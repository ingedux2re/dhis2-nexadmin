// src/pages/HierarchyViewer.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

export default function HierarchyViewer() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="schema"
        title={i18n.t('Hierarchy Viewer')}
        description={i18n.t(
          'Visualise and explore the full organisation unit hierarchy in an interactive tree view.'
        )}
        accentColor="brand"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />
      <div className={styles.comingSoon}>
        <div className={styles.comingSoonIcon}>
          <span className="material-icons-round">account_tree</span>
        </div>
        <h2 className={styles.comingSoonTitle}>{i18n.t('Interactive Hierarchy Tree')}</h2>
        <p className={styles.comingSoonText}>
          {i18n.t(
            'A collapsible, searchable tree view of your entire organisation hierarchy will be available here. Click any node to view details, relationships, and assigned data sets.'
          )}
        </p>
        <div className={styles.featureList}>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Expandable tree with search')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Filter by level or group')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('View geo boundaries on map')}
          </div>
          <div className={styles.featureItem}>
            <span className="material-icons-round">check_circle</span>
            {i18n.t('Export hierarchy as JSON or CSV')}
          </div>
        </div>
      </div>
    </div>
  )
}
