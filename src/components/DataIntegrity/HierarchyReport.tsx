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
import type { HierarchyViolation, ViolationType } from '../../hooks/useHierarchyValidator'
import styles from './HierarchyReport.module.css'

interface HierarchyReportProps {
  violations: HierarchyViolation[]
  loading: boolean
  error: Error | undefined
}

const VIOLATION_LABELS: Record<ViolationType, () => string> = {
  'missing-parent': () => i18n.t('Missing Parent'),
  orphan: () => i18n.t('Orphan Unit'),
  'level-gap': () => i18n.t('Level Inconsistency'),
  'circular-ref': () => i18n.t('Circular Reference'),
}

function ViolationTypeBadge({ type }: { type: ViolationType }) {
  const isError = type === 'missing-parent' || type === 'circular-ref' || type === 'orphan'
  return isError ? (
    <Tag negative>{VIOLATION_LABELS[type]()}</Tag>
  ) : (
    <Tag>{VIOLATION_LABELS[type]()}</Tag>
  )
}

function handleExport(violations: HierarchyViolation[]) {
  const headers = [
    i18n.t('Org Unit'),
    i18n.t('Violation Type'),
    i18n.t('Details'),
    i18n.t('Severity'),
  ]
  const rows = violations.map((v) => [
    v.orgUnitName,
    VIOLATION_LABELS[v.violationType](),
    v.details,
    v.severity === 'error'
      ? i18n.t('High')
      : v.severity === 'warning'
        ? i18n.t('Medium')
        : i18n.t('Low'),
  ])
  exportCsv('hierarchy-violations.csv', headers, rows)
}

export const HierarchyReport: React.FC<HierarchyReportProps> = ({ violations, loading, error }) => {
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

  if (violations.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>rule</div>
        <p>{i18n.t('No violations found — hierarchy is valid')}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {i18n.t('{{count}} violations detected', { count: violations.length })}
        </span>
        <Button secondary small onClick={() => handleExport(violations)}>
          {i18n.t('Export CSV')}
        </Button>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>{i18n.t('Org Unit')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Violation Type')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Details')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Severity')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {violations.map((v) => (
            <DataTableRow key={v.id}>
              <DataTableCell>
                <span className={styles.unitName}>{v.orgUnitName}</span>
                <span className={styles.unitId}>{v.orgUnitId}</span>
              </DataTableCell>
              <DataTableCell>
                <ViolationTypeBadge type={v.violationType} />
              </DataTableCell>
              <DataTableCell>
                <span className={styles.details}>{v.details}</span>
              </DataTableCell>
              <DataTableCell>
                <SeverityBadge severity={v.severity} />
              </DataTableCell>
              <DataTableCell>
                <Button
                  small
                  secondary
                  onClick={() => window.open(`#/org-units?id=${v.orgUnitId}`, '_blank')}
                >
                  {i18n.t('View Org Unit')}
                </Button>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default HierarchyReport
