// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/types.ts
// Shared TypeScript types for the Data Element Engineering module.
// ─────────────────────────────────────────────────────────────────────────────

// ── DHIS2 metadata reference ──────────────────────────────────────────────────

export interface MetaRef {
  id: string
  displayName: string
}

// ── Dataset reference ─────────────────────────────────────────────────────────

export interface DataSet {
  id: string
  displayName: string
}

// ── Data Element value types (DHIS2 2.38+) ───────────────────────────────────

export type ValueType =
  | 'TEXT'
  | 'LONG_TEXT'
  | 'LETTER'
  | 'PHONE_NUMBER'
  | 'EMAIL'
  | 'BOOLEAN'
  | 'TRUE_ONLY'
  | 'DATE'
  | 'DATETIME'
  | 'TIME'
  | 'NUMBER'
  | 'UNIT_INTERVAL'
  | 'PERCENTAGE'
  | 'INTEGER'
  | 'INTEGER_POSITIVE'
  | 'INTEGER_NEGATIVE'
  | 'INTEGER_ZERO_OR_POSITIVE'
  | 'TRACKER_ASSOCIATE'
  | 'USERNAME'
  | 'COORDINATE'
  | 'ORGANISATION_UNIT'
  | 'REFERENCE'
  | 'AGE'
  | 'URL'
  | 'FILE_RESOURCE'
  | 'IMAGE'

export const VALUE_TYPES: { value: ValueType; label: string }[] = [
  { value: 'INTEGER', label: 'Integer' },
  { value: 'INTEGER_POSITIVE', label: 'Positive Integer' },
  { value: 'INTEGER_ZERO_OR_POSITIVE', label: 'Zero or Positive Integer' },
  { value: 'INTEGER_NEGATIVE', label: 'Negative Integer' },
  { value: 'NUMBER', label: 'Number' },
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'UNIT_INTERVAL', label: 'Unit Interval' },
  { value: 'TEXT', label: 'Text' },
  { value: 'LONG_TEXT', label: 'Long Text' },
  { value: 'LETTER', label: 'Letter' },
  { value: 'BOOLEAN', label: 'Boolean' },
  { value: 'TRUE_ONLY', label: 'Yes Only' },
  { value: 'DATE', label: 'Date' },
  { value: 'DATETIME', label: 'Date & Time' },
  { value: 'TIME', label: 'Time' },
  { value: 'EMAIL', label: 'Email' },
  { value: 'PHONE_NUMBER', label: 'Phone Number' },
  { value: 'URL', label: 'URL' },
  { value: 'FILE_RESOURCE', label: 'File' },
  { value: 'IMAGE', label: 'Image' },
  { value: 'COORDINATE', label: 'Coordinate' },
  { value: 'ORGANISATION_UNIT', label: 'Organisation Unit' },
  { value: 'AGE', label: 'Age' },
]

export type DomainType = 'AGGREGATE' | 'TRACKER'

export const DOMAIN_TYPES: { value: DomainType; label: string }[] = [
  { value: 'AGGREGATE', label: 'Aggregate' },
  { value: 'TRACKER', label: 'Tracker' },
]

export type AggregationType =
  | 'SUM'
  | 'AVERAGE'
  | 'AVERAGE_SUM_ORG_UNIT'
  | 'LAST'
  | 'LAST_AVERAGE_ORG_UNIT'
  | 'LAST_IN_PERIOD'
  | 'LAST_IN_PERIOD_AVERAGE_ORG_UNIT'
  | 'FIRST'
  | 'FIRST_AVERAGE_ORG_UNIT'
  | 'COUNT'
  | 'STDDEV'
  | 'VARIANCE'
  | 'MIN'
  | 'MAX'
  | 'NONE'
  | 'CUSTOM'
  | 'DEFAULT'

export const AGGREGATION_TYPES: { value: AggregationType; label: string }[] = [
  { value: 'SUM', label: 'Sum' },
  { value: 'AVERAGE', label: 'Average' },
  { value: 'AVERAGE_SUM_ORG_UNIT', label: 'Avg (sum in org unit hierarchy)' },
  { value: 'COUNT', label: 'Count' },
  { value: 'LAST', label: 'Last (sum in org unit hierarchy)' },
  { value: 'LAST_AVERAGE_ORG_UNIT', label: 'Last (avg in org unit hierarchy)' },
  { value: 'FIRST', label: 'First (sum in org unit hierarchy)' },
  { value: 'FIRST_AVERAGE_ORG_UNIT', label: 'First (avg in org unit hierarchy)' },
  { value: 'MIN', label: 'Min' },
  { value: 'MAX', label: 'Max' },
  { value: 'STDDEV', label: 'Std deviation' },
  { value: 'VARIANCE', label: 'Variance' },
  { value: 'NONE', label: 'None' },
  { value: 'DEFAULT', label: 'Default' },
]

