// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/views/OuGovernancePage.tsx
//
// Entry point for the Organisation Unit Governance Workflow module.
// Orchestrates role switching, the requests table, create/edit form,
// and detail view.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../../../components/shared/PageHeader'
import { RoleSwitcher } from '../components/RoleSwitcher'
import { RequestsTable } from '../components/RequestsTable'
import { RequestForm } from '../components/RequestForm'
import { RequestDetail } from '../components/RequestDetail'
import { GovernanceStats } from '../components/GovernanceStats'
import { TransitionConfirm } from '../components/TransitionConfirm'
import { useGovernance } from '../hooks/useGovernance'
import type { RequestFormValues } from '../types'
import styles from './OuGovernancePage.module.css'

// ── Component ─────────────────────────────────────────────────────────────────

const OuGovernancePage: FC = () => {
  const {
    state,
    selectedRequest,
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
  } = useGovernance()

  const { panel, role, requests, pendingTransition, transitionComment } = state

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleSaveDraft(values: RequestFormValues) {
    if (panel === 'edit' && selectedRequest) {
      updateRequest(selectedRequest.id, values)
    } else {
      saveRequest(values, true)
    }
  }

  function handleSubmit(values: RequestFormValues) {
    if (panel === 'edit' && selectedRequest) {
      updateRequest(selectedRequest.id, values)
    } else {
      saveRequest(values, false)
    }
  }

  // ── Pending transition modal (from table row) ─────────────────────────────

  const pendingRequest =
    pendingTransition && panel === 'table'
      ? requests.find((r) => r.id === pendingTransition.requestId)
      : null

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* Page header */}
      <PageHeader
        icon="account_tree"
        title={i18n.t('OU Governance Workflow')}
        description={i18n.t(
          'Manage the lifecycle of organisation unit creation requests through a structured approval pipeline (District, Region, National Admin).'
        )}
        accentColor="brand"
        badge={
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              padding: '3px 10px',
              borderRadius: 'var(--radius-full)',
              fontSize: 'var(--text-xs)',
              fontWeight: 'var(--weight-semibold)',
              background: 'rgba(57, 73, 171, 0.1)',
              color: 'var(--brand-700)',
              border: '1px solid var(--brand-100)',
            }}
          >
            <span className="material-icons-round" style={{ fontSize: 13 }}>
              science
            </span>
            {i18n.t('MVP Demo')}
          </span>
        }
        actions={
          panel === 'table' && role === 'DISTRICT' ? (
            <button
              type="button"
              onClick={openCreate}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 'var(--space-2)',
                padding: 'var(--space-2) var(--space-4)',
                borderRadius: 'var(--radius-md)',
                border: 'none',
                background: 'var(--brand-500)',
                color: 'white',
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-semibold)',
                fontFamily: 'var(--font-sans)',
                cursor: 'pointer',
                transition: 'background var(--transition-fast)',
              }}
            >
              <span className="material-icons-round" style={{ fontSize: 18 }}>
                add
              </span>
              {i18n.t('New Request')}
            </button>
          ) : undefined
        }
      />

      {/* Role switcher (always visible) */}
      <RoleSwitcher currentRole={role} onRoleChange={setRole} />

      {/* ── Table view ─────────────────────────────────────────── */}
      {panel === 'table' && (
        <>
          {/* Stats */}
          <GovernanceStats requests={requests} />

          {/* Requests table */}
          <RequestsTable
            requests={requests}
            currentRole={role}
            onView={openView}
            onEdit={openEdit}
            onDelete={deleteRequest}
            onInitiateTransition={initiateTransition}
          />
        </>
      )}

      {/* ── Create / Edit form ──────────────────────────────────── */}
      {(panel === 'create' || panel === 'edit') && (
        <RequestForm
          existing={panel === 'edit' ? (selectedRequest ?? undefined) : undefined}
          onSaveDraft={handleSaveDraft}
          onSubmit={handleSubmit}
          onCancel={backToTable}
        />
      )}

      {/* ── Detail view ─────────────────────────────────────────── */}
      {panel === 'view' && selectedRequest && (
        <RequestDetail
          request={selectedRequest}
          currentRole={role}
          pendingTransition={pendingTransition}
          transitionComment={transitionComment}
          onInitiateTransition={initiateTransition}
          onConfirmTransition={confirmTransition}
          onCancelTransition={cancelTransition}
          onCommentChange={setTransitionComment}
          onBack={backToTable}
          onEdit={openEdit}
        />
      )}

      {/* ── Transition confirm modal (from table) ───────────────── */}
      {pendingRequest && pendingTransition && panel === 'table' && (
        <TransitionConfirm
          request={pendingRequest}
          toStatus={pendingTransition.toStatus}
          comment={transitionComment}
          onCommentChange={setTransitionComment}
          onConfirm={confirmTransition}
          onCancel={cancelTransition}
        />
      )}
    </div>
  )
}

export default OuGovernancePage
