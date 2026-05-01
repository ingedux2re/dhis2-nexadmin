// src/components/Sidebar/Sidebar.tsx — Competition version
import type { FC } from 'react'
import { useLocation, Link } from 'react-router-dom'
import i18n from '@dhis2/d2-i18n'
import { useAppStore } from '../../store'
import styles from './Sidebar.module.css'

interface NavEntry {
  id: string
  label: string
  path: string
  icon: string
}

const NAV_ENTRIES: NavEntry[] = [
  { id: 'dashboard', label: 'Dashboard', path: '/', icon: 'dashboard' },
  {
    id: 'data-element-engineering',
    label: 'Data Element Engineering',
    path: '/data-elements',
    icon: 'data_object',
  },
  {
    id: 'bulk-rename',
    label: 'Bulk Rename',
    path: '/bulk/rename',
    icon: 'drive_file_rename_outline',
  },
  { id: 'data-integrity', label: 'Data Integrity', path: '/integrity', icon: 'verified_user' },
]

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

      {/* ── Overview section ──────────────────────────────── */}
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

      {/* ── Features section ──────────────────────────────── */}
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
