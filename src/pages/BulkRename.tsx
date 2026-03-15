import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { BulkRenameTable } from '../components/BulkOperations/BulkRenameTable'
import { ConfirmDialog } from '../components/BulkOperations/ConfirmDialog'
import { ProgressBar } from '../components/BulkOperations/ProgressBar'
import { useBulkRename } from '../hooks/useBulkRename'
import type { OrgUnitListItem } from '../types/orgUnit'
import type { RenameMode } from '../hooks/useBulkRename'
import styles from './BulkOperations.module.css'

const BULK_RENAME_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: ['id', 'name', 'shortName', 'level', 'path', 'parent[id,name]'],
      paging: false,
    },
  },
}

interface QueryResult {
  orgUnits: { organisationUnits: OrgUnitListItem[] }
}

export default function BulkRename() {
  const { data, loading, error } = useDataQuery<QueryResult>(BULK_RENAME_QUERY)
  const { state, preview, requestConfirm, cancelConfirm, execute, reset } = useBulkRename()

  const orgUnits: OrgUnitListItem[] = data?.orgUnits?.organisationUnits ?? []

  const handlePreview = useCallback(
    (ous: OrgUnitListItem[], mode: RenameMode, find: string, replace: string) => {
      preview(ous, mode, find, replace)
    },
    [preview]
  )

  const handleConfirm = useCallback(() => {
    execute(state.previews)
  }, [execute, state.previews])

  const isRunning = state.status === 'running'
  const isDone = state.status === 'done'
  const isError = state.status === 'error'

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{i18n.t('Bulk Rename')}</h1>
        <p className={styles.description}>
          {i18n.t(
            'Find and replace, add prefix/suffix, or apply a regex to rename org units in bulk.'
          )}
        </p>
      </div>

      {loading && <p className={styles.loading}>{i18n.t('Loading org units…')}</p>}
      {error && (
        <p className={styles.error}>
          {i18n.t('Failed to load org units: {{message}}', { message: error.message })}
        </p>
      )}

      {!loading && !error && (
        <>
          <BulkRenameTable
            orgUnits={orgUnits}
            previews={state.previews}
            onPreview={handlePreview}
            onConfirm={requestConfirm}
            disabled={isRunning}
          />

          {isRunning && (
            <ProgressBar
              percent={state.progress}
              label={i18n.t('Renaming {{count}} org units…', { count: state.total })}
              completed={state.completed}
              total={state.total}
            />
          )}

          {isDone && (
            <div className={styles.successBanner}>
              <span>
                {i18n.t('All {{count}} org units renamed successfully.', { count: state.total })}
              </span>
              <button className={styles.resetBtn} onClick={reset}>
                {i18n.t('New Operation')}
              </button>
            </div>
          )}

          {isError && (
            <div className={styles.errorBanner}>
              <p>
                {i18n.t('Rename failed. {{n}} errors encountered.', { n: state.errors.length })}
              </p>
              {state.errors.map((e, idx) => (
                <p key={idx} className={styles.errorItem}>
                  {e}
                </p>
              ))}
              <button className={styles.resetBtn} onClick={reset}>
                {i18n.t('Try Again')}
              </button>
            </div>
          )}
        </>
      )}

      {state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Confirm Bulk Rename')}
          message={i18n.t(
            'This will rename {{count}} org units. This cannot be undone without a snapshot.',
            { count: state.previews.length }
          )}
          onConfirm={handleConfirm}
          onCancel={cancelConfirm}
          destructive
        />
      )}
    </div>
  )
}
