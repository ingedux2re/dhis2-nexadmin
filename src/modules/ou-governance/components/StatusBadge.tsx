// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/StatusBadge.tsx
//
// Renders a coloured chip for a WorkflowStatus value.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { WorkflowStatus } from '../types'

// ── Status metadata ───────────────────────────────────────────────────────────

interface StatusMeta {
  labelKey: string
  icon: string
  color: string
  bg: string
  border: string
}

const STATUS_META: Record<WorkflowStatus, StatusMeta> = {
  DRAFT: {
    labelKey: 'DRAFT',
    icon: 'edit_note',
    color: 'var(--text-secondary)',
    bg: 'var(--grey-100)',
    border: 'var(--border-default)',
  },
  SUBMITTED: {
    labelKey: 'SUBMITTED',
    icon: 'send',
    color: 'var(--color-info-text)',
    bg: 'var(--color-info-bg)',
    border: 'var(--color-info-border)',
  },
  UNDER_REVIEW: {
    labelKey: 'UNDER_REVIEW',
    icon: 'rate_review',
    color: 'var(--color-warning-text)',
    bg: 'var(--color-warning-bg)',
    border: 'var(--color-warning-border)',
  },
  VALIDATED: {
    labelKey: 'VALIDATED',
    icon: 'verified',
    color: 'var(--brand-700)',
    bg: 'var(--brand-50)',
    border: 'var(--brand-200)',
  },
  CREATED: {
    labelKey: 'CREATED',
    icon: 'add_location_alt',
    color: 'var(--color-success-text)',
    bg: 'var(--color-success-bg)',
    border: 'var(--color-success-border)',
  },
  REJECTED: {
    labelKey: 'REJECTED',
    icon: 'cancel',
    color: 'var(--color-danger-text)',
    bg: 'var(--color-danger-bg)',
    border: 'var(--color-danger-border)',
  },
  PENDING_USER: {
    labelKey: 'PENDING_USER',
    icon: 'person_add',
    color: 'var(--color-warning-text)',
    bg: 'var(--color-warning-bg)',
    border: 'var(--color-warning-border)',
  },
  USER_CREATED: {
    labelKey: 'USER_CREATED',
    icon: 'how_to_reg',
    color: 'var(--color-success-text)',
    bg: 'var(--color-success-bg)',
    border: 'var(--color-success-border)',
  },
}

// Status label i18n map
const STATUS_I18N: Record<WorkflowStatus, string> = {
  DRAFT: i18n.t('DRAFT'),
  SUBMITTED: i18n.t('SUBMITTED'),
  UNDER_REVIEW: i18n.t('UNDER_REVIEW'),
  VALIDATED: i18n.t('VALIDATED'),
  CREATED: i18n.t('CREATED'),
  REJECTED: i18n.t('REJECTED'),
  PENDING_USER: i18n.t('PENDING_USER'),
  USER_CREATED: i18n.t('USER_CREATED'),
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: WorkflowStatus
}

// ── Component ─────────────────────────────────────────────────────────────────

export const StatusBadge: FC<StatusBadgeProps> = ({ status }) => {
  const meta = STATUS_META[status]
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        padding: '3px 10px 3px 7px',
        borderRadius: 'var(--radius-full)',
        fontSize: 'var(--text-xs)',
        fontWeight: 'var(--weight-semibold)',
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        whiteSpace: 'nowrap',
      }}
    >
      <span className="material-icons-round" style={{ fontSize: '13px' }} aria-hidden="true">
        {meta.icon}
      </span>
      {STATUS_I18N[status]}
    </span>
  )
}

export default StatusBadge
