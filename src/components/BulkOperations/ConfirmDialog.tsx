// src/components/BulkOperations/ConfirmDialog.tsx
import { useEffect, useRef } from 'react'
import i18n from '@dhis2/d2-i18n'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  title: string
  message: string
  /**
   * Optional list of warning strings displayed between the message and buttons.
   * Use for non-blocking notices the user should acknowledge before confirming
   * (e.g. shortName truncation, irreversible side-effects).
   */
  warnings?: string[]
  onConfirm: () => void
  onCancel: () => void
  destructive?: boolean
}

/**
 * All focusable element selectors per WCAG 2.1 / ARIA best practices.
 */
const FOCUSABLE =
  'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'

export function ConfirmDialog({
  title,
  message,
  warnings,
  onConfirm,
  onCancel,
  destructive = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null)

  // ── Focus trap ────────────────────────────────────────────────────────────
  // Move focus into the dialog when it mounts, then keep it inside.
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return

    // Focus the first focusable element (Cancel button)
    const focusable = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
    if (focusable.length > 0) focusable[0].focus()

    const handleKeyDown = (e: KeyboardEvent) => {
      // Dismiss on Escape
      if (e.key === 'Escape') {
        e.preventDefault()
        onCancel()
        return
      }

      // Trap Tab / Shift+Tab inside the dialog
      if (e.key === 'Tab') {
        const live = Array.from(dialog.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (live.length === 0) return
        const first = live[0]
        const last = live[live.length - 1]

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault()
            last.focus()
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault()
            first.focus()
          }
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onCancel])

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      aria-describedby="confirm-message"
    >
      <div className={styles.dialog} ref={dialogRef} data-destructive={String(destructive)}>
        <h2 id="confirm-title" className={styles.title}>
          {title}
        </h2>

        <p id="confirm-message" className={styles.message}>
          {message}
        </p>

        {warnings && warnings.length > 0 && (
          <ul className={styles.warnings} aria-label={i18n.t('Warnings')}>
            {warnings.map((w, idx) => (
              <li key={idx} className={styles.warningItem}>
                {w}
              </li>
            ))}
          </ul>
        )}

        <div className={styles.actions}>
          <button type="button" className={styles.cancelBtn} onClick={onCancel}>
            {i18n.t('Cancel')}
          </button>
          <button
            type="button"
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
