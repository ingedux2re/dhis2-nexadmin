// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/components/AssignDatasetModal.tsx
//
// Post-creation guided workflow: assign newly created data elements to a
// dataset immediately after bulk creation succeeds.
//
// Wizard steps:
//   Step 1 (decision)         — Choose: assign existing | create new | skip
//   Step 2A (selectDatasets)  — Pick one or more existing datasets + element scope
//   Step 2B (createDataset)   — Fill in new dataset form + element scope
//   Step 3 (orgUnitDeployment)— Assign to existing org units / org unit groups
//   Step 4 (confirming)       — Review summary before applying
//   running / done / error    — Feedback states
// ─────────────────────────────────────────────────────────────────────────────

import { useState, useCallback, useMemo, useEffect } from 'react'
import type { ChangeEvent } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { MetaRef } from '../types'
import type {
  AssignMode,
  CreatedElement,
  NewDataSetForm,
  UserGroupAccess,
} from '../hooks/useAssignDataset'
import {
  PERIOD_TYPES,
  ACCESS_NONE,
  ACCESS_VIEW,
  ACCESS_VIEW_EDIT,
  ACCESS_VIEW_EDIT_DATA,
} from '../hooks/useAssignDataset'
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
  { mode: 'orgUnitDeployment', label: 'Org unit deployment' },
  { mode: 'sharing', label: 'Sharing & Access' },
  { mode: 'confirming', label: 'Confirm' },
]

