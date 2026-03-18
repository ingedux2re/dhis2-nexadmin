// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useAssignDataset.ts
//
// State machine hook that drives the post-creation "assign to dataset" workflow.
//
// Responsibilities:
//   • Fetch all dataSets (with existing dataSetElements) via the DHIS2 API
//   • Assign data elements to existing dataSets via the collections API
//   • Create a brand-new dataSet with the data elements already attached via POST
//
// Why collections API for assigning to existing datasets?
//   POST /api/dataSets/{id}/dataElements with {"identifiableObjects":[{"id":"..."}]}
//   is the documented DHIS2 approach for adding data elements to a dataset.
//   DHIS2 handles the composite DataSetElement join-table internally, so we never
//   need to construct the join object manually — which avoids Hibernate null-value
//   errors on "dataElement" (not-null) and "dataSet" (circular reference) fields.
//   All previous approaches (PUT with full body, POST /api/metadata with
//   importStrategy=UPDATE, JSON Patch) produced 409 Conflict errors because the
//   server requires the full composite object with the correct id fields.
//   The collections API is the safest and simplest approach.
//
// State machine:
//   idle  ──(open)──► decision
//   decision ──(assign-existing)──► selectDatasets
//            ──(create-new)──────► createDataset
//            ──(skip)───────────► idle
//   selectDatasets ──(next)──► orgUnitDeployment
//   createDataset  ──(next)──► orgUnitDeployment
//   orgUnitDeployment ──(next)──► sharing
//   sharing ──(next)──► confirming
//   confirming ──(cancel)──► sharing
//              ──(apply)───► running
//   running ──(ok)────► done
//           ──(fail)──► error
//   done | error ──(reset)──► idle
// ─────────────────────────────────────────────────────────────────────────────

import { useReducer, useCallback } from 'react'
import { useDataEngine } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'

// ── Public types ──────────────────────────────────────────────────────────────

export type AssignMode =
  | 'decision'
  | 'selectDatasets'
  | 'createDataset'
  | 'orgUnitDeployment'
  | 'sharing'
  | 'confirming'
  | 'running'
  | 'done'
  | 'error'
  | 'idle'

/**
 * DHIS2 access strings (8 chars).
 * Pos 1: metadata read, 2: metadata write, 3: data read, 4: data write (data entry).
 */
export const ACCESS_NONE = '--------'
export const ACCESS_VIEW = 'r-------' // metadata read only
export const ACCESS_VIEW_EDIT = 'rw------' // metadata read+write, no data access
export const ACCESS_VIEW_EDIT_DATA = 'rwrw----' // metadata + data read+write (data entry)

/** User group with access level */
export interface UserGroupAccess {
  id: string
  displayName: string
  access: string
}

/** Lightweight user group reference */
export interface UserGroupRef {
  id: string
  displayName: string
}

/** Lightweight org unit reference */
export interface OrgUnitRef {
  id: string
  displayName: string
}

