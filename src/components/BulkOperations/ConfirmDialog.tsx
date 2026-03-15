import i18n from '@dhis2/d2-i18n'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

export function ConfirmDialog({
  title,
  message,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
      <div className={styles.dialog}>
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onCancel}>
            {i18n.t('Cancel')}
          </button>
          <button
            className={destructive ? styles.destructiveBtn : styles.confirmBtn}
            onClick={onConfirm}
          >
            {i18n.t('Confirm')}
          </button>
        </div>
      </div>
    </div>
  )
}
