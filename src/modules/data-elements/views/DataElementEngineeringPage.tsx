// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/views/DataElementEngineeringPage.tsx
//
// Entry point for the Data Element Engineering module.
// Two tabs:
//   Tab 1 — Bulk Create Data Elements
//   Tab 2 — Rename Data Elements in Dataset
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useEffect } from 'react'
import i18n from '@dhis2/d2-i18n'
import { PageHeader } from '../../../components/shared/PageHeader'
import { ConfirmDialog } from '../../../components/BulkOperations/ConfirmDialog'
import { ProgressBar } from '../../../components/BulkOperations/ProgressBar'
import { BulkCreateGrid } from '../components/BulkCreateGrid'
import { RenameDatasetTable } from '../components/RenameDatasetTable'
import { useSupportingMetadata } from '../hooks/useSupportingMetadata'
import { useBulkCreateElements } from '../hooks/useBulkCreateElements'
import { useDatasetElements } from '../hooks/useDatasetElements'
import { useBulkRenameElements } from '../hooks/useBulkRenameElements'
import type { DataElement, RenameRule } from '../types'
import { collectImportErrors } from '../services/metadataService'
import styles from './DataElementEngineeringPage.module.css'

// ── Tab identifiers ───────────────────────────────────────────────────────────

type ActiveTab = 'create' | 'rename'

// ── Component ─────────────────────────────────────────────────────────────────

