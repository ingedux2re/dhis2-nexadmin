// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/TransitionConfirm.tsx
//
// Inline modal-like dialog shown when a transition is initiated from the table.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { WorkflowStatus, GovernanceRequest } from '../types'
import { ALLOWED_TRANSITIONS } from '../types'
import styles from './RequestDetail.module.css'

interface TransitionConfirmProps {
  request: GovernanceRequest
  toStatus: WorkflowStatus
  comment: string
  onCommentChange: (c: string) => void
  onConfirm: () => void
  onCancel: () => void
}

export const TransitionConfirm: FC<TransitionConfirmProps> = ({
  request,
  toStatus,
  comment,
  onCommentChange,
  onConfirm,
  onCancel,
}) => {
  const transition = ALLOWED_TRANSITIONS.find((t) => t.from === request.status && t.to === toStatus)

  const needsComment = toStatus === 'REJECTED' || toStatus === 'VALIDATED' || toStatus === 'CREATED'

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--surface-overlay)',
        zIndex: 'var(--z-modal)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-4)',
      }}
      role="dialog"
      aria-modal="true"
      aria-label={i18n.t('Confirm transition')}
    >
      <div
        style={{
          background: 'var(--surface-card)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: 'var(--shadow-2xl)',
          width: '100%',
          maxWidth: 480,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--space-3)',
            padding: 'var(--space-5) var(--space-6)',
            borderBottom: '1px solid var(--border-subtle)',
            background: 'var(--grey-50)',
          }}
        >
          <span
            className="material-icons-round"
            style={{ color: 'var(--brand-500)', fontSize: 22 }}
          >
            {transition?.icon ?? 'swap_horiz'}
          </span>
          <div>
            <div
              style={{
                fontSize: 'var(--text-md)',
                fontWeight: 'var(--weight-semibold)',
                color: 'var(--text-primary)',
              }}
            >
              {transition ? i18n.t(transition.labelKey) : i18n.t('Confirm transition')}
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {request.reference} — {request.facilityName}
            </div>
          </div>
        </div>

        {/* Body */}
        <div
          style={{
            padding: 'var(--space-5) var(--space-6)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-4)',
          }}
        >
          <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
            {i18n.t('This will move the request to status {{status}}', {
              status: i18n.t(toStatus),
            })}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            <label
              htmlFor="transition-comment"
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 'var(--weight-medium)',
                color: 'var(--text-primary)',
              }}
            >
              {needsComment ? (
                <>
                  {i18n.t('Comment')}
                  <span style={{ color: 'var(--color-danger-text)', marginLeft: 2 }}>*</span>
                </>
              ) : (
                i18n.t('Comment (optional)')
              )}
            </label>
            <textarea
              id="transition-comment"
              className={styles.commentArea}
              value={comment}
              onChange={(e) => onCommentChange(e.target.value)}
              placeholder={
                toStatus === 'REJECTED'
                  ? i18n.t('Reason for rejection…')
                  : toStatus === 'VALIDATED'
                    ? i18n.t('Validation notes…')
                    : i18n.t('Add a comment…')
              }
              rows={3}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-end',
            gap: 'var(--space-3)',
            padding: 'var(--space-4) var(--space-6)',
            borderTop: '1px solid var(--border-subtle)',
            background: 'var(--grey-50)',
          }}
        >
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
            onClick={onCancel}
          >
            {i18n.t('Cancel')}
          </button>
          <button
            type="button"
            className={`${styles.btn} ${
              toStatus === 'REJECTED'
                ? styles.btnDanger
                : toStatus === 'VALIDATED' || toStatus === 'CREATED'
                  ? styles.btnSuccess
                  : styles.btnPrimary
            } ${styles.btnSmall}`}
            onClick={onConfirm}
            disabled={needsComment && !comment.trim()}
          >
            <span className="material-icons-round">{transition?.icon ?? 'check'}</span>
            {i18n.t('Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}

export default TransitionConfirm
