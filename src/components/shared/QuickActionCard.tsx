// src/components/shared/QuickActionCard.tsx
import type { FC } from 'react'
import { Link } from 'react-router-dom'
import styles from './QuickActionCard.module.css'

interface QuickActionCardProps {
  icon: string
  title: string
  description: string
  to: string
  color?: 'brand' | 'accent' | 'success' | 'warning' | 'danger' | 'info'
  badge?: string
}

export const QuickActionCard: FC<QuickActionCardProps> = ({
  icon,
  title,
  description,
  to,
  color = 'brand',
  badge,
}) => (
  <Link to={to} className={`${styles.card} ${styles[`color-${color}`]}`}>
    <div className={styles.iconRow}>
      <div className={`${styles.iconWrap} ${styles[`icon-${color}`]}`}>
        <span className="material-icons-round" aria-hidden="true">
          {icon}
        </span>
      </div>
      {badge && <span className={`${styles.badge} ${styles[`badge-${color}`]}`}>{badge}</span>}
    </div>
    <div className={styles.content}>
      <div className={styles.title}>{title}</div>
      <div className={styles.description}>{description}</div>
    </div>
    <div className={styles.arrow}>
      <span className="material-icons-round">arrow_forward</span>
    </div>
  </Link>
)

export default QuickActionCard
