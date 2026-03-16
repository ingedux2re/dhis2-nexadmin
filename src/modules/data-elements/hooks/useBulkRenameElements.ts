// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkRenameElements.ts
//
// State machine for Tab 2 — Rename Data Elements in Dataset.
//
// API strategy: POST /api/metadata?importStrategy=UPDATE&mergeMode=REPLACE
//   Body: { dataElements: [{ id, name, shortName, valueType, domainType,
//                            aggregationType, categoryCombo? }] }
//
// This is the IDENTICAL approach used by useBulkCreateElements (Tab 1), which
// is confirmed to work. The only difference is importStrategy=UPDATE instead
// of CREATE. Sending the batch in one POST is also faster than N individual
// PATCHes/PUTs and avoids per-element CORS pre-flights.
//
// Why not PUT /api/dataElements/{id}?
// ─────────────────────────────────────────────────────────────────────────────
// type:'update' in @dhis2/app-runtime maps to PATCH (not PUT). DHIS2 rejects
// PATCH /api/dataElements/{id} with mergeMode=REPLACE because it treats PATCH
// as a JSON-merge-patch and ignores the mergeMode parameter.
// The metadata batch endpoint is the documented way to update multiple objects.
//
// State machine:
//   idle  ──(requestConfirm)──► confirming
//   confirming ──(cancel)──► idle
//              ──(confirm)──► running
//   running ──(all ok)──► done
//           ──(any fail)──► error  (with rollback attempted)
//   done  ──(continueRenaming)──► idle   (keeps session counter)
//   done  ──(reset)──► idle              (clears session counter)
//   error ──(reset)──► idle
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { SHORT_NAME_MAX, applyRuleChain } from '../services/metadataService'
import type { DataElement, DataElementRenamePreview, RenameRule } from '../types'

// ── Types ─────────────────────────────────────────────────────────────────────

export type BulkRenameElementsStatus = 'idle' | 'confirming' | 'running' | 'done' | 'error'

export interface ShortNameWarning {
  id: string
  newName: string
  /** Length of newName (> SHORT_NAME_MAX) */
  newNameLength: number
  /** The shortName that will actually be written */
  truncatedShortName: string
}

export interface BulkRenameElementsState {
  status: BulkRenameElementsStatus
  previews: DataElementRenamePreview[]
  shortNameWarnings: ShortNameWarning[]
  progress: number
  completed: number
  total: number
  rolledBack: number
  /** Cumulative count across multiple rename sessions */
  totalRenamed: number
  errors: string[]
}

const INITIAL: BulkRenameElementsState = {
  status: 'idle',
  previews: [],
  shortNameWarnings: [],
  progress: 0,
  completed: 0,
  total: 0,
  rolledBack: 0,
  totalRenamed: 0,
  errors: [],
}

// ── Constants ─────────────────────────────────────────────────────────────────

/** Max elements per metadata POST — keeps requests manageable */
const BATCH_SIZE = 50

// ── Helpers ───────────────────────────────────────────────────────────────────

function buildPreviews(
  elements: DataElement[],
  selectedIds: Set<string>,
  rules: RenameRule[]
): DataElementRenamePreview[] {
  return elements
    .filter((el) => selectedIds.has(el.id))
    .map((el) => {
      const newName = applyRuleChain(el.name, rules)
      const newShortName = newName.slice(0, SHORT_NAME_MAX)
      return {
        id: el.id,
        oldName: el.name,
        newName,
        oldShortName: el.shortName,
        newShortName,
        code: el.code,
        valueType: el.valueType,
        domainType: el.domainType,
        aggregationType: el.aggregationType,
        categoryComboId: el.categoryCombo?.id,
        changed: newName !== el.name,
      }
    })
}

function buildShortNameWarnings(previews: DataElementRenamePreview[]): ShortNameWarning[] {
  return previews
    .filter((p) => p.changed && p.newName.length > SHORT_NAME_MAX)
    .map((p) => ({
      id: p.id,
      newName: p.newName,
      newNameLength: p.newName.length,
      truncatedShortName: p.newName.slice(0, SHORT_NAME_MAX),
    }))
}

/** Split an array into chunks of at most `size` items */
function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size))
  return out
}

/**
 * Build a single dataElement entry for the metadata POST body.
 * Includes all fields required by DHIS2 server-side validation.
 */
function buildMetadataEntry(
  p: DataElementRenamePreview,
  name: string,
  shortName: string
): Record<string, unknown> {
  const entry: Record<string, unknown> = {
    id: p.id,
    name,
    shortName,
    valueType: p.valueType,
    domainType: p.domainType,
    aggregationType: p.aggregationType,
  }
  if (p.categoryComboId) {
    entry.categoryCombo = { id: p.categoryComboId }
  }
  return entry
}

/**
 * Walk typeReports → objectReports → errorReports and collect messages.
 * DHIS2 POST /api/metadata returns { status, typeReports } with HTTP 200
 * even when the operation fails — we must inspect status explicitly.
 */
function extractImportErrors(raw: unknown): string[] {
  const r = raw as Record<string, unknown>
  const msgs: string[] = []
  const typeReports = r.typeReports as Array<Record<string, unknown>> | undefined
  if (Array.isArray(typeReports)) {
    for (const tr of typeReports) {
      const objs = tr.objectReports as Array<Record<string, unknown>> | undefined
      if (!Array.isArray(objs)) continue
      for (const obj of objs) {
        const errs = obj.errorReports as Array<Record<string, unknown>> | undefined
        if (!Array.isArray(errs)) continue
        for (const e of errs) {
          const m = String(e.message ?? e.errorCode ?? '')
          if (m) msgs.push(m)
        }
      }
    }
  }
  if (msgs.length === 0 && typeof r.message === 'string' && r.message) {
    msgs.push(r.message)
  }
  return msgs
}

