// src/pages/Dashboard.tsx — Competition version
// Clean, focused landing page for exactly 3 features
import i18n from '@dhis2/d2-i18n'
import { Link } from 'react-router-dom'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  return (
    <div className={styles.page}>
      {/* ── Hero ─────────────────────────────────────────────── */}
      <div className={styles.hero}>
        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            {i18n.t('Welcome to')}{' '}
            <span className={styles.heroTitleAccent}>{i18n.t('NexAdmin')}</span>
          </h1>
          <p className={styles.heroSubtitle}>
            {i18n.t(
              'The administration toolkit DHIS2 was missing. Bulk operations, data integrity, and metadata engineering — all in one place.'
            )}
          </p>
        </div>
        <div className={styles.heroIllustration} aria-hidden="true">
          <div className={styles.heroOrb} />
          <div className={styles.heroOrb2} />
          <span
            className="material-icons-round"
            style={{ fontSize: 80, color: 'rgba(255,255,255,0.15)', position: 'relative' }}
          >
            data_object
          </span>
        </div>
      </div>

      {/* ── 3 Feature cards ───────────────────────────────────── */}
      <section>
        <h2 className={styles.sectionTitle}>{i18n.t('Core Features')}</h2>
        <div className={styles.featureGrid}>
          {/* Feature 1 */}
          <Link to="/data-elements" className={`${styles.featureCard} ${styles.featureCardGreen}`}>
            <div className={styles.featureIconWrap}>
              <span className="material-icons-round">data_object</span>
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
            <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
          </Link>

          {/* Feature 2 */}
          <Link to="/bulk/rename" className={`${styles.featureCard} ${styles.featureCardAccent}`}>
            <div className={styles.featureIconWrap}>
              <span className="material-icons-round">drive_file_rename_outline</span>
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
                  {i18n.t('Live preview panel — zero surprises')}
                </li>
                <li>
                  <span className="material-icons-round">undo</span>
                  {i18n.t('Auto-rollback on any failure')}
                </li>
              </ul>
            </div>
            <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
          </Link>

          {/* Feature 3 */}
          <Link to="/integrity" className={`${styles.featureCard} ${styles.featureCardWarning}`}>
            <div className={styles.featureIconWrap}>
              <span className="material-icons-round">verified_user</span>
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
            <span className={`material-icons-round ${styles.featureArrow}`}>arrow_forward</span>
          </Link>
        </div>
      </section>

      {/* ── Quick stat strip ──────────────────────────────────── */}
      <section className={styles.statStrip}>
        <div className={styles.statItem}>
          <span className="material-icons-round">bolt</span>
          <strong>{i18n.t('Hours → Seconds')}</strong>
          <span>{i18n.t('Bulk metadata operations')}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className="material-icons-round">undo</span>
          <strong>{i18n.t('Auto-Rollback')}</strong>
          <span>{i18n.t('Every destructive op is safe')}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className="material-icons-round">radar</span>
          <strong>{i18n.t('3-in-1 Integrity Scan')}</strong>
          <span>{i18n.t('Duplicates · Hierarchy · Geo')}</span>
        </div>
        <div className={styles.statDivider} />
        <div className={styles.statItem}>
          <span className="material-icons-round">table_view</span>
          <strong>{i18n.t('Excel-Native Import')}</strong>
          <span>{i18n.t('Paste directly from spreadsheets')}</span>
        </div>
      </section>
    </div>
  )
}
