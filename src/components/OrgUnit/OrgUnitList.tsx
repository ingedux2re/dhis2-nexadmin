// src/components/OrgUnit/OrgUnitList.tsx
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableColumnHeader,
  DataTableCell,
  Button,
  CircularLoader,
  NoticeBox,
  Tag,
} from '@dhis2/ui'
import type { OrgUnitListItem } from '../../types/orgUnit'
import styles from './OrgUnitList.module.css'
import i18n from '@dhis2/d2-i18n'

interface Props {
  orgUnits: OrgUnitListItem[]
  loading: boolean
  error?: Error | null
  onEdit: (unit: OrgUnitListItem) => void
  onDelete: (unit: OrgUnitListItem) => void
}

export function OrgUnitList({ orgUnits, loading, error, onEdit, onDelete }: Props) {
  if (loading) {
    return (
      <div className={styles.center}>
        <CircularLoader />
      </div>
    )
  }

  if (error) {
    return (
      <NoticeBox error title="Failed to load organisation units">
        {error.message}
      </NoticeBox>
    )
  }

  if (orgUnits.length === 0) {
    return (
      <NoticeBox title="No organisation units found">
        Try adjusting your search or filters.
      </NoticeBox>
    )
  }

  return (
    // DataTable does NOT accept a `loading` prop — handled above
    <DataTable className={styles.table}>
      <DataTableHead>
        <DataTableRow>
          <DataTableColumnHeader>{i18n.t('Name')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Short name')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Code')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Level')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Opening date')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Status')}</DataTableColumnHeader>
          <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
        </DataTableRow>
      </DataTableHead>
      <DataTableBody>
        {orgUnits.map((unit) => (
          <DataTableRow key={unit.id}>
            <DataTableCell>{unit.name}</DataTableCell>
            <DataTableCell>{unit.shortName}</DataTableCell>
            <DataTableCell>{unit.code ?? '—'}</DataTableCell>
            <DataTableCell>{unit.level}</DataTableCell>
            <DataTableCell>
              {unit.openingDate ? new Date(unit.openingDate).toLocaleDateString() : '—'}
            </DataTableCell>
            <DataTableCell>
              {unit.closedDate ? (
                <Tag negative>{i18n.t('Closed')}</Tag>
              ) : (
                <Tag positive>{i18n.t('Open')}</Tag>
              )}
            </DataTableCell>
            <DataTableCell>
              <Button small onClick={() => onEdit(unit)}>
                {i18n.t('Edit')}
              </Button>
              <Button small destructive onClick={() => onDelete(unit)}>
                {i18n.t('Delete')}
              </Button>
            </DataTableCell>
          </DataTableRow>
        ))}
      </DataTableBody>
    </DataTable>
  )
}
