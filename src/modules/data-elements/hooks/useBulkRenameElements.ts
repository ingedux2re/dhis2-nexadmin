// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkRenameElements.ts
//
// State machine for Tab 2 — Rename Data Elements in Dataset.
//
// API strategy: POST /api/metadata with importStrategy=UPDATE + mergeMode=MERGE
// ─────────────────────────────────────────────────────────────────────────────
//
// WHY NOT PUT /api/dataElements/{id}?
// ─────────────────────────────────────────────────────────────────────────────
// DHIS2's PUT endpoint for dataElements requires the full object payload —
// sending only {name, shortName} causes "One or more errors occurred" because
// required fields (valueType, domainType, aggregationType, etc.) are missing.
//
// WHY POST /api/metadata with mergeMode=MERGE?
// ─────────────────────────────────────────────────────────────────────────────
// The metadata import API with mergeMode=MERGE performs a *partial* update:
// only the fields present in the payload are changed; all other fields keep
// their current values in the database. This is the correct DHIS2 approach
// for lightweight field updates without fetching the full object first.
//
// Endpoint:  POST /api/metadata?importStrategy=UPDATE&mergeMode=MERGE
// Payload:   { dataElements: [{ id, name, shortName }, ...] }
// Batch size: BATCH_SIZE items per request to stay well under payload limits.
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

// ── Constants ─────────────────────────────────────────────────────────────────

/** Number of data elements to send per metadata import request */
const BATCH_SIZE = 50

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
 * Extract human-readable error strings from a DHIS2 metadata import result.
 * The response shape is: { status, typeReports: [{ objectReports: [{ errorReports: [{ message }] }] }] }
 */
function extractMetadataErrors(raw: unknown): string[] {
  const errors: string[] = []
  try {
    const r = raw as Record<string, unknown>

    // Top-level message (e.g. summary line from the server)
    if (typeof r.message === 'string' && r.message) {
      errors.push(r.message)
    }

    const typeReports = r.typeReports as Array<Record<string, unknown>> | undefined
    if (!Array.isArray(typeReports)) return errors

    for (const tr of typeReports) {
      const objectReports = tr.objectReports as Array<Record<string, unknown>> | undefined
      if (!Array.isArray(objectReports)) continue
      for (const obj of objectReports) {
        const errorReports = obj.errorReports as Array<Record<string, unknown>> | undefined
        if (!Array.isArray(errorReports)) continue
        for (const err of errorReports) {
          const msg = (err.message ?? err.errorCode ?? '') as string
          if (msg) errors.push(msg)
        }
      }
    }
  } catch {
    // Ignore parse errors — caller will show a generic message
  }
  return errors
}

/**
 * Split an array into chunks of at most `size` items.
 */
function chunk<T>(arr: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size))
  }
  return result
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
      const allErrors: string[] = []
      const batches = chunk(previews, BATCH_SIZE)

      for (let bi = 0; bi < batches.length; bi++) {
        const batch = batches[bi]

        // Build a minimal payload — mergeMode=MERGE means only these fields
        // are touched; all other dataElement fields remain unchanged.
        const payload = {
          dataElements: batch.map((p) => ({
            id: p.id,
            name: p.newName,
            shortName: p.newShortName,
          })),
        }

        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const raw = await (engine as any).mutate({
            resource: 'metadata',
            type: 'create', // maps to POST /api/metadata
            params: {
              importStrategy: 'UPDATE',
              mergeMode: 'MERGE',
              // Atomic=false lets partial batches succeed independently;
              // atomic=true (default) rolls back the whole batch on any error.
              atomic: 'false',
            },
            data: payload,
          })

          // Check the import result for application-level errors
          const status = (raw as Record<string, unknown>)?.status
          if (status === 'ERROR') {
            const msgs = extractMetadataErrors(raw)
            allErrors.push(
              ...(msgs.length > 0 ? msgs : [`Batch ${bi + 1}: Unknown error from server`])
            )
            // Stop on first failing batch
            break
          }

          // Mark all items in this batch as succeeded
          succeeded.push(...batch)
        } catch (err: unknown) {
          // Network / HTTP-level error — extract the most useful message
          let msg: string
          if (err instanceof Error) {
            // Try to parse DHIS2 JSON error body embedded in the Error message
            try {
              const body = JSON.parse(err.message) as Record<string, unknown>
              const extracted = extractMetadataErrors(body)
              msg = extracted.length > 0 ? extracted.join('; ') : err.message
            } catch {
              msg = err.message
            }
          } else {
            msg = String(err)
          }
          allErrors.push(msg)
          break
        }

        // Update progress after each batch
        const doneCount = Math.min((bi + 1) * BATCH_SIZE, previews.length)
        setState((s) => ({
          ...s,
          completed: doneCount,
          progress: Math.round((doneCount / previews.length) * 100),
        }))
      }

      if (allErrors.length === 0) {
        setState((s) => ({
          ...s,
          status: 'done',
          progress: 100,
          completed: previews.length,
          totalRenamed: s.totalRenamed + succeeded.length,
        }))
        return
      }

      // ── Partial failure — attempt rollback of already-renamed elements ──────
      let rolledBack = 0
      const rollbackBatches = chunk(succeeded, BATCH_SIZE)
      for (const rbBatch of rollbackBatches) {
        try {
          const rollbackPayload = {
            dataElements: rbBatch.map((p) => ({
              id: p.id,
              name: p.oldName,
              shortName: p.oldShortName,
            })),
          }
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'metadata',
            type: 'create',
            params: { importStrategy: 'UPDATE', mergeMode: 'MERGE', atomic: 'false' },
            data: rollbackPayload,
          })
          rolledBack += rbBatch.length
        } catch {
          // Ignore rollback failures — user is informed of the partial state
        }
      }

      setState((s) => ({ ...s, status: 'error', errors: allErrors, rolledBack }))
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
