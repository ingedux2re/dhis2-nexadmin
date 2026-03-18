// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/services/excelPasteParser.ts
//
// Pure, dependency-free parser for Excel / CSV paste input.
//
// Pipeline:
//   raw text  →  detectDelimiter  →  splitRows  →  parseHeaders  →
//   mapColumns  →  normaliseRow  →  validateRow  →  ParsedRow[]
//
// Design goals:
//   • Zero external deps — runs synchronously, ≥100 rows <5 ms
//   • Smart column mapping: fuzzy-matches common Excel header spellings
//   • Full normalization: "int" → "INTEGER", "avg" → "AVERAGE" …
//   • Returns one ParseResult per data row with parsed fields + warnings
// ─────────────────────────────────────────────────────────────────────────────

import type { ValueType, AggregationType, DomainType } from '../types'
import { VALUE_TYPES, AGGREGATION_TYPES } from '../types'
import { deriveShortName, deriveCode, SHORT_NAME_MAX } from './metadataService'
import { nanoid } from '../../../utils/nanoid'

// ── Public surface ────────────────────────────────────────────────────────────

/** One column position in the user's paste → one CreateRow field */
export type TargetField =
  | 'name'
  | 'shortName'
  | 'code'
  | 'valueType'
  | 'aggregationType'
  | 'domainType'
  | 'categoryComboId'
  | 'optionSetId'
  | 'ignore'

/** Per-row result of parsing one data line */
export interface ParsedRow {
  /** Same uid format as CreateRow._id */
  _id: string
  name: string
  shortName: string
  code: string
  valueType: ValueType
  domainType: DomainType
  aggregationType: AggregationType
  categoryComboId: string
  optionSetId: string
  /** Warnings that don't block import (e.g. truncated shortName) */
  warnings: string[]
  /** Hard errors that must be fixed before import */
  errors: string[]
  /** The original raw columns, kept for display in the preview table */
  _raw: string[]
}

/** Column mapping: index in raw CSV → target field */
export interface ColumnMapping {
  rawIndex: number
  header: string
  targetField: TargetField
}

/** Full result of one parse run */
export interface PasteParseResult {
  delimiter: string
  headers: string[]
  columnMappings: ColumnMapping[]
  rows: ParsedRow[]
  /** Number of rows skipped (empty / blank lines) */
  skippedRows: number
  hasHeaderRow: boolean
}

// ── Delimiter detection ───────────────────────────────────────────────────────

/**
 * Detect the most likely column separator in raw paste text.
 * Excel copies as tab-delimited. CSV tools typically use comma or semicolon.
 * We count occurrences in the first non-empty line and pick the most frequent.
 */
export function detectDelimiter(text: string): '\t' | ',' | ';' {
  const firstLine = text.split('\n').find((l) => l.trim().length > 0) ?? ''
  const counts = {
    '\t': (firstLine.match(/\t/g) ?? []).length,
    ',': (firstLine.match(/,/g) ?? []).length,
    ';': (firstLine.match(/;/g) ?? []).length,
  }
  // Tab wins ties (Excel default)
  if (counts['\t'] >= counts[','] && counts['\t'] >= counts[';']) return '\t'
  if (counts[';'] > counts[',']) return ';'
  return ','
}

// ── Row splitting ─────────────────────────────────────────────────────────────

/**
 * Split a raw text line respecting double-quoted CSV fields.
 * Excel wraps cells containing the delimiter in double-quotes.
 */
export function splitRow(line: string, delimiter: string): string[] {
  if (delimiter === '\t') {
    // Tabs are never inside quoted strings in Excel exports
    return line.split('\t').map((c) => c.trim())
  }

  // Handle CSV quoting for comma/semicolon
  const cells: string[] = []
  let current = ''
  let inQuote = false

  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (inQuote && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        inQuote = !inQuote
      }
    } else if (ch === delimiter && !inQuote) {
      cells.push(current.trim())
      current = ''
    } else {
      current += ch
    }
  }
  cells.push(current.trim())
  return cells
}

// ── Header → field mapping ────────────────────────────────────────────────────