export default function DataElementEngineeringPage() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('create')

  // ── Supporting metadata (shared by both tabs) ─────────────────────────────
  const meta = useSupportingMetadata()

  // Load supporting metadata once on mount
  useEffect(() => {
    meta.load()
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Tab 1: Bulk Create ────────────────────────────────────────────────────
  const create = useBulkCreateElements()

  const handleCreateConfirm = useCallback(async () => {
    await create.execute()
  }, [create])

  const isCreating = create.state.status === 'running'
  const createDone = create.state.status === 'done'
  const createError = create.state.status === 'error'

  const createErrors = createError
    ? create.state.errors
    : createDone && create.state.result
      ? collectImportErrors(create.state.result)
      : []

  // ── Tab 2: Rename in Dataset ──────────────────────────────────────────────
  const ds = useDatasetElements()
  const renameEl = useBulkRenameElements()

  const handleRequestRenameConfirm = useCallback(
    (elements: DataElement[], selectedIds: Set<string>, rules: RenameRule[]) => {
      renameEl.requestConfirm(elements, selectedIds, rules)
    },
    [renameEl]
  )

  const handleRenameConfirm = useCallback(async () => {
    await renameEl.execute(renameEl.state.previews)
  }, [renameEl])

  const isRenaming = renameEl.state.status === 'running'
  const renameDone = renameEl.state.status === 'done'
  const renameError = renameEl.state.status === 'error'

  // ── Tab switch: lazy-load elements on first switch to rename tab ──────────
  const handleTabChange = useCallback((tab: ActiveTab) => {
    setActiveTab(tab)
  }, [])

  // ── Page-level badges ─────────────────────────────────────────────────────
  const pageBadge =
    createDone && create.state.result ? (
      <span className="nx-chip nx-chip-success">
        {i18n.t('{{n}} created', { n: create.state.result.stats.created })}
      </span>
    ) : renameDone && renameEl.state.totalRenamed > 0 ? (
      <span className="nx-chip nx-chip-success">
        {i18n.t('{{n}} renamed', { n: renameEl.state.totalRenamed })}
      </span>
    ) : undefined

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className={styles.page}>
      {/* ── Page header ──────────────────────────────────────────── */}
      <PageHeader
        icon="data_object"
        title={i18n.t('Data Element Engineering')}
        description={i18n.t(
          'Bulk create data elements and rename them within datasets — turning hours of manual work into minutes.'
        )}
        accentColor="success"
        badge={pageBadge}
      />

      {/* ── Tab switcher ─────────────────────────────────────────── */}
      <div className={styles.tabBar} role="tablist">
        <button
          role="tab"
          aria-selected={activeTab === 'create'}
          className={`${styles.tab} ${activeTab === 'create' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('create')}
        >
          <span className="material-icons-round" style={{ fontSize: 17 }}>
            add_circle_outline
          </span>
          {i18n.t('Bulk Create')}
          {create.state.rows.length > 0 && create.state.rows[0].name !== '' && (
            <span className="nx-chip nx-chip-neutral" style={{ marginLeft: 4 }}>
              {create.state.rows.length}
            </span>
          )}
        </button>

        <button
          role="tab"
          aria-selected={activeTab === 'rename'}
          className={`${styles.tab} ${activeTab === 'rename' ? styles.tabActive : ''}`}
          onClick={() => handleTabChange('rename')}
        >
          <span className="material-icons-round" style={{ fontSize: 17 }}>
            drive_file_rename_outline
          </span>
          {i18n.t('Rename in Dataset')}
          {renameEl.state.totalRenamed > 0 && (
            <span className="nx-chip nx-chip-success" style={{ marginLeft: 4 }}>
              {renameEl.state.totalRenamed}
            </span>
          )}
        </button>
      </div>

      {/* ══════════════════════════════════════════════════════════
          TAB 1 — Bulk Create
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'create' && (
        <div className={styles.tabContent} role="tabpanel">
          {/* ── Progress bar ─────────────────────────────────────── */}
          {isCreating && (
            <ProgressBar percent={50} label={i18n.t('Submitting data elements to DHIS2…')} />
          )}

          {/* ── Success banner ───────────────────────────────────── */}
          {createDone && create.state.result && (
            <div className={styles.successBanner}>
              <span className="material-icons-round">check_circle</span>
              <div>
                <strong>
                  {i18n.t('{{n}} data element{{s}} created successfully', {
                    n: create.state.result.stats.created,
                    s: create.state.result.stats.created === 1 ? '' : 's',
                  })}
                </strong>
                {create.state.result.stats.ignored > 0 && (
                  <div className={styles.bannerSub}>
                    {i18n.t('{{n}} ignored (may already exist or have validation errors)', {
                      n: create.state.result.stats.ignored,
                    })}
                  </div>
                )}
              </div>
              <button
                className={`nx-btn nx-btn-secondary nx-btn-sm`}
                onClick={create.reset}
                style={{ marginLeft: 'auto' }}
              >
                {i18n.t('Create more')}
              </button>
            </div>
          )}

          {/* ── Error banner ─────────────────────────────────────── */}
          {createError && (
            <div className={styles.errorBanner}>
              <span className="material-icons-round">error_outline</span>
              <div>
                <strong>{i18n.t('Creation failed')}</strong>
                {createErrors.slice(0, 3).map((e, i) => (
                  <div key={i} className={styles.bannerSub}>
                    {e}
                  </div>
                ))}
                {createErrors.length > 3 && (
                  <div className={styles.bannerSub}>
                    {i18n.t('…and {{n}} more errors', { n: createErrors.length - 3 })}
                  </div>
                )}
              </div>
              <button
                className={`nx-btn nx-btn-secondary nx-btn-sm`}
                onClick={create.reset}
                style={{ marginLeft: 'auto' }}
              >
                {i18n.t('Reset')}
              </button>
            </div>
          )}

          {/* ── Grid + submit button ─────────────────────────────── */}
          {!createDone && (
            <>
              <BulkCreateGrid
                rows={create.state.rows}
                template={create.state.template}
                categoryCombos={meta.categoryCombos}
                optionSets={meta.optionSets}
                onUpdateCell={create.updateCell}
                onUpdateTemplate={create.updateTemplateField}
                onAdd={create.addRow}
                onDuplicate={create.duplicateRow}
                onDelete={create.deleteRow}
                disabled={isCreating}
              />

              {/* ── Submit bar ───────────────────────────────────── */}
              <div className={styles.submitBar}>
                <span className={styles.submitHint}>
                  {i18n.t(
                    'Review all rows before submitting. Creation cannot be undone from this tool.'
                  )}
                </span>
                <button
                  className={`nx-btn nx-btn-primary`}
                  onClick={create.validateAndConfirm}
                  disabled={isCreating || create.state.rows.every((r) => !r.name)}
                >
                  <span className="material-icons-round" style={{ fontSize: 17 }}>
                    cloud_upload
                  </span>
                  {i18n.t('Create {{n}} data element{{s}}', {
                    n: create.state.rows.filter((r) => r.name).length,
                    s: create.state.rows.filter((r) => r.name).length === 1 ? '' : 's',
                  })}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          TAB 2 — Rename in Dataset
      ══════════════════════════════════════════════════════════ */}
      {activeTab === 'rename' && (
        <div className={styles.tabContentFull} role="tabpanel">
          {/* ── Progress bar ─────────────────────────────────────── */}
          {isRenaming && (
            <ProgressBar
              percent={renameEl.state.progress}
              label={i18n.t('Renaming data elements…')}
              completed={renameEl.state.completed}
              total={renameEl.state.total}
            />
          )}

          {/* ── Success banner ───────────────────────────────────── */}
          {renameDone && (
            <div className={styles.successBanner}>
              <span className="material-icons-round">check_circle</span>
              <div>
                <strong>
                  {i18n.t('{{n}} data element{{s}} renamed successfully', {
                    n: renameEl.state.completed,
                    s: renameEl.state.completed === 1 ? '' : 's',
                  })}
                </strong>
              </div>
              <button
                className={`nx-btn nx-btn-secondary nx-btn-sm`}
                onClick={renameEl.continueRenaming}
                style={{ marginLeft: 'auto' }}
              >
                {i18n.t('Rename more')}
              </button>
            </div>
          )}

          {/* ── Error banner ─────────────────────────────────────── */}
          {renameError && (
            <div className={styles.errorBanner}>
              <span className="material-icons-round">error_outline</span>
              <div>
                <strong>
                  {i18n.t('Rename failed — {{n}} element{{s}} rolled back', {
                    n: renameEl.state.rolledBack,
                    s: renameEl.state.rolledBack === 1 ? '' : 's',
                  })}
                </strong>
                {renameEl.state.errors.slice(0, 3).map((e, i) => (
                  <div key={i} className={styles.bannerSub}>
                    {e}
                  </div>
                ))}
              </div>
              <button
                className={`nx-btn nx-btn-secondary nx-btn-sm`}
                onClick={renameEl.reset}
                style={{ marginLeft: 'auto' }}
              >
                {i18n.t('Reset')}
              </button>
            </div>
          )}

          {/* ── Rename table ─────────────────────────────────────── */}
          <RenameDatasetTable
            dataSets={meta.dataSets}
            elements={ds.elements}
            dataSetName={ds.dataSetName}
            loadingDataSets={meta.loading}
            loadingElements={ds.loading}
            errorElements={ds.error}
            onSelectDataset={ds.fetchForDataset}
            onRequestConfirm={handleRequestRenameConfirm}
            disabled={isRenaming || renameDone || renameError}
            completedCount={renameEl.state.totalRenamed}
          />
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          Confirm dialogs (both tabs)
      ══════════════════════════════════════════════════════════ */}

      {/* Create confirm */}
      {create.state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Create {{n}} data element{{s}}?', {
            n: create.state.rows.filter((r) => r.name).length,
            s: create.state.rows.filter((r) => r.name).length === 1 ? '' : 's',
          })}
          message={i18n.t(
            'This will create {{n}} new data element{{s}} in DHIS2. Data elements created here will be immediately visible in the Maintenance app and any datasets you assign them to.',
            {
              n: create.state.rows.filter((r) => r.name).length,
              s: create.state.rows.filter((r) => r.name).length === 1 ? '' : 's',
            }
          )}
          onConfirm={handleCreateConfirm}
          onCancel={create.cancelConfirm}
        />
      )}

      {/* Rename confirm */}
      {renameEl.state.status === 'confirming' && (
        <ConfirmDialog
          title={i18n.t('Rename {{n}} data element{{s}}?', {
            n: renameEl.state.previews.length,
            s: renameEl.state.previews.length === 1 ? '' : 's',
          })}
          message={i18n.t(
            'This will rename {{n}} data element{{s}} globally across all datasets and reports in DHIS2. This action cannot be undone from this tool.',
            {
              n: renameEl.state.previews.length,
              s: renameEl.state.previews.length === 1 ? '' : 's',
            }
          )}
          warnings={
            renameEl.state.shortNameWarnings.length > 0
              ? renameEl.state.shortNameWarnings.map((w) =>
                  i18n.t(
                    '"{{name}}" is {{len}} characters — short name will be truncated to 50 characters: "{{short}}"',
                    { name: w.newName, len: w.newNameLength, short: w.truncatedShortName }
                  )
                )
              : undefined
          }
          onConfirm={handleRenameConfirm}
          onCancel={renameEl.cancelConfirm}
          destructive
        />
      )}
    </div>
  )
}
