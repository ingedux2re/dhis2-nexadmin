// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/components/RenameDatasetTable.tsx
//
// Three-zone UI for renaming data elements within a dataset:
//
//   Zone 1 — Dataset selector + filter bar
//   Zone 2 — Data element table (scrollable, checkboxes)
//   Zone 3 — Rule chain panel (pinned bottom, never scrolls)
//
// The rule chain is the productivity core: administrators can stack multiple
// rename rules (prefix → titlecase → trim) and see every name transform in
// real-time before committing.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC, KeyboardEvent } from 'react'
import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import i18n from '@dhis2/d2-i18n'
import { exportCsv } from '../../../utils/exportCsv'
import { nanoid } from '../../../utils/nanoid'
import { applyRuleChain } from '../services/metadataService'
import { RENAME_MODES } from '../types'
import type {
  DataElement,
  DataSet,
  DataElementRenamePreview,
  RenameRule,
  RenameMode,
} from '../types'
import styles from './RenameDatasetTable.module.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface RenameDatasetTableProps {
  dataSets: DataSet[]
  elements: DataElement[]
  dataSetName: string
  loadingDataSets: boolean
  loadingElements: boolean
  errorElements: Error | undefined
  onSelectDataset: (id: string) => void
  /**
   * Called with the fully-resolved preview list (inline overrides already
   * applied). The parent hook uses these previews directly without rebuilding.
   */
  onRequestConfirm: (previews: DataElementRenamePreview[]) => void
  disabled?: boolean
  completedCount?: number
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100]

function makeRule(mode: RenameMode = 'find-replace'): RenameRule {
  return { _id: nanoid(), mode, find: '', replace: '' }
}

/**
 * Convert a raw API error into a short, actionable message for the user.
 * Hides internal HTTP codes and suggests a concrete remedy.
 */
