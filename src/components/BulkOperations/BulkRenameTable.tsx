// src/components/BulkOperations/BulkRenameTable.tsx
import type { FC } from 'react'
import { useState, useMemo, useEffect, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { OrgUnitListItem, OrgUnitRef } from '../../types/orgUnit'
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
  completedCount?: number
}

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

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
        return name.replace(new RegExp(find, 'g'), replace)
      } catch {
        return name
      }
    }
  }
}

export const BulkRenameTable: FC<Props> = ({
  orgUnits,
  onConfirm,
  disabled = false,
  completedCount = 0,
}) => {
  // ── Table state ──────────────────────────────────────────
  const [filter, setFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | ''>('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // ── Rename panel state ───────────────────────────────────
  const [mode, setMode] = useState<RenameMode>('find-replace')
  const [find, setFind] = useState('')
  const [replace, setReplace] = useState('')

  // ── Per-row manual rename overrides ─────────────────────
  // Keyed by org unit id; takes priority over the pattern-based rename.
  const [manualRenames, setManualRenames] = useState<Map<string, string>>(new Map())

  /**
   * When exactly 1 row is selected and the mode is find-replace or regex,
   * and the Find field is still empty, pre-fill it with that org unit's name.
   * Does NOT fire if the user already has a pattern typed (find !== ''),
   * so adding more rows to an existing selection keeps the rule intact.
   */
  useEffect(() => {
    if (selectedIds.size !== 1) return
    if (mode !== 'find-replace' && mode !== 'regex') return
    if (find !== '') return
    const ou = orgUnits.find((u) => u.id === [...selectedIds][0])
    if (ou) {
      setFind(ou.name)
      setReplace('')
    }
  }, [selectedIds, orgUnits, mode]) // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Clear selection and manual renames after each successful rename batch.
   * find/replace are intentionally kept so the user can immediately
   * search for more units and apply the same rule again.
   */
  useEffect(() => {
    if (completedCount === 0) return
    setSelectedIds(new Set())
    setManualRenames(new Map())
  }, [completedCount])

  // ── Derived ──────────────────────────────────────────────
  const levels = useMemo(
    () =>
      (
        [
          ...new Set(
            orgUnits.map((u: OrgUnitListItem) => u.level).filter((l): l is number => l != null)
          ),
        ] as number[]
      ).sort((a: number, b: number) => a - b),
    [orgUnits]
  )

  const filtered = useMemo(() => {
    return orgUnits.filter((ou) => {
      if (filter && !ou.name.toLowerCase().includes(filter.toLowerCase())) return false
      if (levelFilter !== '' && ou.level !== levelFilter) return false
      return true
    })
  }, [orgUnits, filter, levelFilter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  // ── Cross-search selection tracking ─────────────────────
  const pinnedRows = useMemo(
    () => orgUnits.filter((u) => selectedIds.has(u.id) && !filtered.find((f) => f.id === u.id)),
    [orgUnits, selectedIds, filtered]
  )

  const hiddenSelectedCount = useMemo(() => {
    const visibleIds = new Set(filtered.map((u) => u.id))
    return [...selectedIds].filter((id) => !visibleIds.has(id)).length
  }, [selectedIds, filtered])

  /**
   * Live previews — merges pattern-based renames with per-row manual overrides.
   * Manual override wins; pattern applies when no override exists;
   * falls back to original name when neither is set.
   * Always computed for all selected rows (no !find gate).
   */
  const previews: RenamePreview[] = useMemo(() => {
    if (selectedIds.size === 0) return []
    return orgUnits
      .filter((ou) => selectedIds.has(ou.id))
      .map((ou) => {
        const manualName = manualRenames.get(ou.id)
        const patternName = find ? applyRename(ou.name, mode, find, replace) : ou.name
        const newName = manualName !== undefined ? manualName : patternName
        return {
          id: ou.id,
          oldName: ou.name,
          newName,
          changed: newName !== ou.name && newName !== '',
        }
      })
  }, [find, replace, mode, orgUnits, selectedIds, manualRenames])

  const changedCount = previews.filter((p) => p.changed).length

  const previewMap = useMemo(() => new Map(previews.map((p) => [p.id, p])), [previews])

  // ── Selection handlers ───────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        // Drop the manual rename when the row is deselected
        setManualRenames((m) => {
          const nm = new Map(m)
          nm.delete(id)
          return nm
        })
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const togglePageAll = useCallback(() => {
    const pageIds = paginated.map((ou) => ou.id)
    const allChecked = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allChecked) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
    // When deselecting the whole page, drop their manual renames too
    if (allChecked) {
      setManualRenames((m) => {
        const nm = new Map(m)
        pageIds.forEach((id) => nm.delete(id))
        return nm
      })
    }
  }, [paginated, selectedIds])

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set())
    setManualRenames(new Map())
  }, [])

  // ── Rename handlers ──────────────────────────────────────
  const handleModeChange = (m: RenameMode) => {
    setMode(m)
    setFind('')
    setReplace('')
  }

  const handleApply = useCallback(() => {
    const toApply = previews.filter((p) => p.changed)
    if (toApply.length === 0) return
    onConfirm(toApply)
    setFind('')
    setReplace('')
  }, [previews, onConfirm])

  const handleExportCsv = () => {
    const headers = [i18n.t('ID'), i18n.t('Current Name'), i18n.t('New Name')]
    const rows = previews.filter((p) => p.changed).map((p) => [p.id, p.oldName, p.newName])
    exportCsv('bulk-rename-preview.csv', headers, rows)
  }

  const pageAllChecked = paginated.length > 0 && paginated.every((ou) => selectedIds.has(ou.id))
  const pageIndeterminate = paginated.some((ou) => selectedIds.has(ou.id)) && !pageAllChecked

  // ── Row renderer ─────────────────────────────────────────
  const renderRow = (ou: OrgUnitListItem, isPinned = false) => {
    const preview = previewMap.get(ou.id)
    const isSelected = selectedIds.has(ou.id)
    const breadcrumb = ou.ancestors?.map((a: OrgUnitRef) => a.name).join(' › ')

    // Value shown in the inline input:
    // manual override → pattern result → empty string (placeholder shown)
    const inputValue =
      manualRenames.get(ou.id) ?? (find ? applyRename(ou.name, mode, find, replace) : '')

    return (
      <tr
        key={ou.id}
        className={[isSelected ? styles.selectedRow : '', isPinned ? styles.pinnedRow : '']
          .filter(Boolean)
          .join(' ')}
        onClick={() => toggleSelect(ou.id)}
      >
        <td className={styles.checkCell}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={() => toggleSelect(ou.id)}
            onClick={(e) => e.stopPropagation()}
            aria-label={i18n.t('Select {{name}}', { name: ou.name })}
          />
        </td>
        <td className={styles.nameCell}>
          <span>{preview?.changed ? <s className={styles.oldName}>{ou.name}</s> : ou.name}</span>
          {breadcrumb && <div className={styles.breadcrumb}>{breadcrumb}</div>}
        </td>
        <td>{ou.level}</td>

        {/* NEW NAME — inline input when selected, static text when not */}
        <td className={styles.newNameCell} onClick={(e) => e.stopPropagation()}>
          {isSelected ? (
            <input
              className={styles.newNameInput}
              value={inputValue}
              placeholder={i18n.t('New name…')}
              disabled={disabled}
              onChange={(e) => {
                const val = e.target.value
                setManualRenames((prev) => {
                  const next = new Map(prev)
                  if (val === ou.name) next.delete(ou.id)
                  else next.set(ou.id, val)
                  return next
                })
              }}
            />
          ) : preview?.changed ? (
            <span className={styles.newName}>{preview.newName}</span>
          ) : (
            <span className={styles.unchanged}>—</span>
          )}
        </td>
      </tr>
    )
  }

  return (
    <div className={styles.container}>
      {/* ── Filter bar ──────────────────────────────────── */}
      <div className={styles.filterBar}>
        <input
          className={styles.searchInput}
          placeholder={i18n.t('Search by name…')}
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value)
            setPage(1)
          }}
          disabled={disabled}
        />
        <select
          className={styles.levelSelect}
          value={levelFilter}
          onChange={(e) => {
            setLevelFilter(e.target.value === '' ? '' : Number(e.target.value))
            setPage(1)
          }}
          disabled={disabled}
        >
          <option value="">{i18n.t('All levels')}</option>
          {levels.map((l) => (
            <option key={l} value={l}>
              {i18n.t('Level {{n}}', { n: l })}
            </option>
          ))}
        </select>

        <span className={styles.countBadge}>
          {i18n.t('{{n}} org units', { n: filtered.length })}
        </span>

        {selectedIds.size > 0 && (
          <span className={styles.selectionBadge}>
            {i18n.t('{{n}} selected', { n: selectedIds.size })}
            {hiddenSelectedCount > 0 && (
              <span className={styles.hiddenBadge}>
                {i18n.t('+{{n}} from other searches', { n: hiddenSelectedCount })}
              </span>
            )}
          </span>
        )}

        {selectedIds.size > 0 && (
          <button className={styles.clearSelBtn} onClick={clearSelection} disabled={disabled}>
            {i18n.t('Clear selection')}
          </button>
        )}
      </div>

      {/* ── Main table ──────────────────────────────────── */}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.checkCell}>
                <input
                  type="checkbox"
                  checked={pageAllChecked}
                  ref={(el) => {
                    if (el) el.indeterminate = pageIndeterminate
                  }}
                  onChange={togglePageAll}
                  aria-label={i18n.t('Select page')}
                />
              </th>
              <th>{i18n.t('Name')}</th>
              <th>{i18n.t('Level')}</th>
              <th className={styles.newNameHeader}>{i18n.t('New Name')}</th>
            </tr>
          </thead>
          <tbody>
            {/* ── Pinned rows: selected from a previous search ── */}
            {pinnedRows.length > 0 && (
              <>
                <tr>
                  <td colSpan={4} className={styles.pinnedDivider}>
                    {i18n.t('Selected from other searches ({{n}})', { n: pinnedRows.length })}
                  </td>
                </tr>
                {pinnedRows.map((ou) => renderRow(ou, true))}
              </>
            )}

            {/* ── Current page rows ── */}
            {paginated.map((ou) => renderRow(ou, false))}

            {/* ── Empty state ── */}
            {paginated.length === 0 && pinnedRows.length === 0 && (
              <tr>
                <td colSpan={4} className={styles.emptyCell}>
                  {i18n.t('No org units match the filter.')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ──────────────────────────────────── */}
      <div className={styles.pagination}>
        <div className={styles.pageSizeRow}>
          <label className={styles.pageSizeLabel}>{i18n.t('Rows per page:')}</label>
          <select
            className={styles.pageSizeSelect}
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value))
              setPage(1)
            }}
          >
            {PAGE_SIZE_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
        <div className={styles.pageNav}>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(1)}
            disabled={page === 1}
            aria-label={i18n.t('First page')}
          >
            «
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            aria-label={i18n.t('Previous page')}
          >
            ‹
          </button>
          <span className={styles.pageInfo}>
            {i18n.t('{{page}} / {{total}}', { page, total: totalPages })}
          </span>
          <button
            className={styles.pageBtn}
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            aria-label={i18n.t('Next page')}
          >
            ›
          </button>
          <button
            className={styles.pageBtn}
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            aria-label={i18n.t('Last page')}
          >
            »
          </button>
        </div>
      </div>

      {/* ── Sticky rename action bar ─────────────────────── */}
      {selectedIds.size > 0 && (
        <div className={styles.renamePanel}>
          {/* ── Header ── */}
          <div className={styles.renamePanelHeader}>
            <span className={styles.renamePanelTitle}>
              {i18n.t('Rename {{n}} selected org units', { n: selectedIds.size })}
            </span>
            {changedCount > 0 && (
              <span className={styles.previewSummary}>
                {i18n.t('{{changed}} of {{total}} names will change', {
                  changed: changedCount,
                  total: selectedIds.size,
                })}
              </span>
            )}
          </div>

          {/* ── Controls ── */}
          <div className={styles.renameControls}>
            <select
              className={styles.select}
              value={mode}
              onChange={(e) => handleModeChange(e.target.value as RenameMode)}
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
                  onChange={(e) => setFind(e.target.value)}
                  disabled={disabled}
                />
                <input
                  className={styles.input}
                  placeholder={i18n.t('Replace with (empty = delete)')}
                  value={replace}
                  onChange={(e) => setReplace(e.target.value)}
                  disabled={disabled}
                />
              </>
            ) : (
              <>
                <input
                  className={styles.input}
                  placeholder={
                    mode === 'prefix'
                      ? i18n.t('Prefix  (e.g. "DR " — space included)')
                      : i18n.t('Suffix  (e.g. " CHP" — space included)')
                  }
                  value={find}
                  onChange={(e) => setFind(e.target.value)}
                  disabled={disabled}
                />
                {find && (
                  <span className={styles.formatHint}>
                    {mode === 'prefix' ? `→ "${find}Name"` : `→ "Name${find}"`}
                  </span>
                )}
              </>
            )}

            <button
              className={styles.applyBtn}
              onClick={handleApply}
              disabled={disabled || changedCount === 0}
            >
              {changedCount > 0
                ? i18n.t('Apply {{n}} renames', { n: changedCount })
                : i18n.t('Apply renames')}
            </button>

            {changedCount > 0 && (
              <button className={styles.exportBtn} onClick={handleExportCsv} disabled={disabled}>
                {i18n.t('Export CSV')}
              </button>
            )}
          </div>

          {/* ── Preview list: ALL pending renames, not limited to current page ── */}
          {changedCount > 0 && (
            <div className={styles.previewList}>
              <div className={styles.previewListHeader}>
                {i18n.t('{{n}} names will change — review before applying:', {
                  n: changedCount,
                })}
              </div>
              <div className={styles.previewListBody}>
                {previews
                  .filter((p) => p.changed)
                  .map((p) => (
                    <div key={p.id} className={styles.previewItem}>
                      <span className={styles.previewOld}>{p.oldName}</span>
                      <span className={styles.previewArrow}>→</span>
                      <span className={styles.previewNew}>{p.newName}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
