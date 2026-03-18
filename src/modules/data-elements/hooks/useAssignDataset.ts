// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useAssignDataset.ts
//
// State machine hook that drives the post-creation "assign to dataset" workflow.
//
// Responsibilities:
//   • Fetch all dataSets (with existing dataSetElements) via the DHIS2 API
//   • Assign data elements to existing dataSets via JSON Patch (append-only)
//   • Create a brand-new dataSet with the data elements already attached via POST
//
// Why JSON Patch for assigning to existing datasets?
//   PUT /api/dataSets/{id} requires round-tripping the full object. Any
//   existing dataSetElement whose structure doesn't exactly match what DHIS2
//   expects (e.g. missing categoryCombo) triggers a Hibernate null-value error.
//   JSON Patch with op:"add" path:"/dataSetElements/-" appends elements without
//   touching existing ones, completely avoiding the round-trip problem.
//   app-runtime type:'json-patch' sends PATCH with content-type
//   application/json-patch+json which is what DHIS2 expects.
//
// State machine:
//   idle  ──(open)──► decision
//   decision ──(assign-existing)──► selectDatasets
//            ──(create-new)──────► createDataset
//            ──(skip)───────────► idle
//   selectDatasets ──(confirm)──► confirming
//   createDataset  ──(confirm)──► confirming
//   confirming ──(cancel)──► selectDatasets | createDataset
//              ──(apply)───► running
//   running ──(ok)────► done
//           ──(fail)──► error
//   done | error ──(reset)──► idle
// ─────────────────────────────────────────────────────────────────────────────

