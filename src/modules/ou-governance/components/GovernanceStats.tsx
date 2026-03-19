// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/GovernanceStats.tsx
//
// Summary stat cards shown at the top of the governance page.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { GovernanceRequest } from '../types'

interface GovernanceStatsProps {
  requests: GovernanceRequest[]
}

interface StatCard {
  labelKey: string
  value: number
  icon: string
  color: string
  bg: string
  border: string
}

export const GovernanceStats: FC<GovernanceStatsProps> = ({ requests }) => {
  const total = requests.length
  const draft = requests.filter((r) => r.status === 'DRAFT').length
  const inProgress = requests.filter((r) =>
    ['SUBMITTED', 'UNDER_REVIEW', 'VALIDATED'].includes(r.status)
  ).length
  const created = requests.filter((r) => r.status === 'CREATED').length
  const rejected = requests.filter((r) => r.status === 'REJECTED').length

  const cards: StatCard[] = [
    {
      labelKey: 'Total Requests',
      value: total,
      icon: 'list_alt',
      color: 'var(--brand-700)',
      bg: 'var(--brand-50)',
      border: 'var(--brand-100)',
    },
    {
      labelKey: 'In Progress',
      value: inProgress,
      icon: 'pending',
      color: 'var(--color-warning-text)',
      bg: 'var(--color-warning-bg)',
      border: 'var(--color-warning-border)',
    },
    {
      labelKey: 'Created',
      value: created,
      icon: 'add_location_alt',
      color: 'var(--color-success-text)',
      bg: 'var(--color-success-bg)',
      border: 'var(--color-success-border)',
    },
    {
      labelKey: 'Drafts',
      value: draft,
      icon: 'edit_note',
      color: 'var(--text-secondary)',
      bg: 'var(--grey-100)',
      border: 'var(--border-default)',
    },
    {
      labelKey: 'Rejected',
      value: rejected,
      icon: 'cancel',
      color: 'var(--color-danger-text)',
      bg: 'var(--color-danger-bg)',
      border: 'var(--color-danger-border)',
    },
  ]

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: 'var(--space-4)',
      }}
      role="list"
      aria-label={i18n.t('Governance statistics')}
    >
      {cards.map((card) => (
        <div
          key={card.labelKey}
          role="listitem"
          style={{
            background: card.bg,
            border: `1px solid ${card.border}`,
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-4) var(--space-4)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-2)',
            boxShadow: 'var(--shadow-xs)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 'var(--weight-semibold)',
                color: card.color,
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
              }}
            >
              {i18n.t(card.labelKey)}
            </span>
            <span
              className="material-icons-round"
              style={{ fontSize: 18, color: card.color, opacity: 0.7 }}
              aria-hidden="true"
            >
              {card.icon}
            </span>
          </div>
          <div
            style={{
              fontSize: 'var(--text-3xl)',
              fontWeight: 'var(--weight-bold)',
              color: card.color,
              lineHeight: 1,
            }}
            aria-label={`${i18n.t(card.labelKey)}: ${card.value}`}
          >
            {card.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export default GovernanceStats
