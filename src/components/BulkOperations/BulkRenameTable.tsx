import { useState } from 'react'
import i18n from '@dhis2/d2-i18n'
import { exportCsv } from '../../utils/exportCsv'
import type { OrgUnitListItem } from '../../types/orgUnit'
import type { RenameMode, RenamePreview } from '../../hooks/useBulkRename'
import styles from './BulkRenameTable.module.css'

interface BulkRenameTableProps {
  orgUnits: OrgUnitListItem[]
  previews: RenamePreview[]
  onPreview: (orgUnits: OrgUnitListItem[], mode: RenameMode, find: string, replace: string) => void
  onConfirm: () => void
  disabled?: boolean
}

const MODES: { value: RenameMode; label: string }[] = [
  { value: 'find-replace', label: 'Find & Replace' },
  { value: 'prefix', label: 'Add Prefix' },
  { value: 'suffix', label: 'Add Suffix' },
  { value: 'regex', label: 'Regex Replace' },
]

export function BulkRenameTable({
  orgUnits,
  previews,
  onPreview,
  onConfirm,
  disabled,
}: BulkRenameTableProps) {
  const [mode, setMode] = useState<RenameMode>('find-replace')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')

  const handlePreview = () => onPreview(orgUnits, mode, find, replace)

  const handleExport = () => {
    exportCsv(
      'bulk-rename-preview.csv',
      [i18n.t('Old Name'), i18n.t('New Name'), i18n.t('Level'), i18n.t('Parent')],
      previews.map((p) => [
        p.oldName,
        p.newName,
        String(p.orgUnit.level),
        p.orgUnit.parent?.name ?? '—',
      ])
    )
  }

  const modeLabel = (v: RenameMode) => {
    const map: Record<RenameMode, string> = {
      'find-replace': i18n.t('Find & Replace'),
      prefix: i18n.t('Add Prefix'),
      suffix: i18n.t('Add Suffix'),
      regex: i18n.t('Regex Replace'),
    }
    return map[v]
  }

  const findPlaceholder = (m: RenameMode) => {
    const map: Record<RenameMode, string> = {
      'find-replace': i18n.t('Text to find…'),
      prefix: i18n.t('Prefix to add…'),
      suffix: i18n.t('Suffix to add…'),
      regex: i18n.t('Regular expression…'),
    }
    return map[m]
  }

  return (
    <div className={styles.container}>
      <div className={styles.controls}>
        <div className={styles.field}>
          <label className={styles.label}>{i18n.t('Mode')}</label>
          <select
            className={styles.select}
            value={mode}
            onChange={(e) => setMode(e.target.value as RenameMode)}
          >
            {MODES.map((m) => (
              <option key={m.value} value={m.value}>
                {modeLabel(m.value)}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            {mode === 'prefix'
              ? i18n.t('Prefix')
              : mode === 'suffix'
                ? i18n.t('Suffix')
                : i18n.t('Find')}
          </label>
          <input
            className={styles.input}
            type="text"
            value={find}
            onChange={(e) => setFind(e.target.value)}
            placeholder={findPlaceholder(mode)}
          />
        </div>

        {(mode === 'find-replace' || mode === 'regex') && (
          <div className={styles.field}>
            <label className={styles.label}>{i18n.t('Replace with')}</label>
            <input
              className={styles.input}
              type="text"
              value={replace}
              onChange={(e) => setReplace(e.target.value)}
              placeholder={i18n.t('Replacement text…')}
            />
          </div>
        )}

        <button
          className={styles.previewBtn}
          onClick={handlePreview}
          disabled={!find.trim() || disabled}
        >
          {i18n.t('Preview Rename')}
        </button>
      </div>

      {previews.length > 0 && (
        <>
          <div className={styles.previewHeader}>
            <span>{i18n.t('{{count}} org units will be renamed', { count: previews.length })}</span>
            <div className={styles.previewActions}>
              <button className={styles.exportBtn} onClick={handleExport}>
                {i18n.t('Export Preview CSV')}
              </button>
              <button className={styles.applyBtn} onClick={onConfirm} disabled={disabled}>
                {i18n.t('Apply Rename ({{count}})', { count: previews.length })}
              </button>
            </div>
          </div>

          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{i18n.t('Old Name')}</th>
                  <th>{i18n.t('New Name')}</th>
                  <th>{i18n.t('Level')}</th>
                  <th>{i18n.t('Parent')}</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((p) => (
                  <tr key={p.orgUnit.id}>
                    <td className={styles.oldName}>{p.oldName}</td>
                    <td className={styles.newName}>{p.newName}</td>
                    <td>{p.orgUnit.level}</td>
                    <td>{p.orgUnit.parent?.name ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {previews.length === 0 && find.trim() && (
        <p className={styles.empty}>{i18n.t('No org units match — nothing to rename.')}</p>
      )}
    </div>
  )
}
