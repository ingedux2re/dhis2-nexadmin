// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/RequestDetail.tsx
//
// Full detail view for a governance request.
// Shows all fields, a Pipeline, action buttons for the current role,
// and a timeline / history panel.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { GovernanceRequest, WorkflowStatus, DemoRole } from '../types'
import { getAllowedTransitions } from '../types'
import { Pipeline } from './Pipeline'
import { StatusBadge } from './StatusBadge'
import { Timeline } from './Timeline'
import styles from './RequestDetail.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'en'

function formatDate(iso: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'long' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(LOCALE, { dateStyle: 'medium', timeStyle: 'short' }).format(
      new Date(iso)
    )
  } catch {
    return iso
  }
}

function formatFacilityType(type: string): string {
  return type.replace(/_/g, ' ')
}

// ── Variant button mapping ────────────────────────────────────────────────────

function btnClass(variant: string): string {
  switch (variant) {
    case 'primary':
      return `${styles.btn} ${styles.btnPrimary}`
    case 'success':
      return `${styles.btn} ${styles.btnSuccess}`
    case 'danger':
      return `${styles.btn} ${styles.btnDanger}`
    default:
      return `${styles.btn} ${styles.btnGhost}`
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface RequestDetailProps {
  request: GovernanceRequest
  currentRole: DemoRole
  pendingTransition: { requestId: string; toStatus: WorkflowStatus } | null
  transitionComment: string
  onInitiateTransition: (id: string, toStatus: WorkflowStatus) => void
  onConfirmTransition: () => void
  onCancelTransition: () => void
  onCommentChange: (comment: string) => void
  onBack: () => void
  onEdit: (id: string) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RequestDetail: FC<RequestDetailProps> = ({
  request,
  currentRole,
  pendingTransition,
  transitionComment,
  onInitiateTransition,
  onConfirmTransition,
  onCancelTransition,
  onCommentChange,
  onBack,
  onEdit,
}) => {
  const transitions = getAllowedTransitions(request.status, currentRole)
  const canEdit = request.status === 'DRAFT' && currentRole === 'DISTRICT'
  const isPending = pendingTransition !== null && pendingTransition.requestId === request.id

  return (
    <div>
      {/* Back button */}
      <button
        type="button"
        onClick={onBack}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 'var(--space-2)',
          background: 'transparent',
          border: 'none',
          color: 'var(--text-secondary)',
          fontSize: 'var(--text-sm)',
          fontWeight: 'var(--weight-medium)',
          cursor: 'pointer',
          marginBottom: 'var(--space-4)',
          padding: 0,
          fontFamily: 'var(--font-sans)',
        }}
      >
        <span className="material-icons-round" style={{ fontSize: 18 }}>
          arrow_back
        </span>
        {i18n.t('Back to requests')}
      </button>

      {/* Pipeline */}
      <div style={{ marginBottom: 'var(--space-5)' }}>
        <Pipeline currentStatus={request.status} />
      </div>

      {/* Two-column layout */}
      <div className={styles.layout}>
        {/* ── Left: request detail card ──── */}
        <div className={styles.card}>
          {/* Card header */}
          <div className={styles.cardHead}>
            <div className={styles.cardHeadIcon}>
              <span className="material-icons-round">add_location_alt</span>
            </div>
            <div className={styles.cardHeadMeta}>
              <div className={styles.cardHeadRef}>{request.reference}</div>
              <div className={styles.cardHeadTitle}>{request.facilityName}</div>
              <StatusBadge status={request.status} />
            </div>
            {canEdit && (
              <div className={styles.cardHeadActions}>
                <button
                  type="button"
                  className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                  onClick={() => onEdit(request.id)}
                >
                  <span className="material-icons-round">edit</span>
                  {i18n.t('Edit')}
                </button>
              </div>
            )}
          </div>

          {/* Fields */}
          <div className={styles.cardBody}>
            <div className={styles.fieldGrid}>
              {/* Assigned UID (if created) */}
              {request.assignedUid && (
                <div className={styles.uidBanner}>
                  <span className="material-icons-round">fingerprint</span>
                  <span className={styles.uidBannerLabel}>{i18n.t('DHIS2 UID assigned')}</span>
                  <span className={styles.uidBannerValue}>{request.assignedUid}</span>
                </div>
              )}

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Facility Name')}</span>
                <span className={styles.fieldValue}>{request.facilityName}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Short Name')}</span>
                <span className={styles.fieldValue}>{request.shortName || '—'}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Facility Type')}</span>
                <span className={styles.fieldValue}>
                  {i18n.t(formatFacilityType(request.facilityType))}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Level')}</span>
                <span className={styles.fieldValue}>
                  {i18n.t('Level {{n}}', { n: request.level })}
                </span>
              </div>

              <div className={`${styles.field} ${styles.fieldFull}`}>
                <span className={styles.fieldLabel}>{i18n.t('Proposed Parent')}</span>
                <span className={styles.fieldValue}>{request.proposedParentName || '—'}</span>
              </div>

              {/* Geo section */}
              <div className={styles.sectionTitle}>{i18n.t('Location')}</div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Latitude')}</span>
                <span className={styles.fieldValue}>
                  {request.latitude ? (
                    <span className={styles.fieldValueMono}>{request.latitude}</span>
                  ) : (
                    <span className={styles.fieldValueMuted}>—</span>
                  )}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Longitude')}</span>
                <span className={styles.fieldValue}>
                  {request.longitude ? (
                    <span className={styles.fieldValueMono}>{request.longitude}</span>
                  ) : (
                    <span className={styles.fieldValueMuted}>—</span>
                  )}
                </span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Opening Date')}</span>
                <span className={styles.fieldValue}>
                  {request.openingDate ? formatDate(request.openingDate) : '—'}
                </span>
              </div>

              {/* Metadata section */}
              <div className={styles.sectionTitle}>{i18n.t('Metadata')}</div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Created')}</span>
                <span className={styles.fieldValue}>{formatDateTime(request.createdAt)}</span>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>{i18n.t('Last Updated')}</span>
                <span className={styles.fieldValue}>{formatDateTime(request.lastUpdated)}</span>
              </div>

              {/* Comments */}
              {request.regionComment && (
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <span className={styles.fieldLabel}>{i18n.t('Region Comment')}</span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      background: 'var(--grey-50)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      fontStyle: 'italic',
                    }}
                  >
                    {request.regionComment}
                  </span>
                </div>
              )}

              {request.adminComment && (
                <div className={`${styles.field} ${styles.fieldFull}`}>
                  <span className={styles.fieldLabel}>{i18n.t('Admin Comment')}</span>
                  <span
                    style={{
                      fontSize: 'var(--text-sm)',
                      color: 'var(--text-secondary)',
                      background: 'var(--grey-50)',
                      border: '1px solid var(--border-subtle)',
                      borderRadius: 'var(--radius-md)',
                      padding: 'var(--space-3)',
                      fontStyle: 'italic',
                    }}
                  >
                    {request.adminComment}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right column: actions + history ──── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
          {/* Transition panel */}
          {(transitions.length > 0 || isPending) && (
            <div className={styles.transitionPanel}>
              <div className={styles.transitionHead}>
                <span className="material-icons-round">rule</span>
                {i18n.t('Available Actions')}
              </div>
              <div className={styles.transitionBody}>
                {!isPending ? (
                  <>
                    <div
                      style={{
                        fontSize: 'var(--text-xs)',
                        color: 'var(--text-tertiary)',
                        marginBottom: 'var(--space-1)',
                      }}
                    >
                      {i18n.t('Actions available as {{role}}', {
                        role:
                          currentRole === 'DISTRICT'
                            ? i18n.t('District Officer')
                            : currentRole === 'REGION'
                              ? i18n.t('Region Officer')
                              : i18n.t('National Admin'),
                      })}
                    </div>
                    <div className={styles.transitionBtns}>
                      {transitions.map((t) => (
                        <button
                          key={t.to}
                          type="button"
                          className={btnClass(t.variant)}
                          onClick={() => onInitiateTransition(request.id, t.to)}
                        >
                          <span className="material-icons-round">{t.icon}</span>
                          {i18n.t(t.labelKey)}
                        </button>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className={styles.confirmBox}>
                    <div className={styles.confirmTitle}>
                      {i18n.t('Confirm transition to {{status}}', {
                        status: pendingTransition ? i18n.t(pendingTransition.toStatus) : '',
                      })}
                    </div>
                    <textarea
                      className={styles.commentArea}
                      value={transitionComment}
                      onChange={(e) => onCommentChange(e.target.value)}
                      placeholder={i18n.t('Add a comment (optional)…')}
                      aria-label={i18n.t('Transition comment')}
                    />
                    <div className={styles.confirmActions}>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
                        onClick={onCancelTransition}
                      >
                        {i18n.t('Cancel')}
                      </button>
                      <button
                        type="button"
                        className={`${styles.btn} ${styles.btnPrimary} ${styles.btnSmall}`}
                        onClick={onConfirmTransition}
                      >
                        <span className="material-icons-round">check</span>
                        {i18n.t('Confirm')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* History / timeline panel */}
          <div className={styles.historyPanel}>
            <div className={styles.historyHead}>
              <span className="material-icons-round">history</span>
              {i18n.t('Request History')}
            </div>
            <div className={styles.historyBody}>
              <Timeline events={request.timeline} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RequestDetail