/** Lightweight org unit group reference */
export interface OrgUnitGroupRef {
  id: string
  displayName: string
}

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
  /** Org unit deployment: all org units (existing only) */
  orgUnits: OrgUnitRef[]
  loadingOrgUnits: boolean
  /** Org unit groups (existing only) */
  orgUnitGroups: OrgUnitGroupRef[]
  loadingOrgUnitGroups: boolean
  /** Selected specific org unit IDs */
  selectedOrgUnitIds: string[]
  /** Selected org unit group IDs (members resolved at apply time) */
  selectedOrgUnitGroupIds: string[]
  /** Resolved org unit count from groups (for confirm display) */
  resolvedOrgUnitCountFromGroups: number
  /** Resolved org unit IDs from groups (for total count deduplication) */
  resolvedOrgUnitIdsFromGroups: string[]
  /** Warning when a selected group has zero members */
  orgUnitGroupZeroMembersWarning: string | null
  /** Sharing: public access (--------, r-------, rw------) */
  publicAccess: string
  /** Sharing: user group accesses */
  userGroupAccesses: UserGroupAccess[]
  /** All user groups for picker */
  userGroups: UserGroupRef[]
  loadingUserGroups: boolean
  /** Sharing errors when partial success (dataset ok, sharing failed) */
  sharingErrors: string[]
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
  | { type: 'GO_BACK_FROM_ORG_UNIT_DEPLOYMENT' }
  | { type: 'GO_BACK_FROM_SHARING' }
  | { type: 'GO_TO_ORG_UNIT_DEPLOYMENT' }
  | { type: 'SET_ORG_UNITS'; orgUnits: OrgUnitRef[] }
  | { type: 'SET_ORG_UNIT_GROUPS'; orgUnitGroups: OrgUnitGroupRef[] }
  | { type: 'TOGGLE_ORG_UNIT'; id: string }
  | { type: 'TOGGLE_ORG_UNIT_GROUP'; id: string }
  | { type: 'SET_RESOLVED_ORG_UNIT_COUNT'; count: number }
  | { type: 'SET_RESOLVED_ORG_UNIT_IDS'; ids: string[] }
  | { type: 'SET_ORG_UNIT_GROUP_ZERO_WARNING'; message: string | null }
  | { type: 'SET_PUBLIC_ACCESS'; access: string }
  | { type: 'SET_USER_GROUPS'; userGroups: UserGroupRef[] }
  | { type: 'SET_USER_GROUP_ACCESS'; id: string; displayName: string; access: string }
  | { type: 'REMOVE_USER_GROUP_ACCESS'; id: string }
  | { type: 'START_RUNNING' }
  | { type: 'SET_DONE'; message: string; sharingErrors?: string[] }
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
      // From createDataset: validate form first
      if (state.mode === 'createDataset') {
        const errors: Partial<Record<keyof NewDataSetForm, string>> = {}
        if (!state.newDataSetForm.name.trim()) errors.name = 'Name is required'
        if (!state.newDataSetForm.shortName.trim()) errors.shortName = 'Short name is required'
        if (Object.keys(errors).length > 0) return { ...state, formErrors: errors }
      }
      // From selectDatasets or createDataset: go to org unit deployment
      if (state.mode === 'selectDatasets' || state.mode === 'createDataset') {
        return {
          ...state,
          mode: 'orgUnitDeployment',
          loadingOrgUnits: true,
          loadingOrgUnitGroups: true,
        }
      }
      // From orgUnitDeployment: go to sharing
      if (state.mode === 'orgUnitDeployment') {
        return {
          ...state,
          mode: 'sharing',
          loadingUserGroups: true,
        }
      }
      // From sharing: go to confirming
      if (state.mode === 'sharing') {
        return { ...state, mode: 'confirming' }
      }
      return state
    }

    case 'CANCEL_CONFIRM':
      return { ...state, mode: 'sharing' }

    case 'GO_BACK_FROM_SHARING':
      return { ...state, mode: 'orgUnitDeployment' }

    case 'GO_BACK_FROM_ORG_UNIT_DEPLOYMENT':
      return {
        ...state,
        mode: state.selectedDataSetIds.length > 0 ? 'selectDatasets' : 'createDataset',
      }

    case 'GO_TO_ORG_UNIT_DEPLOYMENT':
      return {
        ...state,
        mode: 'orgUnitDeployment',
        loadingOrgUnits: true,
        loadingOrgUnitGroups: true,
      }

    case 'SET_ORG_UNITS':
      return { ...state, orgUnits: action.orgUnits, loadingOrgUnits: false }

    case 'SET_ORG_UNIT_GROUPS':
      return { ...state, orgUnitGroups: action.orgUnitGroups, loadingOrgUnitGroups: false }

    case 'TOGGLE_ORG_UNIT': {
      const already = state.selectedOrgUnitIds.includes(action.id)
      return {
        ...state,
        selectedOrgUnitIds: already
          ? state.selectedOrgUnitIds.filter((id) => id !== action.id)
          : [...state.selectedOrgUnitIds, action.id],
      }
    }

    case 'TOGGLE_ORG_UNIT_GROUP': {
      const already = state.selectedOrgUnitGroupIds.includes(action.id)
      return {
        ...state,
        selectedOrgUnitGroupIds: already
          ? state.selectedOrgUnitGroupIds.filter((id) => id !== action.id)
          : [...state.selectedOrgUnitGroupIds, action.id],
      }
    }

    case 'SET_RESOLVED_ORG_UNIT_COUNT':
      return { ...state, resolvedOrgUnitCountFromGroups: action.count }

    case 'SET_RESOLVED_ORG_UNIT_IDS':
      return {
        ...state,
        resolvedOrgUnitIdsFromGroups: action.ids,
        resolvedOrgUnitCountFromGroups: action.ids.length,
      }

    case 'SET_ORG_UNIT_GROUP_ZERO_WARNING':
      return { ...state, orgUnitGroupZeroMembersWarning: action.message }

    case 'SET_PUBLIC_ACCESS':
      return { ...state, publicAccess: action.access }

    case 'SET_USER_GROUPS':
      return { ...state, userGroups: action.userGroups, loadingUserGroups: false }

    case 'SET_USER_GROUP_ACCESS': {
      const existing = state.userGroupAccesses.find((a) => a.id === action.id)
      const updated = existing
        ? state.userGroupAccesses.map((a) =>
            a.id === action.id ? { ...a, access: action.access } : a
          )
        : [
            ...state.userGroupAccesses,
            { id: action.id, displayName: action.displayName, access: action.access },
          ]
      return { ...state, userGroupAccesses: updated }
    }

    case 'REMOVE_USER_GROUP_ACCESS':
      return {
        ...state,
        userGroupAccesses: state.userGroupAccesses.filter((a) => a.id !== action.id),
      }

    case 'START_RUNNING':
      return { ...state, mode: 'running', errors: [] }

    case 'SET_DONE':
      return {
        ...state,
        mode: 'done',
        resultMessage: action.message,
        errors: [],
        sharingErrors: action.sharingErrors ?? [],
      }

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
  orgUnits: [],
  loadingOrgUnits: false,
  orgUnitGroups: [],
  loadingOrgUnitGroups: false,
  selectedOrgUnitIds: [],
  selectedOrgUnitGroupIds: [],
  resolvedOrgUnitCountFromGroups: 0,
  resolvedOrgUnitIdsFromGroups: [],
  orgUnitGroupZeroMembersWarning: null,
  publicAccess: ACCESS_NONE,
  userGroupAccesses: [],
  userGroups: [],
  loadingUserGroups: false,
  sharingErrors: [],
}

