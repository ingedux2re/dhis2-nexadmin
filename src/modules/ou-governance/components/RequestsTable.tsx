// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/RequestsTable.tsx
//
// Table listing all governance requests with search, filter and actions.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useMemo, type FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { GovernanceRequest, WorkflowStatus, DemoRole } from '../types'
import { getAllowedTransitions } from '../types'
import { StatusBadge } from './StatusBadge'
import styles from './RequestsTable.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'en'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatFacilityType(type: string): string {
  return type.replace(/_/g, ' ')
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RequestsTableProps {
  requests: GovernanceRequest[]
  currentRole: DemoRole
  onView: (id: string) => void
  onEdit: (id: string) => void
  onDelete: (id: string) => void
  onInitiateTransition: (id: string, toStatus: WorkflowStatus) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RequestsTable: FC<RequestsTableProps> = ({
  requests,
  currentRole,
  onView,
  onEdit,
  onDelete,
  onInitiateTransition,
}) => {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<WorkflowStatus | ''>('')

  const filtered = useMemo(() => {
    return requests.filter((r) => {
      const matchSearch =
        !search ||
        r.facilityName.toLowerCase().includes(search.toLowerCase()) ||
        r.reference.toLowerCase().includes(search.toLowerCase()) ||
        r.proposedParentName.toLowerCase().includes(search.toLowerCase())
      const matchStatus = !statusFilter || r.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [requests, search, statusFilter])

  const STATUS_OPTIONS: WorkflowStatus[] = [
    'DRAFT',
    'SUBMITTED',
    'UNDER_REVIEW',
    'VALIDATED',
    'CREATED',
    'REJECTED',
  ]

  return (
    <div className={styles.wrapper}>
      {/* Toolbar */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarTitle}>
          {i18n.t('Facility Requests')}
          <span className={styles.count}>{filtered.length}</span>
        </div>

        {/* Search */}
        <div className={styles.searchWrap}>
          <span className={`${styles.searchIcon} material-icons-round`} aria-hidden="true">
            search
          </span>
          <input
            className={styles.searchInput}
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={i18n.t('Search requests…')}
            aria-label={i18n.t('Search requests')}
          />
        </div>

        {/* Status filter */}
        <select
          className={styles.filterSelect}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as WorkflowStatus | '')}
          aria-label={i18n.t('Filter by status')}
        >
          <option value="">{i18n.t('All statuses')}</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {i18n.t(s)}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <span className="material-icons-round">search_off</span>
          <div className={styles.emptyTitle}>{i18n.t('No requests found')}</div>
          <div className={styles.emptyText}>
            {search || statusFilter
              ? i18n.t('Try adjusting your search or filter')
              : i18n.t('Create a new request to get started')}
          </div>
        </div>
      ) : (
        <div className={styles.tableScroll}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{i18n.t('Reference')}</th>
                <th>{i18n.t('Facility Name')}</th>
                <th>{i18n.t('Type')}</th>
                <th>{i18n.t('Proposed Parent')}</th>
                <th>{i18n.t('Submitted')}</th>
                <th>{i18n.t('Status')}</th>
                <th>{i18n.t('Comment')}</th>
                <th>{i18n.t('Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((req) => {
                const transitions = getAllowedTransitions(req.status, currentRole)
                const canEdit = req.status === 'DRAFT' && currentRole === 'DISTRICT'
                const canDelete = req.status === 'DRAFT' && currentRole === 'DISTRICT'
                const comment = req.regionComment || req.adminComment || ''

                return (
                  <tr
                    key={req.id}
                    onClick={() => onView(req.id)}
                    aria-label={i18n.t('View request {{ref}}', { ref: req.reference })}
                  >
                    <td className={styles.refCell}>{req.reference}</td>
                    <td className={styles.nameCell}>{req.facilityName}</td>
                    <td>
                      <span className={styles.typeChip}>
                        {i18n.t(formatFacilityType(req.facilityType))}
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-sm)' }}>
                      {req.proposedParentName || '—'}
                    </td>
                    <td className={styles.dateCell}>{formatDate(req.createdAt)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={req.status} />
                    </td>
                    <td className={styles.commentCell} title={comment}>
                      {comment || '—'}
                    </td>
                    <td onClick={(e) => e.stopPropagation()} style={{ whiteSpace: 'nowrap' }}>
                      <div className={styles.actions}>
                        {/* View */}
                        <button
                          type="button"
                          className={styles.actionBtn}
                          onClick={() => onView(req.id)}
                          title={i18n.t('View details')}
                          aria-label={i18n.t('View {{ref}}', { ref: req.reference })}
                        >
                          <span className="material-icons-round">visibility</span>
                        </button>

                        {/* Edit (draft only) */}
                        {canEdit && (
                          <button
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => onEdit(req.id)}
                            title={i18n.t('Edit draft')}
                            aria-label={i18n.t('Edit {{ref}}', { ref: req.reference })}
                          >
                            <span className="material-icons-round">edit</span>
                          </button>
                        )}

                        {/* Workflow transitions */}
                        {transitions.map((t) => (
                          <button
                            key={t.to}
                            type="button"
                            className={styles.actionBtn}
                            onClick={() => onInitiateTransition(req.id, t.to)}
                            title={i18n.t(t.labelKey)}
                            aria-label={`${i18n.t(t.labelKey)} — ${req.reference}`}
                          >
                            <span className="material-icons-round">{t.icon}</span>
                          </button>
                        ))}

                        {/* Delete (draft only) */}
                        {canDelete && (
                          <button
                            type="button"
                            className={`${styles.actionBtn} ${styles.actionBtnDanger}`}
                            onClick={() => onDelete(req.id)}
                            title={i18n.t('Delete draft')}
                            aria-label={i18n.t('Delete {{ref}}', { ref: req.reference })}
                          >
                            <span className="material-icons-round">delete</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default RequestsTable
