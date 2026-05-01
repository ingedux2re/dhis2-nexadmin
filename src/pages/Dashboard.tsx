// src/pages/Dashboard.tsx — Competition version v3
// Competition-ready landing page: stronger hero, polished cards, no badges
import i18n from '@dhis2/d2-i18n'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroEyebrow}>
            <span className="material-icons-round" style={{ fontSize: 13 }}>
              bolt
            </span>
            {i18n.t('DHIS2 Administration Toolkit')}
          </div>
          <h1 className={styles.heroTitle}>
            {i18n.t('Meet')} <span className={styles.heroTitleAccent}>{i18n.t('NexAdmin')}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            {i18n.t(
              'What used to take your team days now takes seconds. Bulk operations, integrity scanning, and metadata engineering — purpose-built for DHIS2 at scale.'
            )}
          </p>
          <div className={styles.heroCtas}>
            <Link to="/data-elements" className={styles.heroPrimaryBtn}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>
                rocket_launch
              </span>
              {i18n.t('Get Started')}
            </Link>
            <Link to="/integrity" className={styles.heroSecondaryBtn}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>
                radar
              </span>
              {i18n.t('Run Integrity Scan')}
            </Link>
          </div>
        </div>
        <div className={styles.heroVisual} aria-hidden="true">
          <div className={styles.heroRingOuter} />
          <div className={styles.heroRingInner} />
          <div className={styles.heroIconGroup}>
            <span className="material-icons-round">data_object</span>
            <span className="material-icons-round">drive_file_rename_outline</span>
            <span className="material-icons-round">verified_user</span>
          </div>
        </div>
      </div>

      {/* ── 3 Feature cards ───────────────────────────────────── */}
      <section>
        <div className={styles.sectionHead}>
          <h2 className={styles.sectionTitle}>{i18n.t('Three Capabilities. One Tool.')}</h2>
          <p className={styles.sectionSub}>
            {i18n.t('Everything a DHIS2 administrator needs — no scripts, no CLI, no waiting.')}
          </p>
        </div>
        <div className={styles.featureGrid}>
          {/* Feature 1 — Data Element Engineering */}
          <Link to="/data-elements" className={`${styles.featureCard} ${styles.featureCardBrand}`}>
            <div className={styles.featureTop}>
              <div className={styles.featureIconWrap}>
                <span className="material-icons-round">data_object</span>
              </div>
              <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
            </div>
            <div className={styles.featureBody}>
              <div className={styles.featureTitle}>{i18n.t('Data Element Engineering')}</div>
              <p className={styles.featureDesc}>
                {i18n.t(
                  'Bulk-create dozens of data elements in seconds. Paste directly from Excel, auto-map columns, and assign to datasets — all in one workflow.'
                )}
              </p>
              <ul className={styles.featureList}>
                <li>
                  <span className="material-icons-round">table_view</span>
                  {i18n.t('Paste from Excel / CSV')}
                </li>
                <li>
                  <span className="material-icons-round">cloud_upload</span>
                  {i18n.t('Bulk create via DHIS2 metadata API')}
                </li>
                <li>
                  <span className="material-icons-round">drive_file_rename_outline</span>
                  {i18n.t('Rename elements within datasets')}
                </li>
              </ul>
            </div>
          </Link>

          {/* Feature 2 — Bulk Rename */}
          <Link to="/bulk/rename" className={`${styles.featureCard} ${styles.featureCardAccent}`}>
            <div className={styles.featureTop}>
              <div className={styles.featureIconWrap}>
                <span className="material-icons-round">drive_file_rename_outline</span>
              </div>
              <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
            </div>
            <div className={styles.featureBody}>
              <div className={styles.featureTitle}>{i18n.t('Bulk Rename')}</div>
              <p className={styles.featureDesc}>
                {i18n.t(
                  'Rename hundreds of org units at once. Find & Replace, Prefix, Suffix, or Regex — with live preview before any change is committed.'
                )}
              </p>
              <ul className={styles.featureList}>
                <li>
                  <span className="material-icons-round">find_replace</span>
                  {i18n.t('4 rename modes including Regex')}
                </li>
                <li>
                  <span className="material-icons-round">preview</span>
                  {i18n.t('Live preview — zero surprises')}
                </li>
                <li>
                  <span className="material-icons-round">undo</span>
                  {i18n.t('Auto-rollback on any failure')}
                </li>
              </ul>
            </div>
          </Link>

          {/* Feature 3 — Data Integrity */}
          <Link to="/integrity" className={`${styles.featureCard} ${styles.featureCardWarning}`}>
            <div className={styles.featureTop}>
              <div className={styles.featureIconWrap}>
                <span className="material-icons-round">verified_user</span>
              </div>
              <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
            </div>
            <div className={styles.featureBody}>
              <div className={styles.featureTitle}>{i18n.t('Data Integrity Scan')}</div>
              <p className={styles.featureDesc}>
                {i18n.t(
                  'One scan, three checks. Detect duplicate org units, hierarchy violations, and geo inconsistencies across your entire instance in seconds.'
                )}
              </p>
              <ul className={styles.featureList}>
                <li>
                  <span className="material-icons-round">content_copy</span>
                  {i18n.t('Fuzzy duplicate detection (Levenshtein)')}
                </li>
                <li>
                  <span className="material-icons-round">account_tree</span>
                  {i18n.t('Hierarchy validator — circular refs, orphans')}
                </li>
                <li>
                  <span className="material-icons-round">place</span>
                  {i18n.t('Geo consistency — boundaries & precision')}
                </li>
              </ul>
            </div>
          </Link>
        </div>
      </section>

      {/* ── Quick stat strip ──────────────────────────────────── */}
      <section className={styles.statStrip}>
        <div className={styles.statItem}>
          <div className={styles.statIconWrap} style={{ background: '#ede9fe', color: '#7c3aed' }}>
            <span className="material-icons-round">bolt</span>
          </div>
          <div className={styles.statText}>
            <strong>{i18n.t('Hours → Seconds')}</strong>
            <span>{i18n.t('Bulk metadata operations')}</span>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statIconWrap} style={{ background: '#fef9c3', color: '#b45309' }}>
            <span className="material-icons-round">undo</span>
          </div>
          <div className={styles.statText}>
            <strong>{i18n.t('Auto-Rollback')}</strong>
            <span>{i18n.t('Every destructive op is safe')}</span>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div className={styles.statIconWrap} style={{ background: '#fee2e2', color: '#b91c1c' }}>
            <span className="material-icons-round">radar</span>
          </div>
          <div className={styles.statText}>
            <strong>{i18n.t('3-in-1 Integrity Scan')}</strong>
            <span>{i18n.t('Duplicates · Hierarchy · Geo')}</span>
          </div>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <div
            className={styles.statIconWrap}
            style={{ background: 'var(--brand-100)', color: 'var(--brand-600)' }}
          >
            <span className="material-icons-round">table_view</span>
          </div>
          <div className={styles.statText}>
            <strong>{i18n.t('Excel-Native Import')}</strong>
            <span>{i18n.t('Paste directly from spreadsheets')}</span>
          </div>
        </div>
      </section>
    </div>
  )
}
