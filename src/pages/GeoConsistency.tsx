// src/pages/GeoConsistency.tsx
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { GeoConsistencyList } from '../components/DataIntegrity/GeoConsistencyList'
import { useGeoConsistency } from '../hooks/useGeoConsistency'
import { useIntegrityData } from '../hooks/useIntegrityData'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './DataIntegrity.module.css'

export default function GeoConsistency() {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const issues = useGeoConsistency(orgUnits)

  return (
    <div className={styles.page} data-testid="page-GeoConsistency">
      <PageHeader
        icon="place"
        title={i18n.t('Geo Consistency Checker')}
        description={i18n.t(
          'Identify org units with missing coordinates, invalid geometries, or coordinates outside their parent polygon.'
        )}
        accentColor="info"
        badge={
          issues.length > 0 ? (
            <span className="nx-chip nx-chip-warning">
              {issues.length} {i18n.t('issues')}
            </span>
          ) : orgUnits.length > 0 ? (
            <span className="nx-chip nx-chip-success">{i18n.t('All clean')}</span>
          ) : undefined
        }
        actions={
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Scanning…') : i18n.t('Run Geo Check')}
          </Button>
        }
      />

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <GeoConsistencyList issues={issues} loading={loading} error={error} />
      )}
    </div>
  )
}
