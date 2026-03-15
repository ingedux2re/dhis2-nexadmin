import type React from 'react'
import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { HierarchyReport } from '../components/DataIntegrity/HierarchyReport'
import { useHierarchyValidator } from '../hooks/useHierarchyValidator'
import type { OrgUnitIntegrityItem } from '../types/orgUnit'
import styles from './DataIntegrity.module.css'

const INTEGRITY_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: ['id', 'name', 'shortName', 'level', 'path', 'parent[id,name]'],
      paging: false,
    },
  },
}

interface IntegrityData {
  orgUnits: {
    organisationUnits: OrgUnitIntegrityItem[]
  }
}

const HierarchyValidator: React.FC = () => {
  const { data, loading, error, refetch } = useDataQuery<IntegrityData>(INTEGRITY_QUERY, {
    lazy: true,
  })

  const orgUnits: OrgUnitIntegrityItem[] = data?.orgUnits?.organisationUnits ?? []
  const violations = useHierarchyValidator(orgUnits)

  const handleRun = useCallback(() => {
    refetch()
  }, [refetch])

  return (
    <div className={styles.page} data-testid="page-HierarchyValidator">
      <div className={styles.header}>
        <h1>{i18n.t('Hierarchy Validator')}</h1>
        <p>{i18n.t('Detect structural violations in the org unit hierarchy')}</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button primary onClick={handleRun} disabled={loading}>
            {loading ? i18n.t('Validating') : i18n.t('Run Validation')}
          </Button>
        </div>
      </div>

      {(data !== undefined || loading || error !== undefined) && (
        <HierarchyReport
          violations={violations}
          loading={loading}
          error={error as Error | undefined}
        />
      )}
    </div>
  )
}

export default HierarchyValidator