/** Canonical aliases for each target field (lowercased, no spaces) */
const FIELD_ALIASES: Record<TargetField, string[]> = {
  name: ['name', 'dataelementname', 'elementname', 'displayname', 'nom', 'nombre'],
  shortName: [
    'shortname',
    'short_name',
    'shortnam',
    'shortdisplayname',
    'abbreviation',
    'abbrev',
    'nomabrégé',
    'nomcourt',
  ],
  code: ['code', 'uid', 'identifier', 'ref', 'codigo'],
  valueType: [
    'valuetype',
    'value_type',
    'type',
    'datatype',
    'data_type',
    'fieldtype',
    'typedonnées',
    'typedevaleur',
  ],
  aggregationType: [
    'aggregationtype',
    'aggregation_type',
    'aggregation',
    'agg',
    'aggtype',
    'typeagrégation',
    'typeaggregation',
  ],
  domainType: ['domaintype', 'domain_type', 'domain', 'typdomaine'],
  categoryComboId: [
    'categorycombo',
    'catcombo',
    'category_combo',
    'categorycomboname',
    'catcomboname',
    'combinaisoncatégorie',
  ],
  optionSetId: [
    'optionset',
    'option_set',
    'optionsetname',
    'optionsetid',
    'listeoptions',
    'ensembleoptions',
  ],
  ignore: ['ignore', 'skip', 'notes', 'comments', 'remarques', 'description', '#'],
}

/** Normalise a header for alias matching */
function normaliseHeader(h: string): string {
  return h
    .toLowerCase()
    .replace(/[\s_\-.*]/g, '')
    .replace(/[éèêë]/g, 'e')
    .replace(/[àâä]/g, 'a')
    .replace(/[ùûü]/g, 'u')
    .replace(/[îï]/g, 'i')
    .replace(/[ôö]/g, 'o')
}

/**
 * Map a single raw header string to the best-matching TargetField.
 * Returns 'ignore' when no alias matches.
 */
export function mapHeader(header: string): TargetField {
  const norm = normaliseHeader(header)
  for (const [field, aliases] of Object.entries(FIELD_ALIASES) as [TargetField, string[]][]) {
    if (aliases.some((a) => norm === a || norm.startsWith(a) || a.startsWith(norm))) {
      return field
    }
  }
  return 'ignore'
}

/**
 * Auto-generate column mappings from an array of header strings.
 * First occurrence of each target field wins; duplicates are ignored.
 */
export function buildColumnMappings(headers: string[]): ColumnMapping[] {
  const seen = new Set<TargetField>()
  return headers.map((h, i) => {
    const targetField = mapHeader(h)
    if (targetField !== 'ignore' && seen.has(targetField)) {
      return { rawIndex: i, header: h, targetField: 'ignore' as TargetField }
    }
    if (targetField !== 'ignore') seen.add(targetField)
    return { rawIndex: i, header: h, targetField }
  })
}

// ── Value normalisation ───────────────────────────────────────────────────────

