// src/pages/BulkReorganise.tsx
import { useState, useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { BulkReorganiseBoard } from '../components/BulkOperations/BulkReorganiseBoard'
import { ConfirmDialog } from '../components/BulkOperations/ConfirmDialog'
import { ProgressBar } from '../components/BulkOperations/ProgressBar'
import { useBulkMove } from '../hooks/useBulkMove'
import { PageHeader } from '../components/shared/PageHeader'
import type { OrgUnitListItem } from '../types/orgUnit'
import type { MoveOperation } from '../hooks/useBulkMove'
import styles from './BulkOperations.module.css'

const BULK_MOVE_QUERY = {
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

export default function BulkReorganise() {
  const { data, loading, error } = useDataQuery<QueryResult>(BULK_MOVE_QUERY)
  const { state, requestConfirm, cancelConfirm, execute, reset } = useBulkMove()
  const [pendingOps, setPendingOps] = useState<MoveOperation[]>([])

  const orgUnits: OrgUnitListItem[] = data?.orgUnits?.organisationUnits ?? []

  const handleRequestExecute = useCallback(
    (ops: MoveOperation[]) => {
      setPendingOps(ops)
      requestConfirm(ops)
    },
    [requestConfirm]
  )

  const handleConfirm = useCallback(() => {
    execute(pendingOps)
  }, [pendingOps, execute])

  const isRunning = state.status === 'running'
  const isDone = state.status === 'done'
  const isError = state.status === 'error'

  return (
    <div className={styles.pageFull}>
      <PageHeader
        icon="low_priority"
        title={i18n.t('Bulk Reorganise')}
        description={i18n.t('Select org units and assign them a new parent to move them in bulk.')}
        accentColor="accent"
        badge={
          isDone && state.total > 0 ? (
            <span className="nx-chip nx-chip-success">
              {state.total} {i18n.t('moved')}
            </span>
          ) : undefined
        }
      />

      {loading && <p className={styles.loading}>{i18n.t('Loading org units…')}</p>}
      {error && (
        <p className={styles.error}>
          {i18n.t('Failed to load org units. {{message}}', { message: error.message })}
        </p>
      )}

      {!loading && !error && (
        <BulkReorganiseBoard orgUnits={orgUnits} onRequestExecute={handleRequestExecute} />
      )}

      {isRunning && (
        <ProgressBar
          percent={state.progress}
          label={i18n.t('Moving {{count}} org units…', { count: state.total })}
          completed={state.completed}
          total={state.total}
        />
      )}

      {isDone && (
        <div className={styles.successBanner}>
          <span>
            {i18n.t('All {{count}} org units moved successfully.', { count: state.total })}
          </span>
          <button type="button" className={styles.resetBtn} onClick={reset}>
            {i18n.t('New Operation')}
          </button>
        </div>
      )}

      {isError && (
        <div className={styles.errorBanner}>
          <p>{i18n.t('Operation failed. {{n}} moves rolled back.', { n: state.rolledBack })}</p>
          {state.errors.map((e, idx) => (
            <p key={idx} className={styles.errorItem}>
              {e}
            </p>
          ))}
          {state.rollbackErrors.length > 0 && (
            <>
              <p className={styles.rollbackWarning}>
                {i18n.t(
                  '⚠ {{n}} unit(s) could not be rolled back and may be in an inconsistent state. Review manually.',
                  { n: state.rollbackErrors.length }
                )}
              </p>
              {state.rollbackErrors.map((e, idx) => (
                <p key={`rb-${idx}`} className={styles.errorItem}>
                  {e}
                </p>
              ))}
            </>
          )}
          <button type="button" className={styles.resetBtn} onClick={reset}>
            {i18n.t('Try Again')}
          </button>
        </div>
      )}

      {state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Confirm Bulk Move')}
          message={i18n.t(
            'This will move {{count}} org units. This cannot be undone without a snapshot.',
            { count: pendingOps.length }
          )}
          onConfirm={handleConfirm}
          onCancel={cancelConfirm}
          destructive
        />
      )}
    </div>
  )
}
