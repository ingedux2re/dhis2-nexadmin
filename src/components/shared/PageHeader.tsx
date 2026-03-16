// src/components/shared/PageHeader.tsx
import type { FC, ReactNode } from 'react'
import styles from './PageHeader.module.css'

interface PageHeaderProps {
  icon: string
  title: string
  description?: string
  accentColor?: 'brand' | 'accent' | 'warning' | 'success' | 'danger' | 'info'
  badge?: ReactNode
  actions?: ReactNode
}

export const PageHeader: FC<PageHeaderProps> = ({
  icon,
  title,
  description,
  accentColor = 'brand',
  badge,
  actions,
}) => (
  <div className={`${styles.header} ${styles[`accent-${accentColor}`]}`}>
    <div className={styles.left}>
      <div className={`${styles.iconWrap} ${styles[`icon-${accentColor}`]}`}>
        <span className="material-icons-round" aria-hidden="true">
          {icon}
        </span>
      </div>
      <div className={styles.text}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{title}</h1>
          {badge && <div className={styles.badge}>{badge}</div>}
        </div>
        {description && <p className={styles.description}>{description}</p>}
      </div>
    </div>
    {actions && <div className={styles.actions}>{actions}</div>}
  </div>
)

export default PageHeader
