// src/pages/RolesAuthorities.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const MOCK_ROLES = [
  { name: 'Superuser', users: 3, authorities: 'All' },
  { name: 'Data Capturer', users: 142, authorities: '8 authorities' },
  { name: 'Data Analyst', users: 67, authorities: '12 authorities' },
  { name: 'Org Unit Admin', users: 18, authorities: '6 authorities' },
  { name: 'Read Only', users: 89, authorities: '2 authorities' },
]

export default function RolesAuthorities() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="admin_panel_settings"
        title={i18n.t('Roles & Authorities')}
        description={i18n.t(
          'Define user roles with specific authorities to control what users can see and do in DHIS2.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      <div className={styles.tablePlaceholder}>
        <div className={styles.tablePlaceholderHead} style={{ gridTemplateColumns: '2fr 1fr 2fr' }}>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Role Name')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Users')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Authorities')}</div>
        </div>
        {MOCK_ROLES.map((r) => (
          <div
            key={r.name}
            className={styles.tablePlaceholderRow}
            style={{ gridTemplateColumns: '2fr 1fr 2fr' }}
          >
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
              {r.name}
            </div>
            <div>
              <span className="nx-chip nx-chip-neutral">{r.users}</span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {r.authorities}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
