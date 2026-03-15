/**
 * Exports an array of rows as a UTF-8 CSV file download.
 *
 * @param filename  The suggested filename (e.g. "duplicates.csv")
 * @param headers   Translated column headers (pass i18n.t('…') values here)
 * @param rows      Data rows; each cell can be a string, number, or undefined
 */
export function exportCsv(
  filename: string,
  headers: string[],
  rows: (string | number | undefined)[][]
): void {
  const escapeCell = (value: string | number | undefined): string => {
    if (value === undefined || value === null) return ''
    const s = String(value)
    if (s.includes(',') || s.includes('"') || s.includes('\n') || s.includes('\r')) {
      return `"${s.replace(/"/g, '""')}"`
    }
    return s
  }

  const lines: string[] = [
    headers.map(escapeCell).join(','),
    ...rows.map((row) => row.map(escapeCell).join(',')),
  ]

  const csv = lines.join('\n')
  const BOM = '\uFEFF' // UTF-8 BOM — ensures Excel opens accented characters correctly
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  document.body.appendChild(anchor)
  anchor.click()
  document.body.removeChild(anchor)
  URL.revokeObjectURL(url)
}
