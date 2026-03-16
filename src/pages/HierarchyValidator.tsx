// src/pages/HierarchyValidator.tsx
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { HierarchyReport } from '../components/DataIntegrity/HierarchyReport'
import { useHierarchyValidator } from '../hooks/useHierarchyValidator'
import { useIntegrityData } from '../hooks/useIntegrityData'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './DataIntegrity.module.css'

export default function HierarchyValidator() {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const violations = useHierarchyValidator(orgUnits)

  return (
    <div className={styles.page} data-testid="page-HierarchyValidator">
      <PageHeader
        icon="rule"
        title={i18n.t('Hierarchy Validator')}
        description={i18n.t(
          'Detect structural violations in the org unit hierarchy — missing parents, circular references, and level gaps.'
        )}
        accentColor="warning"
        badge={
          violations.length > 0 ? (
            <span className="nx-chip nx-chip-danger">
              {violations.length} {i18n.t('violations')}
            </span>
          ) : orgUnits.length > 0 ? (
            <span className="nx-chip nx-chip-success">{i18n.t('No violations')}</span>
          ) : undefined
        }
        actions={
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Validating…') : i18n.t('Run Validation')}
          </Button>
        }
      />

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <HierarchyReport violations={violations} loading={loading} error={error} />
      )}
    </div>
  )
}
