// src/pages/BulkRename.tsx
import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { BulkRenameTable } from '../components/BulkOperations/BulkRenameTable'
import type { RenamePreview } from '../components/BulkOperations/BulkRenameTable'
import { ConfirmDialog } from '../components/BulkOperations/ConfirmDialog'
import { ProgressBar } from '../components/BulkOperations/ProgressBar'
import { useBulkRename } from '../hooks/useBulkRename'
import type { OrgUnitListItem } from '../types/orgUnit'
import styles from './BulkOperations.module.css'

const ORG_UNITS_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: ['id', 'name', 'shortName', 'level', 'path', 'parent[id,name]'],
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
  const { state, requestConfirm, cancelConfirm, execute, reset } = useBulkRename()

  const orgUnits: OrgUnitListItem[] = data?.orgUnits?.organisationUnits ?? []

  const handleConfirmPreviews = useCallback(
    (previews: RenamePreview[]) => {
      requestConfirm(previews)
    },
    [requestConfirm]
  )

  const handleConfirm = useCallback(() => {
    if (state.previews.length > 0) {
      execute(state.previews)
    }
  }, [state.previews, execute])

  const isRunning = state.status === 'running'
  const isDone = state.status === 'done'
  const isError = state.status === 'error'
  const isDisabled = isRunning || isDone

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>{i18n.t('Bulk Rename')}</h1>
        <p className={styles.description}>
          {i18n.t(
            'Apply find-replace, prefix, suffix, or regex rules to rename org units in bulk.'
          )}
        </p>
      </div>

      {loading && <p className={styles.loading}>{i18n.t('Loading org units…')}</p>}
      {error && (
        <p className={styles.error}>
          {i18n.t('Failed to load org units. {{message}}', { message: error.message })}
        </p>
      )}

      {!loading && !error && (
        <BulkRenameTable
          orgUnits={orgUnits}
          onConfirm={handleConfirmPreviews}
          disabled={isDisabled}
        />
      )}

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
          <p>{i18n.t('Operation failed. {{n}} renames rolled back.', { n: state.rolledBack })}</p>
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

      {state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Confirm Bulk Rename')}
          message={i18n.t(
            'This will rename {{count}} org units. This cannot be undone without a snapshot.',
            { count: state.previews.length }
          )}
          warnings={
            state.longNameWarnings.length > 0
              ? [
                  i18n.t(
                    '{{n}} org unit name(s) exceed 50 characters. Their shortName will be automatically truncated: {{names}}',
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
