// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/hooks/useGovernance.ts
//
// Central React hook for the OU Governance module.
// Wraps the in-memory store and exposes typed state + actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback } from 'react'
import type { GovernanceRequest, WorkflowStatus, DemoRole, RequestFormValues } from '../types'
import * as store from '../store/governanceStore'

export interface GovernanceState {
  requests: GovernanceRequest[]
  selectedId: string | null
  role: DemoRole
  /** Panel mode: null = table, 'create' = new form, 'edit' = edit form, 'view' = detail */
  panel: 'table' | 'create' | 'edit' | 'view'
  /** Comment entered when doing a transition */
  transitionComment: string
  /** Which request is being confirmed for a transition */
  pendingTransition: {
    requestId: string
    toStatus: WorkflowStatus
    role: DemoRole
  } | null
}

const INITIAL: GovernanceState = {
  requests: store.getAll(),
  selectedId: null,
  role: 'DISTRICT',
  panel: 'table',
  transitionComment: '',
  pendingTransition: null,
}

export function useGovernance() {
  const [state, setState] = useState<GovernanceState>(INITIAL)

  /** Refresh requests from store */
  const refresh = useCallback(() => {
    setState((s) => ({ ...s, requests: store.getAll() }))
  }, [])

  /** Switch demo role */
  const setRole = useCallback((role: DemoRole) => {
    setState((s) => ({ ...s, role }))
  }, [])

  /** Open create form */
  const openCreate = useCallback(() => {
    setState((s) => ({ ...s, panel: 'create', selectedId: null }))
  }, [])

  /** Open edit form */
  const openEdit = useCallback((id: string) => {
    setState((s) => ({ ...s, panel: 'edit', selectedId: id }))
  }, [])

  /** Open detail view */
  const openView = useCallback((id: string) => {
    setState((s) => ({ ...s, panel: 'view', selectedId: id }))
  }, [])

  /** Back to table */
  const backToTable = useCallback(() => {
    setState((s) => ({ ...s, panel: 'table', selectedId: null, pendingTransition: null }))
  }, [])

  /** Save a new request */
  const saveRequest = useCallback(
    (values: RequestFormValues, asDraft: boolean) => {
      store.createRequest(values, state.role, asDraft)
      setState((s) => ({ ...s, panel: 'table', requests: store.getAll() }))
    },
    [state.role]
  )

  /** Update an existing draft */
  const updateRequest = useCallback((id: string, values: Partial<RequestFormValues>) => {
    store.updateRequest(id, values)
    setState((s) => ({ ...s, panel: 'table', requests: store.getAll() }))
  }, [])

  /** Delete a draft request */
  const deleteRequest = useCallback((id: string) => {
    store.deleteRequest(id)
    setState((s) => ({
      ...s,
      requests: store.getAll(),
      selectedId: s.selectedId === id ? null : s.selectedId,
      panel: s.selectedId === id ? 'table' : s.panel,
    }))
  }, [])

  /** Set the transition comment */
  const setTransitionComment = useCallback((comment: string) => {
    setState((s) => ({ ...s, transitionComment: comment }))
  }, [])

  /** Initiate a status transition (shows confirmation inline) */
  const initiateTransition = useCallback((requestId: string, toStatus: WorkflowStatus) => {
    setState((s) => ({
      ...s,
      pendingTransition: { requestId, toStatus, role: s.role },
      transitionComment: '',
    }))
  }, [])

  /** Confirm and execute the pending transition */
  const confirmTransition = useCallback(() => {
    setState((s) => {
      if (!s.pendingTransition) return s
      const { requestId, toStatus, role } = s.pendingTransition
      store.transitionRequest(requestId, toStatus, role, s.transitionComment || undefined)
      return {
        ...s,
        requests: store.getAll(),
        pendingTransition: null,
        transitionComment: '',
        // If we're in view mode, re-select to refresh
        selectedId: s.panel === 'view' ? requestId : s.selectedId,
      }
    })
  }, [])

  /** Cancel the pending transition */
  const cancelTransition = useCallback(() => {
    setState((s) => ({ ...s, pendingTransition: null, transitionComment: '' }))
  }, [])

  /** Currently selected request */
  const selectedRequest = state.selectedId
    ? (state.requests.find((r) => r.id === state.selectedId) ?? null)
    : null

  return {
    state,
    selectedRequest,
    refresh,
    setRole,
    openCreate,
    openEdit,
    openView,
    backToTable,
    saveRequest,
    updateRequest,
    deleteRequest,
    setTransitionComment,
    initiateTransition,
    confirmTransition,
    cancelTransition,
  }
}