/**
 * Extract the most useful error string from a thrown exception.
 * The @dhis2/app-runtime wraps HTTP errors; .message may contain a JSON body.
 */
function extractErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  try {
    const body = JSON.parse(err.message) as Record<string, unknown>
    const errs = extractImportErrors(body)
    if (errs.length > 0) return errs.join('; ')
    if (typeof body.message === 'string' && body.message) return body.message
  } catch {
    /* not JSON — fall through */
  }
  return err.message
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkRenameElements() {
  const engine = useDataEngine()
  const [state, setState] = useState<BulkRenameElementsState>(INITIAL)

  /**
   * Accept pre-built previews (from the table component, which has already
   * applied inline overrides). Skips the buildPreviews step entirely.
   */
  const requestConfirmWithPreviews = useCallback((previews: DataElementRenamePreview[]) => {
    const filtered = previews.filter((p) => p.changed)
    if (filtered.length === 0) return
    const shortNameWarnings = buildShortNameWarnings(filtered)
    setState((s) => ({
      ...s,
      status: 'confirming',
      previews: filtered,
      shortNameWarnings,
      total: filtered.length,
    }))
  }, [])

  /**
   * Build previews from the current selection + rule chain,
   * then move to the confirming state to show the dialog.
   */
  const requestConfirm = useCallback(
    (elements: DataElement[], selectedIds: Set<string>, rules: RenameRule[]) => {
      const previews = buildPreviews(elements, selectedIds, rules).filter((p) => p.changed)
      if (previews.length === 0) return
      const shortNameWarnings = buildShortNameWarnings(previews)
      setState((s) => ({
        ...s,
        status: 'confirming',
        previews,
        shortNameWarnings,
        total: previews.length,
      }))
    },
    []
  )

  const cancelConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle' }))
  }, [])

  /**
   * Post a batch of previews to POST /api/metadata?importStrategy=UPDATE&mergeMode=REPLACE.
   * Returns an error message string on failure, or null on success.
   */
  const postBatch = useCallback(
    async (
      batch: DataElementRenamePreview[],
      nameGetter: (p: DataElementRenamePreview) => string,
      shortNameGetter: (p: DataElementRenamePreview) => string
    ): Promise<string | null> => {
      const dataElements = batch.map((p) =>
        buildMetadataEntry(p, nameGetter(p), shortNameGetter(p))
      )
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (engine as any).mutate({
        resource: 'metadata',
        type: 'create', // 'create' → POST — same as Bulk Create tab
        params: {
          importStrategy: 'UPDATE',
          mergeMode: 'REPLACE',
          atomic: 'false', // don't roll back the whole batch on one error
        },
        data: { dataElements },
      })

      // metadata endpoint returns { status: 'OK' | 'WARNING' | 'ERROR', ... }
      if (raw && typeof raw === 'object') {
        const status = (raw as Record<string, unknown>).status
        if (status === 'ERROR') {
          const errs = extractImportErrors(raw)
          return errs.length > 0 ? errs.join('; ') : 'Server returned ERROR status'
        }
      }
      return null
    },
    [engine]
  )

  /**
   * Execute renames via POST /api/metadata with importStrategy=UPDATE.
   *
   * Sends elements in batches of BATCH_SIZE. Progress is updated after each
   * batch. On failure the completed batches are rolled back (best effort).
   */
  const execute = useCallback(
    async (previews: DataElementRenamePreview[]) => {
      setState((s) => ({
        ...s,
        status: 'running',
        progress: 0,
        completed: 0,
        total: previews.length,
        errors: [],
        rolledBack: 0,
      }))

      const batches = chunk(previews, BATCH_SIZE)
      const succeededBatches: DataElementRenamePreview[][] = []
      const errors: string[] = []
      let totalDone = 0

      for (const batch of batches) {
        try {
          const err = await postBatch(
            batch,
            (p) => p.newName,
            (p) => p.newShortName
          )
          if (err) {
            errors.push(err)
            break
          }
          succeededBatches.push(batch)
          totalDone += batch.length
        } catch (err: unknown) {
          errors.push(extractErrorMessage(err))
          break
        }

        setState((s) => ({
          ...s,
          completed: totalDone,
          progress: Math.round((totalDone / previews.length) * 100),
        }))
      }

      if (errors.length === 0) {
        setState((s) => ({
          ...s,
          status: 'done',
          progress: 100,
          completed: previews.length,
          totalRenamed: s.totalRenamed + previews.length,
        }))
        return
      }

      // ── Rollback succeeded batches (best effort) ──────────────────────────
      let rolledBack = 0
      for (const batch of succeededBatches) {
        try {
          const rbErr = await postBatch(
            batch,
            (p) => p.oldName,
            (p) => p.oldShortName
          )
          if (!rbErr) rolledBack += batch.length
        } catch {
          /* ignore rollback failures */
        }
      }

      setState((s) => ({ ...s, status: 'error', errors, rolledBack }))
    },
    [postBatch]
  )

  /** Return to idle preserving the session totalRenamed counter */
  const continueRenaming = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle', previews: [], errors: [] }))
  }, [])

  /** Full reset — clears all state including the session counter */
  const reset = useCallback(() => setState(INITIAL), [])

  return {
    state,
    requestConfirm,
    requestConfirmWithPreviews,
    cancelConfirm,
    execute,
    continueRenaming,
    reset,
  }
}
