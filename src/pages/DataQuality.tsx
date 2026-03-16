// src/pages/DataQuality.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const CHECKS = [
  {
    icon: 'rule',
    title: 'Validation Rules',
    desc: 'Run DHIS2 validation rules to detect data entry errors and inconsistencies.',
    status: 'planned',
  },
  {
    icon: 'compare_arrows',
    title: 'Outlier Detection',
    desc: 'Identify statistical outliers that deviate significantly from expected values.',
    status: 'planned',
  },
  {
    icon: 'data_object',
    title: 'Completeness Check',
    desc: 'Assess reporting completeness across org units and data sets.',
    status: 'planned',
  },
  {
    icon: 'timelapse',
    title: 'Timeliness Analysis',
    desc: 'Measure how timely data submissions are compared to expected deadlines.',
    status: 'planned',
  },
]

export default function DataQuality() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="verified"
        title={i18n.t('Data Quality')}
        description={i18n.t(
          'Run validation rules, detect outliers, and assess completeness and timeliness of reported data.'
        )}
        accentColor="success"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />
      <div className={styles.infoGrid}>
        {CHECKS.map((c) => (
          <div key={c.title} className={styles.infoCard}>
            <div className={styles.infoCardTitle}>
              <span className="material-icons-round">{c.icon}</span>
              {i18n.t(c.title)}
            </div>
            <div className={styles.infoCardBody}>{i18n.t(c.desc)}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