// ── Row in the Bulk Create grid ───────────────────────────────────────────────

export interface CreateRow {
  /** Internal client-side id — never sent to the API */
  _id: string
  name: string
  shortName: string
  code: string
  valueType: ValueType
  domainType: DomainType
  aggregationType: AggregationType
  /** DHIS2 id of the categoryCombo (empty string = use default) */
  categoryComboId: string
  /** DHIS2 id of the optionSet (empty string = none) */
  optionSetId: string
  /** Inline validation errors keyed by field name — populated by validateAllRows() */
  errors: Partial<Record<keyof Omit<CreateRow, '_id' | 'errors'>, string>>
}

// ── Template row (defaults applied to every new row) ─────────────────────────

export type TemplateRow = Omit<CreateRow, '_id' | 'name' | 'shortName' | 'code' | 'errors'>

// ── Existing data element from DHIS2 ─────────────────────────────────────────

export interface DataElement {
  id: string
  name: string
  shortName: string
  code?: string
  valueType: ValueType
  domainType: DomainType
  aggregationType: AggregationType
  categoryCombo?: MetaRef
  optionSet?: MetaRef
}

// ── Rename rule ───────────────────────────────────────────────────────────────
//
// NOTE: This is a superset of the RenameMode in BulkRenameTable.tsx (org units).
// That component defines: 'find-replace' | 'prefix' | 'suffix' | 'regex'
// This module adds: 'uppercase' | 'lowercase' | 'titlecase' | 'trim'
// The extra modes are essential for real naming-standard enforcement.

export type RenameMode =
  | 'find-replace'
  | 'prefix'
  | 'suffix'
  | 'uppercase'
  | 'lowercase'
  | 'titlecase'
  | 'trim'
  | 'regex'

export const RENAME_MODES: {
  value: RenameMode
  label: string
  hasFind: boolean
  hasReplace: boolean
}[] = [
  { value: 'find-replace', label: 'Find & Replace', hasFind: true, hasReplace: true },
  { value: 'prefix', label: 'Add Prefix', hasFind: true, hasReplace: false },
  { value: 'suffix', label: 'Add Suffix', hasFind: true, hasReplace: false },
  { value: 'uppercase', label: 'UPPERCASE', hasFind: false, hasReplace: false },
  { value: 'lowercase', label: 'lowercase', hasFind: false, hasReplace: false },
  { value: 'titlecase', label: 'Title Case', hasFind: false, hasReplace: false },
  { value: 'trim', label: 'Trim Spaces', hasFind: false, hasReplace: false },
  { value: 'regex', label: 'Regex Replace', hasFind: true, hasReplace: true },
]

/** A single step in an ordered rename rule chain */
export interface RenameRule {
  /** Client-side id for React keys */
  _id: string
  mode: RenameMode
  /** The find/prefix/suffix/regex pattern — empty string for transform-only modes */
  find: string
  /** The replacement string — empty string where not applicable */
  replace: string
}

// ── Rename preview row ────────────────────────────────────────────────────────

export interface DataElementRenamePreview {
  id: string
  oldName: string
  /** Result after applying the full rule chain */
  newName: string
  oldShortName: string
  /** Derived from newName; truncated to SHORT_NAME_MAX if needed */
  newShortName: string
  code?: string
  valueType: ValueType
  changed: boolean
}

// ── Metadata API result ───────────────────────────────────────────────────────

export interface MetadataImportStats {
  created: number
  updated: number
  deleted: number
  ignored: number
  total: number
}

export interface MetadataTypeReport {
  klass: string
  stats: MetadataImportStats
  objectReports?: Array<{
    uid: string
    errorReports?: Array<{ message: string; errorCode: string }>
  }>
}

export interface MetadataImportResult {
  status: 'OK' | 'WARNING' | 'ERROR'
  stats: MetadataImportStats
  typeReports?: MetadataTypeReport[]
  message?: string
}
