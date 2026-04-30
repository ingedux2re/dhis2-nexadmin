// src/pages/DataIntegrity.tsx — Competition version v2
// One scan → three checks. Unified integrity page with improved UX:
// - Animated scan button with live count during fetch
// - Score ring showing overall health %
// - Tighter summary bar with color-coded cells
// - Tab badges: green ✓ / red count / amber count
// ─────────────────────────────────────────────────────────────────────────────

import { useState } from 'react'
import { Button } from '@dhis2/ui'
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import { DuplicateTable } from '../components/DataIntegrity/DuplicateTable'
import { HierarchyReport } from '../components/DataIntegrity/HierarchyReport'
import { GeoConsistencyList } from '../components/DataIntegrity/GeoConsistencyList'
import { useDuplicateDetector } from '../hooks/useDuplicateDetector'
import { useHierarchyValidator } from '../hooks/useHierarchyValidator'
import { useGeoConsistency } from '../hooks/useGeoConsistency'
import { useIntegrityData } from '../hooks/useIntegrityData'
import styles from './DataIntegrityPage.module.css'

type ActiveTab = 'duplicates' | 'hierarchy' | 'geo'

export default function DataIntegrity() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('duplicates')
  const { orgUnits, loading, error, run } = useIntegrityData()

  // All three algorithms run client-side on the same shared dataset
  const pairs = useDuplicateDetector(orgUnits)
  const violations = useHierarchyValidator(orgUnits)
  const geoIssues = useGeoConsistency(orgUnits)

  const hasResults = orgUnits.length > 0
  const totalIssues = pairs.length + violations.length + geoIssues.length
  const isClean = hasResults && totalIssues === 0

  // Health score: 0–100 where 100 = no issues
  const healthScore = hasResults
    ? Math.max(0, Math.round(100 - (totalIssues / Math.max(orgUnits.length, 1)) * 100))
    : null

  // ── Error count helpers ───────────────────────────────────────────────────
  const dupErrors = pairs.filter((p) => p.severity === 'error').length
  const vioErrors = violations.filter((v) => v.severity === 'error').length
  const geoErrors = geoIssues.filter((g) => g.severity === 'error').length

  // ── Tab badge renderer ────────────────────────────────────────────────────
  function tabBadge(count: number, errorCount: number) {
    if (!hasResults) return null
    if (count === 0) return <span className={styles.badgeClean}>✓</span>
    if (errorCount > 0) return <span className={styles.badgeError}>{count}</span>
    return <span className={styles.badgeWarn}>{count}</span>
  }

  return (
    <div className={styles.page}>
      {/* ── Page header ──────────────────────────────────────── */}
      <PageHeader
        icon="verified_user"
        title={i18n.t('Data Integrity Scan')}
        description={i18n.t(
          'One scan — three checks. Duplicates · Hierarchy violations · Geo inconsistencies — all detected in one pass across your entire DHIS2 instance.'
        )}
        accentColor="warning"
        badge={
          isClean ? (
            <span className="nx-chip nx-chip-success">
              <span className="material-icons-round" style={{ fontSize: 13 }}>
                check_circle
              </span>
              {i18n.t('All clean')}
            </span>
          ) : hasResults && totalIssues > 0 ? (
            <span className="nx-chip nx-chip-danger">
              <span className="material-icons-round" style={{ fontSize: 13 }}>
                warning
              </span>
              {totalIssues} {i18n.t('issues found')}
            </span>
          ) : undefined
        }
        actions={
          <Button primary onClick={run} disabled={loading}>
            <span
              className="material-icons-round"
              style={{ fontSize: 18, marginRight: 6, verticalAlign: 'middle' }}
            >
              {loading ? 'hourglass_empty' : 'radar'}
            </span>
            {loading
              ? i18n.t('Scanning {{n}} org units…', { n: orgUnits.length || '…' })
              : hasResults
                ? i18n.t('Re-scan')
                : i18n.t('Run Full Scan')}
          </Button>
        }
      />

      {/* ── Scan summary bar ─────────────────────────────────── */}
      {hasResults && (
        <div className={styles.summaryBar}>
          {/* Health score ring */}
          <div className={styles.scoreBlock}>
            <div
              className={styles.scoreRing}
              style={{
                background: `conic-gradient(
                  ${isClean ? 'var(--color-success-solid)' : totalIssues > 10 ? 'var(--color-danger-solid)' : '#f59e0b'} ${healthScore}%,
                  var(--grey-200) 0
                )`,
              }}
            >
              <div className={styles.scoreInner}>
                <span className={styles.scoreValue}>{healthScore}</span>
                <span className={styles.scoreLabel}>{i18n.t('score')}</span>
              </div>
            </div>
          </div>

          <div className={styles.summaryDivider} />

          {/* Issue counts */}
          <div className={styles.summaryItems}>
            <div
              className={`${styles.summaryItem} ${pairs.length > 0 ? styles.summaryItemWarn : styles.summaryItemOk}`}
            >
              <span className="material-icons-round">content_copy</span>
              <div className={styles.summaryItemText}>
                <strong>{pairs.length}</strong>
                <span>{i18n.t('duplicate pairs')}</span>
              </div>
            </div>

            <div
              className={`${styles.summaryItem} ${violations.length > 0 ? (vioErrors > 0 ? styles.summaryItemError : styles.summaryItemWarn) : styles.summaryItemOk}`}
            >
              <span className="material-icons-round">account_tree</span>
              <div className={styles.summaryItemText}>
                <strong>{violations.length}</strong>
                <span>{i18n.t('hierarchy violations')}</span>
              </div>
            </div>

            <div
              className={`${styles.summaryItem} ${geoIssues.length > 0 ? (geoErrors > 0 ? styles.summaryItemError : styles.summaryItemWarn) : styles.summaryItemOk}`}
            >
              <span className="material-icons-round">place</span>
              <div className={styles.summaryItemText}>
                <strong>{geoIssues.length}</strong>
                <span>{i18n.t('geo issues')}</span>
              </div>
            </div>

            <div className={styles.summaryItem}>
              <span className="material-icons-round">corporate_fare</span>
              <div className={styles.summaryItemText}>
                <strong>{orgUnits.length.toLocaleString()}</strong>
                <span>{i18n.t('org units scanned')}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab switcher ─────────────────────────────────────── */}
      {hasResults && (
        <div className={styles.tabBar} role="tablist">
          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'duplicates'}
            className={`${styles.tab} ${activeTab === 'duplicates' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('duplicates')}
          >
            <span className="material-icons-round" style={{ fontSize: 16 }}>
              content_copy
            </span>
            {i18n.t('Duplicates')}
            {tabBadge(pairs.length, dupErrors)}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'hierarchy'}
            className={`${styles.tab} ${activeTab === 'hierarchy' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('hierarchy')}
          >
            <span className="material-icons-round" style={{ fontSize: 16 }}>
              account_tree
            </span>
            {i18n.t('Hierarchy')}
            {tabBadge(violations.length, vioErrors)}
          </button>

          <button
            type="button"
            role="tab"
            aria-selected={activeTab === 'geo'}
            className={`${styles.tab} ${activeTab === 'geo' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('geo')}
          >
            <span className="material-icons-round" style={{ fontSize: 16 }}>
              place
            </span>
            {i18n.t('Geo Consistency')}
            {tabBadge(geoIssues.length, geoErrors)}
          </button>
        </div>
      )}

      {/* ── Scan prompt state ─────────────────────────────────── */}
      {!hasResults && !loading && !error && (
        <div className={styles.promptState}>
          <div className={styles.promptIcon}>
            <span className="material-icons-round">radar</span>
          </div>
          <h2 className={styles.promptTitle}>{i18n.t('Ready to scan')}</h2>
          <p className={styles.promptText}>
            {i18n.t(
              'Click "Run Full Scan" to fetch all org units and run three integrity checks in one pass — no manual configuration required.'
            )}
          </p>
          <div className={styles.checksGrid}>
            <div className={styles.checkItem}>
              <div
                className={styles.checkItemIcon}
                style={{ background: '#fef9c3', color: '#b45309' }}
              >
                <span className="material-icons-round">content_copy</span>
              </div>
              <strong>{i18n.t('Duplicate Detector')}</strong>
              <p>{i18n.t('Exact + fuzzy name matching with Levenshtein distance scoring')}</p>
            </div>
            <div className={styles.checkItem}>
              <div
                className={styles.checkItemIcon}
                style={{ background: '#fee2e2', color: '#b91c1c' }}
              >
                <span className="material-icons-round">account_tree</span>
              </div>
              <strong>{i18n.t('Hierarchy Validator')}</strong>
              <p>{i18n.t('Missing parents, orphaned units, level gaps, circular references')}</p>
            </div>
            <div className={styles.checkItem}>
              <div
                className={styles.checkItemIcon}
                style={{ background: '#dbeafe', color: '#1d4ed8' }}
              >
                <span className="material-icons-round">place</span>
              </div>
              <strong>{i18n.t('Geo Consistency')}</strong>
              <p>{i18n.t('Missing coordinates, out-of-boundary points, low decimal precision')}</p>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab content ──────────────────────────────────────── */}
      {(hasResults || loading || error !== undefined) && (
        <div className={styles.tabContent} role="tabpanel">
          {activeTab === 'duplicates' && (
            <DuplicateTable pairs={pairs} loading={loading} error={error} />
          )}
          {activeTab === 'hierarchy' && (
            <HierarchyReport violations={violations} loading={loading} error={error} />
          )}
          {activeTab === 'geo' && (
            <GeoConsistencyList issues={geoIssues} loading={loading} error={error} />
          )}
        </div>
      )}
    </div>
  )
}
