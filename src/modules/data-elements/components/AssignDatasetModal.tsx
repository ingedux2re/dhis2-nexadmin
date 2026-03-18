// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/components/AssignDatasetModal.tsx
//
// Post-creation guided workflow: assign newly created data elements to a
// dataset immediately after bulk creation succeeds.
//
// Wizard steps:
//   Step 1 (decision)       — Choose: assign existing | create new | skip
//   Step 2A (selectDatasets)— Pick one or more existing datasets + element scope
//   Step 2B (createDataset) — Fill in new dataset form + element scope
//   Step 3 (confirming)     — Review summary before applying
//   running / done / error  — Feedback states
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo } from 'react'
import type { ChangeEvent } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { MetaRef } from '../types'
import type { AssignMode, CreatedElement, NewDataSetForm } from '../hooks/useAssignDataset'
import { PERIOD_TYPES } from '../hooks/useAssignDataset'
import type { useAssignDataset } from '../hooks/useAssignDataset'
import styles from './AssignDatasetModal.module.css'

// ── Props ─────────────────────────────────────────────────────────────────────

interface AssignDatasetModalProps {
  /** The hook instance created in the parent */
  hook: ReturnType<typeof useAssignDataset>
  /** All data elements that were just created */
  createdElements: CreatedElement[]
  /** Category combos for the new-dataset form */
  categoryCombos: MetaRef[]
  onClose: () => void
}

// ── Step labels ───────────────────────────────────────────────────────────────

const STEP_DEFS: { mode: AssignMode; label: string }[] = [
  { mode: 'decision', label: 'Choose action' },
  { mode: 'selectDatasets', label: 'Select datasets' },
  { mode: 'createDataset', label: 'New dataset' },
  { mode: 'confirming', label: 'Confirm' },
]

const STEP_DEFS_CREATE: { mode: AssignMode; label: string }[] = [
  { mode: 'decision', label: 'Choose action' },
  { mode: 'createDataset', label: 'New dataset' },
  { mode: 'confirming', label: 'Confirm' },
]

function getStepIndex(steps: typeof STEP_DEFS, mode: AssignMode): number {
  const idx = steps.findIndex((s) => s.mode === mode)
  return idx === -1 ? 0 : idx
}

// ── Sub-component: Step 1 — Decision ─────────────────────────────────────────

interface DecisionStepProps {
  onAssignExisting: () => void
  onCreateNew: () => void
  onSkip: () => void
  createdCount: number
}

function DecisionStep({ onAssignExisting, onCreateNew, onSkip, createdCount }: DecisionStepProps) {
  return (
    <div className={styles.body}>
      <div style={{ textAlign: 'center', padding: 'var(--space-2) 0 var(--space-4)' }}>
        <div
          style={{
            fontSize: 'var(--text-2xl, 24px)',
            fontWeight: 'var(--weight-bold)',
            color: 'var(--text-primary)',
            marginBottom: 'var(--space-2)',
          }}
        >
          {i18n.t('{{n}} data element{{s}} created!', {
            n: createdCount,
            s: createdCount === 1 ? '' : 's',
          })}
        </div>
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
          {i18n.t('Would you like to assign them to a dataset now?')}
        </div>
      </div>

      <div className={styles.decisionGrid}>
        {/* Option A — assign to existing */}
        <button type="button" className={styles.decisionCard} onClick={onAssignExisting}>
          <div className={styles.decisionIcon}>
            <span className="material-icons-round">playlist_add</span>
          </div>
          <div className={styles.decisionTitle}>{i18n.t('Add to existing dataset')}</div>
          <div className={styles.decisionHint}>
            {i18n.t('Pick one or more datasets already in DHIS2 and append these elements.')}
          </div>
        </button>

        {/* Option B — create new dataset */}
        <button type="button" className={styles.decisionCard} onClick={onCreateNew}>
          <div className={styles.decisionIcon}>
            <span className="material-icons-round">create_new_folder</span>
          </div>
          <div className={styles.decisionTitle}>{i18n.t('Create a new dataset')}</div>
          <div className={styles.decisionHint}>
            {i18n.t('Define a brand-new dataset and include these elements immediately.')}
          </div>
        </button>

        {/* Option C — skip */}
        <button type="button" className={`${styles.decisionCard} ${styles.skip}`} onClick={onSkip}>
          <div className={`${styles.decisionIcon}`}>
            <span className="material-icons-round">skip_next</span>
          </div>
          <div className={styles.decisionTitle}>{i18n.t('Do nothing for now')}</div>
          <div className={styles.decisionHint}>
            {i18n.t('Close this dialog — you can assign elements later from the Maintenance app.')}
          </div>
        </button>
      </div>
    </div>
  )
}

