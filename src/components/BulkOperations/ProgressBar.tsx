import i18n from '@dhis2/d2-i18n'
import styles from './ProgressBar.module.css'

interface ProgressBarProps {
  percent: number // 0-100
  label?: string
  completed?: number
  total?: number
}

export function ProgressBar({ percent, label, completed, total }: ProgressBarProps) {
  return (
    <div
      className={styles.container}
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className={styles.track}>
        <div className={styles.fill} style={{ width: `${percent}%` }} />
      </div>
      <div className={styles.meta}>
        <span className={styles.label}>{label ?? i18n.t('Processing…')}</span>
        {completed !== undefined && total !== undefined && (
          <span className={styles.count}>
            {i18n.t('{{completed}} / {{total}}', { completed, total })}
          </span>
        )}
        <span className={styles.percent}>{percent}%</span>
      </div>
    </div>
  )
}
