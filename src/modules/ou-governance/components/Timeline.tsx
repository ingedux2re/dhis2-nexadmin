// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/Timeline.tsx
//
// Chronological audit trail for a governance request.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { TimelineEvent, DemoRole, WorkflowStatus } from '../types'
import { ACTION_LABELS } from '../store/governanceStore'
import styles from './Timeline.module.css'

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOCALE = typeof navigator !== 'undefined' ? navigator.language : 'en'

function formatDateTime(iso: string): string {
  if (!iso) return '—'
  try {
    return new Intl.DateTimeFormat(LOCALE, {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso))
  } catch {
    return iso
  }
}

// ── Status icon + colour ──────────────────────────────────────────────────────

interface EventStyle {
  icon: string
  color: string
  bg: string
  border: string
}

function getEventStyle(status: WorkflowStatus): EventStyle {
  switch (status) {
    case 'DRAFT':
      return {
        icon: 'edit_note',
        color: 'var(--text-secondary)',
        bg: 'var(--grey-100)',
        border: 'var(--border-default)',
      }
    case 'SUBMITTED':
      return {
        icon: 'send',
        color: 'var(--color-info-text)',
        bg: 'var(--color-info-bg)',
        border: 'var(--color-info-border)',
      }
    case 'UNDER_REVIEW':
      return {
        icon: 'rate_review',
        color: 'var(--color-warning-text)',
        bg: 'var(--color-warning-bg)',
        border: 'var(--color-warning-border)',
      }
    case 'VALIDATED':
      return {
        icon: 'verified',
        color: 'var(--brand-600)',
        bg: 'var(--brand-50)',
        border: 'var(--brand-200)',
      }
    case 'CREATED':
      return {
        icon: 'add_location_alt',
        color: 'var(--color-success-text)',
        bg: 'var(--color-success-bg)',
        border: 'var(--color-success-border)',
      }
    case 'REJECTED':
      return {
        icon: 'cancel',
        color: 'var(--color-danger-text)',
        bg: 'var(--color-danger-bg)',
        border: 'var(--color-danger-border)',
      }
    default:
      return {
        icon: 'circle',
        color: 'var(--text-tertiary)',
        bg: 'var(--grey-50)',
        border: 'var(--border-subtle)',
      }
  }
}

// ── Role pill class ───────────────────────────────────────────────────────────

function getRoleClass(role: DemoRole): string {
  switch (role) {
    case 'DISTRICT':
      return styles.roleDistrict
    case 'REGION':
      return styles.roleRegion
    case 'ADMIN':
      return styles.roleAdmin
    default:
      return ''
  }
}

function getRoleLabel(role: DemoRole): string {
  switch (role) {
    case 'DISTRICT':
      return i18n.t('District Officer')
    case 'REGION':
      return i18n.t('Region Officer')
    case 'ADMIN':
      return i18n.t('National Admin')
    default:
      return role
  }
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface TimelineProps {
  events: TimelineEvent[]
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Timeline: FC<TimelineProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div
        style={{
          color: 'var(--text-tertiary)',
          fontSize: 'var(--text-sm)',
          padding: 'var(--space-4) 0',
        }}
      >
        {i18n.t('No history available')}
      </div>
    )
  }

  return (
    <div className={styles.wrapper} aria-label={i18n.t('Request history')}>
      {events.map((evt, idx) => {
        const evtStyle = getEventStyle(evt.status)
        const isLast = idx === events.length - 1
        const actionLabel = ACTION_LABELS[evt.actionKey]
          ? i18n.t(ACTION_LABELS[evt.actionKey])
          : i18n.t(evt.actionKey)

        return (
          <div key={evt.id} className={styles.event}>
            {/* Vertical connector line */}
            {!isLast && <div className={styles.connector} aria-hidden="true" />}

            {/* Icon */}
            <div className={styles.iconCol}>
              <div
                className={styles.iconCircle}
                style={{ background: evtStyle.bg, borderColor: evtStyle.border }}
                aria-hidden="true"
              >
                <span className="material-icons-round" style={{ color: evtStyle.color }}>
                  {evtStyle.icon}
                </span>
              </div>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <div className={styles.eventHeader}>
                <span className={styles.eventTitle}>{actionLabel}</span>
                <span className={`${styles.rolePill} ${getRoleClass(evt.role)}`}>
                  {getRoleLabel(evt.role)}
                </span>
                <span className={styles.timestamp}>{formatDateTime(evt.timestamp)}</span>
              </div>

              {evt.comment && (
                <div className={styles.comment}>
                  <span className="material-icons-round">format_quote</span>
                  {evt.comment}
                </div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default Timeline
