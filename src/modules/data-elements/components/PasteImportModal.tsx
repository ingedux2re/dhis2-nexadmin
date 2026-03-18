// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/components/PasteImportModal.tsx
//
// Full-screen modal for "Paste from Excel" import flow.
//
// Steps:
//   1. Paste  — user pastes raw Excel / CSV text + sets global defaults
//   2. Map    — user confirms / adjusts column ↔ field assignments
//   3. Preview — editable preview table with per-row validation
//   4. Import — fires onImport(rows) to push data into the grid
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useRef, useEffect } from 'react'
import type { ChangeEvent, KeyboardEvent } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { MetaRef, ValueType, AggregationType, DomainType } from '../types'
import { VALUE_TYPES, AGGREGATION_TYPES } from '../types'
import type {
  ParsedRow,
  ColumnMapping,
  TargetField,
  ParseDefaults,
} from '../services/excelPasteParser'
import {
  parsePasteText,
  DEFAULT_PARSE_DEFAULTS,
  splitRow,
  parseRawRow,
} from '../services/excelPasteParser'
import styles from './PasteImportModal.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const TARGET_FIELD_OPTIONS: { value: TargetField; label: string }[] = [
  { value: 'name', label: 'Name' },
  { value: 'shortName', label: 'Short Name' },
  { value: 'code', label: 'Code' },
  { value: 'valueType', label: 'Value Type' },
  { value: 'aggregationType', label: 'Aggregation Type' },
  { value: 'domainType', label: 'Domain Type' },
  { value: 'categoryComboId', label: 'Category Combo' },
  { value: 'optionSetId', label: 'Option Set' },
  { value: 'ignore', label: '— Ignore —' },
]

const STEP_LABELS = ['Paste', 'Map Columns', 'Preview']

