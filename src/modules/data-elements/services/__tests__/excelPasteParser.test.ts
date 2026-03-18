// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/services/__tests__/excelPasteParser.test.ts
//
// Tests for the Excel/CSV paste parser pipeline.
// ─────────────────────────────────────────────────────────────────────────────

import {
  detectDelimiter,
  splitRow,
  mapHeader,
  buildColumnMappings,
  normaliseValueType,
  normaliseAggregationType,
  normaliseDomainType,
  looksLikeHeaderRow,
  parsePasteText,
  DEFAULT_PARSE_DEFAULTS,
} from '../excelPasteParser'

// ── detectDelimiter ───────────────────────────────────────────────────────────

describe('detectDelimiter', () => {
  it('detects tab as delimiter (Excel default)', () => {
    expect(detectDelimiter('Name\tShort Name\tCode\tValue Type')).toBe('\t')
  })

  it('detects comma as delimiter', () => {
    expect(detectDelimiter('Name,Short Name,Code,Value Type')).toBe(',')
  })

  it('detects semicolon as delimiter', () => {
    expect(detectDelimiter('Name;Short Name;Code;Value Type')).toBe(';')
  })

  it('prefers tab over comma when equal count', () => {
    expect(detectDelimiter('a,b\tc,d\te')).toBe('\t')
  })

  it('defaults to tab on empty text (tab wins all ties)', () => {
    expect(detectDelimiter('')).toBe('\t')
  })
})

// ── splitRow ──────────────────────────────────────────────────────────────────

describe('splitRow', () => {
  it('splits tab-delimited row', () => {
    expect(splitRow('Malaria Cases\tMAL\tINTEGER', '\t')).toEqual([
      'Malaria Cases',
      'MAL',
      'INTEGER',
    ])
  })

  it('splits comma-delimited row', () => {
    expect(splitRow('Malaria Cases,MAL,INTEGER', ',')).toEqual(['Malaria Cases', 'MAL', 'INTEGER'])
  })

  it('handles double-quoted fields with embedded commas', () => {
    expect(splitRow('"Cases, confirmed",CONF,INTEGER', ',')).toEqual([
      'Cases, confirmed',
      'CONF',
      'INTEGER',
    ])
  })

  it('handles escaped double-quotes inside quoted fields', () => {
    expect(splitRow('"He said ""hello""",X', ',')).toEqual(['He said "hello"', 'X'])
  })

  it('trims whitespace from cells', () => {
    expect(splitRow('  Name  ,  Code  ', ',')).toEqual(['Name', 'Code'])
  })
})

// ── mapHeader ─────────────────────────────────────────────────────────────────

describe('mapHeader', () => {
  const cases: [string, string][] = [
    ['Name', 'name'],
    ['name', 'name'],
    ['Data Element Name', 'name'],
    ['Short Name', 'shortName'],
    ['shortName', 'shortName'],
    ['Code', 'code'],
    ['Value Type', 'valueType'],
    ['valueType', 'valueType'],
    ['Type', 'valueType'],
    ['Aggregation', 'aggregationType'],
    ['aggregationType', 'aggregationType'],
    ['Domain Type', 'domainType'],
    ['Category Combo', 'categoryComboId'],
    ['Option Set', 'optionSetId'],
    ['Notes', 'ignore'],
    ['RandomUnknown', 'ignore'],
    // French headers
    ['Nom', 'name'],
    ['Type de valeur', 'valueType'],
  ]

  it.each(cases)('maps header "%s" to field "%s"', (header, expected) => {
    expect(mapHeader(header)).toBe(expected)
  })
})

// ── buildColumnMappings ───────────────────────────────────────────────────────

describe('buildColumnMappings', () => {
  it('builds correct mappings from standard headers', () => {
    const headers = ['Name', 'Short Name', 'Code', 'Value Type', 'Aggregation']
    const mappings = buildColumnMappings(headers)
    expect(mappings[0].targetField).toBe('name')
    expect(mappings[1].targetField).toBe('shortName')
    expect(mappings[2].targetField).toBe('code')
    expect(mappings[3].targetField).toBe('valueType')
    expect(mappings[4].targetField).toBe('aggregationType')
  })

  it('deduplicates: second occurrence of same target field is ignored', () => {
    const headers = ['Name', 'Name', 'Code']
    const mappings = buildColumnMappings(headers)
    expect(mappings[0].targetField).toBe('name')
    expect(mappings[1].targetField).toBe('ignore') // duplicate
    expect(mappings[2].targetField).toBe('code')
  })

  it('maps unknown headers to ignore', () => {
    const headers = ['Foo', 'Bar']
    const mappings = buildColumnMappings(headers)
    expect(mappings[0].targetField).toBe('ignore')
    expect(mappings[1].targetField).toBe('ignore')
  })
})

