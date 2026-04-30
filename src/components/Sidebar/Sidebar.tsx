// src/components/Sidebar/Sidebar.tsx — Competition version
// Clean sidebar showing only Dashboard + 3 competition features with feature badges
import type { FC } from 'react'
import { useLocation, Link } from 'react-router-dom'
import i18n from '@dhis2/d2-i18n'
import { useAppStore } from '../../store'
import styles from './Sidebar.module.css'

// ── Static nav config (inlined — no import from navigation constants needed) ─

interface NavEntry {
  id: string
  label: string
  path: string
  icon: string
  badge?: { text: string; variant: 'new' | 'popular' | 'integrity' }
}

const NAV_ENTRIES: NavEntry[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
  },
  {
    id: 'data-element-engineering',
    label: 'Data Element Engineering',
    path: '/data-elements',
    icon: 'data_object',
    badge: { text: 'New', variant: 'new' },
  },
  {
    id: 'bulk-rename',
    label: 'Bulk Rename',
    path: '/bulk/rename',
    icon: 'drive_file_rename_outline',
    badge: { text: 'Popular', variant: 'popular' },
  },
  {
    id: 'data-integrity',
    label: 'Data Integrity',
    path: '/integrity',
    icon: 'verified_user',
    badge: { text: 'Integrity', variant: 'integrity' },
  },
]

const BADGE_CLASS: Record<string, string> = {
  new: styles.navBadgeNew,
  popular: styles.navBadgePopular,
  integrity: styles.navBadgeIntegrity,
}

export const Sidebar: FC = () => {
  const location = useLocation()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)

  return (
    <nav
      className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}
      aria-label={i18n.t('Main navigation')}
      data-testid="sidebar"
    >
      {/* ── Competition badge ──────────────────────────────── */}
      <div className={styles.competitionBadge}>
        <span className="material-icons-round" style={{ fontSize: 11 }}>
          emoji_events
        </span>
        {i18n.t('DHIS2 Competition 2026')}
      </div>

      {/* ── Toggle button ─────────────────────────────────── */}
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? i18n.t('Collapse sidebar') : i18n.t('Expand sidebar')}
        data-testid="sidebar-toggle"
      >
        <span className={`${styles.navIcon} material-icons-round`} aria-hidden="true">
          {sidebarOpen ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      {/* ── Overview section (Dashboard only) ────────────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>{i18n.t('Overview')}</div>
        {NAV_ENTRIES.filter((e) => e.id === 'dashboard').map((item) => {
          const isActive = location.pathname === item.path
          const label = i18n.t(item.label)
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`nav-${item.id}`}
              data-label={label}
              title={!sidebarOpen ? label : undefined}
            >
              <span className={`${styles.navIcon} material-icons-round`} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.navLabel}>{label}</span>
            </Link>
          )
        })}
      </div>

      {/* ── Features section (3 competition features) ─────── */}
      <div className={styles.section}>
        <div className={styles.sectionHeader}>{i18n.t('Features')}</div>
        {NAV_ENTRIES.filter((e) => e.id !== 'dashboard').map((item) => {
          const isActive =
            location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path))
          const label = i18n.t(item.label)
          return (
            <Link
              key={item.id}
              to={item.path}
              className={`${styles.navItem} ${isActive ? styles.active : ''}`}
              aria-current={isActive ? 'page' : undefined}
              data-testid={`nav-${item.id}`}
              data-label={label}
              title={!sidebarOpen ? label : undefined}
            >
              <span className={`${styles.navIcon} material-icons-round`} aria-hidden="true">
                {item.icon}
              </span>
              <span className={styles.navLabel}>{label}</span>
              {item.badge && (
                <span className={`${styles.navBadge} ${BADGE_CLASS[item.badge.variant]}`}>
                  {i18n.t(item.badge.text)}
                </span>
              )}
            </Link>
          )
        })}
      </div>

      {/* ── Footer ────────────────────────────────────────── */}
      <div className={styles.sidebarFooter}>
        <span className={styles.footerLine}>{i18n.t('NexAdmin')}</span>
        <span className={styles.footerSub}>{i18n.t('v1.1.0 · DHIS2 2.38+')}</span>
      </div>
    </nav>
  )
}

export default Sidebar
