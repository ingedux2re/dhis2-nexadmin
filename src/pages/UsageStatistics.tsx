// src/pages/UsageStatistics.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import { StatCard } from '../components/shared/StatCard'
import styles from './StubPage.module.css'
import pageStyles from './UsageStatistics.module.css'

export default function UsageStatistics() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="bar_chart"
        title={i18n.t('Usage Statistics')}
        description={i18n.t(
          'Monitor system usage, active users, popular features, and performance metrics over time.'
        )}
        accentColor="success"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      {/* Skeleton KPI row */}
      <div className={pageStyles.statsRow}>
        <StatCard icon="people" label={i18n.t('Active Users')} value="—" color="brand" loading />
        <StatCard
          icon="touch_app"
          label={i18n.t('API Requests / day')}
          value="—"
          color="info"
          loading
        />
        <StatCard
          icon="speed"
          label={i18n.t('Avg Response (ms)')}
          value="—"
          color="success"
          loading
        />
        <StatCard
          icon="error_outline"
          label={i18n.t('Error Rate')}
          value="—"
          color="warning"
          loading
        />
      </div>

      <div className={styles.comingSoon} style={{ padding: 'var(--space-8)' }}>
        <div className={styles.comingSoonIcon}>
          <span className="material-icons-round">bar_chart</span>
        </div>
        <h2 className={styles.comingSoonTitle}>{i18n.t('Analytics Dashboard')}</h2>
        <p className={styles.comingSoonText}>
          {i18n.t(
            'Charts, trend lines, and detailed usage reports will be available here. Track user activity, popular modules, and system performance.'
          )}
        </p>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Daily active users chart')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Most used features and modules')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Performance and error rate trends')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Export reports as PDF or CSV')}
          </div>
        </div>
      </div>
    </div>
  )
}
