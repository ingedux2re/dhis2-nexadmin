// src/pages/SystemSettings.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const SETTING_GROUPS = [
  {
    icon: 'language',
    title: 'Localisation',
    desc: 'Configure language, date format, and regional settings.',
  },
  {
    icon: 'security',
    title: 'Security',
    desc: 'Password policies, session timeouts, and two-factor authentication.',
  },
  {
    icon: 'mail',
    title: 'Email',
    desc: 'SMTP server configuration for system notifications and alerts.',
  },
  {
    icon: 'storage',
    title: 'Database',
    desc: 'Connection settings, backup schedules, and maintenance windows.',
  },
  {
    icon: 'cloud_sync',
    title: 'Synchronisation',
    desc: 'Data synchronisation intervals and remote server configuration.',
  },
  {
    icon: 'tune',
    title: 'General',
    desc: 'Application name, logo, welcome message, and default values.',
  },
]

export default function SystemSettings() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="settings"
        title={i18n.t('System Settings')}
        description={i18n.t(
          'Configure application behaviour, security policies, email notifications, and system-wide preferences.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      <div className={styles.infoGrid}>
        {SETTING_GROUPS.map((g) => (
          <div key={g.title} className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              <span className="material-icons-round">{g.icon}</span>
              {i18n.t(g.title)}
            </div>
            <div className={styles.infoCardBody}>{i18n.t(g.desc)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
