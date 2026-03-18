// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/services/__tests__/metadataService.test.ts
//
// Tests for parseImportResult — covering:
//   1. DHIS2 2.38+ format: stats nested inside `response` key
//   2. Legacy / top-level format: stats at root level
//   3. Error status propagation
//   4. collectImportErrors helper
// ─────────────────────────────────────────────────────────────────────────────

import { parseImportResult, collectImportErrors } from '../metadataService'

describe('parseImportResult', () => {
  // ── DHIS2 2.38+ wrapped format ──────────────────────────────────────────────

  it('reads stats from response.response (DHIS2 2.38+ envelope format)', () => {
    const raw = {
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
      response: {
        responseType: 'ImportReport',
        status: 'OK',
        stats: { created: 3, updated: 0, deleted: 0, ignored: 0, total: 3 },
        typeReports: [],
      },
    }
    const result = parseImportResult(raw)
    expect(result.status).toBe('OK')
    expect(result.stats.created).toBe(3)
    expect(result.stats.total).toBe(3)
  })

  it('reads typeReports from response.response', () => {
    const raw = {
      httpStatus: 'OK',
      httpStatusCode: 200,
      status: 'OK',
      response: {
        responseType: 'ImportReport',
        status: 'OK',
        stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
        typeReports: [
          {
            klass: 'org.hisp.dhis.dataelement.DataElement',
            stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
            objectReports: [
              {
                uid: 'abc123',
                errorReports: [{ errorCode: 'E4000', message: 'Duplicate name' }],
              },
            ],
          },
        ],
      },
    }
    const result = parseImportResult(raw)
    expect(result.typeReports).toHaveLength(1)
    expect(result.typeReports?.[0].objectReports).toHaveLength(1)
  })

  it('returns WARNING status from nested response', () => {
    const raw = {
      httpStatus: 'Conflict',
      httpStatusCode: 409,
      status: 'WARNING',
      response: {
        responseType: 'ImportReport',
        status: 'WARNING',
        stats: { created: 2, updated: 0, deleted: 0, ignored: 1, total: 3 },
        typeReports: [],
      },
    }
    const result = parseImportResult(raw)
    expect(result.status).toBe('WARNING')
    expect(result.stats.created).toBe(2)
    expect(result.stats.ignored).toBe(1)
  })

  // ── Legacy / top-level format ───────────────────────────────────────────────

  it('falls back to top-level stats when response key is absent', () => {
    const raw = {
      status: 'OK',
      stats: { created: 2, updated: 0, deleted: 0, ignored: 0, total: 2 },
      typeReports: [],
    }
    const result = parseImportResult(raw)
    expect(result.status).toBe('OK')
    expect(result.stats.created).toBe(2)
  })

  // ── Defensive defaults ──────────────────────────────────────────────────────

  it('returns zero stats when no stats field present', () => {
    const result = parseImportResult({ status: 'OK', response: { status: 'OK' } })
    expect(result.stats.created).toBe(0)
    expect(result.stats.total).toBe(0)
  })

  it('defaults status to ERROR when absent everywhere', () => {
    const result = parseImportResult({})
    expect(result.status).toBe('ERROR')
  })
})

describe('collectImportErrors', () => {
  it('returns empty array when no typeReports', () => {
    const result = parseImportResult({
      status: 'OK',
      response: {
        status: 'OK',
        stats: { created: 1, updated: 0, deleted: 0, ignored: 0, total: 1 },
        typeReports: [],
      },
    })
    expect(collectImportErrors(result)).toEqual([])
  })

  it('collects error messages from nested objectReports', () => {
    const raw = {
      status: 'OK',
      response: {
        status: 'ERROR',
        stats: { created: 0, updated: 0, deleted: 0, ignored: 1, total: 1 },
        typeReports: [
          {
            klass: 'org.hisp.dhis.dataelement.DataElement',
            stats: { created: 0, updated: 0, deleted: 0, ignored: 1, total: 1 },
            objectReports: [
              {
                uid: 'xyz',
                errorReports: [
                  { errorCode: 'E4000', message: 'Duplicate short name' },
                  { errorCode: 'E4001', message: 'Invalid value type' },
                ],
              },
            ],
          },
        ],
      },
    }
    const result = parseImportResult(raw)
    const errors = collectImportErrors(result)
    expect(errors).toHaveLength(2)
    expect(errors[0]).toBe('[E4000] Duplicate short name')
    expect(errors[1]).toBe('[E4001] Invalid value type')
  })
})
