// src/pages/UserManagement.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

export default function UserManagement() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="manage_accounts"
        title={i18n.t('User Management')}
        description={i18n.t(
          'Create and manage system users, assign roles, and control access to DHIS2 resources.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>
          <span className="material-icons-round">manage_accounts</span>
        </div>
        <h2 className={styles.comingSoonTitle}>{i18n.t('User Management')}</h2>
        <p className={styles.comingSoonText}>
          {i18n.t(
            'This module is under active development. User management, role assignments, and permission configuration will be available here.'
          )}
        </p>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Create and edit user accounts')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Assign roles and authorities')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Manage user groups and access')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Bulk import users from CSV')}
          </div>
        </div>
      </div>
    </div>
  )
}
