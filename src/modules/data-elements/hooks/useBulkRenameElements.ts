// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkRenameElements.ts
//
// State machine for Tab 2 — Rename Data Elements in Dataset.
//
// API strategy: PUT /api/dataElements/{id}?mergeMode=REPLACE with the minimum
// required fields that satisfy DHIS2 server-side validation:
//   { id, name, shortName, valueType, domainType, aggregationType }
//
// All of these are already available from the dataset-elements query
// (useDatasetElements), so no extra GET-per-element is needed.
//
// WHY NOT FETCH FIRST?
// ────────────────────
// The DHIS2 Maintenance App fetches fields=:owner then PUTs the full object.
// For bulk operations over many elements this is wasteful (N extra GETs) and
// error-prone (nested objects in the full payload may cause validation issues).
//
// Instead, we include the three truly required scalar fields — valueType,
// domainType, aggregationType — in the DataElementRenamePreview so the hook
// has everything it needs without any additional requests.
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
 * Extract the most useful error string from a DHIS2 API error.
 * The runtime throws errors whose .message may contain a JSON body.
 */
function extractErrorMessage(err: unknown): string {
  if (!(err instanceof Error)) return String(err)
  // Try to parse a DHIS2 JSON error body embedded in Error.message
  try {
    const body = JSON.parse(err.message) as Record<string, unknown>
    // DHIS2 error shape: { httpStatusCode, message, typeReports: [...] }
    if (typeof body.message === 'string' && body.message) return body.message
    // typeReports → objectReports → errorReports
    const typeReports = body.typeReports as Array<Record<string, unknown>> | undefined
    if (Array.isArray(typeReports)) {
      const msgs: string[] = []
      for (const tr of typeReports) {
        const objs = tr.objectReports as Array<Record<string, unknown>> | undefined
        if (!Array.isArray(objs)) continue
        for (const obj of objs) {
          const errs = obj.errorReports as Array<Record<string, unknown>> | undefined
          if (!Array.isArray(errs)) continue
          for (const e of errs) {
            const m = (e.message ?? e.errorCode ?? '') as string
            if (m) msgs.push(m)
          }
        }
      }
      if (msgs.length > 0) return msgs.join('; ')
    }
  } catch {
    // Not JSON — fall through to raw message
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
   * Execute renames using the minimal-but-complete PUT payload pattern.
   *
   * DHIS2 PUT /api/dataElements/{id}?mergeMode=REPLACE requires all mandatory
   * fields: name, shortName, valueType, domainType, aggregationType.
   * We already have every one of these from the dataset-elements query, so we
   * can skip the extra GET-per-element entirely.
   *
   * Payload sent per element:
   *   { id, name, shortName, valueType, domainType, aggregationType }
   *   + mergeMode=REPLACE as a query param
   *
   * This is the same validated approach as useBulkRename.ts (org units) —
   * send the required fields only, let DHIS2 leave everything else unchanged.
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
          // PUT with the minimum set of required fields.
          // mergeMode=REPLACE tells DHIS2 to apply exactly what we send;
          // because we include all required fields this does NOT wipe other fields.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataElements',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: {
              id: p.id,
              name: p.newName,
              shortName: p.newShortName,
              valueType: p.valueType,
              domainType: p.domainType,
              aggregationType: p.aggregationType,
            },
          })

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
            data: {
              id: p.id,
              name: p.oldName,
              shortName: p.oldShortName,
              valueType: p.valueType,
              domainType: p.domainType,
              aggregationType: p.aggregationType,
            },
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