// ── Raw DHIS2 response shapes ─────────────────────────────────────────────────

interface RawDataSetsResponse {
  dataSets: Array<{
    id: string
    displayName: string
    dataSetElements?: Array<unknown>
  }>
}

/**
 * Full dataset for PUT update — report-fbr-mali-app pattern.
 * Must include categoryCombo and dataSet in each new DataSetElement.
 * organisationUnits: array of { id } for dataset deployment.
 */
interface FullDataSetForUpdate {
  id: string
  name?: string
  shortName?: string
  periodType?: string
  categoryCombo?: { id: string }
  dataSetElements: Array<{
    dataElement: { id: string }
    categoryCombo?: { id: string }
    dataSet?: { id: string }
  }>
  organisationUnits?: Array<{ id: string }>
  [key: string]: unknown
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
  const goBackFromOrgUnitDeployment = useCallback(
    () => dispatch({ type: 'GO_BACK_FROM_ORG_UNIT_DEPLOYMENT' }),
    []
  )

  // ── Org unit deployment ───────────────────────────────────────────────────

  const toggleOrgUnit = useCallback((id: string) => dispatch({ type: 'TOGGLE_ORG_UNIT', id }), [])
  const toggleOrgUnitGroup = useCallback(
    (id: string) => dispatch({ type: 'TOGGLE_ORG_UNIT_GROUP', id }),
    []
  )

  /** Load org units and groups when entering org unit deployment step */
  const loadOrgUnitsAndGroups = useCallback(async () => {
    try {
      const [ouRes, ougRes] = await Promise.all([
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (engine as any).query({
          orgUnits: {
            resource: 'organisationUnits',
            params: {
              fields: ['id', 'displayName'],
              paging: false,
              order: 'displayName:asc',
            },
          },
        }),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (engine as any).query({
          orgUnitGroups: {
            resource: 'organisationUnitGroups',
            params: {
              fields: ['id', 'displayName'],
              paging: false,
              order: 'displayName:asc',
            },
          },
        }),
      ])
      const orgUnits: OrgUnitRef[] = (ouRes.orgUnits?.organisationUnits ?? []).map(
        (ou: { id: string; displayName?: string }) => ({
          id: ou.id,
          displayName: ou.displayName ?? ou.id,
        })
      )
      const orgUnitGroups: OrgUnitGroupRef[] = (
        ougRes.orgUnitGroups?.organisationUnitGroups ?? []
      ).map((oug: { id: string; displayName?: string }) => ({
        id: oug.id,
        displayName: oug.displayName ?? oug.id,
      }))
      dispatch({ type: 'SET_ORG_UNITS', orgUnits })
      dispatch({ type: 'SET_ORG_UNIT_GROUPS', orgUnitGroups })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({ type: 'SET_LOAD_ERROR', message: msg })
      dispatch({ type: 'SET_ORG_UNITS', orgUnits: [] })
      dispatch({ type: 'SET_ORG_UNIT_GROUPS', orgUnitGroups: [] })
    }
  }, [engine])

