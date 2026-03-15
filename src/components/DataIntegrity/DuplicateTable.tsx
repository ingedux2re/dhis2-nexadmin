import type React from 'react'
import i18n from '@dhis2/d2-i18n'
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableColumnHeader,
  DataTableCell,
  CircularLoader,
  Button,
  Tag,
} from '@dhis2/ui'
import { SeverityBadge } from './SeverityBadge'
import { exportCsv } from '../../utils/exportCsv'
import type { DuplicatePair } from '../../hooks/useDuplicateDetector'

import styles from './DuplicateTable.module.css'

interface DuplicateTableProps {
  pairs: DuplicatePair[]
  loading: boolean
  error: Error | undefined
}

function MatchTypeBadge({ type }: { type: 'exact' | 'fuzzy' }) {
  return type === 'exact' ? (
    <Tag negative>{i18n.t('Exact Match')}</Tag>
  ) : (
    <Tag>{i18n.t('Fuzzy Match')}</Tag>
  )
}

function handleExport(pairs: DuplicatePair[]) {
  const headers = [
    i18n.t('Org Unit A'),
    i18n.t('Org Unit B'),
    i18n.t('Level'),
    i18n.t('Match Type'),
    i18n.t('Similarity Score'),
    i18n.t('Severity'),
  ]
  const rows = pairs.map((p) => [
    p.nameA,
    p.nameB,
    p.level,
    p.matchType === 'exact' ? i18n.t('Exact Match') : i18n.t('Fuzzy Match'),
    `${p.similarity}%`,
    p.severity === 'error'
      ? i18n.t('High')
      : p.severity === 'warning'
        ? i18n.t('Medium')
        : i18n.t('Low'),
  ])
  exportCsv('duplicates.csv', headers, rows)
}

export const DuplicateTable: React.FC<DuplicateTableProps> = ({ pairs, loading, error }) => {
  if (loading) {
    return (
      <div className={styles.center}>
        <CircularLoader small />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {i18n.t('Something went wrong')}: {error.message}
      </div>
    )
  }

  if (pairs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>content_copy</div>
        <p>{i18n.t('No duplicates found — system is clean')}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {i18n.t('{{count}} duplicates found', { count: pairs.length })}
        </span>
        <Button secondary small onClick={() => handleExport(pairs)}>
          {i18n.t('Export CSV')}
        </Button>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>{i18n.t('Org Unit A')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Org Unit B')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Level')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Match Type')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Similarity Score')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Severity')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {pairs.map((pair) => (
            <DataTableRow key={pair.id}>
              <DataTableCell>
                <span className={styles.unitName}>{pair.nameA}</span>
                <span className={styles.unitId}>{pair.idA}</span>
              </DataTableCell>
              <DataTableCell>
                <span className={styles.unitName}>{pair.nameB}</span>
                <span className={styles.unitId}>{pair.idB}</span>
              </DataTableCell>
              <DataTableCell>{pair.level}</DataTableCell>
              <DataTableCell>
                <MatchTypeBadge type={pair.matchType} />
              </DataTableCell>
              <DataTableCell>
                <span className={styles.similarity}>{pair.similarity}%</span>
              </DataTableCell>
              <DataTableCell>
                <SeverityBadge severity={pair.severity} />
              </DataTableCell>
              <DataTableCell>
                <div className={styles.actions}>
                  <Button
                    small
                    secondary
                    onClick={() => window.open(`#/org-units?id=${pair.idA}`, '_blank')}
                  >
                    {i18n.t('View Details')}
                  </Button>
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default DuplicateTable
