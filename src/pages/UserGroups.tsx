// src/pages/UserGroups.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const MOCK_GROUPS = [
  { name: 'National Admins', members: 12, managed: 'No' },
  { name: 'District Health Officers', members: 89, managed: 'Yes' },
  { name: 'Data Entry Team', members: 234, managed: 'No' },
  { name: 'Facility Managers', members: 456, managed: 'Yes' },
  { name: 'Analytics Team', members: 31, managed: 'No' },
]

export default function UserGroups() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="group"
        title={i18n.t('User Groups')}
        description={i18n.t(
          'Organise users into groups to simplify sharing and access control across DHIS2 objects.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      <div className={styles.tablePlaceholder}>
        <div className={styles.tablePlaceholderHead} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Group Name')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Members')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Managed')}</div>
        </div>
        {MOCK_GROUPS.map((g) => (
          <div
            key={g.name}
            className={styles.tablePlaceholderRow}
            style={{ gridTemplateColumns: '2fr 1fr 1fr' }}
          >
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-semibold)' }}>
              {g.name}
            </div>
            <div>
              <span className="nx-chip nx-chip-neutral">{g.members}</span>
            </div>
            <div>
              <span
                className={`nx-chip ${g.managed === 'Yes' ? 'nx-chip-success' : 'nx-chip-neutral'}`}
              >
                {g.managed}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
