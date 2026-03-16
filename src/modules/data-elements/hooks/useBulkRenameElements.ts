// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkRenameElements.ts
//
// State machine for Tab 2 — Rename Data Elements in Dataset.
//
// API strategy: PUT /api/dataElements/{id}?mergeMode=REPLACE
//
// Payload fields sent per element:
//   { id, name, shortName, valueType, domainType, aggregationType, categoryCombo }
//
// All of these are already available from the dataset-elements query
// (useDatasetElements), so no extra GET-per-element is needed.
//
// IMPORTANT: DHIS2 PUT /api/dataElements returns a metadata import result JSON
// with status 'OK' or 'ERROR' — it does NOT always throw on failure.
// We must check result.status and extract errorReports manually.
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

/**
 * Extract a human-readable error string from a DHIS2 import response body.
 * DHIS2 PUT /api/dataElements returns a metadata import result JSON
 * (status: 'OK' | 'WARNING' | 'ERROR') rather than throwing an HTTP error.
 * We check this explicitly after every mutate call.
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
  // Fallback to top-level message
  if (msgs.length === 0 && typeof r.message === 'string' && r.message) {
    msgs.push(r.message)
  }
  return msgs
}

/**
 * Extract the most useful error string from a thrown exception.
 * The runtime wraps HTTP errors; .message may contain a JSON body.
 */
function extractErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  try {
    const body = JSON.parse(err.message) as Record<string, unknown>
    const errs = extractImportErrors(body)
    if (errs.length > 0) return errs.join('; ')
    if (typeof body.message === 'string' && body.message) return body.message
  } catch {
    // Not JSON — fall through
  }
  return err.message
}

/** Build the PUT data payload for a single element rename */
function buildPutPayload(p: DataElementRenamePreview, name: string, shortName: string) {
  const payload: Record<string, unknown> = {
    id: p.id,
    name,
    shortName,
    valueType: p.valueType,
    domainType: p.domainType,
    aggregationType: p.aggregationType,
  }
  // categoryCombo is required by most DHIS2 instances — include when known
  if (p.categoryComboId) {
    payload.categoryCombo = { id: p.categoryComboId }
  }
  return payload
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
   * Execute renames using PUT /api/dataElements/{id}?mergeMode=REPLACE.
   *
   * The payload includes all required fields (name, shortName, valueType,
   * domainType, aggregationType, categoryCombo) so DHIS2 accepts the request
   * without needing to fetch the full element first.
   *
   * IMPORTANT: DHIS2 returns a metadata import result JSON with HTTP 200 even
   * on validation failure. We check result.status after every call and throw
   * manually when it is 'ERROR' so the error is surfaced to the user.
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

      const succeeded: DataElementRenamePreview[] = []
      const errors: string[] = []

      for (let i = 0; i < previews.length; i++) {
        const p = previews[i]
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = await (engine as any).mutate({
            resource: 'dataElements',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: buildPutPayload(p, p.newName, p.newShortName),
          })

          // DHIS2 returns { status: 'OK' | 'WARNING' | 'ERROR', ... } with HTTP 200
          // A status of ERROR means validation failed — we must check it explicitly.
          if (raw && typeof raw === 'object') {
            const status = (raw as Record<string, unknown>).status
            if (status === 'ERROR' || status === 'WARNING') {
              const errs = extractImportErrors(raw)
              throw new Error(
                errs.length > 0 ? errs.join('; ') : `Server returned status ${String(status)}`
              )
            }
          }

          succeeded.push(p)
        } catch (err: unknown) {
          errors.push(`${p.oldName}: ${extractErrorMessage(err)}`)
          break
        }

        setState((s) => ({
          ...s,
          completed: i + 1,
          progress: Math.round(((i + 1) / previews.length) * 100),
        }))
      }

      if (errors.length === 0) {
        setState((s) => ({
          ...s,
          status: 'done',
          progress: 100,
          completed: previews.length,
          totalRenamed: s.totalRenamed + succeeded.length,
        }))
        return
      }

      // ── Partial failure: rollback already-renamed elements ────────────────
      let rolledBack = 0
      for (const p of succeeded) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataElements',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: buildPutPayload(p, p.oldName, p.oldShortName),
          })
          rolledBack++
        } catch {
          // Ignore rollback failures — user is informed of the partial state
        }
      }

      setState((s) => ({ ...s, status: 'error', errors, rolledBack }))
    },
    [engine]
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