const VALUE_TYPE_ALIASES: Record<string, ValueType> = {
  // Numeric
  integer: 'INTEGER',
  int: 'INTEGER',
  entier: 'INTEGER',
  integer_positive: 'INTEGER_POSITIVE',
  integer_pos: 'INTEGER_POSITIVE',
  positive_integer: 'INTEGER_POSITIVE',
  pos_int: 'INTEGER_POSITIVE',
  entierpositif: 'INTEGER_POSITIVE',
  integer_negative: 'INTEGER_NEGATIVE',
  neg_int: 'INTEGER_NEGATIVE',
  entiernégatif: 'INTEGER_NEGATIVE',
  integer_zero_or_positive: 'INTEGER_ZERO_OR_POSITIVE',
  zero_or_positive: 'INTEGER_ZERO_OR_POSITIVE',
  zero_positive: 'INTEGER_ZERO_OR_POSITIVE',
  number: 'NUMBER',
  num: 'NUMBER',
  numeric: 'NUMBER',
  float: 'NUMBER',
  decimal: 'NUMBER',
  nombre: 'NUMBER',
  percentage: 'PERCENTAGE',
  percent: 'PERCENTAGE',
  pct: 'PERCENTAGE',
  pourcentage: 'PERCENTAGE',
  unit_interval: 'UNIT_INTERVAL',
  // Text
  text: 'TEXT',
  texte: 'TEXT',
  string: 'TEXT',
  long_text: 'LONG_TEXT',
  longtext: 'LONG_TEXT',
  texte_long: 'LONG_TEXT',
  letter: 'LETTER',
  lettre: 'LETTER',
  // Date/time
  date: 'DATE',
  datetime: 'DATETIME',
  date_time: 'DATETIME',
  time: 'TIME',
  // Boolean
  boolean: 'BOOLEAN',
  bool: 'BOOLEAN',
  yes_no: 'BOOLEAN',
  yesno: 'BOOLEAN',
  oui_non: 'BOOLEAN',
  true_only: 'TRUE_ONLY',
  trueonly: 'TRUE_ONLY',
  yes_only: 'TRUE_ONLY',
  yesonly: 'TRUE_ONLY',
  // Contact
  email: 'EMAIL',
  phone: 'PHONE_NUMBER',
  phone_number: 'PHONE_NUMBER',
  telephone: 'PHONE_NUMBER',
  url: 'URL',
  // Geo
  coordinate: 'COORDINATE',
  coordinates: 'COORDINATE',
  organisation_unit: 'ORGANISATION_UNIT',
  org_unit: 'ORGANISATION_UNIT',
  // Other
  file: 'FILE_RESOURCE',
  file_resource: 'FILE_RESOURCE',
  image: 'IMAGE',
  age: 'AGE',
}

const VALID_VALUE_TYPES = new Set<string>(VALUE_TYPES.map((v) => v.value))

export function normaliseValueType(raw: string, fallback: ValueType): ValueType {
  if (!raw) return fallback
  const upper = raw.trim().toUpperCase().replace(/[\s-]/g, '_')
  if (VALID_VALUE_TYPES.has(upper)) return upper as ValueType
  const lower = raw.trim().toLowerCase().replace(/[\s-]/g, '_')
  return VALUE_TYPE_ALIASES[lower] ?? fallback
}

const AGGREGATION_ALIASES: Record<string, AggregationType> = {
  sum: 'SUM',
  somme: 'SUM',
  average: 'AVERAGE',
  avg: 'AVERAGE',
  moyenne: 'AVERAGE',
  average_sum_org_unit: 'AVERAGE_SUM_ORG_UNIT',
  avg_sum_ou: 'AVERAGE_SUM_ORG_UNIT',
  count: 'COUNT',
  nombre: 'COUNT',
  last: 'LAST',
  dernier: 'LAST',
  last_average_org_unit: 'LAST_AVERAGE_ORG_UNIT',
  last_avg_ou: 'LAST_AVERAGE_ORG_UNIT',
  last_in_period: 'LAST_IN_PERIOD',
  last_in_period_average_org_unit: 'LAST_IN_PERIOD_AVERAGE_ORG_UNIT',
  first: 'FIRST',
  first_average_org_unit: 'FIRST_AVERAGE_ORG_UNIT',
  first_avg_ou: 'FIRST_AVERAGE_ORG_UNIT',
  min: 'MIN',
  max: 'MAX',
  stddev: 'STDDEV',
  std_dev: 'STDDEV',
  standard_deviation: 'STDDEV',
  variance: 'VARIANCE',
  none: 'NONE',
  aucun: 'NONE',
  custom: 'CUSTOM',
  default: 'DEFAULT',
}

const VALID_AGGREGATION_TYPES = new Set<string>(AGGREGATION_TYPES.map((a) => a.value))

export function normaliseAggregationType(raw: string, fallback: AggregationType): AggregationType {
  if (!raw) return fallback
  const upper = raw.trim().toUpperCase().replace(/[\s-]/g, '_')
  if (VALID_AGGREGATION_TYPES.has(upper)) return upper as AggregationType
  const lower = raw.trim().toLowerCase().replace(/[\s-]/g, '_')
  return AGGREGATION_ALIASES[lower] ?? fallback
}

