// src/pages/Notifications.tsx
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../components/shared/PageHeader'
import styles from './StubPage.module.css'

const MOCK_NOTIFICATIONS = [
  {
    icon: 'check_circle',
    color: 'success',
    title: 'Bulk Rename completed',
    body: '1,204 org units were successfully renamed.',
    time: '2 hours ago',
  },
  {
    icon: 'warning_amber',
    color: 'warning',
    title: 'Hierarchy validation found issues',
    body: '14 org units have missing parent assignments.',
    time: '5 hours ago',
  },
  {
    icon: 'info',
    color: 'info',
    title: 'System update scheduled',
    body: 'DHIS2 will be updated to version 2.43 on March 20.',
    time: '1 day ago',
  },
  {
    icon: 'error',
    color: 'danger',
    title: 'Bulk Reorganise failed',
    body: 'Operation failed after 23 moves. Rolled back successfully.',
    time: '2 days ago',
  },
]

const ICON_COLOR: Record<string, string> = {
  success: 'var(--color-success-text)',
  warning: 'var(--color-warning-text)',
  info: 'var(--color-info-text)',
  danger: 'var(--color-danger-text)',
}

export default function Notifications() {
  return (
    <div className={styles.page}>
      <PageHeader
        icon="notifications"
        title={i18n.t('Notifications')}
        description={i18n.t(
          'System alerts, operation results, and important messages about your DHIS2 instance.'
        )}
        accentColor="info"
        badge={<span className="nx-chip nx-chip-neutral">{i18n.t('4 unread')}</span>}
      />

      <div className={styles.tablePlaceholder}>
        {MOCK_NOTIFICATIONS.map((n, i) => (
          <div
            key={i}
            className={styles.tablePlaceholderRow}
            style={{
              gridTemplateColumns: 'auto 1fr auto',
              gap: 'var(--space-4)',
              padding: 'var(--space-4)',
            }}
          >
            <span
              className="material-icons-round"
              style={{ color: ICON_COLOR[n.color], fontSize: 22 }}
            >
              {n.icon}
            </span>
            <div>
              <div
                style={{
                  fontSize: 'var(--text-sm)',
                  fontWeight: 'var(--weight-semibold)',
                  marginBottom: 2,
                }}
              >
                {n.title}
              </div>
              <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                {n.body}
              </div>
            </div>
            <div
              style={{
                fontSize: 'var(--text-xs)',
                color: 'var(--text-tertiary)',
                whiteSpace: 'nowrap',
                fontFamily: 'var(--font-mono)',
              }}
            >
              {n.time}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
