// src/pages/DuplicateDetector.tsx
import type React from 'react'
import i18n from '@dhis2/d2-i18n'
import { Button } from '@dhis2/ui'
import { DuplicateTable } from '../components/DataIntegrity/DuplicateTable'
import { useDuplicateDetector } from '../hooks/useDuplicateDetector'
import { useIntegrityData } from '../hooks/useIntegrityData'
import styles from './DataIntegrity.module.css'

const DuplicateDetector: React.FC = () => {
  const { orgUnits, loading, error, run } = useIntegrityData()
  const pairs = useDuplicateDetector(orgUnits)

  return (
    <div className={styles.page} data-testid="page-DuplicateDetector">
      <div className={styles.header}>
        <h1>{i18n.t('Duplicate Detector')}</h1>
        <p>{i18n.t('Find org units with identical or suspiciously similar names')}</p>
      </div>

      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <Button primary onClick={run} disabled={loading}>
            {loading ? i18n.t('Scanning...') : i18n.t('Scan for Duplicates')}
          </Button>
        </div>
      </div>

      {(orgUnits.length > 0 || loading || error !== undefined) && (
        <DuplicateTable pairs={pairs} loading={loading} error={error} />
      )}
    </div>
  )
}

export default DuplicateDetector
