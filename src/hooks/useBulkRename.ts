import { useState, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import type { OrgUnitListItem } from '../types/orgUnit'

export type RenameMode = 'find-replace' | 'prefix' | 'suffix' | 'regex'

export interface RenamePreview {
  orgUnit: OrgUnitListItem
  oldName: string
  newName: string
}

export type BulkRenameStatus = 'idle' | 'previewing' | 'confirming' | 'running' | 'done' | 'error'

export interface BulkRenameState {
  status: BulkRenameStatus
  previews: RenamePreview[]
  progress: number
  completed: number
  total: number
  errors: string[]
}

function applyRename(original: string, mode: RenameMode, find: string, replace: string): string {
  switch (mode) {
    case 'find-replace':
      return original.split(find).join(replace)
    case 'prefix':
      return `${find}${original}`
    case 'suffix':
      return `${original}${find}`
    case 'regex': {
      try {
        const regex = new RegExp(find, 'g')
        return original.replace(regex, replace)
      } catch {
        return original
      }
    }
  }
}

export function useBulkRename() {
  const engine = useDataEngine()

  const [state, setState] = useState<BulkRenameState>({
    status: 'idle',
    previews: [],
    progress: 0,
    completed: 0,
    total: 0,
    errors: [],
  })

  const preview = useCallback(
    (orgUnits: OrgUnitListItem[], mode: RenameMode, find: string, replace: string) => {
      if (!find.trim()) {
        setState((s) => ({ ...s, previews: [], status: 'idle' }))
        return
      }
      const previews: RenamePreview[] = orgUnits
        .map((ou) => ({
          orgUnit: ou,
          oldName: ou.name,
          newName: applyRename(ou.name, mode, find, replace),
        }))
        .filter((p) => p.oldName !== p.newName)
      setState((s) => ({ ...s, previews, status: 'previewing' }))
    },
    []
  )

  const requestConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'confirming' }))
  }, [])

  const cancelConfirm = useCallback(() => {
    setState((s) => ({ ...s, status: 'previewing' }))
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
      }))

      const errors: string[] = []
      for (let i = 0; i < previews.length; i++) {
        const p = previews[i]
        const shortName = p.newName.slice(0, 50)
        try {
          await engine.mutate({
            resource: 'organisationUnits',
            type: 'update',
            id: p.orgUnit.id,
            data: { name: p.newName, shortName },
          })
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${p.oldName}: ${msg}`)
        }
        setState((s) => ({
          ...s,
          completed: i + 1,
          progress: Math.round(((i + 1) / previews.length) * 100),
          errors: [...errors],
        }))
      }

      setState((s) => ({
        ...s,
        status: errors.length === 0 ? 'done' : 'error',
        errors,
      }))
    },
    [engine]
  )

  const reset = useCallback(() => {
    setState({
      status: 'idle',
      previews: [],
      progress: 0,
      completed: 0,
      total: 0,
      errors: [],
    })
  }, [])

  return { state, preview, requestConfirm, cancelConfirm, execute, reset }
}