const STEP_DEFS_CREATE: { mode: AssignMode; label: string }[] = [
  { mode: 'decision', label: 'Choose action' },
  { mode: 'createDataset', label: 'New dataset' },
  { mode: 'orgUnitDeployment', label: 'Org unit deployment' },
  { mode: 'sharing', label: 'Sharing & Access' },
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

// ── Sub-component: Step 3 — Org unit deployment ────────────────────────────

interface OrgUnitDeploymentStepProps {
  orgUnits: ReturnType<typeof useAssignDataset>['state']['orgUnits']
  orgUnitGroups: ReturnType<typeof useAssignDataset>['state']['orgUnitGroups']
  loadingOrgUnits: boolean
  loadingOrgUnitGroups: boolean
  selectedOrgUnitIds: string[]
  selectedOrgUnitGroupIds: string[]
  zeroMembersWarning: string | null
  onToggleOrgUnit: (id: string) => void
  onToggleOrgUnitGroup: (id: string) => void
}

function OrgUnitDeploymentStep({
  orgUnits,
  orgUnitGroups,
  loadingOrgUnits,
  loadingOrgUnitGroups,
  selectedOrgUnitIds,
  selectedOrgUnitGroupIds,
  zeroMembersWarning,
  onToggleOrgUnit,
  onToggleOrgUnitGroup,
}: OrgUnitDeploymentStepProps) {
  const [ouQuery, setOuQuery] = useState('')
  const [ougQuery, setOugQuery] = useState('')

  const filteredOrgUnits = useMemo(() => {
    const q = ouQuery.toLowerCase().trim()
    if (!q) return orgUnits
    return orgUnits.filter((ou) => ou.displayName.toLowerCase().includes(q))
  }, [orgUnits, ouQuery])

  const filteredGroups = useMemo(() => {
    const q = ougQuery.toLowerCase().trim()
    if (!q) return orgUnitGroups
    return orgUnitGroups.filter((g) => g.displayName.toLowerCase().includes(q))
  }, [orgUnitGroups, ougQuery])

  return (
    <div className={styles.body}>
      <div className={styles.confirmWarning} style={{ marginBottom: 0 }}>
        <span className="material-icons-round">info</span>
        {i18n.t(
          'Only existing organisation units are supported. No new org units will be created in this flow.'
        )}
      </div>

      {/* Specific org units */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            place
          </span>
          <span className={styles.cardTitle}>{i18n.t('Specific organisation units')}</span>
          {selectedOrgUnitIds.length > 0 && (
            <span className={styles.selectedBadge}>
              {i18n.t('{{n}} selected', { n: selectedOrgUnitIds.length })}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          {loadingOrgUnits && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} style={{ width: 20, height: 20, borderWidth: 2 }} />
              {i18n.t('Loading organisation units…')}
            </div>
          )}
          {!loadingOrgUnits && (
            <>
              <div className={styles.searchBox}>
                <span className="material-icons-round">search</span>
                <input
                  className={styles.searchInput}
                  placeholder={i18n.t('Search org units…')}
                  value={ouQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOuQuery(e.target.value)}
                  aria-label={i18n.t('Search organisation units')}
                />
                {ouQuery && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                    }}
                    onClick={() => setOuQuery('')}
                    aria-label={i18n.t('Clear search')}
                  >
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      close
                    </span>
                  </button>
                )}
              </div>
              <div className={styles.datasetList}>
                {filteredOrgUnits.length === 0 ? (
                  <div className={styles.emptySearch}>
                    {ouQuery
                      ? i18n.t('No org units match "{{q}}"', { q: ouQuery })
                      : i18n.t('No organisation units found')}
                  </div>
                ) : (
                  filteredOrgUnits.map((ou) => {
                    const checked = selectedOrgUnitIds.includes(ou.id)
                    return (
                      <label
                        key={ou.id}
                        htmlFor={`ou-${ou.id}`}
                        className={`${styles.datasetItem} ${checked ? styles.selected : ''}`}
                      >
                        <input
                          id={`ou-${ou.id}`}
                          type="checkbox"
                          className={styles.datasetCheckbox}
                          checked={checked}
                          onChange={() => onToggleOrgUnit(ou.id)}
                          aria-label={i18n.t('Select {{name}}', { name: ou.displayName })}
                        />
                        <span className={styles.datasetName}>{ou.displayName}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Org unit groups */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            group
          </span>
          <span className={styles.cardTitle}>{i18n.t('Organisation unit groups')}</span>
          {selectedOrgUnitGroupIds.length > 0 && (
            <span className={styles.selectedBadge}>
              {i18n.t('{{n}} selected', { n: selectedOrgUnitGroupIds.length })}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          {loadingOrgUnitGroups && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} style={{ width: 20, height: 20, borderWidth: 2 }} />
              {i18n.t('Loading org unit groups…')}
            </div>
          )}
          {!loadingOrgUnitGroups && (
            <>
              <div className={styles.searchBox}>
                <span className="material-icons-round">search</span>
                <input
                  className={styles.searchInput}
                  placeholder={i18n.t('Search groups…')}
                  value={ougQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setOugQuery(e.target.value)}
                  aria-label={i18n.t('Search org unit groups')}
                />
                {ougQuery && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                    }}
                    onClick={() => setOugQuery('')}
                    aria-label={i18n.t('Clear search')}
                  >
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      close
                    </span>
                  </button>
                )}
              </div>
              <div className={styles.datasetList}>
                {filteredGroups.length === 0 ? (
                  <div className={styles.emptySearch}>
                    {ougQuery
                      ? i18n.t('No groups match "{{q}}"', { q: ougQuery })
                      : i18n.t('No org unit groups found')}
                  </div>
                ) : (
                  filteredGroups.map((g) => {
                    const checked = selectedOrgUnitGroupIds.includes(g.id)
                    return (
                      <label
                        key={g.id}
                        htmlFor={`oug-${g.id}`}
                        className={`${styles.datasetItem} ${checked ? styles.selected : ''}`}
                      >
                        <input
                          id={`oug-${g.id}`}
                          type="checkbox"
                          className={styles.datasetCheckbox}
                          checked={checked}
                          onChange={() => onToggleOrgUnitGroup(g.id)}
                          aria-label={i18n.t('Select {{name}}', { name: g.displayName })}
                        />
                        <span className={styles.datasetName}>{g.displayName}</span>
                      </label>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {zeroMembersWarning && (
        <div className={styles.confirmWarning}>
          <span className="material-icons-round">warning</span>
          {zeroMembersWarning}
        </div>
      )}
    </div>
  )
}

// ── Sub-component: Step 4 — Sharing & Access ────────────────────────────────

interface SharingStepProps {
  publicAccess: string
  userGroupAccesses: UserGroupAccess[]
  userGroups: ReturnType<typeof useAssignDataset>['state']['userGroups']
  loadingUserGroups: boolean
  onSetPublicAccess: (access: string) => void
  onSetUserGroupAccess: (id: string, displayName: string, access: string) => void
  onRemoveUserGroupAccess: (id: string) => void
}

function SharingStep({
  publicAccess,
  userGroupAccesses,
  userGroups,
  loadingUserGroups,
  onSetPublicAccess,
  onSetUserGroupAccess,
  onRemoveUserGroupAccess,
}: SharingStepProps) {
  const [ugQuery, setUgQuery] = useState('')
  const [addingGroupId, setAddingGroupId] = useState<string | null>(null)

  const filteredGroups = useMemo(() => {
    const q = ugQuery.toLowerCase().trim()
    if (!q) return userGroups
    return userGroups.filter((g) => g.displayName.toLowerCase().includes(q))
  }, [userGroups, ugQuery])

  const accessOptions = [
    { value: ACCESS_NONE, label: i18n.t('None (private)') },
    { value: ACCESS_VIEW, label: i18n.t('View only') },
    { value: ACCESS_VIEW_EDIT, label: i18n.t('Edit metadata only') },
    { value: ACCESS_VIEW_EDIT_DATA, label: i18n.t('Edit metadata and data entry') },
  ]

  return (
    <div className={styles.body}>
      {/* Public access */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            public
          </span>
          <span className={styles.cardTitle}>{i18n.t('Public access')}</span>
        </div>
        <div className={styles.cardBody}>
          <div className={styles.formGroup}>
            <label className={styles.formLabel}>{i18n.t('Who can see this dataset?')}</label>
            <select
              className={styles.formSelect}
              value={publicAccess}
              onChange={(e) => onSetPublicAccess(e.target.value)}
              aria-label={i18n.t('Public access level')}
            >
              {accessOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* User group access */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span
            className="material-icons-round"
            style={{ fontSize: 15, color: 'var(--brand-600)' }}
          >
            group
          </span>
          <span className={styles.cardTitle}>{i18n.t('User groups')}</span>
          {userGroupAccesses.length > 0 && (
            <span className={styles.selectedBadge}>
              {i18n.t('{{n}} group{{s}}', {
                n: userGroupAccesses.length,
                s: userGroupAccesses.length === 1 ? '' : 's',
              })}
            </span>
          )}
        </div>
        <div className={styles.cardBody}>
          {userGroupAccesses.length > 0 && (
            <div className={styles.elementList} style={{ marginBottom: 'var(--space-3)' }}>
              {userGroupAccesses.map((uga) => (
                <div
                  key={uga.id}
                  className={styles.elementItem}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <span className={styles.elementName}>{uga.displayName}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}>
                    <select
                      className={styles.formSelect}
                      style={{ width: 'auto', minWidth: 120 }}
                      value={uga.access}
                      onChange={(e) =>
                        onSetUserGroupAccess(uga.id, uga.displayName, e.target.value)
                      }
                      aria-label={i18n.t('Access for {{name}}', { name: uga.displayName })}
                    >
                      <option value={ACCESS_VIEW}>{i18n.t('View only')}</option>
                      <option value={ACCESS_VIEW_EDIT}>{i18n.t('Edit metadata only')}</option>
                      <option value={ACCESS_VIEW_EDIT_DATA}>
                        {i18n.t('Edit metadata and data entry')}
                      </option>
                    </select>
                    <button
                      type="button"
                      className={styles.linkBtn}
                      onClick={() => onRemoveUserGroupAccess(uga.id)}
                      aria-label={i18n.t('Remove {{name}}', { name: uga.displayName })}
                    >
                      {i18n.t('Remove')}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {loadingUserGroups && (
            <div className={styles.loadingState}>
              <div className={styles.spinner} style={{ width: 20, height: 20, borderWidth: 2 }} />
              {i18n.t('Loading user groups…')}
            </div>
          )}
          {!loadingUserGroups && (
            <>
              <div className={styles.searchBox}>
                <span className="material-icons-round">search</span>
                <input
                  className={styles.searchInput}
                  placeholder={i18n.t('Search user groups…')}
                  value={ugQuery}
                  onChange={(e: ChangeEvent<HTMLInputElement>) => setUgQuery(e.target.value)}
                  aria-label={i18n.t('Search user groups')}
                />
                {ugQuery && (
                  <button
                    type="button"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-tertiary)',
                      display: 'flex',
                    }}
                    onClick={() => setUgQuery('')}
                    aria-label={i18n.t('Clear search')}
                  >
                    <span className="material-icons-round" style={{ fontSize: 16 }}>
                      close
                    </span>
                  </button>
                )}
              </div>
              <div className={styles.datasetList}>
                {filteredGroups
                  .filter((g) => !userGroupAccesses.some((uga) => uga.id === g.id))
                  .map((g) => (
                    <div
                      key={g.id}
                      className={styles.datasetItem}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <span className={styles.datasetName}>{g.displayName}</span>
                      <button
                        type="button"
                        className="nx-btn nx-btn-secondary nx-btn-sm"
                        disabled={addingGroupId === g.id}
                        onClick={() => {
                          setAddingGroupId(g.id)
                          onSetUserGroupAccess(g.id, g.displayName, ACCESS_VIEW)
                          setAddingGroupId(null)
                        }}
                      >
                        {i18n.t('Add')}
                      </button>
                    </div>
                  ))}
                {filteredGroups.filter((g) => !userGroupAccesses.some((uga) => uga.id === g.id))
                  .length === 0 && (
                  <div className={styles.emptySearch}>
                    {ugQuery
                      ? i18n.t('No groups match "{{q}}"', { q: ugQuery })
                      : i18n.t('All groups added or no user groups available')}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Sub-component: Step 5 — Confirm ──────────────────────────────────────────

interface ConfirmStepProps {
  mode: 'selectDatasets' | 'createDataset'
  selectedDataSets: Array<{ id: string; displayName: string }>
  newDataSetForm: NewDataSetForm
  elementCount: number
  assignAll: boolean
  selectedElementIds: string[]
  createdElements: CreatedElement[]
  selectedOrgUnitCount: number
  selectedOrgUnitGroupCount: number
  resolvedOrgUnitCountFromGroups: number
  totalOrgUnitsToDeploy: number
  publicAccess: string
  userGroupAccesses: UserGroupAccess[]
}

function ConfirmStep({
  mode,
  selectedDataSets,
  newDataSetForm,
  elementCount,
  assignAll,
  selectedElementIds,
  createdElements,
  selectedOrgUnitCount,
  selectedOrgUnitGroupCount,
  resolvedOrgUnitCountFromGroups,
  totalOrgUnitsToDeploy,
  publicAccess,
  userGroupAccesses,
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

        {/* Org unit deployment */}
        <div className={styles.confirmRow}>
          <span className={styles.confirmLabel}>{i18n.t('Org unit deployment')}</span>
          <span className={styles.confirmValue}>
            {totalOrgUnitsToDeploy === 0
              ? i18n.t('None selected')
              : i18n.t('{{n}} organisation unit{{s}} total', {
                  n: totalOrgUnitsToDeploy,
                  s: totalOrgUnitsToDeploy === 1 ? '' : 's',
                })}
          </span>
        </div>
        {totalOrgUnitsToDeploy > 0 && (
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel} />
            <span className={styles.confirmValue} style={{ fontSize: 'var(--text-xs)' }}>
              {selectedOrgUnitCount > 0 &&
                i18n.t('{{n}} specific org unit{{s}}', {
                  n: selectedOrgUnitCount,
                  s: selectedOrgUnitCount === 1 ? '' : 's',
                })}
              {selectedOrgUnitCount > 0 && selectedOrgUnitGroupCount > 0 && ' · '}
              {selectedOrgUnitGroupCount > 0 &&
                i18n.t('{{n}} group{{s}} ({{m}} org unit{{p}} resolved)', {
                  n: selectedOrgUnitGroupCount,
                  s: selectedOrgUnitGroupCount === 1 ? '' : 's',
                  m: resolvedOrgUnitCountFromGroups,
                  p: resolvedOrgUnitCountFromGroups === 1 ? '' : 's',
                })}
            </span>
          </div>
        )}

        {/* Sharing */}
        <div className={styles.confirmRow}>
          <span className={styles.confirmLabel}>{i18n.t('Sharing')}</span>
          <span className={styles.confirmValue}>
            {publicAccess !== ACCESS_NONE || userGroupAccesses.length > 0
              ? [
                  publicAccess !== ACCESS_NONE &&
                    (publicAccess === ACCESS_VIEW
                      ? i18n.t('Public: view only')
                      : publicAccess === ACCESS_VIEW_EDIT
                        ? i18n.t('Public: edit metadata only')
                        : i18n.t('Public: edit metadata and data entry')),
                  userGroupAccesses.length > 0 &&
                    i18n.t('{{n}} user group{{s}}', {
                      n: userGroupAccesses.length,
                      s: userGroupAccesses.length === 1 ? '' : 's',
                    }),
                ]
                  .filter(Boolean)
                  .join(' · ')
              : i18n.t('No changes (keep existing)')}
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

interface DoneStepProps {
  message: string | null
  sharingErrors?: string[]
}

function DoneStep({ message, sharingErrors = [] }: DoneStepProps) {
  const hasPartialSuccess = sharingErrors.length > 0
  return (
    <div className={styles.body}>
      <div className={styles.resultBox}>
        <div className={`${styles.resultIcon} ${styles.success}`}>
          <span className="material-icons-round">check_circle</span>
        </div>
        <h3 className={styles.resultTitle}>
          {hasPartialSuccess ? i18n.t('Done with warnings') : i18n.t('Done!')}
        </h3>
        <p className={styles.resultMessage}>
          {message ?? i18n.t('Elements assigned successfully.')}
        </p>
        {hasPartialSuccess && (
          <div className={styles.errorList} style={{ marginTop: 'var(--space-3)' }}>
            <div
              style={{
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                marginBottom: 'var(--space-2)',
              }}
            >
              {i18n.t('Sharing could not be updated for:')}
            </div>
            {sharingErrors.map((e, i) => (
              <div key={i} className={styles.errorItem}>
                {e}
              </div>
            ))}
          </div>
        )}
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

  // ── Load org units and groups when entering org unit deployment ───────────
  useEffect(() => {
    if (
      state.mode === 'orgUnitDeployment' &&
      state.loadingOrgUnits &&
      state.orgUnits.length === 0
    ) {
      hook.loadOrgUnitsAndGroups()
    }
  }, [state.mode, state.loadingOrgUnits, state.orgUnits.length, hook])

  // ── Load user groups when entering sharing step ────────────────────────────
  useEffect(() => {
    if (state.mode === 'sharing' && state.loadingUserGroups && state.userGroups.length === 0) {
      hook.loadUserGroups()
    }
  }, [state.mode, state.loadingUserGroups, state.userGroups.length, hook])

  // ── Derive element IDs to assign based on scope setting ──────────────────
  const elementIdsToAssign = useMemo(() => {
    if (state.assignAll) return createdElements.map((e) => e.id)
    return state.selectedElementIds
  }, [state.assignAll, state.selectedElementIds, createdElements])

  // ── Compute total org units to deploy (selected + resolved from groups, deduped) ───
  const totalOrgUnitsToDeploy = useMemo(() => {
    const all = new Set([...state.selectedOrgUnitIds, ...state.resolvedOrgUnitIdsFromGroups])
    return all.size
  }, [state.selectedOrgUnitIds, state.resolvedOrgUnitIdsFromGroups])

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
    if (state.mode === 'orgUnitDeployment') {
      return true
    }
    return true
  }, [state, elementIdsToAssign])

  // ── Execute handler (fires from confirming step) ──────────────────────────
  const handleApply = useCallback(async () => {
    const orgUnitIdsFromGroups = await hook.resolveOrgUnitIdsFromGroups(
      state.selectedOrgUnitGroupIds
    )
    const allOrgUnitIds = Array.from(
      new Set([...state.selectedOrgUnitIds, ...orgUnitIdsFromGroups])
    )
    const sharingConfig = {
      publicAccess: state.publicAccess,
      userGroupAccesses: state.userGroupAccesses,
    }

    if (state.selectedDataSetIds.length > 0) {
      await hook.executeAssignExisting(
        createdElements,
        elementIdsToAssign,
        allOrgUnitIds,
        sharingConfig
      )
    } else {
      await hook.executeCreateNew(
        elementIdsToAssign,
        state.newDataSetForm.categoryComboId,
        allOrgUnitIds,
        sharingConfig
      )
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
    state.mode === 'selectDatasets' ||
    state.mode === 'createDataset' ||
    state.mode === 'orgUnitDeployment' ||
    state.mode === 'sharing' ||
    state.mode === 'confirming'
  const showPrimary = !isTerminal && state.mode !== 'decision'

  const primaryLabel = useMemo(() => {
    if (state.mode === 'confirming') return i18n.t('Confirm & Apply')
    return i18n.t('Next')
  }, [state.mode])

  const handleBack = useCallback(() => {
    if (state.mode === 'confirming') {
      hook.cancelConfirm()
    } else if (state.mode === 'sharing') {
      hook.goBackFromSharing()
    } else if (state.mode === 'orgUnitDeployment') {
      hook.goBackFromOrgUnitDeployment()
    } else {
      hook.close()
    }
  }, [state.mode, hook])

  const handlePrimary = useCallback(async () => {
    if (state.mode === 'confirming') {
      await handleApply()
    } else if (state.mode === 'orgUnitDeployment') {
      await hook.confirmFromOrgUnitDeployment()
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

        {state.mode === 'orgUnitDeployment' && (
          <OrgUnitDeploymentStep
            orgUnits={state.orgUnits}
            orgUnitGroups={state.orgUnitGroups}
            loadingOrgUnits={state.loadingOrgUnits}
            loadingOrgUnitGroups={state.loadingOrgUnitGroups}
            selectedOrgUnitIds={state.selectedOrgUnitIds}
            selectedOrgUnitGroupIds={state.selectedOrgUnitGroupIds}
            zeroMembersWarning={state.orgUnitGroupZeroMembersWarning}
            onToggleOrgUnit={hook.toggleOrgUnit}
            onToggleOrgUnitGroup={hook.toggleOrgUnitGroup}
          />
        )}

        {state.mode === 'sharing' && (
          <SharingStep
            publicAccess={state.publicAccess}
            userGroupAccesses={state.userGroupAccesses}
            userGroups={state.userGroups}
            loadingUserGroups={state.loadingUserGroups}
            onSetPublicAccess={hook.setPublicAccess}
            onSetUserGroupAccess={hook.setUserGroupAccess}
            onRemoveUserGroupAccess={hook.removeUserGroupAccess}
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
            selectedOrgUnitCount={state.selectedOrgUnitIds.length}
            selectedOrgUnitGroupCount={state.selectedOrgUnitGroupIds.length}
            resolvedOrgUnitCountFromGroups={state.resolvedOrgUnitCountFromGroups}
            totalOrgUnitsToDeploy={totalOrgUnitsToDeploy}
            publicAccess={state.publicAccess}
            userGroupAccesses={state.userGroupAccesses}
          />
        )}

        {state.mode === 'running' && <RunningStep />}

        {state.mode === 'done' && (
          <DoneStep message={state.resultMessage} sharingErrors={state.sharingErrors} />
        )}

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
            {state.mode === 'orgUnitDeployment' && (
              <span className={styles.footerNote}>
                {state.selectedOrgUnitIds.length + state.selectedOrgUnitGroupIds.length > 0
                  ? i18n.t('{{ou}} org unit{{s}}, {{g}} group{{p}} selected', {
                      ou: state.selectedOrgUnitIds.length,
                      s: state.selectedOrgUnitIds.length === 1 ? '' : 's',
                      g: state.selectedOrgUnitGroupIds.length,
                      p: state.selectedOrgUnitGroupIds.length === 1 ? '' : 's',
                    })
                  : i18n.t('Optional — skip to deploy only to data elements')}
              </span>
            )}
            {state.mode === 'sharing' && (
              <span className={styles.footerNote}>
                {state.publicAccess !== ACCESS_NONE || state.userGroupAccesses.length > 0
                  ? [
                      state.publicAccess !== ACCESS_NONE &&
                        (state.publicAccess === ACCESS_VIEW
                          ? i18n.t('Public: view only')
                          : state.publicAccess === ACCESS_VIEW_EDIT
                            ? i18n.t('Public: edit metadata only')
                            : i18n.t('Public: edit metadata and data entry')),
                      state.userGroupAccesses.length > 0 &&
                        i18n.t('{{n}} user group{{s}}', {
                          n: state.userGroupAccesses.length,
                          s: state.userGroupAccesses.length === 1 ? '' : 's',
                        }),
                    ]
                      .filter(Boolean)
                      .join(' · ')
                  : i18n.t('Optional — keep existing sharing')}
              </span>
            )}
          </div>

          <div className={styles.footerActions}>
            {/* Back / Cancel (not shown on decision or terminal states) */}
            {showBack && state.mode !== 'running' && (
              <button type="button" className="nx-btn nx-btn-secondary" onClick={handleBack}>
                {state.mode === 'confirming' ||
                state.mode === 'orgUnitDeployment' ||
                state.mode === 'sharing' ? (
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
