// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/components/BulkCreateGrid.tsx
//
// Compact, keyboard-navigable spreadsheet grid for bulk creating data elements.
//
// UX design principles:
//   • Tab key moves focus to the next cell (keyboard-first entry)
//   • Template row at the top sets defaults for every new row
//   • Auto-derive shortName and code from name while those fields are untouched
//   • Duplicate row — the most common operation when creating similar elements
//   • Inline validation errors shown beneath the offending cell
//   • All metadata selectors (valueType, aggregationType, categoryCombo,
//     optionSet) are compact dropdowns; domain type defaults to AGGREGATE
// ─────────────────────────────────────────────────────────────────────────────

import type { FC, KeyboardEvent } from 'react'
import { useRef, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { CreateRow, MetaRef, TemplateRow } from '../types'
import { VALUE_TYPES, AGGREGATION_TYPES } from '../types'
import styles from './BulkCreateGrid.module.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface BulkCreateGridProps {
  rows: CreateRow[]
  template: TemplateRow
  categoryCombos: MetaRef[]
  optionSets: MetaRef[]
  onUpdateCell: (id: string, field: keyof Omit<CreateRow, '_id' | 'errors'>, value: string) => void
  onUpdateTemplate: (field: keyof TemplateRow, value: string) => void
  onAdd: () => void
  onDuplicate: (id: string) => void
  onDelete: (id: string) => void
  disabled?: boolean
}

// ── Column definitions ────────────────────────────────────────────────────────

const COLUMNS = [
  { key: 'name', label: 'Name *', minWidth: '180px' },
  { key: 'shortName', label: 'Short Name *', minWidth: '120px' },
  { key: 'code', label: 'Code', minWidth: '100px' },
  { key: 'valueType', label: 'Value Type *', minWidth: '110px' },
  { key: 'aggregationType', label: 'Aggregation *', minWidth: '110px' },
  { key: 'categoryComboId', label: 'Category Combo', minWidth: '120px' },
  { key: 'optionSetId', label: 'Option Set', minWidth: '100px' },
] as const

type ColKey = (typeof COLUMNS)[number]['key']

// ── Component ─────────────────────────────────────────────────────────────────

