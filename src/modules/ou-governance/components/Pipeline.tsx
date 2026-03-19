// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/Pipeline.tsx
//
// Horizontal pipeline showing the workflow stages.
// Highlights the current stage and renders done/active/pending states.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { WorkflowStatus } from '../types'
import styles from './Pipeline.module.css'

// ── Stage definitions ─────────────────────────────────────────────────────────

interface PipelineStage {
  status: WorkflowStatus
  icon: string
  labelKey: string
  roleKey: string
}

const STAGES: PipelineStage[] = [
  { status: 'DRAFT', icon: 'edit_note', labelKey: 'Draft', roleKey: 'District' },
  { status: 'SUBMITTED', icon: 'send', labelKey: 'Submitted', roleKey: 'District' },
  { status: 'UNDER_REVIEW', icon: 'rate_review', labelKey: 'Region Review', roleKey: 'Region' },
  { status: 'VALIDATED', icon: 'verified', labelKey: 'Validated', roleKey: 'Region' },
  { status: 'CREATED', icon: 'add_location_alt', labelKey: 'Created', roleKey: 'Admin' },
]

// Status ordering for "done" detection
const STATUS_ORDER: WorkflowStatus[] = [
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'VALIDATED',
  'CREATED',
]

function getStageClass(stage: PipelineStage, currentStatus: WorkflowStatus): string {
  if (currentStatus === 'REJECTED') {
    // Grey out everything after UNDER_REVIEW
    const stageIdx = STATUS_ORDER.indexOf(stage.status)
    const reviewIdx = STATUS_ORDER.indexOf('UNDER_REVIEW')
    if (stageIdx < reviewIdx) return styles.done
    if (stageIdx === reviewIdx) return styles.rejected
    return ''
  }
  const currentIdx = STATUS_ORDER.indexOf(currentStatus)
  const stageIdx = STATUS_ORDER.indexOf(stage.status)
  if (stageIdx < currentIdx) return styles.done
  if (stageIdx === currentIdx) return styles.active
  return ''
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PipelineProps {
  currentStatus: WorkflowStatus
}

// ── Component ─────────────────────────────────────────────────────────────────

export const Pipeline: FC<PipelineProps> = ({ currentStatus }) => {
  const isRejected = currentStatus === 'REJECTED'

  return (
    <div className={styles.wrapper}>
      <div className={styles.title}>{i18n.t('Workflow Pipeline')}</div>

      <div className={styles.track} role="list" aria-label={i18n.t('Workflow stages')}>
        {STAGES.map((stage) => {
          const cls = getStageClass(stage, currentStatus)
          const isActive = cls === styles.active
          const isDone = cls === styles.done
          const isCreated = stage.status === 'CREATED' && currentStatus === 'CREATED'

          return (
            <div
              key={stage.status}
              className={`${styles.step} ${cls} ${isCreated ? styles.created : ''}`}
              role="listitem"
              aria-current={isActive ? 'step' : undefined}
            >
              <div className={styles.iconCircle} aria-hidden="true">
                <span className="material-icons-round">
                  {isDone || isCreated ? 'check' : isActive && isRejected ? 'cancel' : stage.icon}
                </span>
              </div>
              <span className={styles.stepLabel}>{i18n.t(stage.labelKey)}</span>
              <span className={styles.roleBadge}>{i18n.t(stage.roleKey)}</span>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className={styles.legend} aria-hidden="true">
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--brand-500)' }} />
          {i18n.t('Completed')}
        </div>
        <div className={styles.legendItem}>
          <div
            className={styles.legendDot}
            style={{ background: 'white', border: '2px solid var(--brand-500)' }}
          />
          {i18n.t('Current')}
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--grey-200)' }} />
          {i18n.t('Pending')}
        </div>
        <div className={styles.legendItem}>
          <div className={styles.legendDot} style={{ background: 'var(--color-danger-solid)' }} />
          {i18n.t('Rejected')}
        </div>
      </div>
    </div>
  )
}

export default Pipeline