// ── Sub-component: Element scope selector (reused by both paths) ──────────────

interface ElementScopeProps {
  createdElements: CreatedElement[]
  assignAll: boolean
  selectedElementIds: string[]
  onSetAssignAll: (v: boolean) => void
  onToggleElement: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onDeselectAll: () => void
}

function ElementScope({
  createdElements,
  assignAll,
  selectedElementIds,
  onSetAssignAll,
  onToggleElement,
  onSelectAll,
  onDeselectAll,
}: ElementScopeProps) {
  return (
    <div className={styles.card}>
      <div className={styles.cardHeader}>
        <span className="material-icons-round" style={{ fontSize: 15, color: 'var(--brand-600)' }}>
          checklist
        </span>
        <span className={styles.cardTitle}>{i18n.t('Elements to assign')}</span>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.toggleRow}>
          <button
            type="button"
            className={`${styles.toggleBtn} ${assignAll ? styles.active : ''}`}
            onClick={() => onSetAssignAll(true)}
          >
            <span className="material-icons-round" style={{ fontSize: 13 }}>
              select_all
            </span>
            {i18n.t('All {{n}} elements', { n: createdElements.length })}
          </button>
          <button
            type="button"
            className={`${styles.toggleBtn} ${!assignAll ? styles.active : ''}`}
            onClick={() => onSetAssignAll(false)}
          >
            <span className="material-icons-round" style={{ fontSize: 13 }}>
              checklist
            </span>
            {i18n.t('Select specific elements')}
          </button>
        </div>

        {!assignAll && (
          <>
            <div className={styles.selectAllRow}>
              <span>
                {i18n.t('{{n}} of {{total}} selected', {
                  n: selectedElementIds.length,
                  total: createdElements.length,
                })}
              </span>
              <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => onSelectAll(createdElements.map((e) => e.id))}
                >
                  {i18n.t('Select all')}
                </button>
                <button type="button" className={styles.linkBtn} onClick={onDeselectAll}>
                  {i18n.t('Clear')}
                </button>
              </div>
            </div>
            <div className={styles.elementList}>
              {createdElements.map((el) => {
                const checked = selectedElementIds.includes(el.id)
                const elId = `el-scope-${el.id}`
                return (
                  <label
                    key={el.id}
                    htmlFor={elId}
                    className={`${styles.elementItem} ${checked ? styles.selected : ''}`}
                  >
                    <input
                      id={elId}
                      type="checkbox"
                      className={styles.elementCheckbox}
                      checked={checked}
                      onChange={() => onToggleElement(el.id)}
                      aria-label={i18n.t('Select {{name}}', { name: el.name })}
                    />
                    <span className={styles.elementName}>{el.name}</span>
                  </label>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-component: Step 2A — Select Existing Datasets ────────────────────────

interface SelectDatasetsStepProps {
  datasets: ReturnType<typeof useAssignDataset>['state']['allDataSets']
  loading: boolean
  loadError: string | null
  selectedIds: string[]
  createdElements: CreatedElement[]
  assignAll: boolean
  selectedElementIds: string[]
  onToggle: (id: string) => void
  onSetAssignAll: (v: boolean) => void
  onToggleElement: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onDeselectAll: () => void
}

function SelectDatasetsStep({
  datasets,
  loading,
  loadError,
  selectedIds,
  createdElements,
  assignAll,
  selectedElementIds,
  onToggle,
  onSetAssignAll,
  onToggleElement,
  onSelectAll,
  onDeselectAll,
}: SelectDatasetsStepProps) {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim()
    if (!q) return datasets
    return datasets.filter((d) => d.displayName.toLowerCase().includes(q))
  }, [datasets, query])

  return (
    <div className={styles.body}>
      {/* Dataset picker */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            storage
          </span>
          <span className={styles.cardTitle}>{i18n.t('Target dataset(s)')}</span>
          {selectedIds.length > 0 && (
            <span className={styles.selectedBadge}>
              {i18n.t('{{n}} selected', { n: selectedIds.length })}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          {loading && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} style={{ width: 20, height: 20, borderWidth: 2 }} />
              {i18n.t('Loading datasets…')}
            </div>
          )}
          {loadError && !loading && (
            <div className={styles.errorState}>
              <span className="material-icons-round" style={{ fontSize: 16 }}>
                error_outline
              </span>
              {loadError}
            </div>
          )}
          {!loading && !loadError && (
            <>
              <div className={styles.searchBox}>
                <span className="material-icons-round">search</span>
                <input
                  className={styles.searchInput}
                  placeholder={i18n.t('Search datasets…')}
                  value={query}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)}
                  aria-label={i18n.t('Search datasets')}
                />
                {query && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                    }}
                    onClick={() => setQuery('')}
                    aria-label={i18n.t('Clear search')}
                  >
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      close
                    </span>
                  </button>
                )}
              </div>

              <div className={styles.datasetList}>
                {filtered.length === 0 ? (
                  <div className={styles.emptySearch}>
                    {i18n.t('No datasets match "{{q}}"', { q: query })}
                  </div>
                ) : (
                  filtered.map((ds) => {
                    const checked = selectedIds.includes(ds.id)
                    const dsId = `ds-select-${ds.id}`
                    return (
                      <label
                        key={ds.id}
                        htmlFor={dsId}
                        className={`${styles.datasetItem} ${checked ? styles.selected : ''}`}
                      >
                        <input
                          id={dsId}
                          type="checkbox"
                          className={styles.datasetCheckbox}
                          checked={checked}
                          onChange={() => onToggle(ds.id)}
                          aria-label={i18n.t('Select {{name}}', { name: ds.displayName })}
                        />
                        <span className={styles.datasetName}>{ds.displayName}</span>
                        {ds.dataSetElementCount !== undefined && (
                          <span className={styles.datasetMeta}>
                            {i18n.t('{{n}} elements', { n: ds.dataSetElementCount })}
                          </span>
                        )}
                      </label>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Element scope */}
      <ElementScope
        createdElements={createdElements}
        assignAll={assignAll}
        selectedElementIds={selectedElementIds}
        onSetAssignAll={onSetAssignAll}
        onToggleElement={onToggleElement}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
    </div>
  )
}

// ── Sub-component: Step 2B — Create New Dataset ───────────────────────────────

interface CreateDatasetStepProps {
  form: NewDataSetForm
  formErrors: Partial<Record<keyof NewDataSetForm, string>>
  categoryCombos: MetaRef[]
  createdElements: CreatedElement[]
  assignAll: boolean
  selectedElementIds: string[]
  onUpdateForm: (field: keyof NewDataSetForm, value: string) => void
  onSetAssignAll: (v: boolean) => void
  onToggleElement: (id: string) => void
  onSelectAll: (ids: string[]) => void
  onDeselectAll: () => void
}

function CreateDatasetStep({
  form,
  formErrors,
  categoryCombos,
  createdElements,
  assignAll,
  selectedElementIds,
  onUpdateForm,
  onSetAssignAll,
  onToggleElement,
  onSelectAll,
  onDeselectAll,
}: CreateDatasetStepProps) {
  return (
    <div className={styles.body}>
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            create_new_folder
          </span>
          <span className={styles.cardTitle}>{i18n.t('New dataset details')}</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGrid}>
            {/* Name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {i18n.t('Name')}
                <span className={styles.req}>*</span>
              </label>
              <input
                className={`${styles.formInput} ${formErrors.name ? styles.hasError : ''}`}
                type="text"
                value={form.name}
                onChange={(e) => onUpdateForm('name', e.target.value)}
                placeholder={i18n.t('e.g. Malaria Indicators 2024')}
                aria-label={i18n.t('Dataset name')}
                maxLength={230}
              />
              {formErrors.name && <span className={styles.formError}>{formErrors.name}</span>}
            </div>

            {/* Short name */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>
                {i18n.t('Short name')}
                <span className={styles.req}>*</span>
              </label>
              <input
                className={`${styles.formInput} ${formErrors.shortName ? styles.hasError : ''}`}
                type="text"
                value={form.shortName}
                onChange={(e) => onUpdateForm('shortName', e.target.value)}
                placeholder={i18n.t('e.g. Malaria 2024')}
                aria-label={i18n.t('Dataset short name')}
                maxLength={50}
              />
              {formErrors.shortName && (
                <span className={styles.formError}>{formErrors.shortName}</span>
              )}
            </div>

            {/* Period type */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{i18n.t('Period type')}</label>
              <select
                className={styles.formSelect}
                value={form.periodType}
                onChange={(e) => onUpdateForm('periodType', e.target.value)}
                aria-label={i18n.t('Period type')}
              >
                {PERIOD_TYPES.map((pt) => (
                  <option key={pt} value={pt}>
                    {pt}
                  </option>
                ))}
              </select>
            </div>

            {/* Category combo */}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>{i18n.t('Category combo')}</label>
              <select
                className={styles.formSelect}
                value={form.categoryComboId}
                onChange={(e) => onUpdateForm('categoryComboId', e.target.value)}
                aria-label={i18n.t('Category combo')}
              >
                <option value="">{i18n.t('(default)')}</option>
                {categoryCombos.map((cc) => (
                  <option key={cc.id} value={cc.id}>
                    {cc.displayName}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Element scope */}
      <ElementScope
        createdElements={createdElements}
        assignAll={assignAll}
        selectedElementIds={selectedElementIds}
        onSetAssignAll={onSetAssignAll}
        onToggleElement={onToggleElement}
        onSelectAll={onSelectAll}
        onDeselectAll={onDeselectAll}
      />
    </div>
  )
}

// ── Sub-component: Step 3 — Confirm ──────────────────────────────────────────

interface ConfirmStepProps {
  mode: 'selectDatasets' | 'createDataset'
  selectedDataSets: Array<{ id: string; displayName: string }>
  newDataSetForm: NewDataSetForm
  elementCount: number
  assignAll: boolean
  selectedElementIds: string[]
  createdElements: CreatedElement[]
}

function ConfirmStep({
  mode,
  selectedDataSets,
  newDataSetForm,
  elementCount,
  assignAll,
  selectedElementIds,
  createdElements,
}: ConfirmStepProps) {
  const count = assignAll ? elementCount : selectedElementIds.length

  return (
    <div className={styles.body}>
      <div className={styles.confirmBox}>
        {/* Action */}
        <div className={styles.confirmRow}>
          <span className={styles.confirmLabel}>{i18n.t('Action')}</span>
          <span className={styles.confirmValue}>
            {mode === 'selectDatasets'
              ? i18n.t('Assign to existing dataset(s)')
              : i18n.t('Create new dataset')}
          </span>
        </div>

        {/* Target */}
        {mode === 'selectDatasets' ? (
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>{i18n.t('Dataset(s)')}</span>
            <div className={styles.confirmChips}>
              {selectedDataSets.map((ds) => (
                <span key={ds.id} className={styles.confirmChip}>
                  <span className="material-icons-round" style={{ fontSize: 11 }}>
                    storage
                  </span>
                  {ds.displayName}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>{i18n.t('Dataset name')}</span>
              <span className={styles.confirmValue}>{newDataSetForm.name}</span>
            </div>
            <div className={styles.confirmRow}>
              <span className={styles.confirmLabel}>{i18n.t('Period type')}</span>
              <span className={styles.confirmValue}>{newDataSetForm.periodType}</span>
            </div>
          </>
        )}

        {/* Elements */}
        <div className={styles.confirmRow}>
          <span className={styles.confirmLabel}>{i18n.t('Elements')}</span>
          <span className={styles.confirmValue}>
            {assignAll
              ? i18n.t('All {{n}} created element{{s}}', { n: count, s: count === 1 ? '' : 's' })
              : i18n.t('{{n}} selected element{{s}}', { n: count, s: count === 1 ? '' : 's' })}
          </span>
        </div>

        {/* Element list preview when subset is chosen */}
        {!assignAll && selectedElementIds.length > 0 && (
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel} />
            <div className={styles.confirmChips}>
              {selectedElementIds.slice(0, 10).map((id) => {
                const el = createdElements.find((e) => e.id === id)
                return (
                  <span key={id} className={styles.confirmChip}>
                    {el?.name ?? id}
                  </span>
                )
              })}
              {selectedElementIds.length > 10 && (
                <span className={styles.confirmChip} style={{ opacity: 0.7 }}>
                  +{selectedElementIds.length - 10} {i18n.t('more')}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {mode === 'selectDatasets' && (
        <div className={styles.confirmWarning}>
          <span className="material-icons-round">info</span>
          {i18n.t(
            'Existing elements in the selected dataset(s) will not be removed. Only new elements will be appended.'
          )}
        </div>
      )}
    </div>
  )
}

// ── Sub-component: Running ────────────────────────────────────────────────────

function RunningStep() {
  return (
    <div className={styles.body}>
      <div className={styles.runningBox}>
        <div className={styles.spinner} />
        <div className={styles.runningLabel}>{i18n.t('Applying changes…')}</div>
      </div>
    </div>
  )
}

// ── Sub-component: Done ───────────────────────────────────────────────────────

function DoneStep({ message }: { message: string | null }) {
  return (
    <div className={styles.body}>
      <div className={styles.resultBox}>
        <div className={`${styles.resultIcon} ${styles.success}`}>
          <span className="material-icons-round">check_circle</span>
        </div>
        <h3 className={styles.resultTitle}>{i18n.t('Done!')}</h3>
        <p className={styles.resultMessage}>
          {message ?? i18n.t('Elements assigned successfully.')}
        </p>
      </div>
    </div>
  )
}

// ── Sub-component: Error ──────────────────────────────────────────────────────

function ErrorStep({ errors }: { errors: string[] }) {
  return (
    <div className={styles.body}>
      <div className={styles.resultBox}>
        <div className={`${styles.resultIcon} ${styles.error}`}>
          <span className="material-icons-round">error_outline</span>
        </div>
        <h3 className={styles.resultTitle}>{i18n.t('Assignment failed')}</h3>
        <p className={styles.resultMessage}>
          {i18n.t('One or more operations failed. Check the errors below.')}
        </p>
        <div className={styles.errorList}>
          {errors.map((e, i) => (
            <div key={i} className={styles.errorItem}>
              {e}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────

export function AssignDatasetModal({
  hook,
  createdElements,
  categoryCombos,
  onClose,
}: AssignDatasetModalProps) {
  const { state } = hook

  // ── Derive element IDs to assign based on scope setting ──────────────────
  const elementIdsToAssign = useMemo(() => {
    if (state.assignAll) return createdElements.map((e) => e.id)
    return state.selectedElementIds
  }, [state.assignAll, state.selectedElementIds, createdElements])

  // ── Compute whether current step can proceed ──────────────────────────────
  const canProceed = useMemo(() => {
    if (state.mode === 'selectDatasets') {
      return state.selectedDataSetIds.length > 0 && elementIdsToAssign.length > 0
    }
    if (state.mode === 'createDataset') {
      return (
        state.newDataSetForm.name.trim().length > 0 &&
        state.newDataSetForm.shortName.trim().length > 0 &&
        elementIdsToAssign.length > 0
      )
    }
    return true
  }, [state, elementIdsToAssign])

  // ── Execute handler (fires from confirming step) ──────────────────────────
  const handleApply = useCallback(async () => {
    // Determine which path we came from by checking what's available
    if (state.selectedDataSetIds.length > 0) {
      await hook.executeAssignExisting(createdElements, elementIdsToAssign)
    } else {
      await hook.executeCreateNew(elementIdsToAssign, state.newDataSetForm.categoryComboId)
    }
  }, [hook, createdElements, elementIdsToAssign, state])

  // ── Step breadcrumb info ──────────────────────────────────────────────────
  const isAssignPath =
    state.mode === 'selectDatasets' ||
    (state.mode === 'confirming' && state.selectedDataSetIds.length > 0)

  // ── Derived data for confirm step ─────────────────────────────────────────
  const confirmMode = state.selectedDataSetIds.length > 0 ? 'selectDatasets' : 'createDataset'
  const selectedDataSets = state.allDataSets.filter((ds) =>
    state.selectedDataSetIds.includes(ds.id)
  )

  // ── Footer button logic ───────────────────────────────────────────────────
  const isTerminal = state.mode === 'done' || state.mode === 'error' || state.mode === 'running'
  const showBack =
    state.mode === 'selectDatasets' || state.mode === 'createDataset' || state.mode === 'confirming'
  const showPrimary = !isTerminal && state.mode !== 'decision'

  const primaryLabel = useMemo(() => {
    if (state.mode === 'confirming') return i18n.t('Confirm & Apply')
    return i18n.t('Next')
  }, [state.mode])

  const handleBack = useCallback(() => {
    if (state.mode === 'confirming') {
      hook.cancelConfirm()
    } else {
      hook.close()
    }
  }, [state.mode, hook])

  const handlePrimary = useCallback(async () => {
    if (state.mode === 'confirming') {
      await handleApply()
    } else {
      hook.confirm()
    }
  }, [state.mode, hook, handleApply])

  // ── Sub-step to show when confirming ─────────────────────────────────────
  const showStepBar =
    state.mode !== 'decision' &&
    state.mode !== 'idle' &&
    state.mode !== 'running' &&
    state.mode !== 'done' &&
    state.mode !== 'error'

  const stepsForBar =
    isAssignPath || confirmMode === 'selectDatasets' ? STEP_DEFS : STEP_DEFS_CREATE

  return (
    <div
      className={styles.overlay}
      role="presentation"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label={i18n.t('Assign to dataset')}
      >
        {/* ── Header ── */}
        <div className={styles.header}>
          <div className={styles.headerIcon}>
            <span className="material-icons-round">storage</span>
          </div>
          <div className={styles.headerText}>
            <h2 className={styles.headerTitle}>{i18n.t('Assign to dataset')}</h2>
            <div className={styles.headerSub}>
              {i18n.t('Go from "created" to "fully usable" in under a minute')}
            </div>
          </div>
          <button
            type="button"
            className={styles.closeBtn}
            onClick={onClose}
            aria-label={i18n.t('Close')}
          >
            <span className="material-icons-round">close</span>
          </button>
        </div>

        {/* ── Step bar ── */}
        {showStepBar && (
          <div className={styles.stepBar}>
            {stepsForBar.map((step, idx) => {
              const activeIdx = getStepIndex(stepsForBar, state.mode)
              const isDone = idx < activeIdx
              const isActive = idx === activeIdx
              return (
                <div
                  key={step.mode}
                  className={`${styles.step} ${isActive ? styles.active : ''} ${isDone ? styles.done : ''}`}
                >
                  <span className={styles.stepNum}>
                    {isDone ? (
                      <span className="material-icons-round" style={{ fontSize: 11 }}>
                        check
                      </span>
                    ) : (
                      idx + 1
                    )}
                  </span>
                  {i18n.t(step.label)}
                </div>
              )
            })}
          </div>
        )}

        {/* ── Step content ── */}
        {state.mode === 'decision' && (
          <DecisionStep
            onAssignExisting={hook.chooseAssignExisting}
            onCreateNew={hook.chooseCreateNew}
            onSkip={onClose}
            createdCount={createdElements.length}
          />
        )}

        {state.mode === 'selectDatasets' && (
          <SelectDatasetsStep
            datasets={state.allDataSets}
            loading={state.loadingDataSets}
            loadError={state.loadError}
            selectedIds={state.selectedDataSetIds}
            createdElements={createdElements}
            assignAll={state.assignAll}
            selectedElementIds={state.selectedElementIds}
            onToggle={hook.toggleDataSet}
            onSetAssignAll={hook.setAssignAll}
            onToggleElement={hook.toggleElement}
            onSelectAll={hook.selectAllElements}
            onDeselectAll={hook.deselectAllElements}
          />
        )}

        {state.mode === 'createDataset' && (
          <CreateDatasetStep
            form={state.newDataSetForm}
            formErrors={state.formErrors}
            categoryCombos={categoryCombos}
            createdElements={createdElements}
            assignAll={state.assignAll}
            selectedElementIds={state.selectedElementIds}
            onUpdateForm={hook.updateForm}
            onSetAssignAll={hook.setAssignAll}
            onToggleElement={hook.toggleElement}
            onSelectAll={hook.selectAllElements}
            onDeselectAll={hook.deselectAllElements}
          />
        )}

        {state.mode === 'confirming' && (
          <ConfirmStep
            mode={confirmMode}
            selectedDataSets={selectedDataSets}
            newDataSetForm={state.newDataSetForm}
            elementCount={createdElements.length}
            assignAll={state.assignAll}
            selectedElementIds={state.selectedElementIds}
            createdElements={createdElements}
          />
        )}

        {state.mode === 'running' && <RunningStep />}

        {state.mode === 'done' && <DoneStep message={state.resultMessage} />}

        {state.mode === 'error' && <ErrorStep errors={state.errors} />}

        {/* ── Footer ── */}
        <div className={styles.footer}>
          <div className={styles.footerLeft}>
            {state.mode === 'selectDatasets' && state.selectedDataSetIds.length > 0 && (
              <span className={styles.footerNote}>
                {i18n.t('{{n}} dataset{{s}} selected', {
                  n: state.selectedDataSetIds.length,
                  s: state.selectedDataSetIds.length === 1 ? '' : 's',
                })}
                {' · '}
                {i18n.t('{{n}} element{{s}} will be assigned', {
                  n: elementIdsToAssign.length,
                  s: elementIdsToAssign.length === 1 ? '' : 's',
                })}
              </span>
            )}
            {state.mode === 'createDataset' && state.newDataSetForm.name && (
              <span className={styles.footerNote}>
                {i18n.t('"{{name}}" · {{n}} element{{s}}', {
                  name: state.newDataSetForm.name,
                  n: elementIdsToAssign.length,
                  s: elementIdsToAssign.length === 1 ? '' : 's',
                })}
              </span>
            )}
          </div>

          <div className={styles.footerActions}>
            {/* Back / Cancel (not shown on decision or terminal states) */}
            {showBack && state.mode !== 'running' && (
              <button type="button" className="nx-btn nx-btn-secondary" onClick={handleBack}>
                {state.mode === 'confirming' ? (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      arrow_back
                    </span>
                    {i18n.t('Back')}
                  </>
                ) : (
                  i18n.t('Cancel')
                )}
              </button>
            )}

            {/* Close button on done/error */}
            {(state.mode === 'done' || state.mode === 'error') && (
              <button type="button" className="nx-btn nx-btn-secondary" onClick={onClose}>
                {i18n.t('Close')}
              </button>
            )}

            {/* Primary action */}
            {showPrimary && (
              <button
                type="button"
                className="nx-btn nx-btn-primary"
                onClick={handlePrimary}
                disabled={!canProceed || state.mode === 'running'}
              >
                {state.mode === 'confirming' ? (
                  <>
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      check
                    </span>
                    {primaryLabel}
                  </>
                ) : (
                  <>
                    {primaryLabel}
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      arrow_forward
                    </span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AssignDatasetModal
