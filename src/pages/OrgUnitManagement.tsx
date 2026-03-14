// src/pages/OrgUnitManagement.tsx
import { useState, useCallback } from 'react'
import { Button, IconAdd24, NoticeBox } from '@dhis2/ui'
import { useOrgUnits } from '../hooks/useOrgUnits'
import { useCreateOrgUnit, useUpdateOrgUnit, useDeleteOrgUnit } from '../hooks/useOrgUnitMutations'
import {
  OrgUnitList,
  OrgUnitSearch,
  OrgUnitPagination,
  OrgUnitForm,
  OrgUnitDeleteDialog,
} from '../components/OrgUnit'
import type {
  OrgUnitListItem,
  OrgUnitCreatePayload,
  OrgUnitUpdatePayload, // [2] OrgUnitPatchPayload n'existe pas → OrgUnitUpdatePayload
  OrgUnitsQueryParams,
} from '../types/orgUnit'
import i18n from '../i18n'
import styles from './OrgUnitManagement.module.css'

const DEFAULT_PARAMS: OrgUnitsQueryParams = {
  page: 1,
  pageSize: 50,
  order: 'name:asc',
}

// [1] fonction normale au lieu de React.FC — React n'est pas importé
export default function OrgUnitManagement() {
  const [params, setParams] = useState<OrgUnitsQueryParams>(DEFAULT_PARAMS)
  const { orgUnits, pager, loading, error, refetch } = useOrgUnits(params)

  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState<OrgUnitListItem | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<OrgUnitListItem | null>(null)

  // [3] renommer loading/error pour éviter les collisions
  const { create, loading: isCreating, error: createError } = useCreateOrgUnit()
  const { update, loading: isUpdating, error: updateError } = useUpdateOrgUnit()
  const { remove, loading: isDeleting, error: deleteError } = useDeleteOrgUnit()

  // ── param helpers ────────────────────────────────────────────────────────────
  const updateParams = useCallback(
    (patch: Partial<OrgUnitsQueryParams>) => {
      const next = { ...params, ...patch }
      setParams(next)
      refetch(next)
    },
    [params, refetch]
  )

  const handleSearch = useCallback(
    (query: string) => updateParams({ query: query || undefined, page: 1 }),
    [updateParams]
  )
  const handlePageChange = useCallback((page: number) => updateParams({ page }), [updateParams])
  const handlePageSizeChange = useCallback(
    (pageSize: number) => updateParams({ pageSize, page: 1 }),
    [updateParams]
  )

  // ── form helpers ─────────────────────────────────────────────────────────────
  const openCreate = () => {
    setEditTarget(null)
    setFormOpen(true)
  }
  const openEdit = (ou: OrgUnitListItem) => {
    setEditTarget(ou)
    setFormOpen(true)
  }
  const closeForm = () => {
    setFormOpen(false)
    setEditTarget(null)
  }

  const handleSave = async (
    payload: OrgUnitCreatePayload | OrgUnitUpdatePayload // [2] type aligné
  ) => {
    try {
      if (editTarget) {
        await update(editTarget.id, payload as OrgUnitUpdatePayload)
      } else {
        await create(payload as OrgUnitCreatePayload)
      }
      closeForm()
      refetch(params)
    } catch {
      // l'erreur est affichée dans OrgUnitForm via la prop error
    }
  }

  // ── delete helpers ───────────────────────────────────────────────────────────
  const openDelete = (ou: OrgUnitListItem) => setDeleteTarget(ou)
  const closeDelete = () => setDeleteTarget(null)
  const handleDelete = async () => {
    if (!deleteTarget) return
    try {
      await remove(deleteTarget.id)
      closeDelete()
      refetch(params)
    } catch {
      // 409 Conflict affiché dans OrgUnitDeleteDialog
    }
  }

  // ── render ───────────────────────────────────────────────────────────────────
  return (
    <div className={styles.page} data-test="orgunit-management-page">
      {/* header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{i18n.t('Organisation Units')}</h1>
          {pager?.total !== undefined && (
            <span className={styles.subtitle}>
              {i18n.t('{{total}} total', { total: pager.total })}
            </span>
          )}
        </div>
        <Button primary icon={<IconAdd24 />} onClick={openCreate} dataTest="create-orgunit-btn">
          {i18n.t('Add organisation unit')}
        </Button>
      </div>

      {/* toolbar */}
      <div className={styles.toolbar}>
        <OrgUnitSearch value={params.query ?? ''} onChange={handleSearch} disabled={loading} />
      </div>

      {/* error banner */}
      {error && !loading && (
        <NoticeBox error title={i18n.t('Error loading organisation units')}>
          {error.message}
        </NoticeBox>
      )}

      {/* list */}
      <OrgUnitList
        orgUnits={orgUnits}
        loading={loading}
        error={null} // erreur réseau déjà affichée dans le banner ci-dessus
        onEdit={openEdit}
        onDelete={openDelete}
      />

      {/* pagination — [4] rendu conditionnel quand pager existe */}
      {pager && (
        <div className={styles.paginationRow}>
          <OrgUnitPagination
            pager={pager}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </div>
      )}

      {/* form modal — [5] prop unit (pas orgUnit) + [6] .message sur FetchError */}
      {formOpen && (
        <OrgUnitForm
          unit={editTarget}
          saving={isCreating || isUpdating}
          error={editTarget ? (updateError?.message ?? null) : (createError?.message ?? null)}
          onSave={handleSave}
          onClose={closeForm}
        />
      )}

      {/* delete dialog — [6] .message sur FetchError */}
      {deleteTarget && (
        <OrgUnitDeleteDialog
          orgUnit={deleteTarget}
          deleting={isDeleting}
          error={deleteError?.message ?? null}
          onConfirm={handleDelete}
          onClose={closeDelete}
        />
      )}
    </div>
  )
}
