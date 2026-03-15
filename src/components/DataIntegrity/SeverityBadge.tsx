import type React from 'react'
import i18n from '@dhis2/d2-i18n'
import styles from './SeverityBadge.module.css'
import type { Severity } from '../../hooks/useDuplicateDetector'

interface SeverityBadgeProps {
  severity: Severity
}

const LABELS: Record<Severity, () => string> = {
  error: () => i18n.t('High'),
  warning: () => i18n.t('Medium'),
  info: () => i18n.t('Low'),
}

export const SeverityBadge: React.FC<SeverityBadgeProps> = ({ severity }) => (
  <span className={`${styles.badge} ${styles[severity]}`}>{LABELS[severity]()}</span>
)

export default SeverityBadge