// ── normaliseValueType ────────────────────────────────────────────────────────

describe('normaliseValueType', () => {
  const cases: [string, string][] = [
    ['INTEGER', 'INTEGER'],
    ['integer', 'INTEGER'],
    ['int', 'INTEGER'],
    ['Number', 'NUMBER'],
    ['numeric', 'NUMBER'],
    ['float', 'NUMBER'],
    ['percentage', 'PERCENTAGE'],
    ['pct', 'PERCENTAGE'],
    ['text', 'TEXT'],
    ['TEXT', 'TEXT'],
    ['boolean', 'BOOLEAN'],
    ['bool', 'BOOLEAN'],
    ['yes_no', 'BOOLEAN'],
    ['date', 'DATE'],
    ['True Only', 'TRUE_ONLY'],
    ['', 'INTEGER'], // fallback
    ['unknowntype', 'INTEGER'], // fallback
    ['INTEGER_POSITIVE', 'INTEGER_POSITIVE'],
    ['positive_integer', 'INTEGER_POSITIVE'],
  ]

  it.each(cases)('normalises "%s" to "%s"', (input, expected) => {
    expect(normaliseValueType(input, 'INTEGER')).toBe(expected)
  })
})

// ── normaliseAggregationType ──────────────────────────────────────────────────

describe('normaliseAggregationType', () => {
  const cases: [string, string][] = [
    ['SUM', 'SUM'],
    ['sum', 'SUM'],
    ['AVERAGE', 'AVERAGE'],
    ['avg', 'AVERAGE'],
    ['count', 'COUNT'],
    ['COUNT', 'COUNT'],
    ['MIN', 'MIN'],
    ['MAX', 'MAX'],
    ['None', 'NONE'],
    ['', 'SUM'], // fallback
    ['unknownagg', 'SUM'], // fallback
  ]

  it.each(cases)('normalises "%s" to "%s"', (input, expected) => {
    expect(normaliseAggregationType(input, 'SUM')).toBe(expected)
  })
})

// ── normaliseDomainType ───────────────────────────────────────────────────────

describe('normaliseDomainType', () => {
  it('accepts AGGREGATE', () =>
    expect(normaliseDomainType('AGGREGATE', 'AGGREGATE')).toBe('AGGREGATE'))
  it('accepts TRACKER', () => expect(normaliseDomainType('TRACKER', 'AGGREGATE')).toBe('TRACKER'))
  it('accepts shorthand', () => expect(normaliseDomainType('agg', 'AGGREGATE')).toBe('AGGREGATE'))
  it('falls back on unknown', () =>
    expect(normaliseDomainType('unknown', 'AGGREGATE')).toBe('AGGREGATE'))
})

// ── looksLikeHeaderRow ────────────────────────────────────────────────────────

describe('looksLikeHeaderRow', () => {
  it('detects a proper header row', () => {
    expect(looksLikeHeaderRow(['Name', 'Short Name', 'Code', 'Value Type'])).toBe(true)
  })

  it('rejects a data row (no known headers)', () => {
    expect(looksLikeHeaderRow(['Malaria Cases', 'MAL', 'INTEGER'])).toBe(false)
  })

  it('requires at least a name-like column', () => {
    expect(looksLikeHeaderRow(['Value Type', 'Aggregation'])).toBe(false)
  })
})

// ── parsePasteText (full pipeline) ────────────────────────────────────────────

