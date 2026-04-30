// src/pages/BulkRename.tsx — Competition version
// UX improvements: status bar at top, compact loading, clear visual hierarchy
import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { BulkRenameTable } from '../components/BulkOperations/BulkRenameTable'
import type { RenamePreview } from '../components/BulkOperations/BulkRenameTable'
import { ConfirmDialog } from '../components/BulkOperations/ConfirmDialog'
import { ProgressBar } from '../components/BulkOperations/ProgressBar'
import { useBulkRename } from '../hooks/useBulkRename'
import { PageHeader } from '../components/shared/PageHeader'
import type { OrgUnitListItem } from '../types/orgUnit'
import styles from './BulkOperations.module.css'

const ORG_UNITS_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: ['id', 'name', 'shortName', 'level', 'path', 'parent[id,name]', 'ancestors[id,name]'],
      paging: true,
      pageSize: 10000,
    },
  },
}

interface QueryResult {
  orgUnits: { organisationUnits: OrgUnitListItem[] }
}

export default function BulkRename() {
  const { data, loading, error } = useDataQuery<QueryResult>(ORG_UNITS_QUERY)
  const { state, requestConfirm, cancelConfirm, execute, continueRenaming, reset } = useBulkRename()

  const orgUnits: OrgUnitListItem[] = data?.orgUnits?.organisationUnits ?? []
  const totalLoaded = orgUnits.length

  const handleConfirmPreviews = useCallback(
    (previews: RenamePreview[]) => requestConfirm(previews),
    [requestConfirm]
  )

  const handleConfirm = useCallback(() => {
    if (state.previews.length > 0) execute(state.previews)
  }, [state.previews, execute])

  const isRunning = state.status === 'running'
  const isDone = state.status === 'done'
  const isError = state.status === 'error'

  return (
    <div className={styles.pageScroll}>
      {/* ── Page Header ─────────────────────────────────────────── */}
      <PageHeader
        icon="drive_file_rename_outline"
        title={i18n.t('Bulk Rename')}
        description={i18n.t(
          'Select org units, choose a rename rule, preview changes live — then apply in one click. Auto-rollback on any failure.'
        )}
        accentColor="accent"
        badge={
          isDone && state.totalRenamed > 0 ? (
            <span className="nx-chip nx-chip-success">
              <span className="material-icons-round" style={{ fontSize: 13 }}>
                check_circle
              </span>
              {state.totalRenamed} {i18n.t('renamed this session')}
            </span>
          ) : loading ? (
            <span className="nx-chip nx-chip-neutral">{i18n.t('Loading org units…')}</span>
          ) : !loading && !error ? (
            <span className="nx-chip nx-chip-brand">
              {totalLoaded.toLocaleString()} {i18n.t('org units loaded')}
            </span>
          ) : undefined
        }
      />

      {/* ── Error loading data ───────────────────────────────────── */}
      {error && (
        <div className={styles.error}>
          <span
            className="material-icons-round"
            style={{ fontSize: 18, marginRight: 8, verticalAlign: 'middle' }}
          >
            error_outline
          </span>
          {i18n.t('Failed to load org units: {{message}}', { message: error.message })}
        </div>
      )}

      {/* ── Running progress ─────────────────────────────────────── */}
      {isRunning && (
        <ProgressBar
          percent={state.progress}
          label={i18n.t('Renaming {{count}} org units…', { count: state.total })}
          completed={state.completed}
          total={state.total}
        />
      )}

      {/* ── Success banner ───────────────────────────────────────── */}
      {isDone && (
        <div className={styles.successBanner}>
          <span className="material-icons-round" style={{ fontSize: 18 }}>
            check_circle
          </span>
          <span>
            {i18n.t('{{count}} org units renamed successfully.', { count: state.totalRenamed })}
          </span>
          <button type="button" className={styles.resetBtn} onClick={continueRenaming}>
            {i18n.t('Continue Renaming')}
          </button>
          <button type="button" className={styles.resetBtn} onClick={reset}>
            {i18n.t('New Session')}
          </button>
        </div>
      )}

      {/* ── Error banner ─────────────────────────────────────────── */}
      {isError && (
        <div className={styles.errorBanner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 600 }}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>
              undo
            </span>
            {i18n.t('Operation failed — {{n}} rename(s) rolled back automatically.', {
              n: state.rolledBack,
            })}
          </div>
          {state.errors.map((e, idx) => (
            <p key={idx} className={styles.errorItem}>
              {e}
            </p>
          ))}
          <button type="button" className={styles.resetBtn} onClick={reset}>
            {i18n.t('Try Again')}
          </button>
        </div>
      )}

      {/* ── Main table ───────────────────────────────────────────── */}
      {!loading && !error && (
        <BulkRenameTable
          orgUnits={orgUnits}
          onConfirm={handleConfirmPreviews}
          disabled={isRunning}
          completedCount={state.totalRenamed}
        />
      )}

      {/* ── Confirm modal ────────────────────────────────────────── */}
      {state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Confirm Rename')}
          message={i18n.t(
            'This will rename {{count}} org unit(s). The operation includes automatic rollback — if any rename fails, all completed renames in this batch are reversed.',
            { count: state.previews.length }
          )}
          warnings={
            state.longNameWarnings.length > 0
              ? [
                  i18n.t(
                    '{{n}} name(s) exceed 50 characters. Their shortName will be auto-truncated: {{names}}',
                    {
                      n: state.longNameWarnings.length,
                      names: state.longNameWarnings.map((w) => w.name).join(', '),
                    }
                  ),
                ]
              : undefined
          }
          onConfirm={handleConfirm}
          onCancel={cancelConfirm}
          destructive
        />
      )}
    </div>
  )
}