export function normaliseDomainType(raw: string, fallback: DomainType): DomainType {
  const upper = raw.trim().toUpperCase()
  if (upper === 'AGGREGATE' || upper === 'TRACKER') return upper as DomainType
  if (upper === 'AGG' || upper === 'AGRÉGÉ' || upper === 'AGREGADO') return 'AGGREGATE'
  return fallback
}

// ── Row parsing ───────────────────────────────────────────────────────────────

export interface ParseDefaults {
  valueType: ValueType
  aggregationType: AggregationType
  domainType: DomainType
  categoryComboId: string
  optionSetId: string
}

export const DEFAULT_PARSE_DEFAULTS: ParseDefaults = {
  valueType: 'INTEGER',
  aggregationType: 'SUM',
  domainType: 'AGGREGATE',
  categoryComboId: '',
  optionSetId: '',
}

/**
 * Convert a raw cell array + column mappings + defaults into a ParsedRow.
 * Applies normalisation, auto-derives shortName/code, and validates.
 */
export function parseRawRow(
  cells: string[],
  mappings: ColumnMapping[],
  defaults: ParseDefaults,
  rowIndex: number,
  /** Used only to detect duplicate codes */
  seenCodes: Set<string>
): ParsedRow {
  const warnings: string[] = []
  const errors: string[] = []

  // Extract fields by column mapping
  const get = (field: TargetField): string => {
    const m = mappings.find((cm) => cm.targetField === field)
    if (!m) return ''
    return (cells[m.rawIndex] ?? '').trim()
  }

  const rawName = get('name')
  const rawShortName = get('shortName')
  const rawCode = get('code')
  const rawValueType = get('valueType')
  const rawAggType = get('aggregationType')
  const rawDomainType = get('domainType')
  const rawCatCombo = get('categoryComboId')
  const rawOptionSet = get('optionSetId')

  // Name
  const name = rawName.trim()
  if (!name) {
    errors.push(`Row ${rowIndex + 1}: Name is required`)
  } else if (name.length > 230) {
    errors.push(`Row ${rowIndex + 1}: Name exceeds 230 characters`)
  }

  // Short name: explicit value or derived from name
  let shortName = rawShortName.trim()
  if (!shortName && name) {
    shortName = deriveShortName(name)
    if (name.length > SHORT_NAME_MAX) {
      warnings.push(`Row ${rowIndex + 1}: Short name auto-truncated to ${SHORT_NAME_MAX} chars`)
    }
  }
  if (!shortName && !name) {
    errors.push(`Row ${rowIndex + 1}: Short name is required`)
  } else if (shortName.length > SHORT_NAME_MAX) {
    warnings.push(
      `Row ${rowIndex + 1}: Short name truncated from ${shortName.length} to ${SHORT_NAME_MAX} characters`
    )
    shortName = shortName.slice(0, SHORT_NAME_MAX)
  }

  // Code: explicit or derived from name
  let code = rawCode.trim()
  if (!code && name) {
    code = deriveCode(name)
  } else if (code) {
    // Normalise: uppercase, replace spaces/hyphens
    code = code.toUpperCase().replace(/\s+/g, '_')
  }
  if (code) {
    if (code.length > 50) {
      code = code.slice(0, 50)
      warnings.push(`Row ${rowIndex + 1}: Code truncated to 50 characters`)
    }
    if (seenCodes.has(code)) {
      errors.push(`Row ${rowIndex + 1}: Duplicate code "${code}"`)
    } else {
      seenCodes.add(code)
    }
  }

  // Value type
  const valueType = normaliseValueType(rawValueType, defaults.valueType)
  if (rawValueType && valueType === defaults.valueType && rawValueType.trim() !== '') {
    const resolved = rawValueType.trim().toUpperCase().replace(/[\s-]/g, '_')
    if (
      !VALID_VALUE_TYPES.has(resolved) &&
      !VALUE_TYPE_ALIASES[rawValueType.toLowerCase().replace(/[\s-]/g, '_')]
    ) {
      warnings.push(
        `Row ${rowIndex + 1}: Unknown value type "${rawValueType}" — using default "${defaults.valueType}"`
      )
    }
  }

  // Aggregation type
  const aggregationType = normaliseAggregationType(rawAggType, defaults.aggregationType)

  // Domain type
  const domainType = normaliseDomainType(rawDomainType, defaults.domainType)

  // Category combo and option set are kept as display-name strings for now;
  // the UI will let the user map them to real IDs from the dropdowns
  const categoryComboId = rawCatCombo || defaults.categoryComboId
  const optionSetId = rawOptionSet || defaults.optionSetId

  return {
    _id: nanoid(),
    name,
    shortName,
    code,
    valueType,
    domainType,
    aggregationType,
    categoryComboId,
    optionSetId,
    warnings,
    errors,
    _raw: cells,
  }
}

