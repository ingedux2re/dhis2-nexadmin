import type React from 'react'
import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { DuplicateTable } from '../components/DataIntegrity/DuplicateTable'
import { useDuplicateDetector } from '../hooks/useDuplicateDetector'
import type { OrgUnitIntegrityItem } from '../types/orgUnit'
import styles from './DataIntegrity.module.css'

const INTEGRITY_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: [
        'id',
        'name',
        'shortName',
        'level',
        'path',
        'parent[id,name]',
        'geometry',
        'featureType',
      ],
      paging: false,
    },
  },
}

interface IntegrityData {
  orgUnits: {
    organisationUnits: OrgUnitIntegrityItem[]
  }
}

const DuplicateDetector: React.FC = () => {
  const { data, loading, error, refetch } = useDataQuery<IntegrityData>(INTEGRITY_QUERY, {
    lazy: true,
  })

  const orgUnits: OrgUnitIntegrityItem[] = data?.orgUnits?.organisationUnits ?? []
  const pairs = useDuplicateDetector(orgUnits)

  const handleRun = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className={styles.page} data-testid="page-DuplicateDetector">
      <div className={styles.header}>
        <h1>{i18n.t('Duplicate Detector')}</h1>
        <p>{i18n.t('Find org units with identical or suspiciously similar names')}</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button primary onClick={handleRun} disabled={loading}>
            {loading ? i18n.t('Scanning...') : i18n.t('Scan for Duplicates')}
          </Button>
        </div>
      </div>

      {(data !== undefined || loading || error !== undefined) && (
        <DuplicateTable pairs={pairs} loading={loading} error={error as Error | undefined} />
      )}
    </div>
  )
}

export default DuplicateDetector
