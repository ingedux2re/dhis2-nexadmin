// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkRenameElements.ts
//
// State machine for Tab 2 — Rename Data Elements in Dataset.
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

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkRenameElements() {
  const engine = useDataEngine()
  const [state, setState] = useState<BulkRenameElementsState>(INITIAL)

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
      const errors: string[] = []

      for (let i = 0; i < previews.length; i++) {
        const p = previews[i]
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataElements',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: { name: p.newName, shortName: p.newShortName },
          })
          succeeded.push(p)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${p.oldName}: ${msg}`)
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
          totalRenamed: s.totalRenamed + succeeded.length,
        }))
        return
      }

      // Partial failure — attempt rollback of already-renamed elements
      let rolledBack = 0
      for (const p of succeeded) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataElements',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: { name: p.oldName, shortName: p.oldShortName },
          })
          rolledBack++
        } catch {
          // Ignore rollback failures — we report success count
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
    cancelConfirm,
    execute,
    continueRenaming,
    reset,
  }
}
