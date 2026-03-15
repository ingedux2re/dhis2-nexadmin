// src/hooks/useBulkRename.ts
import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import type { RenamePreview } from '../components/BulkOperations/BulkRenameTable'

export type BulkRenameStatus = 'idle' | 'confirming' | 'running' | 'done' | 'error'

export interface BulkRenameState {
  status: BulkRenameStatus
  previews: RenamePreview[]
  progress: number
  completed: number
  total: number
  rolledBack: number
  errors: string[]
}

const INITIAL: BulkRenameState = {
  status: 'idle',
  previews: [],
  progress: 0,
  completed: 0,
  total: 0,
  rolledBack: 0,
  errors: [],
}

export function useBulkRename() {
  const engine = useDataEngine()
  const [state, setState] = useState<BulkRenameState>(INITIAL)

  // ← previews param added; stored in state for confirm dialog
  const requestConfirm = useCallback((previews: RenamePreview[]) => {
    setState((s) => ({ ...s, status: 'confirming', previews, total: previews.length }))
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
        const shortName = p.newName.slice(0, 50)
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: p.id,
            data: { name: p.newName, shortName },
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
        setState((s) => ({ ...s, status: 'done', progress: 100 }))
        return
      }

      // Rollback: restore original names
      let rolledBack = 0
      for (const p of completed) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: p.id,
            data: { name: p.oldName, shortName: p.oldName.slice(0, 50) },
          })
          rolledBack++
        } catch {
          // ignore rollback failures
        }
      }

      setState((s) => ({ ...s, status: 'error', errors, rolledBack }))
    },
    [engine]
  )

  const reset = useCallback(() => setState(INITIAL), [])

  return { state, requestConfirm, cancelConfirm, execute, reset }
}
