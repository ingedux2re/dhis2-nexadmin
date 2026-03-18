// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/services/metadataService.ts
// Pure helpers — payload builders, validators, rule engine.
// NO direct API calls; all HTTP is done via hooks using useDataEngine.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  CreateRow,
  DataElement,
  MetadataImportResult,
  MetadataImportStats,
  MetadataTypeReport,
  RenameMode,
  RenameRule,
} from '../types'

// ── Constants ─────────────────────────────────────────────────────────────────

/** DHIS2 enforced maximum for shortName field */
export const SHORT_NAME_MAX = 50

/** Safe upper bound for code field */
export const CODE_MAX = 50

// ── Auto-generation helpers ───────────────────────────────────────────────────

/**
 * Derive a short name from the full name.
 * Truncates to SHORT_NAME_MAX characters.
 */
export function deriveShortName(name: string): string {
  return name.trim().slice(0, SHORT_NAME_MAX)
}

/**
 * Derive a code from the full name:
 * Uppercase → replace non-alphanumeric with underscores →
 * collapse consecutive underscores → strip leading/trailing underscores →
 * truncate to CODE_MAX.
 */
export function deriveCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, CODE_MAX)
}

// ── Rename rule engine ────────────────────────────────────────────────────────

/**
 * Apply a single rename rule to one name string.
 * Returns the original name unchanged when the rule cannot be applied
 * (e.g. empty find string for find-replace).
 */
export function applyRenameRule(
  name: string,
  mode: RenameMode,
  find: string,
  replace: string
): string {
  switch (mode) {
    case 'find-replace':
      if (!find) return name
      return name.split(find).join(replace)

    case 'prefix':
      if (!find) return name
      return `${find}${name}`

    case 'suffix':
      if (!find) return name
      return `${name}${find}`

    case 'uppercase':
      return name.toUpperCase()

    case 'lowercase':
      return name.toLowerCase()

    case 'titlecase':
      return name.replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())

    case 'trim':
      // Remove leading/trailing spaces and collapse internal multiple spaces
      return name.trim().replace(/\s{2,}/g, ' ')

    case 'regex': {
      if (!find) return name
      try {
        return name.replace(new RegExp(find, 'g'), replace)
      } catch {
        return name
      }
    }

    default:
      return name
  }
}

/**
 * Apply an ordered chain of rename rules to a single name.
 * The output of each rule becomes the input of the next.
 * Rules with no practical effect (empty find on modes that require it)
 * are skipped silently.
 */
export function applyRuleChain(name: string, rules: RenameRule[]): string {
  return rules.reduce(
    (current, rule) => applyRenameRule(current, rule.mode, rule.find, rule.replace),
    name
  )
}

// ── Row validation ────────────────────────────────────────────────────────────

/**
 * Validate a single CreateRow.
 * Returns an errors map; empty object means the row is valid.
 */
export function validateRow(
  row: CreateRow
): Partial<Record<keyof Omit<CreateRow, '_id' | 'errors'>, string>> {
  const errors: Partial<Record<keyof Omit<CreateRow, '_id' | 'errors'>, string>> = {}

  if (!row.name.trim()) {
    errors.name = 'Name is required'
  } else if (row.name.trim().length > 230) {
    errors.name = 'Name must be ≤ 230 characters'
  }

  if (!row.shortName.trim()) {
    errors.shortName = 'Short name is required'
  } else if (row.shortName.trim().length > SHORT_NAME_MAX) {
    errors.shortName = `Short name must be ≤ ${SHORT_NAME_MAX} characters`
  }

  if (row.code && row.code.trim().length > CODE_MAX) {
    errors.code = `Code must be ≤ ${CODE_MAX} characters`
  }

  if (!row.valueType) {
    errors.valueType = 'Value type is required'
  }

  if (!row.aggregationType) {
    errors.aggregationType = 'Aggregation type is required'
  }

  return errors
}

/**
 * Validate all rows at once.
 * Returns the full row array with inline errors populated,
 * plus a boolean flag indicating whether the entire set is valid.
 */
export function validateAllRows(rows: CreateRow[]): {
  rows: CreateRow[]
  valid: boolean
} {
  const validated = rows.map((row) => ({
    ...row,
    errors: validateRow(row),
  }))
  const valid = validated.every((r) => Object.keys(r.errors).length === 0)
  return { rows: validated, valid }
}

// ── Payload builders ──────────────────────────────────────────────────────────

/**
 * Convert a single CreateRow into a DHIS2 dataElement payload object.
 * Optional fields are omitted when empty so the API uses its own defaults.
 */
