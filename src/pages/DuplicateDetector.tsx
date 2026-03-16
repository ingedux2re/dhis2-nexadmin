// src/pages/DuplicateDetector.tsx
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { DuplicateTable } from '../components/DataIntegrity/DuplicateTable'
import { useDuplicateDetector } from '../hooks/useDuplicateDetector'
import { useIntegrityData } from '../hooks/useIntegrityData'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './DataIntegrity.module.css'

export default function DuplicateDetector() {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const pairs = useDuplicateDetector(orgUnits)

  return (
    <div className={styles.page} data-testid="page-DuplicateDetector">
      <PageHeader
        icon="find_replace"
        title={i18n.t('Duplicate Detector')}
        description={i18n.t(
          'Find org units with identical or suspiciously similar names in the hierarchy.'
        )}
        accentColor="warning"
        badge={
          pairs.length > 0 ? (
            <span className="nx-chip nx-chip-warning">
              {pairs.length} {i18n.t('pairs found')}
            </span>
          ) : undefined
        }
        actions={
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Scanning…') : i18n.t('Scan for Duplicates')}
          </Button>
        }
      />

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <DuplicateTable pairs={pairs} loading={loading} error={error} />
      )}
    </div>
  )
}
