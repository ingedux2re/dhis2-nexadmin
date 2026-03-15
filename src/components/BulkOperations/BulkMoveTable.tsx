import { useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import { exportCsv } from '../../utils/exportCsv'
import type { OrgUnitListItem } from '../../types/orgUnit'
import type { MoveOperation } from '../../hooks/useBulkMove'
import styles from './BulkMoveTable.module.css'

interface BulkMoveTableProps {
  orgUnits: OrgUnitListItem[]
  onOperationsChange: (ops: MoveOperation[]) => void
}

export function BulkMoveTable({ orgUnits, onOperationsChange }: BulkMoveTableProps) {
  const [operations, setOperations] = useState<MoveOperation[]>([])
  const [newParentId, setNewParentId] = useState('')
  const [newParentName, setNewParentName] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleAll = useCallback(() => {
    setSelectedIds((prev) =>
      prev.size === orgUnits.length ? new Set() : new Set(orgUnits.map((u) => u.id))
    )
  }, [orgUnits])

  const buildOps = useCallback(() => {
    if (!newParentId.trim() || !newParentName.trim()) return
    const ops: MoveOperation[] = orgUnits
      .filter((u) => selectedIds.has(u.id))
      .map((u) => ({
        orgUnit: u,
        newParentId: newParentId.trim(),
        newParentName: newParentName.trim(),
      }))
    setOperations(ops)
    onOperationsChange(ops)
  }, [newParentId, newParentName, orgUnits, selectedIds, onOperationsChange])

  const handleExport = () => {
    exportCsv(
      'bulk-move-preview.csv',
      [i18n.t('Org Unit'), i18n.t('Current Parent'), i18n.t('New Parent'), i18n.t('Level')],
      operations.map((op) => [
        op.orgUnit.name,
        op.orgUnit.parent?.name ?? '—',
        op.newParentName,
        String(op.orgUnit.level),
      ])
    )
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>{i18n.t('New Parent ID')}</label>
          <input
            className={styles.input}
            type="text"
            value={newParentId}
            onChange={(e) => setNewParentId(e.target.value)}
            placeholder={i18n.t('Paste DHIS2 org unit ID…')}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>{i18n.t('New Parent Name')}</label>
          <input
            className={styles.input}
            type="text"
            value={newParentName}
            onChange={(e) => setNewParentName(e.target.value)}
            placeholder={i18n.t('Display name…')}
          />
        </div>
        <button
          className={styles.previewBtn}
          onClick={buildOps}
          disabled={!newParentId.trim() || selectedIds.size === 0}
        >
          {i18n.t('Preview Move ({{count}})', { count: selectedIds.size })}
        </button>
      </div>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>
                <input
                  type="checkbox"
                  checked={selectedIds.size === orgUnits.length && orgUnits.length > 0}
                  onChange={toggleAll}
                  aria-label={i18n.t('Select all')}
                />
              </th>
              <th>{i18n.t('Org Unit')}</th>
              <th>{i18n.t('Current Parent')}</th>
              <th>{i18n.t('Level')}</th>
              <th>{i18n.t('New Parent')}</th>
            </tr>
          </thead>
          <tbody>
            {orgUnits.map((ou) => {
              const op = operations.find((o) => o.orgUnit.id === ou.id)
              return (
                <tr key={ou.id} className={selectedIds.has(ou.id) ? styles.selected : ''}>
                  <td>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(ou.id)}
                      onChange={() => toggleSelect(ou.id)}
                      aria-label={i18n.t('Select {{name}}', { name: ou.name })}
                    />
                  </td>
                  <td>{ou.name}</td>
                  <td>{ou.parent?.name ?? '—'}</td>
                  <td>{ou.level}</td>
                  <td className={op ? styles.newParent : styles.unchanged}>
                    {op ? op.newParentName : '—'}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {operations.length > 0 && (
        <div className={styles.footer}>
          <span>{i18n.t('{{count}} moves staged', { count: operations.length })}</span>
          <button className={styles.exportBtn} onClick={handleExport}>
            {i18n.t('Export Preview CSV')}
          </button>
        </div>
      )}
    </div>
  )
}
