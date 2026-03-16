// src/pages/GeoConsistency.tsx
import type React from 'react'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { GeoConsistencyList } from '../components/DataIntegrity/GeoConsistencyList'
import { useGeoConsistency } from '../hooks/useGeoConsistency'
import { useIntegrityData } from '../hooks/useIntegrityData'
import styles from './DataIntegrity.module.css'

const GeoConsistency: React.FC = () => {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const issues = useGeoConsistency(orgUnits)

  return (
    <div className={styles.page} data-testid="page-GeoConsistency">
      <div className={styles.header}>
        <h1>{i18n.t('Geo Consistency Checker')}</h1>
        <p>{i18n.t('Identify org units with coordinates outside their district polygon')}</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Scanning...') : i18n.t('Run Geo Check')}
          </Button>
        </div>
      </div>

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <GeoConsistencyList issues={issues} loading={loading} error={error} />
      )}
    </div>
  )
}

export default GeoConsistency
