import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import type { OrgUnitListItem } from '../types/orgUnit'

export interface MoveOperation {
  orgUnit: OrgUnitListItem
  newParentId: string
  newParentName: string
}

export type BulkMoveStatus = 'idle' | 'confirming' | 'running' | 'done' | 'error'

export interface BulkMoveState {
  status: BulkMoveStatus
  progress: number
  completed: number
  total: number
  rolledBack: number
  errors: string[]
}

export function useBulkMove() {
  const engine = useDataEngine()

  const [state, setState] = useState<BulkMoveState>({
    status: 'idle',
    progress: 0,
    completed: 0,
    total: 0,
    rolledBack: 0,
    errors: [],
  })

  const requestConfirm = useCallback((ops: MoveOperation[]) => {
    setState((s) => ({ ...s, status: 'confirming', total: ops.length }))
  }, [])

  const cancelConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle' }))
  }, [])

  const execute = useCallback(
    async (ops: MoveOperation[]) => {
      setState({
        status: 'running',
        progress: 0,
        completed: 0,
        total: ops.length,
        rolledBack: 0,
        errors: [],
      })

      const completed: MoveOperation[] = []
      const errors: string[] = []

      for (let i = 0; i < ops.length; i++) {
        const op = ops[i]
        try {
          await engine.mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: op.orgUnit.id,
            data: { parent: { id: op.newParentId } },
          })
          completed.push(op)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${op.orgUnit.name}: ${msg}`)
        }
        setState((s) => ({
          ...s,
          completed: i + 1,
          progress: Math.round(((i + 1) / ops.length) * 100),
          errors: [...errors],
        }))
      }

      if (errors.length === 0) {
        setState((s) => ({ ...s, status: 'done', progress: 100 }))
        return
      }

      // Partial failure – best-effort rollback of completed moves
      let rolledBack = 0
      for (const op of completed) {
        try {
          await engine.mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: op.orgUnit.id,
            data: { parent: { id: op.orgUnit.parent?.id ?? '' } },
          })
          rolledBack++
        } catch {
          // ignore rollback errors
        }
      }

      setState((s) => ({ ...s, status: 'error', rolledBack, errors }))
    },
    [engine]
  )

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      progress: 0,
      completed: 0,
      total: 0,
      rolledBack: 0,
      errors: [],
    })
  }, [])

  return { state, requestConfirm, cancelConfirm, execute, reset }
}
