// src/pages/HierarchyValidator.tsx
import type React from 'react'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { HierarchyReport } from '../components/DataIntegrity/HierarchyReport'
import { useHierarchyValidator } from '../hooks/useHierarchyValidator'
import { useIntegrityData } from '../hooks/useIntegrityData'
import styles from './DataIntegrity.module.css'

const HierarchyValidator: React.FC = () => {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const violations = useHierarchyValidator(orgUnits)

  return (
    <div className={styles.page} data-testid="page-HierarchyValidator">
      <div className={styles.header}>
        <h1>{i18n.t('Hierarchy Validator')}</h1>
        <p>{i18n.t('Detect structural violations in the org unit hierarchy')}</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Validating') : i18n.t('Run Validation')}
          </Button>
        </div>
      </div>

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <HierarchyReport violations={violations} loading={loading} error={error} />
      )}
    </div>
  )
}

export default HierarchyValidator
