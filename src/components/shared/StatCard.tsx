// src/components/shared/StatCard.tsx
import type { FC } from 'react'
import styles from './StatCard.module.css'

interface StatCardProps {
  icon: string
  label: string
  value: string | number
  trend?: { value: string; up: boolean }
  color?: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info' | 'neutral'
  loading?: boolean
}

export const StatCard: FC<StatCardProps> = ({
  icon,
  label,
  value,
  trend,
  color = 'brand',
  loading = false,
}) => (
  <div className={`${styles.card} ${styles[`color-${color}`]}`}>
    <div className={styles.top}>
      <span className={`${styles.icon} material-icons-round`} aria-hidden="true">
        {icon}
      </span>
      {trend && (
        <span className={`${styles.trend} ${trend.up ? styles.trendUp : styles.trendDown}`}>
          <span className="material-icons-round" style={{ fontSize: 14 }}>
            {trend.up ? 'trending_up' : 'trending_down'}
          </span>
          {trend.value}
        </span>
      )}
    </div>
    <div className={styles.bottom}>
      {loading ? <div className={styles.skeleton} /> : <div className={styles.value}>{value}</div>}
      <div className={styles.label}>{label}</div>
    </div>
  </div>
)

export default StatCard
