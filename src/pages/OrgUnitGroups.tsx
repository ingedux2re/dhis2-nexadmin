// src/pages/OrgUnitGroups.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const MOCK_GROUPS = [
  { name: 'Hospitals', units: 312, sets: 2 },
  { name: 'Health Centres', units: 1847, sets: 3 },
  { name: 'Community Units', units: 5621, sets: 1 },
  { name: 'District Offices', units: 89, sets: 2 },
  { name: 'National Facilities', units: 14, sets: 4 },
]

export default function OrgUnitGroups() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="folder_special"
        title={i18n.t('Org Unit Groups')}
        description={i18n.t(
          'Categorise organisation units into groups and group sets for analytics and access control.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      <div className={styles.tablePlaceholder}>
        <div className={styles.tablePlaceholderHead} style={{ gridTemplateColumns: '2fr 1fr 1fr' }}>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Group Name')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Units')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Group Sets')}</div>
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
              <span className="nx-chip nx-chip-brand">{g.units.toLocaleString()}</span>
            </div>
            <div>
              <span className="nx-chip nx-chip-neutral">{g.sets}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
