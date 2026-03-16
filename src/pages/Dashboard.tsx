// src/pages/Dashboard.tsx
import i18n from '@dhis2/d2-i18n'
import { StatCard } from '../components/shared/StatCard'
import { QuickActionCard } from '../components/shared/QuickActionCard'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  return (
    <div className={styles.page}>
      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className="material-icons-round" style={{ fontSize: 14 }}>
              verified
            </span>
            {i18n.t('DHIS2 Administration Platform')}
          </div>
          <h1 className={styles.heroTitle}>
            {i18n.t('Welcome to')}{' '}
            <span className={styles.heroTitleAccent}>{i18n.t('NexAdmin')}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            {i18n.t(
              'A modern, powerful interface for managing your DHIS2 organisation hierarchy, data integrity, users, and system configuration.'
            )}
          </p>
        </div>
        <div className={styles.heroIllustration} aria-hidden="true">
          <div className={styles.heroOrb} />
          <div className={styles.heroOrb2} />
          <span
            className="material-icons-round"
            style={{ fontSize: 80, color: 'rgba(255,255,255,0.15)', position: 'relative' }}
          >
            account_tree
          </span>
        </div>
      </div>

      {/* ── KPI Stats ─────────────────────────────────────────── */}
      <section>
        <h2 className={styles.sectionTitle}>{i18n.t('System Overview')}</h2>
        <div className={styles.statsGrid}>
          <StatCard
            icon="account_tree"
            label={i18n.t('Organisation Units')}
            value="—"
            color="brand"
          />
          <StatCard icon="people" label={i18n.t('System Users')} value="—" color="info" />
          <StatCard
            icon="warning_amber"
            label={i18n.t('Data Integrity Issues')}
            value="—"
            color="warning"
          />
          <StatCard
            icon="done_all"
            label={i18n.t('Completed Bulk Ops')}
            value="—"
            color="success"
          />
        </div>
      </section>

      {/* ── Quick Actions ──────────────────────────────────────── */}
      <section>
        <h2 className={styles.sectionTitle}>{i18n.t('Quick Actions')}</h2>
        <div className={styles.actionsGrid}>
          <QuickActionCard
            icon="account_tree"
            title={i18n.t('Manage Org Units')}
            description={i18n.t('Create, edit, and organise your organisation hierarchy.')}
            to="/org-units"
            color="brand"
          />
          <QuickActionCard
            icon="drive_file_rename_outline"
            title={i18n.t('Bulk Rename')}
            description={i18n.t('Rename hundreds of org units at once using patterns and rules.')}
            to="/bulk/rename"
            color="accent"
            badge={i18n.t('Popular')}
          />
          <QuickActionCard
            icon="low_priority"
            title={i18n.t('Bulk Reorganise')}
            description={i18n.t('Move org units to new parents and restructure your hierarchy.')}
            to="/bulk/reorganise"
            color="accent"
          />
          <QuickActionCard
            icon="find_replace"
            title={i18n.t('Duplicate Detector')}
            description={i18n.t('Find and resolve duplicate organisation units in your system.')}
            to="/integrity/duplicates"
            color="warning"
            badge={i18n.t('Integrity')}
          />
          <QuickActionCard
            icon="account_tree"
            title={i18n.t('Hierarchy Validator')}
            description={i18n.t('Validate your org unit hierarchy for structural issues.')}
            to="/integrity/hierarchy"
            color="warning"
          />
          <QuickActionCard
            icon="place"
            title={i18n.t('Geo Consistency')}
            description={i18n.t('Check geographic data consistency and coordinate accuracy.')}
            to="/integrity/geo"
            color="info"
          />
          <QuickActionCard
            icon="manage_accounts"
            title={i18n.t('User Management')}
            description={i18n.t('Manage users, roles, and access permissions.')}
            to="/users"
            color="brand"
          />
          <QuickActionCard
            icon="settings"
            title={i18n.t('System Settings')}
            description={i18n.t('Configure application settings and preferences.')}
            to="/system/settings"
            color="brand"
          />
        </div>
      </section>

      {/* ── Module cards ───────────────────────────────────────── */}
      <section>
        <h2 className={styles.sectionTitle}>{i18n.t('All Modules')}</h2>
        <div className={styles.moduleGrid}>
          {MODULES.map((mod) => (
            <a
              key={mod.id}
              href={`#${mod.path}`}
              className={`${styles.moduleCard} ${styles[`module-${mod.color}`]}`}
            >
              <span className={`material-icons-round ${styles.moduleIcon}`}>{mod.icon}</span>
              <div className={styles.moduleInfo}>
                <div className={styles.moduleTitle}>{i18n.t(mod.title)}</div>
                <div className={styles.moduleSection}>{i18n.t(mod.section)}</div>
              </div>
              <span className="material-icons-round" style={{ fontSize: 16, opacity: 0.4 }}>
                chevron_right
              </span>
            </a>
          ))}
        </div>
      </section>
    </div>
  )
}

interface ModuleDef {
  id: string
  icon: string
  title: string
  section: string
  path: string
  color: string
}

const MODULES: ModuleDef[] = [
  {
    id: 'ou',
    icon: 'account_tree',
    title: 'Org Unit Management',
    section: 'Organisation Units',
    path: '/org-units',
    color: 'brand',
  },
  {
    id: 'hierarchy',
    icon: 'schema',
    title: 'Hierarchy Viewer',
    section: 'Organisation Units',
    path: '/org-units/hierarchy',
    color: 'brand',
  },
  {
    id: 'groups',
    icon: 'folder_special',
    title: 'Org Unit Groups',
    section: 'Organisation Units',
    path: '/org-units/groups',
    color: 'brand',
  },
  {
    id: 'duplicates',
    icon: 'find_replace',
    title: 'Duplicate Detector',
    section: 'Data Integrity',
    path: '/integrity/duplicates',
    color: 'warning',
  },
  {
    id: 'hier-valid',
    icon: 'rule',
    title: 'Hierarchy Validator',
    section: 'Data Integrity',
    path: '/integrity/hierarchy',
    color: 'warning',
  },
  {
    id: 'geo',
    icon: 'place',
    title: 'Geo Consistency',
    section: 'Data Integrity',
    path: '/integrity/geo',
    color: 'info',
  },
  {
    id: 'reorg',
    icon: 'low_priority',
    title: 'Bulk Reorganise',
    section: 'Bulk Operations',
    path: '/bulk/reorganise',
    color: 'accent',
  },
  {
    id: 'rename',
    icon: 'drive_file_rename_outline',
    title: 'Bulk Rename',
    section: 'Bulk Operations',
    path: '/bulk/rename',
    color: 'accent',
  },
  {
    id: 'users',
    icon: 'manage_accounts',
    title: 'User Management',
    section: 'Users',
    path: '/users',
    color: 'info',
  },
  {
    id: 'audit',
    icon: 'history',
    title: 'Audit Log',
    section: 'Governance',
    path: '/governance/audit',
    color: 'info',
  },
  {
    id: 'settings',
    icon: 'settings',
    title: 'System Settings',
    section: 'System',
    path: '/system/settings',
    color: 'brand',
  },
  {
    id: 'notif',
    icon: 'notifications',
    title: 'Notifications',
    section: 'System',
    path: '/system/notifications',
    color: 'info',
  },
]
