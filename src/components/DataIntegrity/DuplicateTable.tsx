import type React from 'react'
import { useState, useCallback } from 'react'
import i18n from '@dhis2/d2-i18n'
import {
  DataTable,
  DataTableHead,
  DataTableBody,
  DataTableRow,
  DataTableColumnHeader,
  DataTableCell,
  CircularLoader,
  Button,
  Tag,
} from '@dhis2/ui'
import { SeverityBadge } from './SeverityBadge'
import { exportCsv } from '../../utils/exportCsv'
import type { DuplicatePair } from '../../hooks/useDuplicateDetector'
import styles from './DuplicateTable.module.css'

interface DuplicateTableProps {
  pairs: DuplicatePair[]
  loading: boolean
  error: Error | undefined
}

function MatchTypeBadge({ type }: { type: 'exact' | 'fuzzy' }) {
  return type === 'exact' ? (
    <Tag negative>{i18n.t('Exact Match')}</Tag>
  ) : (
    <Tag>{i18n.t('Fuzzy Match')}</Tag>
  )
}

function handleExport(pairs: DuplicatePair[]) {
  const headers = [
    i18n.t('Org Unit A'),
    i18n.t('Parent A'),
    i18n.t('Org Unit B'),
    i18n.t('Parent B'),
    i18n.t('Level'),
    i18n.t('Match Type'),
    i18n.t('Similarity Score'),
    i18n.t('Severity'),
  ]
  const rows = pairs.map((p) => [
    p.nameA,
    p.parentA ?? '',
    p.nameB,
    p.parentB ?? '',
    p.level,
    p.matchType === 'exact' ? i18n.t('Exact Match') : i18n.t('Fuzzy Match'),
    `${p.similarity}%`,
    p.severity === 'error'
      ? i18n.t('High')
      : p.severity === 'warning'
        ? i18n.t('Medium')
        : i18n.t('Low'),
  ])
  exportCsv('duplicates.csv', headers, rows)
}

// ── Copy-ID button with transient "Copied!" feedback ─────────────────────────
function CopyIdButton({ id, name }: { id: string; name: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = useCallback(() => {
    navigator.clipboard
      .writeText(id)
      .then(() => {
        setCopied(true)
        setTimeout(() => setCopied(false), 1800)
      })
      .catch(() => {
        /* ignore */
      })
  }, [id])

  return (
    <Button small secondary onClick={handleCopy} title={i18n.t('Copy UID for {{name}}', { name })}>
      <span
        className="material-icons-round"
        style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }}
      >
        {copied ? 'check' : 'content_copy'}
      </span>
      {copied ? i18n.t('Copied!') : i18n.t('Copy ID')}
    </Button>
  )
}

// ── View-in-DHIS2 link — plain <a> so the browser resolves the URL natively.
// baseUrl from useConfig() is always '..', which makes window.open build a
// broken relative path. A native <a href> is also never blocked by popup blockers.
function ViewOrgUnitButton({ id, name }: { id: string; name: string }) {
  // Compute the absolute DHIS2 URL once on render.
  // Dev: app=:3000, DHIS2 proxy=:8080 → swap port.
  // Production: both share the same origin, port is empty.
  const { protocol, hostname, port } = window.location
  const dhis2Port = port === '3000' ? '8080' : port
  const origin = `${protocol}//${hostname}${dhis2Port ? `:${dhis2Port}` : ''}`
  const href = `${origin}/dhis-web-maintenance/index.html#/edit/organisationUnitSection/organisationUnit/${id}`

  // Use a plain <a> with a full http:// href — React Router / HashRouter only
  // intercepts relative paths and hash-only links, never absolute http URLs.
  // target="_blank" without noopener/noreferrer avoids popup-blocker issues.
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      title={i18n.t('Open {{name}} in Maintenance app', { name })}
      className={styles.viewLink}
    >
      <span
        className="material-icons-round"
        style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }}
      >
        open_in_new
      </span>
      {i18n.t('View in DHIS2')}
    </a>
  )
}

export const DuplicateTable: React.FC<DuplicateTableProps> = ({ pairs, loading, error }) => {
  if (loading) {
    return (
      <div className={styles.center}>
        <CircularLoader small />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {i18n.t('Something went wrong')}: {error.message}
      </div>
    )
  }

  if (pairs.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>content_copy</div>
        <p>{i18n.t('No duplicates found — system is clean')}</p>
      </div>
    )
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.toolbar}>
        <span className={styles.count}>
          {i18n.t('{{count}} duplicates found', { count: pairs.length })}
        </span>
        <Button secondary small onClick={() => handleExport(pairs)}>
          {i18n.t('Export CSV')}
        </Button>
      </div>

      <DataTable>
        <DataTableHead>
          <DataTableRow>
            <DataTableColumnHeader>{i18n.t('Org Unit A')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Parent A')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Org Unit B')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Parent B')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Level')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Match Type')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Similarity')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Severity')}</DataTableColumnHeader>
            <DataTableColumnHeader>{i18n.t('Actions')}</DataTableColumnHeader>
          </DataTableRow>
        </DataTableHead>
        <DataTableBody>
          {pairs.map((pair) => (
            <DataTableRow key={pair.id}>
              <DataTableCell>
                <span className={styles.unitName}>{pair.nameA}</span>
                <span className={styles.unitId}>{pair.idA}</span>
              </DataTableCell>
              <DataTableCell>
                <span className={styles.parentName}>{pair.parentA ?? '—'}</span>
              </DataTableCell>
              <DataTableCell>
                <span className={styles.unitName}>{pair.nameB}</span>
                <span className={styles.unitId}>{pair.idB}</span>
              </DataTableCell>
              <DataTableCell>
                <span className={styles.parentName}>{pair.parentB ?? '—'}</span>
              </DataTableCell>
              <DataTableCell>{pair.level}</DataTableCell>
              <DataTableCell>
                <MatchTypeBadge type={pair.matchType} />
              </DataTableCell>
              <DataTableCell>
                <span className={styles.similarity}>{pair.similarity}%</span>
              </DataTableCell>
              <DataTableCell>
                <SeverityBadge severity={pair.severity} />
              </DataTableCell>
              <DataTableCell>
                <div className={styles.actions}>
                  <CopyIdButton id={pair.idA} name={pair.nameA} />
                  <ViewOrgUnitButton id={pair.idA} name={pair.nameA} />
                </div>
              </DataTableCell>
            </DataTableRow>
          ))}
        </DataTableBody>
      </DataTable>
    </div>
  )
}

export default DuplicateTable
