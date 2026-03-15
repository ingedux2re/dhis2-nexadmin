// src/hooks/useBulkMove.ts
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

const INITIAL: BulkMoveState = {
  status: 'idle',
  progress: 0,
  completed: 0,
  total: 0,
  rolledBack: 0,
  errors: [],
}

export function useBulkMove() {
  const [state, setState] = useState<BulkMoveState>(INITIAL)
  const engine = useDataEngine()

  const moveOrgUnit = useCallback(
    async (orgUnitId: string, parentId: string) => {
      // Step 1: fetch all owned fields (same as DHIS2 Maintenance)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const result = await (engine as any).query({
        ou: {
          resource: `organisationUnits/${orgUnitId}`,
          params: { fields: ':owner' },
        },
      })

      const ou = result?.ou
      if (!ou) throw new Error(`Org unit ${orgUnitId} not found`)

      // Step 2: PUT with mergeMode=REPLACE — exactly what DHIS2 Maintenance does
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (engine as any).mutate({
        resource: 'organisationUnits',
        type: 'update',
        id: orgUnitId,
        params: { mergeMode: 'REPLACE' },
        data: {
          ...ou,
          parent: { id: parentId },
        },
      })
    },
    [engine]
  )

  const requestConfirm = useCallback((ops: MoveOperation[]) => {
    setState((s) => ({ ...s, status: 'confirming', total: ops.length }))
  }, [])

  const cancelConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'idle' }))
  }, [])

  const execute = useCallback(
    async (ops: MoveOperation[]) => {
      setState((s) => ({
        ...s,
        status: 'running',
        completed: 0,
        progress: 0,
        errors: [],
        rolledBack: 0,
        total: ops.length,
      }))

      const completed: MoveOperation[] = []
      const errors: string[] = []

      for (let i = 0; i < ops.length; i++) {
        const op = ops[i]
        try {
          await moveOrgUnit(op.orgUnit.id, op.newParentId)
          completed.push(op)
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${op.orgUnit.name}: ${msg}`)
          break
        }
        setState((s) => ({
          ...s,
          completed: i + 1,
          progress: Math.round(((i + 1) / ops.length) * 100),
        }))
      }

      if (errors.length === 0) {
        setState((s) => ({ ...s, status: 'done', progress: 100 }))
        return
      }

      // Rollback: restore original parents
      let rolledBack = 0
      for (const op of completed) {
        try {
          const originalParentId = op.orgUnit.parent?.id
          if (originalParentId) {
            await moveOrgUnit(op.orgUnit.id, originalParentId)
            rolledBack++
          }
        } catch {
          // ignore rollback failures
        }
      }

      setState((s) => ({ ...s, status: 'error', errors, rolledBack }))
    },
    [moveOrgUnit]
  )

  const reset = useCallback(() => setState(INITIAL), [])

  return { state, requestConfirm, cancelConfirm, execute, reset }
}
