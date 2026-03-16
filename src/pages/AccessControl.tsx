// src/pages/AccessControl.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const FEATURES = [
  {
    icon: 'shield',
    title: 'Role-Based Access Control',
    desc: 'Define roles with fine-grained permissions and assign them to users.',
  },
  {
    icon: 'group_work',
    title: 'Sharing & Visibility',
    desc: 'Control which user groups can view or edit each data object.',
  },
  {
    icon: 'vpn_lock',
    title: 'Organisation Unit Scope',
    desc: 'Restrict user access to specific branches of the org unit hierarchy.',
  },
  {
    icon: 'visibility_off',
    title: 'Data Capture Restrictions',
    desc: 'Limit data entry to authorised programs and datasets.',
  },
]

export default function AccessControl() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="lock"
        title={i18n.t('Access Control')}
        description={i18n.t(
          'Manage sharing settings, user restrictions, and organisation-unit-level access across the system.'
        )}
        accentColor="warning"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />
      <div className={styles.infoGrid}>
        {FEATURES.map((f) => (
          <div key={f.title} className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              <span className="material-icons-round">{f.icon}</span>
              {i18n.t(f.title)}
            </div>
            <div className={styles.infoCardBody}>{i18n.t(f.desc)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