describe('parsePasteText', () => {
  describe('basic tab-delimited Excel paste', () => {
    const TEXT = `Name\tShort Name\tCode\tValue Type\tAggregation
Malaria Cases\tMalaria\tMALARIA_CASES\tInteger\tSum
ANC Visits\tANC\tANC_VISITS\tInteger\tCount`

    it('parses 2 rows', () => {
      const result = parsePasteText(TEXT)
      expect(result.rows).toHaveLength(2)
    })

    it('detects tab delimiter', () => {
      const result = parsePasteText(TEXT)
      expect(result.delimiter).toBe('\t')
    })

    it('detects header row', () => {
      const result = parsePasteText(TEXT)
      expect(result.hasHeaderRow).toBe(true)
    })

    it('correctly parses first row', () => {
      const result = parsePasteText(TEXT)
      const row = result.rows[0]
      expect(row.name).toBe('Malaria Cases')
      expect(row.shortName).toBe('Malaria')
      expect(row.code).toBe('MALARIA_CASES')
      expect(row.valueType).toBe('INTEGER')
      expect(row.aggregationType).toBe('SUM')
    })

    it('produces no errors for valid rows', () => {
      const result = parsePasteText(TEXT)
      expect(result.rows[0].errors).toHaveLength(0)
      expect(result.rows[1].errors).toHaveLength(0)
    })
  })

  describe('comma-delimited CSV', () => {
    const CSV = `Name,Code,Value Type
TB Cases,TB_CASES,Number
HIV Tests,HIV_TESTS,Percentage`

    it('detects comma delimiter', () => {
      expect(parsePasteText(CSV).delimiter).toBe(',')
    })

    it('parses all rows', () => {
      const result = parsePasteText(CSV)
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].valueType).toBe('NUMBER')
      expect(result.rows[1].valueType).toBe('PERCENTAGE')
    })
  })

  describe('no header row (positional mapping)', () => {
    const TEXT = `Malaria Cases\tMalaria\tMAL\tINTEGER\tSUM`

    it('maps columns positionally', () => {
      const result = parsePasteText(TEXT)
      expect(result.hasHeaderRow).toBe(false)
      expect(result.rows[0].name).toBe('Malaria Cases')
      expect(result.rows[0].shortName).toBe('Malaria')
      expect(result.rows[0].code).toBe('MAL')
      expect(result.rows[0].valueType).toBe('INTEGER')
      expect(result.rows[0].aggregationType).toBe('SUM')
    })
  })

  describe('auto-derivation', () => {
    it('derives shortName from name when missing', () => {
      const text = `Name\tCode\nMalaria Cases\tMAL`
      const result = parsePasteText(text)
      expect(result.rows[0].shortName).toBe('Malaria Cases')
    })

    it('derives code from name when missing', () => {
      const text = `Name\nMalaria Cases`
      const result = parsePasteText(text)
      expect(result.rows[0].code).toBe('MALARIA_CASES')
    })

    it('truncates shortName to 50 characters and adds a warning', () => {
      const longName = 'A'.repeat(60)
      const text = `Name\n${longName}`
      const result = parsePasteText(text)
      expect(result.rows[0].shortName).toHaveLength(50)
      expect(result.rows[0].warnings.length).toBeGreaterThan(0)
    })
  })

  describe('validation', () => {
    it('errors when name is missing', () => {
      const text = `Name\tCode\n\tMAL`
      const result = parsePasteText(text)
      expect(result.rows[0].errors.some((e) => e.includes('Name'))).toBe(true)
    })

    it('errors on duplicate code', () => {
      const text = `Name\tCode\nRow One\tDUP_CODE\nRow Two\tDUP_CODE`
      const result = parsePasteText(text)
      expect(result.rows[1].errors.some((e) => e.includes('Duplicate'))).toBe(true)
    })

    it('does not error on rows with unique codes', () => {
      const text = `Name\tCode\nRow One\tCODE_A\nRow Two\tCODE_B`
      const result = parsePasteText(text)
      expect(result.rows[0].errors).toHaveLength(0)
      expect(result.rows[1].errors).toHaveLength(0)
    })
  })

  describe('defaults', () => {
    it('applies global defaults when fields are missing', () => {
      const text = `Name\nMalaria Cases`
      const result = parsePasteText(text, {
        ...DEFAULT_PARSE_DEFAULTS,
        valueType: 'NUMBER',
        aggregationType: 'AVERAGE',
        domainType: 'TRACKER',
      })
      expect(result.rows[0].valueType).toBe('NUMBER')
      expect(result.rows[0].aggregationType).toBe('AVERAGE')
      expect(result.rows[0].domainType).toBe('TRACKER')
    })
  })

  describe('blank lines', () => {
    it('skips empty lines and counts them', () => {
      const text = `Name\tCode\n\nMalaria\tMAL\n\nTB Cases\tTB\n`
      const result = parsePasteText(text)
      expect(result.rows).toHaveLength(2)
      expect(result.skippedRows).toBeGreaterThan(0)
    })
  })

  describe('empty input', () => {
    it('returns empty result for empty string', () => {
      const result = parsePasteText('')
      expect(result.rows).toHaveLength(0)
      expect(result.headers).toHaveLength(0)
    })
  })

  describe('Windows line endings', () => {
    it('handles \\r\\n line endings', () => {
      const text = 'Name\tCode\r\nMalaria\tMAL\r\nTB Cases\tTB'
      const result = parsePasteText(text)
      expect(result.rows).toHaveLength(2)
      expect(result.rows[0].name).toBe('Malaria')
    })
  })

  describe('performance', () => {
    it('parses 100 rows in under 50ms', () => {
      const header = 'Name\tShort Name\tCode\tValue Type\tAggregation\n'
      const dataRows = Array.from(
        { length: 100 },
        (_, i) => `Data Element ${i + 1}\tDE${i + 1}\tDE_${i + 1}\tInteger\tSum`
      ).join('\n')
      const text = header + dataRows
      const start = performance.now()
      const result = parsePasteText(text)
      const elapsed = performance.now() - start
      expect(result.rows).toHaveLength(100)
      expect(elapsed).toBeLessThan(50)
    })
  })
})
