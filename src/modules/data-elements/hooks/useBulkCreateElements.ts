// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useBulkCreateElements.ts
//
// useReducer-based state machine for the Bulk Create tab.
//
// State machine:
//   idle  ──(validate)──► validating ──(fail)──► idle  (errors shown inline)
//                                    ──(ok)───► confirming
//   confirming ──(cancel)──► idle
//              ──(confirm)──► running
//   running ──(all ok)──► done
//           ──(any fail)──► error
//   done  ──(reset)──► idle
//   error ──(reset)──► idle
// ─────────────────────────────────────────────────────────────────────────────

import { useReducer, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import { nanoid } from '../../../utils/nanoid'
import {
  validateAllRows,
  buildBulkCreatePayload,
  parseImportResult,
  collectImportErrors,
  deriveShortName,
  deriveCode,
} from '../services/metadataService'
import type { CreateRow, TemplateRow, MetadataImportResult } from '../types'

// ── Default template values ───────────────────────────────────────────────────

export const DEFAULT_TEMPLATE: TemplateRow = {
  valueType: 'INTEGER',
  domainType: 'AGGREGATE',
  aggregationType: 'SUM',
  categoryComboId: '',
  optionSetId: '',
}

// ── Factory ───────────────────────────────────────────────────────────────────

export function makeEmptyRow(template: TemplateRow = DEFAULT_TEMPLATE): CreateRow {
  return {
    _id: nanoid(),
    name: '',
    shortName: '',
    code: '',
    valueType: template.valueType,
    domainType: template.domainType,
    aggregationType: template.aggregationType,
    categoryComboId: template.categoryComboId,
    optionSetId: template.optionSetId,
    errors: {},
  }
}

// ── State & Action types ──────────────────────────────────────────────────────

export type BulkCreateStatus = 'idle' | 'confirming' | 'running' | 'done' | 'error'

export interface BulkCreateState {
  status: BulkCreateStatus
  rows: CreateRow[]
  /** Template row — its field values are copied into every newly added row */
  template: TemplateRow
  result: MetadataImportResult | null
  errors: string[]
}

type Action =
  | { type: 'SET_ROWS'; rows: CreateRow[] }
  | { type: 'SET_TEMPLATE'; template: TemplateRow }
  | { type: 'ADD_ROW' }
  | { type: 'DUPLICATE_ROW'; id: string }
  | { type: 'DELETE_ROW'; id: string }
  | {
      type: 'UPDATE_CELL'
      id: string
      field: keyof Omit<CreateRow, '_id' | 'errors'>
      value: string
    }
  | { type: 'VALIDATE_AND_CONFIRM' }
  | { type: 'CANCEL_CONFIRM' }
  | { type: 'START_RUNNING' }
  | { type: 'SET_DONE'; result: MetadataImportResult }
  | { type: 'SET_ERROR'; errors: string[] }
  | { type: 'RESET' }

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: BulkCreateState, action: Action): BulkCreateState {
  switch (action.type) {
    case 'SET_ROWS':
      return { ...state, rows: action.rows }

    case 'SET_TEMPLATE':
      return { ...state, template: action.template }

    case 'ADD_ROW':
      return { ...state, rows: [...state.rows, makeEmptyRow(state.template)] }

    case 'DUPLICATE_ROW': {
      const idx = state.rows.findIndex((r) => r._id === action.id)
      if (idx === -1) return state
      const dup: CreateRow = { ...state.rows[idx], _id: nanoid(), errors: {} }
      const next = [...state.rows]
      next.splice(idx + 1, 0, dup)
      return { ...state, rows: next }
    }

    case 'DELETE_ROW':
      return { ...state, rows: state.rows.filter((r) => r._id !== action.id) }

    case 'UPDATE_CELL': {
      const rows = state.rows.map((r) => {
        if (r._id !== action.id) return r
        const updated: CreateRow = { ...r, [action.field]: action.value, errors: { ...r.errors } }

        // Auto-derive shortName and code from name when those fields are still empty
        if (action.field === 'name') {
          if (!r.shortName || r.shortName === deriveShortName(r.name)) {
            updated.shortName = deriveShortName(action.value)
          }
          if (!r.code || r.code === deriveCode(r.name)) {
            updated.code = deriveCode(action.value)
          }
        }

        // Clear the error for the field being edited
        delete updated.errors[action.field as keyof typeof updated.errors]
        return updated
      })
      return { ...state, rows }
    }

    case 'VALIDATE_AND_CONFIRM': {
      const { rows, valid } = validateAllRows(state.rows)
      if (!valid) return { ...state, rows, status: 'idle' }
      return { ...state, rows, status: 'confirming' }
    }

    case 'CANCEL_CONFIRM':
      return { ...state, status: 'idle' }

    case 'START_RUNNING':
      return { ...state, status: 'running', errors: [] }

    case 'SET_DONE':
      return { ...state, status: 'done', result: action.result, errors: [] }

    case 'SET_ERROR':
      return { ...state, status: 'error', errors: action.errors }

    case 'RESET':
      return INITIAL_STATE

    default:
      return state
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: BulkCreateState = {
  status: 'idle',
  rows: [makeEmptyRow()],
  template: DEFAULT_TEMPLATE,
  result: null,
  errors: [],
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useBulkCreateElements() {
  const engine = useDataEngine()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // ── Row management ────────────────────────────────────────────────────────

  const addRow = useCallback(() => dispatch({ type: 'ADD_ROW' }), [])

  const duplicateRow = useCallback((id: string) => dispatch({ type: 'DUPLICATE_ROW', id }), [])

  const deleteRow = useCallback((id: string) => dispatch({ type: 'DELETE_ROW', id }), [])

  const updateCell = useCallback(
    (id: string, field: keyof Omit<CreateRow, '_id' | 'errors'>, value: string) =>
      dispatch({ type: 'UPDATE_CELL', id, field, value }),
    []
  )

  const setTemplate = useCallback(
    (template: TemplateRow) => dispatch({ type: 'SET_TEMPLATE', template }),
    []
  )

  // ── Workflow ──────────────────────────────────────────────────────────────

  const validateAndConfirm = useCallback(() => dispatch({ type: 'VALIDATE_AND_CONFIRM' }), [])

  const cancelConfirm = useCallback(() => dispatch({ type: 'CANCEL_CONFIRM' }), [])

  const execute = useCallback(async () => {
    dispatch({ type: 'START_RUNNING' })
    const payload = buildBulkCreatePayload(state.rows)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await (engine as any).mutate({
        resource: 'metadata',
        type: 'create',
        params: { mergeMode: 'REPLACE', importStrategy: 'CREATE' },
        data: payload,
      })
      const result = parseImportResult(raw)
      if (result.status === 'ERROR') {
        const errs = collectImportErrors(result)
        dispatch({
          type: 'SET_ERROR',
          errors: errs.length > 0 ? errs : ['Unknown error from server'],
        })
      } else {
        dispatch({ type: 'SET_DONE', result })
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({ type: 'SET_ERROR', errors: [msg] })
    }
  }, [engine, state.rows])

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  // ── Update template field helper ──────────────────────────────────────────

  const updateTemplateField = useCallback(
    (field: keyof TemplateRow, value: string) => {
      dispatch({
        type: 'SET_TEMPLATE',
        template: { ...state.template, [field]: value },
      })
    },
    [state.template]
  )

  /** Replace the entire row list (used by the Excel paste import flow) */
  const setRows = useCallback((rows: CreateRow[]) => dispatch({ type: 'SET_ROWS', rows }), [])

  return {
    state,
    addRow,
    duplicateRow,
    deleteRow,
    updateCell,
    setRows,
    setTemplate,
    updateTemplateField,
    validateAndConfirm,
    cancelConfirm,
    execute,
    reset,
  }
}