import { useReducer, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'

// ── Public types ──────────────────────────────────────────────────────────────

export type AssignMode =
  | 'decision'
  | 'selectDatasets'
  | 'createDataset'
  | 'confirming'
  | 'running'
  | 'done'
  | 'error'
  | 'idle'

/** Lightweight dataset reference returned by the list query */
export interface DataSetRef {
  id: string
  displayName: string
  /** Number of data elements already in the dataset */
  dataSetElementCount?: number
}

/** Payload for creating a brand-new dataset */
export interface NewDataSetForm {
  name: string
  shortName: string
  periodType: string
  categoryComboId: string
}

export const DEFAULT_NEW_DATASET_FORM: NewDataSetForm = {
  name: '',
  shortName: '',
  periodType: 'Monthly',
  categoryComboId: '',
}

/** A created data element reference to assign */
export interface CreatedElement {
  id: string
  name: string
}

// ── Period types supported by DHIS2 ──────────────────────────────────────────

export const PERIOD_TYPES = [
  'Daily',
  'Weekly',
  'WeeklyWednesday',
  'WeeklyThursday',
  'WeeklySaturday',
  'WeeklySunday',
  'BiWeekly',
  'Monthly',
  'BiMonthly',
  'Quarterly',
  'QuarterlyNov',
  'SixMonthly',
  'SixMonthlyApril',
  'SixMonthlyNov',
  'Yearly',
  'FinancialApril',
  'FinancialJuly',
  'FinancialOct',
  'FinancialNov',
]

// ── State ─────────────────────────────────────────────────────────────────────

export interface AssignDatasetState {
  mode: AssignMode
  /** All datasets fetched from DHIS2 (for the existing-datasets path) */
  allDataSets: DataSetRef[]
  loadingDataSets: boolean
  loadError: string | null
  /** IDs of datasets selected by the user */
  selectedDataSetIds: string[]
  /** Whether to assign ALL created elements (false = user picks a subset) */
  assignAll: boolean
  /** IDs of elements explicitly selected when assignAll === false */
  selectedElementIds: string[]
  /** Form for creating a brand-new dataset */
  newDataSetForm: NewDataSetForm
  /** Inline validation errors for the new-dataset form */
  formErrors: Partial<Record<keyof NewDataSetForm, string>>
  /** Result of the assign/create operation */
  resultMessage: string | null
  errors: string[]
}

type AssignAction =
  | { type: 'OPEN' }
  | { type: 'CLOSE' }
  | { type: 'CHOOSE_ASSIGN_EXISTING' }
  | { type: 'CHOOSE_CREATE_NEW' }
  | { type: 'SET_DATASETS'; datasets: DataSetRef[] }
  | { type: 'SET_LOAD_ERROR'; message: string }
  | { type: 'TOGGLE_DATASET'; id: string }
  | { type: 'SET_ASSIGN_ALL'; value: boolean }
  | { type: 'TOGGLE_ELEMENT'; id: string }
  | { type: 'SELECT_ALL_ELEMENTS'; ids: string[] }
  | { type: 'DESELECT_ALL_ELEMENTS' }
  | { type: 'UPDATE_FORM'; field: keyof NewDataSetForm; value: string }
  | { type: 'CONFIRM' }
  | { type: 'CANCEL_CONFIRM' }
  | { type: 'START_RUNNING' }
  | { type: 'SET_DONE'; message: string }
  | { type: 'SET_ERROR'; errors: string[] }
  | { type: 'RESET' }

// ── Reducer ───────────────────────────────────────────────────────────────────

function reducer(state: AssignDatasetState, action: AssignAction): AssignDatasetState {
  switch (action.type) {
    case 'OPEN':
      return { ...INITIAL_STATE, mode: 'decision', loadingDataSets: true }

    case 'CLOSE':
    case 'RESET':
      return INITIAL_STATE

    case 'CHOOSE_ASSIGN_EXISTING':
      return { ...state, mode: 'selectDatasets' }

    case 'CHOOSE_CREATE_NEW':
      return { ...state, mode: 'createDataset' }

    case 'SET_DATASETS':
      return { ...state, allDataSets: action.datasets, loadingDataSets: false, loadError: null }

    case 'SET_LOAD_ERROR':
      return { ...state, loadingDataSets: false, loadError: action.message }

    case 'TOGGLE_DATASET': {
      const already = state.selectedDataSetIds.includes(action.id)
      return {
        ...state,
        selectedDataSetIds: already
          ? state.selectedDataSetIds.filter((id) => id !== action.id)
          : [...state.selectedDataSetIds, action.id],
      }
    }

    case 'SET_ASSIGN_ALL':
      return { ...state, assignAll: action.value }

    case 'TOGGLE_ELEMENT': {
      const already = state.selectedElementIds.includes(action.id)
      return {
        ...state,
        selectedElementIds: already
          ? state.selectedElementIds.filter((id) => id !== action.id)
          : [...state.selectedElementIds, action.id],
      }
    }

    case 'SELECT_ALL_ELEMENTS':
      return { ...state, selectedElementIds: action.ids }

    case 'DESELECT_ALL_ELEMENTS':
      return { ...state, selectedElementIds: [] }

    case 'UPDATE_FORM': {
      const updated = { ...state.newDataSetForm, [action.field]: action.value }
      // Auto-derive shortName from name when it is still in sync
      if (action.field === 'name') {
        const wasAuto = state.newDataSetForm.shortName === state.newDataSetForm.name.slice(0, 50)
        if (wasAuto || !state.newDataSetForm.shortName) {
          updated.shortName = action.value.slice(0, 50)
        }
      }
      return {
        ...state,
        newDataSetForm: updated,
        formErrors: { ...state.formErrors, [action.field]: undefined },
      }
    }

    case 'CONFIRM': {
      // Validate new-dataset form before allowing confirmation
      if (state.mode === 'createDataset') {
        const errors: Partial<Record<keyof NewDataSetForm, string>> = {}
        if (!state.newDataSetForm.name.trim()) errors.name = 'Name is required'
        if (!state.newDataSetForm.shortName.trim()) errors.shortName = 'Short name is required'
        if (Object.keys(errors).length > 0) return { ...state, formErrors: errors }
      }
      return { ...state, mode: 'confirming' }
    }

    case 'CANCEL_CONFIRM':
      return {
        ...state,
        mode:
          state.allDataSets.length > 0 || state.loadingDataSets
            ? 'selectDatasets'
            : 'createDataset',
      }

    case 'START_RUNNING':
      return { ...state, mode: 'running', errors: [] }

    case 'SET_DONE':
      return { ...state, mode: 'done', resultMessage: action.message, errors: [] }

    case 'SET_ERROR':
      return { ...state, mode: 'error', errors: action.errors }

    default:
      return state
  }
}

// ── Initial state ─────────────────────────────────────────────────────────────

const INITIAL_STATE: AssignDatasetState = {
  mode: 'idle',
  allDataSets: [],
  loadingDataSets: false,
  loadError: null,
  selectedDataSetIds: [],
  assignAll: true,
  selectedElementIds: [],
  newDataSetForm: { ...DEFAULT_NEW_DATASET_FORM },
  formErrors: {},
  resultMessage: null,
  errors: [],
}

// ── Raw DHIS2 response shapes ─────────────────────────────────────────────────

interface RawDataSetsResponse {
  dataSets: Array<{
    id: string
    displayName: string
    dataSetElements?: Array<unknown>
  }>
}

// RawDataSetDetailResponse is used to check which elements are already present
// before building the patch (so we don't try to add duplicates).
interface RawDataSetDetailResponse {
  id: string
  dataSetElements?: Array<{ dataElement: { id: string } }>
}

// ── Hook ──────────────────────────────────────────────────────────────────────

export function useAssignDataset() {
  const engine = useDataEngine()
  const [state, dispatch] = useReducer(reducer, INITIAL_STATE)

  // ── Open the workflow ─────────────────────────────────────────────────────

  const open = useCallback(async () => {
    dispatch({ type: 'OPEN' })
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = (await (engine as any).query({
        dataSets: {
          resource: 'dataSets',
          params: {
            fields: ['id', 'displayName', 'dataSetElements[dataElement[id]]'],
            paging: false,
            order: 'displayName:asc',
          },
        },
      })) as { dataSets: RawDataSetsResponse }

      const datasets: DataSetRef[] = raw.dataSets.dataSets.map((ds) => ({
        id: ds.id,
        displayName: ds.displayName,
        dataSetElementCount: ds.dataSetElements?.length ?? 0,
      }))
      dispatch({ type: 'SET_DATASETS', datasets })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({ type: 'SET_LOAD_ERROR', message: msg })
    }
  }, [engine])

  const close = useCallback(() => dispatch({ type: 'CLOSE' }), [])

  // ── Step navigation ───────────────────────────────────────────────────────

  const chooseAssignExisting = useCallback(() => dispatch({ type: 'CHOOSE_ASSIGN_EXISTING' }), [])
  const chooseCreateNew = useCallback(() => dispatch({ type: 'CHOOSE_CREATE_NEW' }), [])

  // ── Dataset selection ─────────────────────────────────────────────────────

  const toggleDataSet = useCallback((id: string) => dispatch({ type: 'TOGGLE_DATASET', id }), [])

  // ── Element selection ─────────────────────────────────────────────────────

  const setAssignAll = useCallback(
    (value: boolean) => dispatch({ type: 'SET_ASSIGN_ALL', value }),
    []
  )
  const toggleElement = useCallback((id: string) => dispatch({ type: 'TOGGLE_ELEMENT', id }), [])
  const selectAllElements = useCallback(
    (ids: string[]) => dispatch({ type: 'SELECT_ALL_ELEMENTS', ids }),
    []
  )
  const deselectAllElements = useCallback(() => dispatch({ type: 'DESELECT_ALL_ELEMENTS' }), [])

  // ── New dataset form ──────────────────────────────────────────────────────

  const updateForm = useCallback(
    (field: keyof NewDataSetForm, value: string) => dispatch({ type: 'UPDATE_FORM', field, value }),
    []
  )

  // ── Confirm / cancel ──────────────────────────────────────────────────────

  const confirm = useCallback(() => dispatch({ type: 'CONFIRM' }), [])
  const cancelConfirm = useCallback(() => dispatch({ type: 'CANCEL_CONFIRM' }), [])

  // ── Execute: assign to existing datasets ─────────────────────────────────

  const executeAssignExisting = useCallback(
    async (_createdElements: CreatedElement[], elementIdsToAssign: string[]) => {
      dispatch({ type: 'START_RUNNING' })
      const errors: string[] = []

      for (const dataSetId of state.selectedDataSetIds) {
        try {
          // Step 1: Fetch ONLY the existing dataSetElement IDs so we can skip
          // duplicates. We intentionally do NOT fetch other fields to avoid
          // needing a full round-trip PUT (which triggers Hibernate errors when
          // any existing dataSetElement has a null/missing sub-field).
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detail = (await (engine as any).query({
            ds: {
              resource: `dataSets/${dataSetId}`,
              params: { fields: ['id', 'dataSetElements[dataElement[id]]'] },
            },
          })) as { ds: RawDataSetDetailResponse }

          const existingIds = new Set(
            (detail.ds.dataSetElements ?? []).map((dse) => dse.dataElement.id)
          )

          // Only append elements that are not already in the dataset
          const toAdd = elementIdsToAssign.filter((id) => !existingIds.has(id))

          if (toAdd.length === 0) {
            // Nothing new to add — skip without error
            continue
          }

          // Step 2: Use JSON Patch (RFC 6902) to append each element.
          //   op:"add"  path:"/dataSetElements/-"  appends to the array.
          //   This never touches existing entries, so no round-trip needed and
          //   no risk of Hibernate null-value errors on existing elements.
          //   app-runtime type:'json-patch' sends:
          //     PATCH /api/dataSets/{id}
          //     Content-Type: application/json-patch+json
          const patchOps = toAdd.map((id) => ({
            op: 'add',
            path: '/dataSetElements/-',
            value: { dataElement: { id } },
          }))

          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataSets',
            id: dataSetId,
            type: 'json-patch',
            data: patchOps,
          })
        } catch (err) {
          const ds = state.allDataSets.find((d) => d.id === dataSetId)
          const label = ds?.displayName ?? dataSetId
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${label}: ${msg}`)
        }
      }

      if (errors.length > 0) {
        dispatch({ type: 'SET_ERROR', errors })
      } else {
        const dsNames = state.selectedDataSetIds
          .map((id) => state.allDataSets.find((d) => d.id === id)?.displayName ?? id)
          .join(', ')
        dispatch({
          type: 'SET_DONE',
          message: `${elementIdsToAssign.length} element(s) assigned to: ${dsNames}`,
        })
      }
    },
    [engine, state.selectedDataSetIds, state.allDataSets]
  )

  // ── Execute: create new dataset with elements ─────────────────────────────

  const executeCreateNew = useCallback(
    async (elementIdsToAssign: string[], categoryComboId: string) => {
      dispatch({ type: 'START_RUNNING' })
      const { name, shortName, periodType } = state.newDataSetForm

      const dataSetElements = elementIdsToAssign.map((id) => ({
        dataElement: { id },
      }))

      const payload: Record<string, unknown> = {
        name: name.trim(),
        shortName: shortName.trim(),
        periodType,
        dataSetElements,
      }

      // Only include categoryCombo if explicitly chosen
      if (categoryComboId) {
        payload.categoryCombo = { id: categoryComboId }
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (engine as any).mutate({
          resource: 'dataSets',
          type: 'create',
          data: payload,
        })
        dispatch({
          type: 'SET_DONE',
          message: `Dataset "${name.trim()}" created with ${elementIdsToAssign.length} element(s)`,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        dispatch({ type: 'SET_ERROR', errors: [msg] })
      }
    },
    [engine, state.newDataSetForm]
  )

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  return {
    state,
    open,
    close,
    chooseAssignExisting,
    chooseCreateNew,
    toggleDataSet,
    setAssignAll,
    toggleElement,
    selectAllElements,
    deselectAllElements,
    updateForm,
    confirm,
    cancelConfirm,
    executeAssignExisting,
    executeCreateNew,
    reset,
  }
}
