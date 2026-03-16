// src/pages/AuditLog.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const MOCK_ROWS = [
  { user: 'admin', action: 'UPDATE', resource: 'OrganisationUnit', time: '2026-03-16 09:14' },
  { user: 'john.doe', action: 'CREATE', resource: 'User', time: '2026-03-16 08:52' },
  { user: 'admin', action: 'DELETE', resource: 'OrganisationUnit', time: '2026-03-15 17:33' },
  { user: 'maria.garcia', action: 'UPDATE', resource: 'UserRole', time: '2026-03-15 16:11' },
  { user: 'admin', action: 'CREATE', resource: 'OrganisationUnit', time: '2026-03-15 14:05' },
]

const ACTION_COLOR: Record<string, string> = {
  CREATE: 'nx-chip-success',
  UPDATE: 'nx-chip-info',
  DELETE: 'nx-chip-danger',
}

export default function AuditLog() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="history"
        title={i18n.t('Audit Log')}
        description={i18n.t(
          'A full record of system changes, including who changed what and when. Useful for compliance and troubleshooting.'
        )}
        accentColor="info"
        badge={<span className="nx-chip nx-chip-info">{i18n.t('Coming soon')}</span>}
      />

      {/* Preview table */}
      <div className={styles.tablePlaceholder}>
        <div className={styles.tablePlaceholderHead}>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('User')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Action')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Resource')}</div>
          <div className={styles.tablePlaceholderHeadCell}>{i18n.t('Time')}</div>
        </div>
        {MOCK_ROWS.map((r, i) => (
          <div key={i} className={styles.tablePlaceholderRow}>
            <div style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)' }}>
              {r.user}
            </div>
            <div>
              <span className={`nx-chip ${ACTION_COLOR[r.action] ?? 'nx-chip-neutral'}`}>
                {r.action}
              </span>
            </div>
            <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
              {r.resource}
            </div>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {r.time}
            </div>
          </div>
        ))}
      </div>

      <div className={styles.comingSoon} style={{ padding: 'var(--space-8)' }}>
        <div className={styles.comingSoonIcon}>
          <span className="material-icons-round">history</span>
        </div>
        <p className={styles.comingSoonText}>
          {i18n.t('Full audit trail with filtering, search, and export will be available here.')}
        </p>
      </div>
    </div>
  )
}