const DELIMITER_LABELS: Record<string, string> = {
  '\t': 'Tab (Excel)',
  ',': 'Comma (CSV)',
  ';': 'Semicolon (CSV)',
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface PasteImportModalProps {
  categoryCombos: MetaRef[]
  optionSets: MetaRef[]
  onImport: (rows: ParsedRow[]) => void
  onClose: () => void
}

// ── Step 1: Paste ─────────────────────────────────────────────────────────────

interface PasteStepProps {
  rawText: string
  defaults: ParseDefaults
  categoryCombos: MetaRef[]
  optionSets: MetaRef[]
  onTextChange: (t: string) => void
  onDefaultsChange: (d: ParseDefaults) => void
}

function PasteStep({
  rawText,
  defaults,
  categoryCombos,
  optionSets,
  onTextChange,
  onDefaultsChange,
}: PasteStepProps) {
  const textAreaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    textAreaRef.current?.focus()
  }, [])

  const lineCount = rawText.trim() ? rawText.trim().split('\n').length : 0

  return (
    <div className={styles.body}>
      {/* ── Paste area ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 16, color: 'var(--brand-600)' }}
          >
            content_paste
          </span>
          <span className={styles.cardTitle}>{i18n.t('Paste your spreadsheet data')}</span>
          {rawText.trim() && (
            <span className={`nx-chip nx-chip-neutral`} style={{ fontSize: '11px' }}>
              {i18n.t('{{n}} line{{s}}', { n: lineCount, s: lineCount === 1 ? '' : 's' })}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          <textarea
            ref={textAreaRef}
            className={`${styles.pasteArea} ${rawText.trim() ? styles.hasContent : ''}`}
            value={rawText}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onTextChange(e.target.value)}
            placeholder={i18n.t(
              'Copy cells from Excel or Google Sheets and paste here (Ctrl+V / ⌘V).\n\nExample:\nName\tShort Name\tCode\tValue Type\nMalaria Cases\tMalaria\tMALARIA_CASES\tInteger\nANC Visits\tANC\tANC_VISITS\tInteger'
            )}
            spellCheck={false}
            aria-label={i18n.t('Paste spreadsheet data')}
          />
          <div className={styles.pasteHint}>
            <span className="material-icons-round">tips_and_updates</span>
            {i18n.t(
              'Include a header row for auto column detection. Supports Tab (Excel), Comma, and Semicolon delimiters.'
            )}
          </div>
        </div>
      </div>

      {/* ── Global defaults ── */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 16, color: 'var(--brand-600)' }}
          >
            tune
          </span>
          <span className={styles.cardTitle}>{i18n.t('Global defaults')}</span>
          <span
            className={styles.cardTitle}
            style={{
              fontSize: 'var(--text-xs)',
              fontWeight: 'normal',
              color: 'var(--text-tertiary)',
            }}
          >
            {i18n.t('Applied to every row where the field is missing')}
          </span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.defaultsRow}>
            <div className={styles.defaultsField}>
              <label className={styles.defaultsLabel}>{i18n.t('Value Type')}</label>
              <select
                className={styles.defaultsSelect}
                value={defaults.valueType}
                onChange={(e) =>
                  onDefaultsChange({ ...defaults, valueType: e.target.value as ValueType })
                }
              >
                {VALUE_TYPES.map((vt) => (
                  <option key={vt.value} value={vt.value}>
                    {vt.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.defaultsField}>
              <label className={styles.defaultsLabel}>{i18n.t('Aggregation')}</label>
              <select
                className={styles.defaultsSelect}
                value={defaults.aggregationType}
                onChange={(e) =>
                  onDefaultsChange({
                    ...defaults,
                    aggregationType: e.target.value as AggregationType,
                  })
                }
              >
                {AGGREGATION_TYPES.map((at) => (
                  <option key={at.value} value={at.value}>
                    {at.label}
                  </option>
                ))}
              </select>
            </div>

            <div className={styles.defaultsField}>
              <label className={styles.defaultsLabel}>{i18n.t('Domain')}</label>
              <select
                className={styles.defaultsSelect}
                value={defaults.domainType}
                onChange={(e) =>
                  onDefaultsChange({ ...defaults, domainType: e.target.value as DomainType })
                }
              >
                <option value="AGGREGATE">{i18n.t('Aggregate')}</option>
                <option value="TRACKER">{i18n.t('Tracker')}</option>
              </select>
            </div>

            {categoryCombos.length > 0 && (
              <div className={styles.defaultsField}>
                <label className={styles.defaultsLabel}>{i18n.t('Category Combo')}</label>
                <select
                  className={styles.defaultsSelect}
                  value={defaults.categoryComboId}
                  onChange={(e) =>
                    onDefaultsChange({ ...defaults, categoryComboId: e.target.value })
                  }
                >
                  <option value="">{i18n.t('(default)')}</option>
                  {categoryCombos.map((cc) => (
                    <option key={cc.id} value={cc.id}>
                      {cc.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {optionSets.length > 0 && (
              <div className={styles.defaultsField}>
                <label className={styles.defaultsLabel}>{i18n.t('Option Set')}</label>
                <select
                  className={styles.defaultsSelect}
                  value={defaults.optionSetId}
                  onChange={(e) => onDefaultsChange({ ...defaults, optionSetId: e.target.value })}
                >
                  <option value="">{i18n.t('—')}</option>
                  {optionSets.map((os) => (
                    <option key={os.id} value={os.id}>
                      {os.displayName}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Step 2: Map Columns ───────────────────────────────────────────────────────

interface MapStepProps {
  mappings: ColumnMapping[]
  delimiter: string
  hasHeaderRow: boolean
  previewRow: string[]
  onChange: (mappings: ColumnMapping[]) => void
}

function MapStep({ mappings, delimiter, hasHeaderRow, previewRow, onChange }: MapStepProps) {
  const updateMapping = useCallback(
    (idx: number, targetField: TargetField) => {
      const updated = mappings.map((m, i) => (i === idx ? { ...m, targetField } : m))
      onChange(updated)
    },
    [mappings, onChange]
  )

  return (
    <div className={styles.body}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 16, color: 'var(--brand-600)' }}
          >
            table_chart
          </span>
          <span className={styles.cardTitle}>{i18n.t('Column mapping')}</span>
          <span className={styles.delimiterBadge}>{DELIMITER_LABELS[delimiter] ?? delimiter}</span>
          {!hasHeaderRow && (
            <span className={`nx-chip nx-chip-warning`} style={{ fontSize: '11px', marginLeft: 8 }}>
              {i18n.t('No header row detected — positional mapping applied')}
            </span>
          )}
        </div>
        <div className={styles.cardBody} style={{ padding: 0 }}>
          <table className={styles.mappingTable}>
            <thead>
              <tr>
                <th>#</th>
                <th>{i18n.t('Spreadsheet Header')}</th>
                <th>{i18n.t('First Data Row (preview)')}</th>
                <th>{i18n.t('Maps to field')}</th>
              </tr>
            </thead>
            <tbody>
              {mappings.map((m, idx) => (
                <tr key={idx}>
                  <td
                    style={{ color: 'var(--text-tertiary)', fontFamily: 'monospace', fontSize: 12 }}
                  >
                    {idx + 1}
                  </td>
                  <td>
                    <span className={styles.mappingHeaderChip}>{m.header || `col${idx + 1}`}</span>
                  </td>
                  <td
                    style={{
                      maxWidth: 160,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      color: 'var(--text-secondary)',
                      fontSize: 'var(--text-sm)',
                    }}
                    title={previewRow[m.rawIndex] ?? ''}
                  >
                    {previewRow[m.rawIndex] || (
                      <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                        {i18n.t('(empty)')}
                      </span>
                    )}
                  </td>
                  <td>
                    <select
                      className={`${styles.mappingSelect} ${
                        m.targetField === 'ignore' ? styles.ignored : styles.mapped
                      }`}
                      value={m.targetField}
                      onChange={(e) => updateMapping(idx, e.target.value as TargetField)}
                      aria-label={i18n.t('Map column {{col}}', { col: m.header })}
                    >
                      {TARGET_FIELD_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Preview ───────────────────────────────────────────────────────────

interface PreviewStepProps {
  rows: ParsedRow[]
}

const PREVIEW_COLS: { key: keyof ParsedRow; label: string }[] = [
  { key: 'name', label: 'Name' },
  { key: 'shortName', label: 'Short Name' },
  { key: 'code', label: 'Code' },
  { key: 'valueType', label: 'Value Type' },
  { key: 'aggregationType', label: 'Aggregation' },
  { key: 'domainType', label: 'Domain' },
]

function PreviewStep({ rows }: PreviewStepProps) {
  const errorCount = rows.filter((r) => r.errors.length > 0).length
  const warnCount = rows.filter((r) => r.warnings.length > 0 && r.errors.length === 0).length

  if (rows.length === 0) {
    return (
      <div className={styles.body}>
        <div className={styles.emptyState}>
          <span className="material-icons-round">table_rows</span>
          <div className={styles.emptyTitle}>{i18n.t('No rows to preview')}</div>
          <div className={styles.emptyHint}>
            {i18n.t('Go back to paste step and make sure your data has at least one data row.')}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.body}>
      {/* Summary */}
      <div className={styles.summaryBar}>
        <span className={`${styles.summaryBadge} ${styles.badgeOk}`}>
          <span className="material-icons-round" style={{ fontSize: 12 }}>
            check_circle
          </span>
          {i18n.t('{{n}} row{{s}}', { n: rows.length, s: rows.length === 1 ? '' : 's' })}
        </span>
        {errorCount > 0 && (
          <span className={`${styles.summaryBadge} ${styles.badgeError}`}>
            <span className="material-icons-round" style={{ fontSize: 12 }}>
              error_outline
            </span>
            {i18n.t('{{n}} error{{s}}', { n: errorCount, s: errorCount === 1 ? '' : 's' })}
          </span>
        )}
        {warnCount > 0 && (
          <span className={`${styles.summaryBadge} ${styles.badgeWarn}`}>
            <span className="material-icons-round" style={{ fontSize: 12 }}>
              warning_amber
            </span>
            {i18n.t('{{n}} warning{{s}}', { n: warnCount, s: warnCount === 1 ? '' : 's' })}
          </span>
        )}
        <span style={{ flex: 1 }} />
        {errorCount > 0 && (
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--color-danger-text)' }}>
            {i18n.t('Rows with errors will be imported but may fail DHIS2 validation.')}
          </span>
        )}
      </div>

      <div className={styles.card}>
        <div className={styles.previewWrap}>
          <table className={styles.previewTable}>
            <thead>
              <tr>
                <th style={{ width: 32 }}>#</th>
                <th style={{ width: 56 }}>{i18n.t('Status')}</th>
                {PREVIEW_COLS.map((c) => (
                  <th key={c.key}>{i18n.t(c.label)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                const hasError = row.errors.length > 0
                const hasWarn = row.warnings.length > 0
                return (
                  <tr
                    key={row._id}
                    className={hasError ? styles.rowError : hasWarn ? styles.rowWarn : ''}
                  >
                    <td className={styles.rowNumCell}>{idx + 1}</td>
                    <td className={styles.statusCell}>
                      {hasError ? (
                        <span className={styles.statusError}>
                          <span className="material-icons-round">error_outline</span>
                        </span>
                      ) : hasWarn ? (
                        <span className={styles.statusWarn}>
                          <span className="material-icons-round">warning_amber</span>
                        </span>
                      ) : (
                        <span className={styles.statusOk}>
                          <span className="material-icons-round">check_circle</span>
                        </span>
                      )}
                    </td>
                    {PREVIEW_COLS.map((c) => (
                      <td key={c.key} title={String(row[c.key] ?? '')}>
                        <div style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                          {String(row[c.key] ?? '') || (
                            <span style={{ color: 'var(--text-tertiary)', fontStyle: 'italic' }}>
                              —
                            </span>
                          )}
                        </div>
                        {/* Show errors under the name cell */}
                        {c.key === 'name' && hasError && (
                          <div className={styles.issueTooltip}>
                            {row.errors.map((e, i) => (
                              <div key={i}>{e}</div>
                            ))}
                          </div>
                        )}
                        {c.key === 'name' && !hasError && hasWarn && (
                          <div className={styles.warnTooltip}>
                            {row.warnings.map((w, i) => (
                              <div key={i}>{w}</div>
                            ))}
                          </div>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ── Main modal ────────────────────────────────────────────────────────────────

export function PasteImportModal({
  categoryCombos,
  optionSets,
  onImport,
  onClose,
}: PasteImportModalProps) {
  const [step, setStep] = useState<0 | 1 | 2>(0)
  const [rawText, setRawText] = useState('')
  const [defaults, setDefaults] = useState<ParseDefaults>({ ...DEFAULT_PARSE_DEFAULTS })

  // Parse result is recalculated when rawText/defaults change
  const parseResult = useMemo(() => parsePasteText(rawText, defaults), [rawText, defaults])

  // Column mappings start from auto-detected, user can override in step 1
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([])

  // Sync mappings when parseResult changes (new paste)
  const lastParsedText = useRef('')
  if (rawText !== lastParsedText.current) {
    lastParsedText.current = rawText
    if (parseResult.columnMappings.length > 0) {
      setColumnMappings(parseResult.columnMappings)
    }
  }

  // Re-parse with (possibly overridden) mappings
  const finalRows = useMemo(() => {
    if (!rawText.trim() || columnMappings.length === 0) return parseResult.rows
    // Re-run parseRawRow with user-overridden mappings
    // We piggyback on parsePasteText internals by re-building from the raw lines
    const result = parsePasteText(rawText, defaults)
    // Replace mappings with user overrides then re-parse
    if (columnMappings.length !== result.columnMappings.length) return result.rows
    // Shallow comparison: if no overrides, return original rows
    const hasOverrides = columnMappings.some(
      (m, i) => m.targetField !== result.columnMappings[i]?.targetField
    )
    if (!hasOverrides) return result.rows

    // Re-parse with custom mappings (reuse the helper)
    const lines = rawText.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')
    const seenCodes = new Set<string>()
    const rows: ParsedRow[] = []
    let dataIdx = 0
    let skippedHeader = false
    for (const line of lines) {
      if (!line.trim()) continue
      if (!skippedHeader && result.hasHeaderRow) {
        skippedHeader = true
        continue
      }
      const cells = splitRow(line, result.delimiter)
      if (cells.every((c: string) => !c.trim())) continue
      rows.push(parseRawRow(cells, columnMappings, defaults, dataIdx, seenCodes))
      dataIdx++
    }
    return rows
  }, [rawText, defaults, columnMappings, parseResult])

  // Preview row for column mapping step
  const previewDataRow = useMemo(() => {
    if (!rawText.trim()) return []
    const lines = rawText
      .replace(/\r\n/g, '\n')
      .split('\n')
      .filter((l) => l.trim())
    const dataLine = parseResult.hasHeaderRow ? lines[1] : lines[0]
    if (!dataLine) return []
    return splitRow(dataLine, parseResult.delimiter) as string[]
  }, [rawText, parseResult.hasHeaderRow, parseResult.delimiter])

  // ── Navigation ──────────────────────────────────────────────────────────────

  const canGoNext = useMemo(() => {
    if (step === 0) return rawText.trim().length > 0
    if (step === 1) return true
    return finalRows.length > 0
  }, [step, rawText, finalRows.length])

  const handleNext = useCallback(() => {
    if (step < 2) setStep((s) => (s + 1) as 0 | 1 | 2)
  }, [step])

  const handleBack = useCallback(() => {
    if (step > 0) setStep((s) => (s - 1) as 0 | 1 | 2)
  }, [step])

  const handleImport = useCallback(() => {
    onImport(finalRows)
  }, [onImport, finalRows])

  // Close on Escape
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Escape') onClose()
    },
    [onClose]
  )

  // ── Error / success summary for footer ─────────────────────────────────────
  const errorCount = finalRows.filter((r) => r.errors.length > 0).length
  const validCount = finalRows.length - errorCount

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={i18n.t('Paste from Excel')}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <span className="material-icons-round">table_view</span>
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>{i18n.t('Paste from Excel')}</h2>
            <div className={styles.headerSub}>
              {i18n.t('Import data elements from Excel, Google Sheets, or any CSV source')}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={i18n.t('Close')}
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* ── Step indicator ── */}
        <div className={styles.stepBar}>
          {STEP_LABELS.map((label, idx) => (
            <div
              key={label}
              className={`${styles.step} ${step === idx ? styles.active : ''} ${step > idx ? styles.done : ''}`}
            >
              <span className={styles.stepNum}>
                {step > idx ? (
                  <span className="material-icons-round" style={{ fontSize: 11 }}>
                    check
                  </span>
                ) : (
                  idx + 1
                )}
              </span>
              {label}
            </div>
          ))}
        </div>

        {/* ── Step content ── */}
        {step === 0 && (
          <PasteStep
            rawText={rawText}
            defaults={defaults}
            categoryCombos={categoryCombos}
            optionSets={optionSets}
            onTextChange={setRawText}
            onDefaultsChange={setDefaults}
          />
        )}

        {step === 1 && (
          <MapStep
            mappings={columnMappings}
            delimiter={parseResult.delimiter}
            hasHeaderRow={parseResult.hasHeaderRow}
            previewRow={previewDataRow}
            onChange={setColumnMappings}
          />
        )}

        {step === 2 && <PreviewStep rows={finalRows} />}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {step === 2 && finalRows.length > 0 && (
              <div className={styles.footerNote}>
                {errorCount > 0
                  ? i18n.t(
                      '{{valid}} of {{total}} rows ready. {{errors}} rows have errors and will still be imported — fix them in the grid before submitting.',
                      { valid: validCount, total: finalRows.length, errors: errorCount }
                    )
                  : i18n.t('{{n}} row{{s}} ready to import into the Bulk Create grid.', {
                      n: finalRows.length,
                      s: finalRows.length === 1 ? '' : 's',
                    })}
              </div>
            )}
            {step === 0 && rawText.trim() && parseResult.rows.length > 0 && (
              <div className={styles.footerNote}>
                <span className={styles.delimiterBadge}>
                  {DELIMITER_LABELS[parseResult.delimiter]}
                </span>{' '}
                {i18n.t('{{n}} data row{{s}} detected', {
                  n: parseResult.rows.length,
                  s: parseResult.rows.length === 1 ? '' : 's',
                })}
                {parseResult.skippedRows > 0 &&
                  ` · ${i18n.t('{{n}} blank row{{s}} skipped', { n: parseResult.skippedRows, s: parseResult.skippedRows === 1 ? '' : 's' })}`}
              </div>
            )}
          </div>

          <div className={styles.footerActions}>
            <button
              type="button"
              className="nx-btn nx-btn-secondary"
              onClick={step === 0 ? onClose : handleBack}
            >
              {step === 0 ? (
                i18n.t('Cancel')
              ) : (
                <>
                  <span className="material-icons-round" style={{ fontSize: 16 }}>
                    arrow_back
                  </span>
                  {i18n.t('Back')}
                </>
              )}
            </button>

            {step < 2 ? (
              <button
                type="button"
                className="nx-btn nx-btn-primary"
                onClick={handleNext}
                disabled={!canGoNext}
              >
                {i18n.t('Next')}
                <span className="material-icons-round" style={{ fontSize: 16 }}>
                  arrow_forward
                </span>
              </button>
            ) : (
              <button
                type="button"
                className="nx-btn nx-btn-primary"
                onClick={handleImport}
                disabled={finalRows.length === 0}
              >
                <span className="material-icons-round" style={{ fontSize: 16 }}>
                  download
                </span>
                {i18n.t('Import {{n}} row{{s}} into grid', {
                  n: finalRows.length,
                  s: finalRows.length === 1 ? '' : 's',
                })}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PasteImportModal
