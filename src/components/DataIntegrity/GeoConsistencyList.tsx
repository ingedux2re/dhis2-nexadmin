import type React from 'react'
import { useState } from 'react'
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
  SingleSelect,
  SingleSelectOption,
} from '@dhis2/ui'
import { SeverityBadge } from './SeverityBadge'
import { exportCsv } from '../../utils/exportCsv'
import type { GeoIssue, GeoIssueType } from '../../hooks/useGeoConsistency'
import styles from './GeoConsistencyList.module.css'

interface GeoConsistencyListProps {
  issues: GeoIssue[]
  loading: boolean
  error: Error | undefined
}

const ISSUE_LABELS: Record<GeoIssueType, () => string> = {
  'missing-geometry': () => i18n.t('Missing Coordinates'),
  'outside-boundary': () => i18n.t('Outside Boundary'),
  'low-precision': () => i18n.t('Low Precision'),
}

function handleExport(issues: GeoIssue[]) {
  const headers = [
    i18n.t('Org Unit'),
    i18n.t('Level'),
    i18n.t('Issue Type'),
    i18n.t('Details'),
    i18n.t('Latitude'),
    i18n.t('Longitude'),
    i18n.t('Severity'),
  ]
  const rows = issues.map((iss) => [
    iss.orgUnitName,
    iss.level,
    ISSUE_LABELS[iss.issueType](),
    iss.details,
    iss.lat !== undefined ? iss.lat.toFixed(6) : '',
    iss.lng !== undefined ? iss.lng.toFixed(6) : '',
    iss.severity === 'error'
      ? i18n.t('High')
      : iss.severity === 'warning'
        ? i18n.t('Medium')
        : i18n.t('Low'),
  ])
  exportCsv('geo-issues.csv', headers, rows)
}

type FilterValue = 'all' | GeoIssueType

export const GeoConsistencyList: React.FC<GeoConsistencyListProps> = ({
  issues,
  loading,
  error,
}) => {
  const [filter, setFilter] = useState<FilterValue>('all')

  const filtered = filter === 'all' ? issues : issues.filter((i) => i.issueType === filter)

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

  if (issues.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>map</div>
        <p>{i18n.t('No geo issues found')}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.count}>
            {i18n.t('{{count}} geo issues found', { count: filtered.length })}
          </span>
          <SingleSelect
            selected={filter}
            onChange={({ selected }: { selected: string }) => setFilter(selected as FilterValue)}
            dense
            className={styles.filterSelect}
          >
            <SingleSelectOption value="all" label={i18n.t('All')} />
            <SingleSelectOption value="missing-geometry" label={i18n.t('Missing Coordinates')} />
            <SingleSelectOption value="outside-boundary" label={i18n.t('Outside Boundary')} />
            <SingleSelectOption value="low-precision" label={i18n.t('Low Precision')} />
          </SingleSelect>
        </div>
        <Button secondary small onClick={() => handleExport(filtered)}>
          {i18n.t('Export CSV')}
        </Button>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>{i18n.t('Org Unit')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Level')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Issue Type')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Details')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Severity')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {filtered.map((iss) => (
            <DataTableRow key={iss.id}>
              <DataTableCell>
                <span className={styles.unitName}>{iss.orgUnitName}</span>
                <span className={styles.unitId}>{iss.orgUnitId}</span>
              </DataTableCell>
              <DataTableCell>{iss.level}</DataTableCell>
              <DataTableCell>
                <span className={styles.issueLabel}>{ISSUE_LABELS[iss.issueType]()}</span>
              </DataTableCell>
              <DataTableCell>
                <span className={styles.details}>{iss.details}</span>
              </DataTableCell>
              <DataTableCell>
                <SeverityBadge severity={iss.severity} />
              </DataTableCell>
              <DataTableCell>
                {iss.lat !== undefined && iss.lng !== undefined ? (
                  <Button
                    small
                    secondary
                    onClick={() =>
                      window.open(
                        `https://www.openstreetmap.org/?mlat=${iss.lat}&mlon=${iss.lng}&zoom=12`,
                        '_blank',
                        'noopener,noreferrer'
                      )
                    }
                  >
                    {i18n.t('View on Map')}
                  </Button>
                ) : (
                  <span className={styles.noCoords}>—</span>
                )}
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default GeoConsistencyList
