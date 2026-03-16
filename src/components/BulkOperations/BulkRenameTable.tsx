// src/components/BulkOperations/BulkRenameTable.tsx
import type React from 'react'
import { useState, useMemo } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { OrgUnitListItem } from '../../types/orgUnit'
import { exportCsv } from '../../utils/exportCsv'
import styles from './BulkRenameTable.module.css'

export type RenameMode = 'find-replace' | 'prefix' | 'suffix' | 'regex'

export interface RenamePreview {
  id: string
  oldName: string
  newName: string
  changed: boolean
}

interface Props {
  orgUnits: OrgUnitListItem[]
  onConfirm: (previews: RenamePreview[]) => void
  disabled?: boolean
}

function applyRename(name: string, mode: RenameMode, find: string, replace: string): string {
  if (!find) return name
  switch (mode) {
    case 'find-replace':
      return name.split(find).join(replace)
    case 'prefix':
      return `${find}${name}`
    case 'suffix':
      return `${name}${find}`
    case 'regex': {
      try {
        const rx = new RegExp(find, 'g')
        return name.replace(rx, replace)
      } catch {
        return name
      }
    }
  }
}

export const BulkRenameTable: React.FC<Props> = ({ orgUnits, onConfirm, disabled = false }) => {
  const [mode, setMode] = useState<RenameMode>('find-replace')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')
  const [filter, setFilter] = useState('')
  const [previewed, setPreviewed] = useState(false)

  const filtered = useMemo(
    () =>
      filter
        ? orgUnits.filter((ou) => ou.name.toLowerCase().includes(filter.toLowerCase()))
        : orgUnits,
    [orgUnits, filter]
  )

  const previews: RenamePreview[] = useMemo(
    () =>
      filtered.map((ou) => {
        const newName = applyRename(ou.name, mode, find, replace)
        return { id: ou.id, oldName: ou.name, newName, changed: newName !== ou.name }
      }),
    [filtered, mode, find, replace]
  )

  const changedCount = previews.filter((p) => p.changed).length

  const handleExportCsv = () => {
    const headers = [i18n.t('ID'), i18n.t('Current Name'), i18n.t('New Name')]
    const rows = previews.filter((p) => p.changed).map((p) => [p.id, p.oldName, p.newName])
    exportCsv('bulk-rename-preview.csv', headers, rows)
  }

  return (
    <div className={styles.container}>
      {/* ── Controls ─────────────────────────────────────────── */}
      <div className={styles.controls}>
        <label className={styles.label}>{i18n.t('Mode')}</label>
        <select
          className={styles.select}
          value={mode}
          onChange={(e) => {
            setMode(e.target.value as RenameMode)
            setPreviewed(false)
          }}
          disabled={disabled}
        >
          <option value="find-replace">{i18n.t('Find & Replace')}</option>
          <option value="prefix">{i18n.t('Add Prefix')}</option>
          <option value="suffix">{i18n.t('Add Suffix')}</option>
          <option value="regex">{i18n.t('Regex Replace')}</option>
        </select>

        {mode === 'find-replace' || mode === 'regex' ? (
          <>
            <input
              className={styles.input}
              placeholder={mode === 'regex' ? i18n.t('Pattern (regex)') : i18n.t('Find text')}
              value={find}
              onChange={(e) => {
                setFind(e.target.value)
                setPreviewed(false)
              }}
              disabled={disabled}
            />
            <input
              className={styles.input}
              placeholder={i18n.t('Replace with')}
              value={replace}
              onChange={(e) => {
                setReplace(e.target.value)
                setPreviewed(false)
              }}
              disabled={disabled}
            />
          </>
        ) : (
          <input
            className={styles.input}
            placeholder={mode === 'prefix' ? i18n.t('Prefix to add') : i18n.t('Suffix to add')}
            value={find}
            onChange={(e) => {
              setFind(e.target.value)
              setPreviewed(false)
            }}
            disabled={disabled}
          />
        )}

        <button
          className={styles.previewBtn}
          onClick={() => setPreviewed(true)}
          disabled={disabled || !find}
        >
          {i18n.t('Preview Rename')}
        </button>
      </div>

      {/* ── Filter ───────────────────────────────────────────── */}
      <div className={styles.filterRow}>
        <input
          className={styles.input}
          placeholder={i18n.t('Filter org units by name…')}
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          disabled={disabled}
        />
        <span className={styles.countBadge}>
          {i18n.t('{{n}} org units loaded', { n: orgUnits.length })}
        </span>
      </div>

      {/* ── Preview table ─────────────────────────────────────── */}
      {previewed && (
        <>
          <div className={styles.previewHeader}>
            <span>
              {i18n.t('{{changed}} of {{total}} names will change', {
                changed: changedCount,
                total: previews.length,
              })}
            </span>
            {changedCount > 0 && (
              <button className={styles.exportBtn} onClick={handleExportCsv} disabled={disabled}>
                {i18n.t('Export CSV')}
              </button>
            )}
          </div>

          {previews.length === 0 ? (
            <p className={styles.empty}>{i18n.t('No org units match the current filter.')}</p>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{i18n.t('ID')}</th>
                  <th>{i18n.t('Current Name')}</th>
                  <th>{i18n.t('New Name')}</th>
                </tr>
              </thead>
              <tbody>
                {previews.map((p) => (
                  <tr key={p.id} className={p.changed ? styles.changed : styles.unchanged}>
                    <td className={styles.idCell}>{p.id}</td>
                    <td>{p.changed ? <s>{p.oldName}</s> : p.oldName}</td>
                    <td className={p.changed ? styles.newName : ''}>{p.newName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {changedCount > 0 && (
            <button
              className={styles.confirmBtn}
              disabled={disabled}
              onClick={() => onConfirm(previews.filter((p) => p.changed))}
            >
              {i18n.t('Apply {{count}} Renames', { count: changedCount })}
            </button>
          )}
        </>
      )}
    </div>
  )
}
