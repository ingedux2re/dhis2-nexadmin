import type { FC } from 'react'
import { useLocation, Link } from 'react-router-dom'
import i18n from '@dhis2/d2-i18n'
import type { NavSection } from '../../constants/navigation'
import { NAV_ITEMS, NAV_SECTIONS, groupBySection } from '../../constants/navigation'
import { useAppStore } from '../../store'
import styles from './Sidebar.module.css'

export const Sidebar: FC = () => {
  const location = useLocation()
  const sidebarOpen = useAppStore((s) => s.sidebarOpen)
  const setSidebarOpen = useAppStore((s) => s.setSidebarOpen)
  const grouped = groupBySection(NAV_ITEMS)
  const sections = Object.keys(NAV_SECTIONS) as NavSection[]

  return (
    <nav
      className={`${styles.sidebar} ${!sidebarOpen ? styles.collapsed : ''}`}
      aria-label={i18n.t('Main navigation')}
      data-testid="sidebar"
    >
      <button
        className={styles.toggleButton}
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? i18n.t('Collapse sidebar') : i18n.t('Expand sidebar')}
        data-testid="sidebar-toggle"
      >
        <span className={`${styles.navIcon} material-icons-round`} aria-hidden="true">
          {sidebarOpen ? 'chevron_left' : 'chevron_right'}
        </span>
      </button>

      {sections.map((section) => {
        const items = grouped[section] ?? []
        if (!items.length) return null
        return (
          <div key={section} className={styles.section} data-testid={`section-${section}`}>
            <div className={styles.sectionHeader}>{NAV_SECTIONS[section]}</div>
            {items.map((item) => {
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
        )
      })}
    </nav>
  )
}

export default Sidebar
