// src/hooks/useBulkRename.ts
import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import type { RenamePreview } from '../components/BulkOperations/BulkRenameTable'

// DHIS2 shortName field limit — enforced by the API
export const SHORT_NAME_MAX_LENGTH = 50

export type BulkRenameStatus = 'idle' | 'confirming' | 'running' | 'done' | 'error'

export interface LongNameWarning {
  id: string
  name: string
  /** Length of the new name (> SHORT_NAME_MAX_LENGTH) */
  newNameLength: number
  /** The truncated shortName that will be written */
  truncatedShortName: string
}

export interface BulkRenameState {
  status: BulkRenameStatus
  previews: RenamePreview[]
  /**
   * Names that will be silently truncated to 50 chars in shortName.
   * Populated by requestConfirm so the UI can warn the user before they confirm.
   */
  longNameWarnings: LongNameWarning[]
  progress: number
  completed: number
  total: number
  rolledBack: number
  totalRenamed: number // cumulative across multiple batches
  errors: string[]
}

const INITIAL: BulkRenameState = {
  status: 'idle',
  previews: [],
  longNameWarnings: [],
  progress: 0,
  completed: 0,
  total: 0,
  rolledBack: 0,
  totalRenamed: 0,
  errors: [],
}

/** Derive shortName: if newName fits within 50 chars use it, otherwise truncate. */
function deriveShortName(newName: string): string {
  return newName.slice(0, SHORT_NAME_MAX_LENGTH)
}

/** Build the list of previews whose newName exceeds the shortName limit. */
function buildLongNameWarnings(previews: RenamePreview[]): LongNameWarning[] {
  return previews
    .filter((p) => p.newName.length > SHORT_NAME_MAX_LENGTH)
    .map((p) => ({
      id: p.id,
      name: p.newName,
      newNameLength: p.newName.length,
      truncatedShortName: deriveShortName(p.newName),
    }))
}

export function useBulkRename() {
  const engine = useDataEngine()
  const [state, setState] = useState<BulkRenameState>(INITIAL)

  // ← previews param added; stored in state for confirm dialog
  const requestConfirm = useCallback((previews: RenamePreview[]) => {
    const longNameWarnings = buildLongNameWarnings(previews)
    setState((s) => ({
      ...s,
      status: 'confirming',
      previews,
      longNameWarnings,
      total: previews.length,
    }))
  }, [])

  const cancelConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle' }))
  }, [])

  const execute = useCallback(
    async (previews: RenamePreview[]) => {
      setState((s) => ({
        ...s,
        status: 'running',
        progress: 0,
        completed: 0,
        total: previews.length,
        errors: [],
        rolledBack: 0,
      }))

      const completed: RenamePreview[] = []
      const errors: string[] = []

      for (let i = 0; i < previews.length; i++) {
        const p = previews[i]
        try {
          // Fetch full org unit first (same pattern as useBulkMove / DHIS2 Maintenance App)
          // Required for mergeMode=REPLACE to work correctly
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (engine as any).query({
            ou: {
              resource: `organisationUnits/${p.id}`,
              params: { fields: ':owner' },
            },
          })
          const ou = result?.ou
          if (!ou) throw new Error(`Org unit ${p.id} not found`)

          // Update with full object + new name (preserves all other fields)
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: p.id,
            params: { mergeMode: 'REPLACE' },
            data: {
              ...ou,
              name: p.newName,
              shortName: deriveShortName(p.newName),
            },
          })
          completed.push(p)
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
          totalRenamed: s.totalRenamed + completed.length,
        }))
        return
      }

      // Rollback: restore original names (fetch-then-update pattern)
      let rolledBack = 0
      for (const p of completed) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const result = await (engine as any).query({
            ou: {
              resource: `organisationUnits/${p.id}`,
              params: { fields: ':owner' },
            },
          })
          const ou = result?.ou
          if (ou) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (engine as any).mutate({
              resource: 'organisationUnits',
              type: 'update',
              id: p.id,
              params: { mergeMode: 'REPLACE' },
              data: {
                ...ou,
                name: p.oldName,
                shortName: p.oldName.slice(0, 50),
              },
            })
            rolledBack++
          }
        } catch {
          // ignore rollback failures
        }
      }
      setState((s) => ({ ...s, status: 'error', errors, rolledBack }))
    },
    [engine]
  )

  /**
   * After a successful batch, return to idle so the user can
   * select more rows and rename again — totalRenamed is preserved.
   */
  const continueRenaming = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle', previews: [], errors: [] }))
  }, [])

  /** Full reset — clears everything including the session counter */
  const reset = useCallback(() => setState(INITIAL), [])

  return { state, requestConfirm, cancelConfirm, execute, continueRenaming, reset }
}