export function buildDataElementPayload(row: CreateRow): Record<string, unknown> {
  const payload: Record<string, unknown> = {
    name: row.name.trim(),
    shortName: row.shortName.trim(),
    valueType: row.valueType,
    domainType: row.domainType,
    aggregationType: row.aggregationType,
  }

  if (row.code.trim()) {
    payload.code = row.code.trim().toUpperCase()
  }

  if (row.categoryComboId) {
    payload.categoryCombo = { id: row.categoryComboId }
  }

  if (row.optionSetId) {
    payload.optionSet = { id: row.optionSetId }
  }

  return payload
}

/**
 * Build the full POST /api/metadata body for bulk creating data elements.
 * Only includes rows with a non-empty name (validation should enforce this, but belt-and-suspenders).
 */
export function buildBulkCreatePayload(rows: CreateRow[]): {
  dataElements: Record<string, unknown>[]
} {
  const validRows = rows.filter((r) => r.name?.trim())
  return { dataElements: validRows.map(buildDataElementPayload) }
}

/**
 * Build the POST /api/metadata body for renaming data elements.
 * mergeMode=REPLACE is set as a query param by the hook, not here.
 */
export function buildBulkRenamePayload(
  elements: Array<{ id: string; name: string; shortName: string }>
): { dataElements: Record<string, unknown>[] } {
  return {
    dataElements: elements.map(({ id, name, shortName }) => ({ id, name, shortName })),
  }
}

// ── Response parsers ──────────────────────────────────────────────────────────

/**
 * Normalise a raw metadata import API response into a typed result.
 *
 * DHIS2 2.38+ wraps the ImportReport inside a top-level `response` key:
 *   { httpStatus, httpStatusCode, status: 'OK', response: { responseType: 'ImportReport', status, stats, typeReports } }
 *
 * Older DHIS2 versions or single-object endpoints may return the fields at top level:
 *   { status, stats, typeReports }
 *
 * Some DHIS2 versions use `importCount` instead of `stats` for the counts object.
 *
 * We unwrap `response` first (if present) then fall back to top-level fields.
 */
export function parseImportResult(raw: unknown): MetadataImportResult {
  const r = raw as Record<string, unknown>

  // DHIS2 2.38+ wraps ImportReport inside a 'response' key; fall back to top-level for older versions
  const report = (r.response as Record<string, unknown>) ?? r

  // Some DHIS2 versions use `importCount` (singular) rather than `stats`
  const rawStats =
    (report.stats as Record<string, unknown> | undefined) ??
    (report.importCount as Record<string, unknown> | undefined) ??
    {}

  const stats: MetadataImportStats = {
    created: Number(rawStats.created ?? 0),
    updated: Number(rawStats.updated ?? 0),
    deleted: Number(rawStats.deleted ?? 0),
    ignored: Number(rawStats.ignored ?? 0),
    total: Number(rawStats.total ?? 0),
  }

  const typeReports = (report.typeReports as MetadataTypeReport[]) ?? []
  // Prefer the nested report status; fall back to top-level status
  const status = ((report.status ?? r.status) as 'OK' | 'WARNING' | 'ERROR' | undefined) ?? 'ERROR'
  return { status, stats, typeReports }
}

/**
 * Flatten all error messages from a metadata import result into a string array.
 */
export function collectImportErrors(result: MetadataImportResult): string[] {
  const errors: string[] = []
  for (const tr of result.typeReports ?? []) {
    for (const obj of tr.objectReports ?? []) {
      for (const err of obj.errorReports ?? []) {
        errors.push(`[${err.errorCode}] ${err.message}`)
      }
    }
  }
  return errors
}

// ── Dataset element extraction ────────────────────────────────────────────────

/**
 * Normalise the DHIS2 dataSets/{id} response.
 * The API returns dataSetElements[].dataElement objects;
 * this helper flattens that structure into a plain DataElement array.
 */
export function extractDataElements(dataSetResponse: unknown): DataElement[] {
  const r = dataSetResponse as Record<string, unknown>
  const dse = (r.dataSetElements as Array<Record<string, unknown>>) ?? []
  return dse.map((entry) => {
    const de = (entry.dataElement as Record<string, unknown>) ?? {}
    return {
      id: String(de.id ?? ''),
      name: String(de.name ?? ''),
      shortName: String(de.shortName ?? ''),
      code: de.code ? String(de.code) : undefined,
      valueType: (de.valueType as DataElement['valueType']) ?? 'TEXT',
      domainType: (de.domainType as DataElement['domainType']) ?? 'AGGREGATE',
      aggregationType: (de.aggregationType as DataElement['aggregationType']) ?? 'SUM',
      categoryCombo: de.categoryCombo
        ? {
            id: String((de.categoryCombo as Record<string, unknown>).id ?? ''),
            displayName: String((de.categoryCombo as Record<string, unknown>).displayName ?? ''),
          }
        : undefined,
    }
  })
}