export const BulkCreateGrid: FC<BulkCreateGridProps> = ({
  rows,
  template,
  categoryCombos,
  optionSets,
  onUpdateCell,
  onUpdateTemplate,
  onAdd,
  onDuplicate,
  onDelete,
  disabled = false,
}) => {
  const gridRef = useRef<HTMLDivElement>(null)

  // ── Keyboard navigation ───────────────────────────────────────────────────
  // Tab across cells; Enter to add a row from the last cell of the last row
  const handleCellKeyDown = useCallback(
    (e: KeyboardEvent<HTMLElement>, rowIndex: number, colIndex: number) => {
      if (e.key !== 'Tab') return
      e.preventDefault()

      const isLastCol = colIndex === COLUMNS.length - 1
      const isLastRow = rowIndex === rows.length - 1

      if (isLastCol && isLastRow && !e.shiftKey) {
        // At the very end → add a new row and focus its first cell
        onAdd()
        // Focus after React re-renders
        setTimeout(() => {
          const inputs = gridRef.current?.querySelectorAll<HTMLElement>(
            `[data-row="${rows.length}"][data-col="0"]`
          )
          inputs?.[0]?.focus()
        }, 50)
        return
      }

      const nextCol = e.shiftKey ? colIndex - 1 : colIndex + 1
      const nextRow = e.shiftKey
        ? nextCol < 0
          ? rowIndex - 1
          : rowIndex
        : nextCol > COLUMNS.length - 1
          ? rowIndex + 1
          : rowIndex

      const clampedCol = ((nextCol % COLUMNS.length) + COLUMNS.length) % COLUMNS.length
      const target = gridRef.current?.querySelector<HTMLElement>(
        `[data-row="${nextRow}"][data-col="${clampedCol}"]`
      )
      target?.focus()
    },
    [rows.length, onAdd]
  )

  // ── Cell renderers ────────────────────────────────────────────────────────

  const renderCell = (row: CreateRow, colKey: ColKey, rowIndex: number, colIndex: number) => {
    const value = row[colKey] as string
    const error = row.errors[colKey]
    const cellProps = {
      'data-row': rowIndex,
      'data-col': colIndex,
      onKeyDown: (e: KeyboardEvent<HTMLElement>) => handleCellKeyDown(e, rowIndex, colIndex),
      disabled,
    }

    if (colKey === 'valueType') {
      return (
        <select
          {...cellProps}
          className={`${styles.cellSelect} ${error ? styles.cellError : ''}`}
          value={value}
          onChange={(e) => onUpdateCell(row._id, 'valueType', e.target.value)}
          aria-label={i18n.t('Value type for {{name}}', {
            name: row.name || `Row ${rowIndex + 1}`,
          })}
        >
          {VALUE_TYPES.map((vt) => (
            <option key={vt.value} value={vt.value}>
              {vt.label}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'aggregationType') {
      return (
        <select
          {...cellProps}
          className={`${styles.cellSelect} ${error ? styles.cellError : ''}`}
          value={value}
          onChange={(e) => onUpdateCell(row._id, 'aggregationType', e.target.value)}
          aria-label={i18n.t('Aggregation type for {{name}}', {
            name: row.name || `Row ${rowIndex + 1}`,
          })}
        >
          {AGGREGATION_TYPES.map((at) => (
            <option key={at.value} value={at.value}>
              {at.label}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'categoryComboId') {
      return (
        <select
          {...cellProps}
          className={`${styles.cellSelect} ${error ? styles.cellError : ''}`}
          value={value}
          onChange={(e) => onUpdateCell(row._id, 'categoryComboId', e.target.value)}
          aria-label={i18n.t('Category combo for {{name}}', {
            name: row.name || `Row ${rowIndex + 1}`,
          })}
        >
          <option value="">{i18n.t('(default)')}</option>
          {categoryCombos.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {cc.displayName}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'optionSetId') {
      return (
        <select
          {...cellProps}
          className={`${styles.cellSelect} ${error ? styles.cellError : ''}`}
          value={value}
          onChange={(e) => onUpdateCell(row._id, 'optionSetId', e.target.value)}
          aria-label={i18n.t('Option set for {{name}}', {
            name: row.name || `Row ${rowIndex + 1}`,
          })}
        >
          <option value="">{i18n.t('—')}</option>
          {optionSets.map((os) => (
            <option key={os.id} value={os.id}>
              {os.displayName}
            </option>
          ))}
        </select>
      )
    }

    // Text cell (name, shortName, code)
    return (
      <input
        {...cellProps}
        type="text"
        className={`${styles.cellInput} ${error ? styles.cellError : ''}`}
        value={value}
        placeholder={colKey === 'name' ? i18n.t('Element name…') : undefined}
        onChange={(e) =>
          onUpdateCell(row._id, colKey as keyof Omit<CreateRow, '_id' | 'errors'>, e.target.value)
        }
        aria-label={COLUMNS.find((c) => c.key === colKey)?.label ?? colKey}
        aria-invalid={!!error}
      />
    )
  }

  // ── Template row cell renderer ────────────────────────────────────────────

  const renderTemplateCell = (colKey: ColKey, colIndex: number) => {
    const commonProps = {
      className: styles.templateSelect,
      'data-row': -1,
      'data-col': colIndex,
      disabled,
    }

    if (colKey === 'name' || colKey === 'shortName' || colKey === 'code') {
      // Template doesn't have text fields — show a placeholder
      return <span className={styles.templatePlaceholder}>{i18n.t('(set per row)')}</span>
    }

    if (colKey === 'valueType') {
      return (
        <select
          {...commonProps}
          value={template.valueType}
          onChange={(e) => onUpdateTemplate('valueType', e.target.value)}
          aria-label={i18n.t('Default value type')}
        >
          {VALUE_TYPES.map((vt) => (
            <option key={vt.value} value={vt.value}>
              {vt.label}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'aggregationType') {
      return (
        <select
          {...commonProps}
          value={template.aggregationType}
          onChange={(e) => onUpdateTemplate('aggregationType', e.target.value)}
          aria-label={i18n.t('Default aggregation type')}
        >
          {AGGREGATION_TYPES.map((at) => (
            <option key={at.value} value={at.value}>
              {at.label}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'categoryComboId') {
      return (
        <select
          {...commonProps}
          value={template.categoryComboId}
          onChange={(e) => onUpdateTemplate('categoryComboId', e.target.value)}
          aria-label={i18n.t('Default category combo')}
        >
          <option value="">{i18n.t('(default)')}</option>
          {categoryCombos.map((cc) => (
            <option key={cc.id} value={cc.id}>
              {cc.displayName}
            </option>
          ))}
        </select>
      )
    }

    if (colKey === 'optionSetId') {
      return (
        <select
          {...commonProps}
          value={template.optionSetId}
          onChange={(e) => onUpdateTemplate('optionSetId', e.target.value)}
          aria-label={i18n.t('Default option set')}
        >
          <option value="">{i18n.t('—')}</option>
          {optionSets.map((os) => (
            <option key={os.id} value={os.id}>
              {os.displayName}
            </option>
          ))}
        </select>
      )
    }

    return null
  }

  // ── Row count badge ───────────────────────────────────────────────────────

  const errorCount = rows.reduce((n, r) => n + Object.keys(r.errors).length, 0)

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.wrapper}>
      {/* ── Toolbar ──────────────────────────────────────────── */}
      <div className={styles.toolbar}>
        <div className={styles.toolbarLeft}>
          <span className={styles.rowCount}>
            {i18n.t('{{n}} row{{s}}', {
              n: rows.length,
              s: rows.length === 1 ? '' : 's',
            })}
          </span>
          {errorCount > 0 && (
            <span className="nx-chip nx-chip-danger">
              {i18n.t('{{n}} error{{s}}', {
                n: errorCount,
                s: errorCount === 1 ? '' : 's',
              })}
            </span>
          )}
        </div>
        <button
          type="button"
          className={`nx-btn nx-btn-secondary nx-btn-sm`}
          onClick={onAdd}
          disabled={disabled}
          aria-label={i18n.t('Add row')}
        >
          <span className="material-icons-round" style={{ fontSize: 16 }}>
            add
          </span>
          {i18n.t('Add row')}
        </button>
      </div>

      {/* ── Grid ─────────────────────────────────────────────── */}
      <div className={styles.gridWrap} ref={gridRef}>
        <table className={styles.grid} role="grid" aria-label={i18n.t('Data elements to create')}>
          {/* ── Column headers ── */}
          <thead>
            <tr>
              {/* Row number gutter */}
              <th className={styles.gutterHead} aria-label={i18n.t('Row')} />
              {COLUMNS.map((col) => (
                <th key={col.key} className={styles.colHead} style={{ minWidth: col.minWidth }}>
                  {i18n.t(col.label)}
                </th>
              ))}
              {/* Actions column */}
              <th className={styles.actionsHead} aria-label={i18n.t('Actions')} />
            </tr>
          </thead>

          <tbody>
            {/* ── Template row ── */}
            <tr className={styles.templateRow}>
              <td className={styles.gutterCell}>
                <span className={styles.templateLabel}>{i18n.t('DEFAULTS')}</span>
              </td>
              {COLUMNS.map((col, ci) => (
                <td key={col.key} className={styles.templateCell}>
                  {renderTemplateCell(col.key, ci)}
                </td>
              ))}
              <td className={styles.templateCell}>
                <span className={styles.templateHint}>
                  <span className="material-icons-round" style={{ fontSize: 13 }}>
                    info_outline
                  </span>
                  {i18n.t('New rows inherit these values')}
                </span>
              </td>
            </tr>

            {/* ── Data rows ── */}
            {rows.map((row, ri) => (
              <tr
                key={row._id}
                className={`${styles.dataRow} ${Object.keys(row.errors).length > 0 ? styles.errorRow : ''}`}
              >
                {/* Row number */}
                <td className={styles.gutterCell}>
                  <span className={styles.rowNum}>{ri + 1}</span>
                </td>

                {/* Cells */}
                {COLUMNS.map((col, ci) => {
                  const error = row.errors[col.key as keyof typeof row.errors]
                  return (
                    <td key={col.key} className={styles.dataCell}>
                      {renderCell(row, col.key, ri, ci)}
                      {error && <div className={styles.inlineError}>{error}</div>}
                    </td>
                  )
                })}

                {/* Row actions */}
                <td className={styles.actionsCell}>
                  <div className={styles.rowActions}>
                    <button
                      type="button"
                      className={styles.iconBtn}
                      onClick={() => onDuplicate(row._id)}
                      disabled={disabled}
                      title={i18n.t('Duplicate row')}
                      aria-label={i18n.t('Duplicate row {{n}}', { n: ri + 1 })}
                    >
                      <span className="material-icons-round">content_copy</span>
                    </button>
                    <button
                      type="button"
                      className={`${styles.iconBtn} ${styles.deleteBtn}`}
                      onClick={() => onDelete(row._id)}
                      disabled={disabled || rows.length === 1}
                      title={i18n.t('Delete row')}
                      aria-label={i18n.t('Delete row {{n}}', { n: ri + 1 })}
                    >
                      <span className="material-icons-round">delete_outline</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Footer hint ───────────────────────────────────────── */}
      <div className={styles.footer}>
        <span className={styles.footerHint}>
          <span className="material-icons-round" style={{ fontSize: 13 }}>
            keyboard
          </span>
          {i18n.t('Press Tab to move between cells · Tab from last cell adds a new row')}
        </span>
      </div>
    </div>
  )
}

export default BulkCreateGrid