function friendlyLoadError(err: Error): string {
  const msg = err.message ?? ''
  if (msg.includes('401') || msg.toLowerCase().includes('unauthorized')) {
    return i18n.t('Session expired — please refresh the page and log in again.')
  }
  if (msg.includes('403') || msg.toLowerCase().includes('forbidden')) {
    return i18n.t('You do not have permission to read this dataset.')
  }
  if (msg.includes('404') || msg.toLowerCase().includes('not found')) {
    return i18n.t('Dataset not found — it may have been deleted. Try selecting another.')
  }
  if (msg.includes('405')) {
    return i18n.t(
      'Could not load dataset elements (API error). Please reload the page; if the problem persists contact your system administrator.'
    )
  }
  if (msg.toLowerCase().includes('network') || msg.toLowerCase().includes('fetch')) {
    return i18n.t('Network error — check your connection and try again.')
  }
  // Fallback: show a trimmed version of the raw message, capped at 120 chars
  return msg.length > 120 ? `${msg.slice(0, 120)}…` : msg
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RenameDatasetTable: FC<RenameDatasetTableProps> = ({
  dataSets,
  elements,
  dataSetName,
  loadingDataSets,
  loadingElements,
  errorElements,
  onSelectDataset,
  onRequestConfirm,
  disabled = false,
  completedCount = 0,
}) => {
  // ── Dataset selector ─────────────────────────────────────────────────────
  const [selectedDataSetId, setSelectedDataSetId] = useState('')

  // ── Table state ──────────────────────────────────────────────────────────
  const [filter, setFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(25)

  // ── Rule chain ───────────────────────────────────────────────────────────
  const [rules, setRules] = useState<RenameRule[]>([makeRule('find-replace')])

  // ── Inline direct edits: map of elementId → new name typed by the user ───
  // These take priority over rule-generated previews for the affected rows.
  const [inlineEdits, setInlineEdits] = useState<Map<string, string>>(new Map())
  // Which cell is currently being edited (null = none)
  const [editingId, setEditingId] = useState<string | null>(null)
  const inlineInputRef = useRef<HTMLInputElement>(null)

  // ── Reset selection + rules after each successful batch ─────────────────
  useEffect(() => {
    if (completedCount === 0) return
    setSelectedIds(new Set())
    setRules([makeRule('find-replace')])
    setInlineEdits(new Map())
    setEditingId(null)
  }, [completedCount])

  // ── Dataset change ────────────────────────────────────────────────────────
  const handleDataSetChange = useCallback(
    (id: string) => {
      setSelectedDataSetId(id)
      setSelectedIds(new Set())
      setFilter('')
      setPage(1)
      if (id) onSelectDataset(id)
    },
    [onSelectDataset]
  )

  // ── Filtering & pagination ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    if (!filter) return elements
    const q = filter.toLowerCase()
    return elements.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        (el.code ?? '').toLowerCase().includes(q) ||
        el.shortName.toLowerCase().includes(q)
    )
  }, [elements, filter])

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize))
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize)

  // ── Selection helpers ─────────────────────────────────────────────────────
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const togglePageAll = useCallback(() => {
    const pageIds = paginated.map((el) => el.id)
    const allChecked = pageIds.every((id) => selectedIds.has(id))
    setSelectedIds((prev) => {
      const next = new Set(prev)
      if (allChecked) pageIds.forEach((id) => next.delete(id))
      else pageIds.forEach((id) => next.add(id))
      return next
    })
  }, [paginated, selectedIds])

  const selectAll = useCallback(() => {
    setSelectedIds(new Set(elements.map((el) => el.id)))
  }, [elements])

  const clearSelection = useCallback(() => setSelectedIds(new Set()), [])

  // ── Inline edit helpers ───────────────────────────────────────────────────
  const startInlineEdit = useCallback(
    (el: DataElement) => {
      if (disabled) return
      // Auto-select the row when user clicks the new-name cell
      setSelectedIds((prev) => {
        if (prev.has(el.id)) return prev
        const next = new Set(prev)
        next.add(el.id)
        return next
      })
      setEditingId(el.id)
      // Pre-fill with existing inline override → rule result → original name
      if (!inlineEdits.has(el.id)) {
        const ruleResult = applyRuleChain(el.name, rules)
        setInlineEdits((prev) =>
          new Map(prev).set(el.id, ruleResult !== el.name ? ruleResult : el.name)
        )
      }
      // Focus the input after React renders it
      setTimeout(() => inlineInputRef.current?.focus(), 0)
    },
    [disabled, inlineEdits, rules]
  )

  const commitInlineEdit = useCallback((id: string, value: string) => {
    const trimmed = value.trim()
    setEditingId(null)
    if (!trimmed) {
      // Empty → remove the override (row reverts to rule result / unchanged)
      setInlineEdits((prev) => {
        const next = new Map(prev)
        next.delete(id)
        return next
      })
      return
    }
    setInlineEdits((prev) => new Map(prev).set(id, trimmed))
  }, [])

  const cancelInlineEdit = useCallback(() => {
    setEditingId(null)
  }, [])

  const clearInlineEdit = useCallback((id: string) => {
    setInlineEdits((prev) => {
      const next = new Map(prev)
      next.delete(id)
      return next
    })
  }, [])

  // ── Rule chain management ─────────────────────────────────────────────────
  const addRule = useCallback(() => {
    setRules((prev) => [...prev, makeRule('find-replace')])
  }, [])

  const removeRule = useCallback((id: string) => {
    setRules((prev) => (prev.length > 1 ? prev.filter((r) => r._id !== id) : prev))
  }, [])

  const updateRule = useCallback(
    (id: string, field: keyof Omit<RenameRule, '_id'>, value: string) => {
      setRules((prev) =>
        prev.map((r) => {
          if (r._id !== id) return r
          const updated = { ...r, [field]: value }
          // Reset find/replace when mode changes
          if (field === 'mode') {
            updated.find = ''
            updated.replace = ''
          }
          return updated
        })
      )
    },
    []
  )

  const moveRule = useCallback((id: string, direction: 'up' | 'down') => {
    setRules((prev) => {
      const idx = prev.findIndex((r) => r._id === id)
      if (idx === -1) return prev
      const next = [...prev]
      const swapIdx = direction === 'up' ? idx - 1 : idx + 1
      if (swapIdx < 0 || swapIdx >= next.length) return prev
      ;[next[idx], next[swapIdx]] = [next[swapIdx], next[idx]]
      return next
    })
  }, [])

  // ── Live previews ─────────────────────────────────────────────────────────
  // Priority: inline direct edit > rule chain > original name (= no change)
  const previews = useMemo<DataElementRenamePreview[]>(() => {
    if (selectedIds.size === 0) return []
    return elements
      .filter((el) => selectedIds.has(el.id))
      .map((el) => {
        const inlineOverride = inlineEdits.get(el.id)
        const newName =
          inlineOverride !== undefined ? inlineOverride : applyRuleChain(el.name, rules)
        const newShortName = newName.slice(0, 50)
        return {
          id: el.id,
          oldName: el.name,
          newName,
          oldShortName: el.shortName,
          newShortName,
          code: el.code,
          valueType: el.valueType,
          // Required fields for the DHIS2 PUT payload — must travel with the preview
          // so the hook can send a valid payload without an extra GET per element.
          domainType: el.domainType,
          aggregationType: el.aggregationType,
          categoryComboId: el.categoryCombo?.id,
          changed: newName !== el.name,
        }
      })
  }, [elements, selectedIds, rules, inlineEdits])

  const changedCount = previews.filter((p) => p.changed).length
  const previewMap = useMemo(() => new Map(previews.map((p) => [p.id, p])), [previews])

  // ── Apply handler ─────────────────────────────────────────────────────────
  // Pass fully-resolved previews (inline overrides already applied) to parent.
  const handleApply = useCallback(() => {
    const changed = previews.filter((p) => p.changed)
    if (changed.length === 0) return
    onRequestConfirm(changed)
  }, [previews, onRequestConfirm])

  // ── Export preview CSV ────────────────────────────────────────────────────
  const handleExportCsv = useCallback(() => {
    const headers = [
      i18n.t('ID'),
      i18n.t('Current Name'),
      i18n.t('New Name'),
      i18n.t('Value Type'),
      i18n.t('Edit Mode'),
    ]
    const rows = previews
      .filter((p) => p.changed)
      .map((p) => [
        p.id,
        p.oldName,
        p.newName,
        p.valueType,
        inlineEdits.has(p.id) ? 'direct' : 'rule',
      ])
    exportCsv('de-rename-preview.csv', headers, rows)
  }, [previews, inlineEdits])

  // ── Page-level checkbox state ─────────────────────────────────────────────
  const pageAllChecked = paginated.length > 0 && paginated.every((el) => selectedIds.has(el.id))
  const pageIndeterminate = paginated.some((el) => selectedIds.has(el.id)) && !pageAllChecked

  // ── Value-type colour helper ──────────────────────────────────────────────
  const vtColor = (vt: string): string => {
    if (vt.includes('INTEGER') || vt === 'NUMBER' || vt === 'PERCENTAGE') return styles.vtNumeric
    if (vt === 'BOOLEAN' || vt === 'TRUE_ONLY') return styles.vtBoolean
    if (vt === 'DATE' || vt === 'DATETIME') return styles.vtDate
    return styles.vtText
  }

  // ── Derived: are there active (non-empty) rules? ──────────────────────────
  const hasActiveRules = rules.some((r) => {
    const meta = RENAME_MODES.find((m) => m.value === r.mode)
    if (!meta) return false
    if (!meta.hasFind) return true // transform-only modes are always "active"
    return r.find.length > 0 // find-based modes need a non-empty find
  })

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.container}>
      {/* ══════════════════════════════════════════════════════════
          ZONE 1 — Dataset selector + filter bar
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.selectorBar}>
        {/* Dataset picker */}
        <div className={styles.datasetPickerWrap}>
          <span
            className="material-icons-round"
            style={{ fontSize: 18, color: 'var(--brand-500)' }}
          >
            dataset
          </span>
          <select
            className={styles.datasetSelect}
            value={selectedDataSetId}
            onChange={(e) => handleDataSetChange(e.target.value)}
            disabled={loadingDataSets || disabled}
            aria-label={i18n.t('Select dataset')}
          >
            <option value="">
              {loadingDataSets
                ? i18n.t('Loading datasets…')
                : i18n.t('— Select a dataset to begin —')}
            </option>
            {dataSets.map((ds) => (
              <option key={ds.id} value={ds.id}>
                {ds.displayName}
              </option>
            ))}
          </select>
          {dataSetName && (
            <span className="nx-chip nx-chip-brand">
              {i18n.t('{{n}} elements', { n: elements.length })}
            </span>
          )}
        </div>

        {/* Search + select-all — only shown when elements are loaded */}
        {elements.length > 0 && (
          <>
            <div className={styles.searchWrap}>
              <span
                className="material-icons-round"
                style={{ fontSize: 16, color: 'var(--text-tertiary)' }}
              >
                search
              </span>
              <input
                className={styles.searchInput}
                placeholder={i18n.t('Search by name, code…')}
                value={filter}
                onChange={(e) => {
                  setFilter(e.target.value)
                  setPage(1)
                }}
                disabled={disabled}
              />
            </div>

            <div className={styles.selectionActions}>
              {selectedIds.size > 0 ? (
                <>
                  <span className="nx-chip nx-chip-info">
                    {i18n.t('{{n}} selected', { n: selectedIds.size })}
                  </span>
                  <button
                    className={`nx-btn nx-btn-ghost nx-btn-sm`}
                    onClick={clearSelection}
                    disabled={disabled}
                  >
                    {i18n.t('Clear')}
                  </button>
                </>
              ) : (
                <button
                  className={`nx-btn nx-btn-secondary nx-btn-sm`}
                  onClick={selectAll}
                  disabled={disabled}
                >
                  {i18n.t('Select all {{n}}', { n: elements.length })}
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          ZONE 2 — Scrollable data element table
      ══════════════════════════════════════════════════════════ */}
      <div className={styles.scrollBody}>
        {/* Empty / loading / error states */}
        {!selectedDataSetId && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <span className="material-icons-round">dataset</span>
            </div>
            <div className={styles.emptyTitle}>{i18n.t('No dataset selected')}</div>
            <p className={styles.emptyText}>
              {i18n.t('Choose a dataset above to load its data elements.')}
            </p>
          </div>
        )}

        {selectedDataSetId && loadingElements && (
          <div className={styles.loadingState}>
            <span className={styles.spinner} />
            {i18n.t('Loading data elements…')}
          </div>
        )}

        {selectedDataSetId && errorElements && !loadingElements && (
          <div className={styles.errorBanner}>
            <span className="material-icons-round">error_outline</span>
            <div className={styles.errorText}>
              <strong>{i18n.t('Could not load data elements')}</strong>
              <div>{friendlyLoadError(errorElements)}</div>
            </div>
            <button
              className="nx-btn nx-btn-secondary"
              style={{ marginLeft: 'auto', flexShrink: 0 }}
              onClick={() => onSelectDataset(selectedDataSetId)}
            >
              <span className="material-icons-round" style={{ fontSize: 16 }}>
                refresh
              </span>
              {i18n.t('Retry')}
            </button>
          </div>
        )}

        {selectedDataSetId && !loadingElements && !errorElements && elements.length === 0 && (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <span className="material-icons-round">inbox</span>
            </div>
            <div className={styles.emptyTitle}>{i18n.t('No data elements found')}</div>
            <p className={styles.emptyText}>
              {i18n.t('This dataset has no data elements configured.')}
            </p>
          </div>
        )}

        {elements.length > 0 && (
          <>
            {/* ── Main table ─────────────────────────────────────────── */}
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
                        aria-label={i18n.t('Select all on this page')}
                      />
                    </th>
                    <th>{i18n.t('Current Name')}</th>
                    <th className={styles.shortNameCol}>{i18n.t('Short Name')}</th>
                    <th className={styles.codeCol}>{i18n.t('Code')}</th>
                    <th className={styles.vtCol}>{i18n.t('Value Type')}</th>
                    <th className={styles.newNameCol}>{i18n.t('New Name (preview)')}</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((el) => {
                    const isSelected = selectedIds.has(el.id)
                    const preview = previewMap.get(el.id)
                    return (
                      <tr
                        key={el.id}
                        className={isSelected ? styles.selectedRow : ''}
                        onClick={() => toggleSelect(el.id)}
                      >
                        <td className={styles.checkCell}>
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelect(el.id)}
                            onClick={(e) => e.stopPropagation()}
                            aria-label={i18n.t('Select {{name}}', { name: el.name })}
                          />
                        </td>
                        <td className={styles.nameCell}>
                          {preview?.changed ? <s className={styles.oldName}>{el.name}</s> : el.name}
                        </td>
                        <td className={styles.shortNameCol}>
                          <span className={styles.mono}>{el.shortName}</span>
                        </td>
                        <td className={styles.codeCol}>
                          <span className={styles.mono}>{el.code ?? '—'}</span>
                        </td>
                        <td className={styles.vtCol}>
                          <span className={`${styles.vtBadge} ${vtColor(el.valueType)}`}>
                            {el.valueType}
                          </span>
                        </td>
                        <td
                          className={styles.newNameCol}
                          onClick={(e) => {
                            e.stopPropagation()
                            startInlineEdit(el)
                          }}
                        >
                          {editingId === el.id ? (
                            // ── Active inline editor ────────────────────────
                            <div className={styles.inlineEditWrap}>
                              <input
                                ref={inlineInputRef}
                                className={styles.inlineInput}
                                defaultValue={inlineEdits.get(el.id) ?? el.name}
                                placeholder={el.name}
                                onClick={(e) => e.stopPropagation()}
                                onBlur={(e) => commitInlineEdit(el.id, e.target.value)}
                                onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => {
                                  if (e.key === 'Enter') {
                                    commitInlineEdit(el.id, e.currentTarget.value)
                                  } else if (e.key === 'Escape') {
                                    cancelInlineEdit()
                                  }
                                }}
                                aria-label={i18n.t('New name for {{name}}', { name: el.name })}
                              />
                            </div>
                          ) : preview?.changed ? (
                            // ── Preview shows a change ──────────────────────
                            <div className={styles.newNameCell}>
                              <span className={styles.newName}>{preview.newName}</span>
                              {inlineEdits.has(el.id) && (
                                <button
                                  className={styles.clearInlineBtn}
                                  title={i18n.t('Clear direct edit — revert to rule result')}
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    clearInlineEdit(el.id)
                                  }}
                                >
                                  <span className="material-icons-round">close</span>
                                </button>
                              )}
                            </div>
                          ) : (
                            // ── No change yet — show click-to-edit prompt ───
                            <span className={styles.editPrompt}>
                              <span className="material-icons-round" style={{ fontSize: 14 }}>
                                edit
                              </span>
                              {isSelected && hasActiveRules
                                ? i18n.t('(no change)')
                                : i18n.t('Click to rename')}
                            </span>
                          )}
                        </td>
                      </tr>
                    )
                  })}

                  {paginated.length === 0 && (
                    <tr>
                      <td colSpan={6} className={styles.emptyCell}>
                        {i18n.t('No data elements match the filter.')}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* ── Pagination ──────────────────────────────────────────── */}
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
                  onClick={() => setPage((p) => p - 1)}
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
                  onClick={() => setPage((p) => p + 1)}
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
          </>
        )}
      </div>

      {/* ══════════════════════════════════════════════════════════
          ZONE 3 — Rule chain panel (pinned bottom)
          Only shown when elements are loaded
      ══════════════════════════════════════════════════════════ */}
      {elements.length > 0 && (
        <div className={styles.rulePanel}>
          {/* ── Panel header ─────────────────────────────────────── */}
          <div className={styles.rulePanelHeader}>
            <div className={styles.rulePanelTitle}>
              <span className="material-icons-round" style={{ fontSize: 18 }}>
                auto_fix_high
              </span>
              {i18n.t('Rename Rules')}
              {selectedIds.size > 0 && (
                <span className="nx-chip nx-chip-info">
                  {i18n.t('{{n}} selected', { n: selectedIds.size })}
                </span>
              )}
              {changedCount > 0 && (
                <span className="nx-chip nx-chip-success">
                  {i18n.t('{{n}} will change', { n: changedCount })}
                </span>
              )}
            </div>

            <div className={styles.rulePanelActions}>
              {changedCount > 0 && (
                <button
                  className={`nx-btn nx-btn-secondary nx-btn-sm`}
                  onClick={handleExportCsv}
                  disabled={disabled}
                >
                  <span className="material-icons-round" style={{ fontSize: 15 }}>
                    download
                  </span>
                  {i18n.t('Export preview')}
                </button>
              )}
              <button
                className={`nx-btn nx-btn-primary`}
                onClick={handleApply}
                disabled={disabled || changedCount === 0 || selectedIds.size === 0}
              >
                <span className="material-icons-round" style={{ fontSize: 16 }}>
                  drive_file_rename_outline
                </span>
                {changedCount > 0
                  ? i18n.t('Apply {{n}} renames', { n: changedCount })
                  : i18n.t('Apply renames')}
              </button>
            </div>
          </div>

          {/* ── Global rename warning ─────────────────────────────── */}
          <div className={styles.globalWarning}>
            <span className="material-icons-round" style={{ fontSize: 15 }}>
              warning_amber
            </span>
            {i18n.t(
              'Renaming a data element changes it globally in DHIS2, not only within this dataset.'
            )}
          </div>

          {/* ── Rule chain ───────────────────────────────────────────── */}
          <div className={styles.ruleChain}>
            {rules.map((rule, idx) => {
              const modeMeta = RENAME_MODES.find((m) => m.value === rule.mode)
              return (
                <div key={rule._id} className={styles.ruleRow}>
                  {/* Step number */}
                  <span className={styles.ruleStep}>{idx + 1}</span>

                  {/* Mode select */}
                  <select
                    className={styles.ruleSelect}
                    value={rule.mode}
                    onChange={(e) => updateRule(rule._id, 'mode', e.target.value)}
                    disabled={disabled}
                    aria-label={i18n.t('Rule {{n}} mode', { n: idx + 1 })}
                  >
                    {RENAME_MODES.map((m) => (
                      <option key={m.value} value={m.value}>
                        {i18n.t(m.label)}
                      </option>
                    ))}
                  </select>

                  {/* Find input */}
                  {modeMeta?.hasFind && (
                    <input
                      className={styles.ruleInput}
                      placeholder={
                        rule.mode === 'prefix'
                          ? i18n.t('Prefix text…')
                          : rule.mode === 'suffix'
                            ? i18n.t('Suffix text…')
                            : rule.mode === 'regex'
                              ? i18n.t('Regex pattern…')
                              : i18n.t('Find text…')
                      }
                      value={rule.find}
                      onChange={(e) => updateRule(rule._id, 'find', e.target.value)}
                      disabled={disabled}
                      aria-label={i18n.t('Find for rule {{n}}', { n: idx + 1 })}
                    />
                  )}

                  {/* Replace input */}
                  {modeMeta?.hasReplace && (
                    <input
                      className={styles.ruleInput}
                      placeholder={i18n.t('Replace with (empty = delete)…')}
                      value={rule.replace}
                      onChange={(e) => updateRule(rule._id, 'replace', e.target.value)}
                      disabled={disabled}
                      aria-label={i18n.t('Replace for rule {{n}}', { n: idx + 1 })}
                    />
                  )}

                  {/* No-input modes label */}
                  {!modeMeta?.hasFind && !modeMeta?.hasReplace && (
                    <span className={styles.ruleModeHint}>
                      {rule.mode === 'uppercase' && i18n.t('All letters → UPPERCASE')}
                      {rule.mode === 'lowercase' && i18n.t('All letters → lowercase')}
                      {rule.mode === 'titlecase' && i18n.t('First Letter Capitalised In Each Word')}
                      {rule.mode === 'trim' &&
                        i18n.t('Remove leading/trailing spaces; collapse double spaces')}
                    </span>
                  )}

                  {/* Reorder buttons */}
                  <div className={styles.ruleReorder}>
                    <button
                      className={styles.reorderBtn}
                      onClick={() => moveRule(rule._id, 'up')}
                      disabled={disabled || idx === 0}
                      aria-label={i18n.t('Move rule {{n}} up', { n: idx + 1 })}
                    >
                      <span className="material-icons-round">keyboard_arrow_up</span>
                    </button>
                    <button
                      className={styles.reorderBtn}
                      onClick={() => moveRule(rule._id, 'down')}
                      disabled={disabled || idx === rules.length - 1}
                      aria-label={i18n.t('Move rule {{n}} down', { n: idx + 1 })}
                    >
                      <span className="material-icons-round">keyboard_arrow_down</span>
                    </button>
                  </div>

                  {/* Remove button */}
                  <button
                    className={styles.removeRuleBtn}
                    onClick={() => removeRule(rule._id)}
                    disabled={disabled || rules.length === 1}
                    aria-label={i18n.t('Remove rule {{n}}', { n: idx + 1 })}
                  >
                    <span className="material-icons-round">close</span>
                  </button>

                  {/* Connector arrow between rules */}
                  {idx < rules.length - 1 && <span className={styles.ruleConnector}>↓</span>}
                </div>
              )
            })}

            {/* Add rule button */}
            <button
              className={`nx-btn nx-btn-ghost nx-btn-sm ${styles.addRuleBtn}`}
              onClick={addRule}
              disabled={disabled}
            >
              <span className="material-icons-round" style={{ fontSize: 15 }}>
                add
              </span>
              {i18n.t('Add rule')}
            </button>
          </div>

          {/* ── Preview strip (collapsed list of all changed names) ── */}
          {changedCount > 0 && selectedIds.size <= 20 && (
            <div className={styles.previewStrip}>
              <div className={styles.previewStripHeader}>
                {i18n.t('Preview — {{n}} name{{s}} will change:', {
                  n: changedCount,
                  s: changedCount === 1 ? '' : 's',
                })}
              </div>
              <div className={styles.previewStripBody}>
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

          {/* When selection is large, show a compact summary instead */}
          {changedCount > 0 && selectedIds.size > 20 && (
            <div className={styles.previewSummaryLarge}>
              <span className="material-icons-round" style={{ fontSize: 15 }}>
                info_outline
              </span>
              {i18n.t(
                '{{n}} names will change. Use "Export preview" to review the full list before applying.',
                { n: changedCount }
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default RenameDatasetTable