  /**
   * Resolve org unit IDs from selected groups.
   * GET organisationUnitGroups/{id}?fields=organisationUnits[id]
   * Returns deduplicated list of org unit IDs.
   */
  const resolveOrgUnitIdsFromGroups = useCallback(
    async (groupIds: string[]): Promise<string[]> => {
      if (groupIds.length === 0) return []
      const allIds = new Set<string>()
      for (const gid of groupIds) {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const res = (await (engine as any).query({
            group: {
              resource: `organisationUnitGroups/${gid}`,
              params: { fields: ['organisationUnits[id]'] },
            },
          })) as { group: { organisationUnits?: Array<{ id: string }> } }
          const ous = res.group?.organisationUnits ?? []
          for (const ou of ous) {
            if (ou?.id) allIds.add(ou.id)
          }
        } catch {
          // Skip groups that fail to load
        }
      }
      return Array.from(allIds)
    },
    [engine]
  )

  /** Load user groups when entering sharing step */
  const loadUserGroups = useCallback(async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const res = (await (engine as any).query({
        userGroups: {
          resource: 'userGroups',
          params: {
            fields: ['id', 'displayName'],
            paging: false,
            order: 'displayName:asc',
          },
        },
      })) as { userGroups: { userGroups?: Array<{ id: string; displayName?: string }> } }
      const groups: UserGroupRef[] = (res.userGroups?.userGroups ?? []).map((g) => ({
        id: g.id,
        displayName: g.displayName ?? g.id,
      }))
      dispatch({ type: 'SET_USER_GROUPS', userGroups: groups })
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err)
      dispatch({ type: 'SET_LOAD_ERROR', message: msg })
      dispatch({ type: 'SET_USER_GROUPS', userGroups: [] })
    }
  }, [engine])

  /** Resolve group members and set count before transitioning to confirm */
  const confirmFromOrgUnitDeployment = useCallback(async () => {
    const resolvedIds = await resolveOrgUnitIdsFromGroups(state.selectedOrgUnitGroupIds)
    dispatch({ type: 'SET_RESOLVED_ORG_UNIT_IDS', ids: resolvedIds })
    if (state.selectedOrgUnitGroupIds.length > 0 && resolvedIds.length === 0) {
      dispatch({
        type: 'SET_ORG_UNIT_GROUP_ZERO_WARNING',
        message: i18n.t(
          'Selected org unit group(s) have no members. No org units will be deployed from groups.'
        ),
      })
    } else {
      dispatch({ type: 'SET_ORG_UNIT_GROUP_ZERO_WARNING', message: null })
    }
    dispatch({ type: 'CONFIRM' })
  }, [state.selectedOrgUnitGroupIds, resolveOrgUnitIdsFromGroups])

  // ── Execute: assign to existing datasets ─────────────────────────────────
  //
  // Uses report-fbr-mali-app pattern: full GET + append dataSetElements + PUT.
  // Each new DataSetElement must include dataElement, categoryCombo (dataset's),
  // and dataSet — DHIS2 requires the full composite for Hibernate to persist.
  // The collections API (POST /dataElements) can fail for newly created elements
  // due to timing or categoryCombo mismatches; this approach is more reliable.

  /**
   * Apply sharing to a dataset. GET current sharing, merge, POST.
   * Preserves owner, user, externalAccess when merging.
   */
  const applySharingToDataSet = useCallback(
    async (
      dataSetId: string,
      publicAccess: string,
      userGroupAccesses: UserGroupAccess[]
    ): Promise<string | null> => {
      try {
        // GET current sharing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const getRes = (await (engine as any).query({
          sharing: {
            resource: 'sharing',
            params: { type: 'dataSet', id: dataSetId },
          },
        })) as {
          sharing?: {
            object?: {
              publicAccess?: string
              externalAccess?: boolean
              user?: { id?: string }
              userGroupAccesses?: Array<{ id: string; access: string }>
            }
          }
        }
        const current = getRes.sharing?.object ?? {}
        const merged = {
          ...current,
          publicAccess,
          externalAccess: current.externalAccess ?? false,
          user: current.user ?? {},
          userGroupAccesses: userGroupAccesses.map(({ id, access }) => ({ id, access })),
        }
        // POST updated sharing
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await (engine as any).mutate({
          resource: 'sharing',
          type: 'create',
          params: { type: 'dataSet', id: dataSetId },
          data: { object: merged },
        })
        return null
      } catch (err) {
        return err instanceof Error ? err.message : String(err)
      }
    },
    [engine]
  )

  const executeAssignExisting = useCallback(
    async (
      _createdElements: CreatedElement[],
      elementIdsToAssign: string[],
      orgUnitIdsToDeploy: string[],
      sharingConfig: { publicAccess: string; userGroupAccesses: UserGroupAccess[] }
    ) => {
      dispatch({ type: 'START_RUNNING' })
      const errors: string[] = []

      for (const dataSetId of state.selectedDataSetIds) {
        try {
          // ── Step 1: fetch full dataset (report-fbr-mali-app pattern) ──────
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const detail = (await (engine as any).query({
            ds: {
              resource: `dataSets/${dataSetId}`,
              params: { fields: ':owner' },
            },
          })) as { ds: FullDataSetForUpdate }

          const dataSet = detail.ds

          // ── Data elements: append new (merge, never overwrite) ────────────
          const existingDeIds = new Set(
            (dataSet.dataSetElements ?? []).map((dse) => dse.dataElement.id)
          )
          const toAddDe = elementIdsToAssign.filter((id) => !existingDeIds.has(id))
          const categoryCombo = dataSet.categoryCombo
          if (toAddDe.length > 0) {
            if (!categoryCombo?.id) {
              errors.push(
                `${dataSet.name ?? dataSetId}: Dataset has no categoryCombo — cannot add elements`
              )
              continue
            }
            for (const deId of toAddDe) {
              dataSet.dataSetElements = dataSet.dataSetElements ?? []
              dataSet.dataSetElements.push({
                dataElement: { id: deId },
                categoryCombo: { id: categoryCombo.id },
                dataSet: { id: dataSet.id },
              })
            }
          }

          // ── Organisation units: merge (never overwrite existing) ───────────
          const existingOuIds = new Set((dataSet.organisationUnits ?? []).map((ou) => ou.id))
          const toAddOu = orgUnitIdsToDeploy.filter((id) => !existingOuIds.has(id))
          if (toAddOu.length > 0) {
            dataSet.organisationUnits = dataSet.organisationUnits ?? []
            for (const ouId of toAddOu) {
              dataSet.organisationUnits.push({ id: ouId })
            }
          }

          if (toAddDe.length === 0 && toAddOu.length === 0) continue

          // ── Step 2: PUT full dataset back ─────────────────────────────────
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await (engine as any).mutate({
            resource: 'dataSets',
            type: 'update',
            id: dataSetId,
            params: { mergeMode: 'REPLACE' },
            data: dataSet,
          })
        } catch (err) {
          const ds = state.allDataSets.find((d) => d.id === dataSetId)
          const label = ds?.displayName ?? dataSetId
          const msg = err instanceof Error ? err.message : String(err)
          errors.push(`${label}: ${msg}`)
        }
      }

      const sharingErrors: string[] = []
      const hasSharingConfig =
        sharingConfig.publicAccess !== ACCESS_NONE || sharingConfig.userGroupAccesses.length > 0
      if (errors.length === 0 && hasSharingConfig) {
        for (const dataSetId of state.selectedDataSetIds) {
          const err = await applySharingToDataSet(
            dataSetId,
            sharingConfig.publicAccess,
            sharingConfig.userGroupAccesses
          )
          if (err) {
            const ds = state.allDataSets.find((d) => d.id === dataSetId)
            sharingErrors.push(`${ds?.displayName ?? dataSetId}: ${err}`)
          }
        }
      }

      if (errors.length > 0) {
        dispatch({ type: 'SET_ERROR', errors })
      } else {
        const dsNames = state.selectedDataSetIds
          .map((id) => state.allDataSets.find((d) => d.id === id)?.displayName ?? id)
          .join(', ')
        const parts: string[] = []
        if (elementIdsToAssign.length > 0) {
          parts.push(`${elementIdsToAssign.length} element(s) assigned`)
        }
        if (orgUnitIdsToDeploy.length > 0) {
          parts.push(`deployed to ${orgUnitIdsToDeploy.length} organisation unit(s)`)
        }
        if (
          sharingErrors.length === 0 &&
          (sharingConfig.publicAccess !== ACCESS_NONE || sharingConfig.userGroupAccesses.length > 0)
        ) {
          parts.push('sharing updated')
        }
        const summary =
          parts.length > 0 ? `${parts.join(', ')} — ${dsNames}` : `Dataset(s) updated: ${dsNames}`
        dispatch({
          type: 'SET_DONE',
          message: summary,
          sharingErrors: sharingErrors.length > 0 ? sharingErrors : undefined,
        })
      }
    },
    [engine, state.selectedDataSetIds, state.allDataSets, applySharingToDataSet]
  )

  // ── Execute: create new dataset with elements ─────────────────────────────

  const executeCreateNew = useCallback(
    async (
      elementIdsToAssign: string[],
      categoryComboId: string,
      orgUnitIdsToDeploy: string[],
      sharingConfig: { publicAccess: string; userGroupAccesses: UserGroupAccess[] }
    ) => {
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

      if (categoryComboId) {
        payload.categoryCombo = { id: categoryComboId }
      }

      if (orgUnitIdsToDeploy.length > 0) {
        payload.organisationUnits = orgUnitIdsToDeploy.map((id) => ({ id }))
      }

      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const createRes = (await (engine as any).mutate({
          resource: 'dataSets',
          type: 'create',
          data: payload,
        })) as Record<string, unknown>
        const createdId =
          (createRes?.response as { uid?: string })?.uid ??
          (createRes?.id as string) ??
          (createRes?.response as { id?: string })?.id
        const sharingErrors: string[] = []
        if (
          createdId &&
          (sharingConfig.publicAccess !== ACCESS_NONE || sharingConfig.userGroupAccesses.length > 0)
        ) {
          const err = await applySharingToDataSet(
            createdId,
            sharingConfig.publicAccess,
            sharingConfig.userGroupAccesses
          )
          if (err) sharingErrors.push(err)
        }
        const parts: string[] = []
        parts.push(`Dataset "${name.trim()}" created`)
        if (elementIdsToAssign.length > 0) {
          parts.push(`${elementIdsToAssign.length} element(s) assigned`)
        }
        if (orgUnitIdsToDeploy.length > 0) {
          parts.push(`deployed to ${orgUnitIdsToDeploy.length} organisation unit(s)`)
        }
        if (
          sharingErrors.length === 0 &&
          (sharingConfig.publicAccess !== ACCESS_NONE || sharingConfig.userGroupAccesses.length > 0)
        ) {
          parts.push('sharing updated')
        }
        dispatch({
          type: 'SET_DONE',
          message: parts.join(', '),
          sharingErrors: sharingErrors.length > 0 ? sharingErrors : undefined,
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err)
        dispatch({ type: 'SET_ERROR', errors: [msg] })
      }
    },
    [engine, state.newDataSetForm, applySharingToDataSet]
  )

  const reset = useCallback(() => dispatch({ type: 'RESET' }), [])

  // ── Sharing actions (for modal) ───────────────────────────────────────────

  const setPublicAccess = useCallback(
    (access: string) => dispatch({ type: 'SET_PUBLIC_ACCESS', access }),
    []
  )
  const setUserGroupAccess = useCallback(
    (id: string, displayName: string, access: string) =>
      dispatch({ type: 'SET_USER_GROUP_ACCESS', id, displayName, access }),
    []
  )
  const removeUserGroupAccess = useCallback(
    (id: string) => dispatch({ type: 'REMOVE_USER_GROUP_ACCESS', id }),
    []
  )
  const goBackFromSharing = useCallback(() => dispatch({ type: 'GO_BACK_FROM_SHARING' }), [])

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
    confirmFromOrgUnitDeployment,
    cancelConfirm,
    goBackFromOrgUnitDeployment,
    toggleOrgUnit,
    toggleOrgUnitGroup,
    loadOrgUnitsAndGroups,
    resolveOrgUnitIdsFromGroups,
    loadUserGroups,
    setPublicAccess,
    setUserGroupAccess,
    removeUserGroupAccess,
    goBackFromSharing,
    executeAssignExisting,
    executeCreateNew,
    reset,
  }
}