// ── Header-row detection ──────────────────────────────────────────────────────

/**
 * Heuristic: if the first row contains at least one recognisable field alias,
 * treat it as a header row.
 */
export function looksLikeHeaderRow(firstRowCells: string[]): boolean {
  const recognisable = firstRowCells.filter((cell) => mapHeader(cell) !== 'ignore')
  // At least 1 cell must be a known header, AND name/shortName/code is among them
  const hasNameLike = firstRowCells.some((c) => {
    const f = mapHeader(c)
    return f === 'name' || f === 'shortName' || f === 'code'
  })
  return recognisable.length >= 1 && hasNameLike
}

// ── Main entry point ──────────────────────────────────────────────────────────

/**
 * Full parse pipeline: text → PasteParseResult.
 *
 * @param text     Raw clipboard text (Excel tab-delimited or CSV)
 * @param defaults Global defaults to apply when a row is missing a field
 */
export function parsePasteText(
  text: string,
  defaults: ParseDefaults = DEFAULT_PARSE_DEFAULTS
): PasteParseResult {
  if (!text.trim()) {
    return {
      delimiter: '\t',
      headers: [],
      columnMappings: [],
      rows: [],
      skippedRows: 0,
      hasHeaderRow: false,
    }
  }

  const delimiter = detectDelimiter(text)

  // Normalise line endings (Windows \r\n, classic Mac \r)
  const lines = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n')

  let skippedRows = 0
  let hasHeaderRow = false
  let columnMappings: ColumnMapping[] = []
  let headers: string[] = []
  const parsedRows: ParsedRow[] = []

  // Find the first non-empty line
  const firstNonEmpty = lines.find((l) => l.trim().length > 0)
  if (!firstNonEmpty) {
    return {
      delimiter,
      headers: [],
      columnMappings: [],
      rows: [],
      skippedRows: 0,
      hasHeaderRow: false,
    }
  }

  const firstCells = splitRow(firstNonEmpty, delimiter)

  if (looksLikeHeaderRow(firstCells)) {
    hasHeaderRow = true
    headers = firstCells
    columnMappings = buildColumnMappings(headers)
  } else {
    // No header row — auto-assign by position
    hasHeaderRow = false
    const positionalFields: TargetField[] = [
      'name',
      'shortName',
      'code',
      'valueType',
      'aggregationType',
      'categoryComboId',
      'optionSetId',
    ]
    headers = firstCells.map((_, i) => positionalFields[i] ?? `col${i + 1}`)
    columnMappings = headers.map((h, i) => ({
      rawIndex: i,
      header: h,
      targetField: (positionalFields[i] ?? 'ignore') as TargetField,
    }))
  }

  const seenCodes = new Set<string>()
  let dataRowIndex = 0

  for (const line of lines) {
    if (!line.trim()) {
      skippedRows++
      continue
    }
    const cells = splitRow(line, delimiter)
    // Skip the header line itself
    if (hasHeaderRow && line.trim() === firstNonEmpty.trim()) {
      continue
    }
    // Skip rows where all cells are empty
    if (cells.every((c) => !c.trim())) {
      skippedRows++
      continue
    }

    const parsed = parseRawRow(cells, columnMappings, defaults, dataRowIndex, seenCodes)
    parsedRows.push(parsed)
    dataRowIndex++
  }

  return {
    delimiter,
    headers,
    columnMappings,
    rows: parsedRows,
    skippedRows,
    hasHeaderRow,
  }
}
