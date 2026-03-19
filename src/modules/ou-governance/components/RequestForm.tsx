// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/RequestForm.tsx
//
// Create / Edit form for OU governance requests.
// Used by District Officers to draft and submit requests.
// ─────────────────────────────────────────────────────────────────────────────

import { useState, type FC, type FormEvent } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { RequestFormValues, GovernanceRequest } from '../types'
import { EMPTY_FORM } from '../types'
import styles from './RequestForm.module.css'

// ── Constants ─────────────────────────────────────────────────────────────────

const FACILITY_TYPES = [
  { value: 'health_centre', labelKey: 'Health Centre' },
  { value: 'hospital', labelKey: 'Hospital' },
  { value: 'clinic', labelKey: 'Clinic' },
  { value: 'dispensary', labelKey: 'Dispensary' },
  { value: 'pharmacy', labelKey: 'Pharmacy' },
  { value: 'laboratory', labelKey: 'Laboratory' },
  { value: 'other', labelKey: 'Other' },
]

const LEVELS = [
  { value: 1, labelKey: 'Level 1 — National' },
  { value: 2, labelKey: 'Level 2 — Regional' },
  { value: 3, labelKey: 'Level 3 — District' },
  { value: 4, labelKey: 'Level 4 — Sub-district' },
  { value: 5, labelKey: 'Level 5 — Facility' },
]

// Mock parent OU suggestions for demo
const MOCK_PARENTS = [
  { id: 'ou_WA_URB', name: 'Western Area Urban' },
  { id: 'ou_WA_RUR', name: 'Western Area Rural' },
  { id: 'ou_BO', name: 'Bo District' },
  { id: 'ou_BOMB', name: 'Bombali District' },
  { id: 'ou_KAI', name: 'Kailahun District' },
  { id: 'ou_KAM', name: 'Kambia District' },
  { id: 'ou_KEN', name: 'Kenema District' },
  { id: 'ou_KON', name: 'Kono District' },
  { id: 'ou_MOY', name: 'Moyamba District' },
  { id: 'ou_POR', name: 'Port Loko District' },
  { id: 'ou_PUJ', name: 'Pujehun District' },
  { id: 'ou_TON', name: 'Tonkolili District' },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface RequestFormProps {
  /** Existing request when editing a draft */
  existing?: GovernanceRequest
  onSaveDraft: (values: RequestFormValues) => void
  onSubmit: (values: RequestFormValues) => void
  onCancel: () => void
}

// ── Validation ────────────────────────────────────────────────────────────────

interface FormErrors {
  facilityName?: string
  facilityType?: string
  level?: string
  proposedParentId?: string
}

function validate(values: RequestFormValues): FormErrors {
  const errors: FormErrors = {}
  if (!values.facilityName.trim()) errors.facilityName = i18n.t('Facility name is required')
  if (!values.facilityType) errors.facilityType = i18n.t('Facility type is required')
  if (!values.level) errors.level = i18n.t('Level is required')
  if (!values.proposedParentId) errors.proposedParentId = i18n.t('Proposed parent is required')
  return errors
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RequestForm: FC<RequestFormProps> = ({
  existing,
  onSaveDraft,
  onSubmit,
  onCancel,
}) => {
  const isEdit = !!existing

  const [values, setValues] = useState<RequestFormValues>(() =>
    existing
      ? {
          facilityName: existing.facilityName,
          shortName: existing.shortName,
          facilityType: existing.facilityType,
          level: existing.level,
          proposedParentId: existing.proposedParentId,
          proposedParentName: existing.proposedParentName,
          latitude: existing.latitude,
          longitude: existing.longitude,
          openingDate: existing.openingDate,
        }
      : { ...EMPTY_FORM }
  )

  const [errors, setErrors] = useState<FormErrors>({})
  const [parentSearch, setParentSearch] = useState(values.proposedParentName)
  const [showParentDropdown, setShowParentDropdown] = useState(false)

  function set(field: keyof RequestFormValues, value: string | number) {
    setValues((v) => {
      const next = { ...v, [field]: value }
      // Auto-derive shortName from facilityName
      if (field === 'facilityName') {
        const wasAuto = v.shortName === v.facilityName.slice(0, 50) || !v.shortName
        if (wasAuto) next.shortName = (value as string).slice(0, 50)
      }
      return next
    })
    if (errors[field as keyof FormErrors]) {
      setErrors((e) => ({ ...e, [field]: undefined }))
    }
  }

  function handleSaveDraft(e: FormEvent) {
    e.preventDefault()
    onSaveDraft(values)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const errs = validate(values)
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    onSubmit(values)
  }

  const filteredParents = MOCK_PARENTS.filter((p) =>
    p.name.toLowerCase().includes(parentSearch.toLowerCase())
  )

  function selectParent(p: { id: string; name: string }) {
    setValues((v) => ({ ...v, proposedParentId: p.id, proposedParentName: p.name }))
    setParentSearch(p.name)
    setShowParentDropdown(false)
    if (errors.proposedParentId) setErrors((e) => ({ ...e, proposedParentId: undefined }))
  }

  return (
    <div className={styles.card}>
      {/* Header */}
      <div className={styles.cardHead}>
        <div className={styles.cardHeadIcon}>
          <span className="material-icons-round">{isEdit ? 'edit' : 'add_location_alt'}</span>
        </div>
        <div>
          <div className={styles.cardHeadTitle}>
            {isEdit
              ? i18n.t('Edit Request — {{ref}}', { ref: existing?.reference })
              : i18n.t('New Facility Request')}
          </div>
          <div className={styles.cardHeadSub}>
            {i18n.t('Complete all required fields and submit for regional review')}
          </div>
        </div>
      </div>

      {/* Body */}
      <form onSubmit={handleSubmit} noValidate>
        <div className={styles.cardBody}>
          <div className={styles.grid}>
            {/* Facility Name */}
            <div className={`${styles.field} ${styles.gridFull}`}>
              <label className={styles.label} htmlFor="gov-facilityName">
                {i18n.t('Facility Name')}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="gov-facilityName"
                className={`${styles.input} ${errors.facilityName ? styles.error : ''}`}
                type="text"
                value={values.facilityName}
                onChange={(e) => set('facilityName', e.target.value)}
                placeholder={i18n.t('e.g. Kailahun Health Centre')}
                maxLength={230}
                aria-required="true"
                aria-describedby={errors.facilityName ? 'gov-facilityName-err' : undefined}
              />
              {errors.facilityName && (
                <span className={styles.errorMsg} id="gov-facilityName-err" role="alert">
                  <span className="material-icons-round">error</span>
                  {errors.facilityName}
                </span>
              )}
            </div>

            {/* Short Name */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-shortName">
                {i18n.t('Short Name')}
              </label>
              <input
                id="gov-shortName"
                className={styles.input}
                type="text"
                value={values.shortName}
                onChange={(e) => set('shortName', e.target.value)}
                placeholder={i18n.t('Auto-derived from name')}
                maxLength={50}
              />
              <span className={styles.hint}>{i18n.t('Max 50 characters')}</span>
            </div>

            {/* Facility Type */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-facilityType">
                {i18n.t('Facility Type')}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="gov-facilityType"
                className={`${styles.select} ${errors.facilityType ? styles.error : ''}`}
                value={values.facilityType}
                onChange={(e) => set('facilityType', e.target.value)}
                aria-required="true"
              >
                <option value="">{i18n.t('Select type…')}</option>
                {FACILITY_TYPES.map((ft) => (
                  <option key={ft.value} value={ft.value}>
                    {i18n.t(ft.labelKey)}
                  </option>
                ))}
              </select>
              {errors.facilityType && (
                <span className={styles.errorMsg} role="alert">
                  <span className="material-icons-round">error</span>
                  {errors.facilityType}
                </span>
              )}
            </div>

            {/* Level */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-level">
                {i18n.t('Organisation Unit Level')}
                <span className={styles.required}>*</span>
              </label>
              <select
                id="gov-level"
                className={`${styles.select} ${errors.level ? styles.error : ''}`}
                value={values.level}
                onChange={(e) => set('level', Number(e.target.value))}
                aria-required="true"
              >
                <option value="">{i18n.t('Select level…')}</option>
                {LEVELS.map((l) => (
                  <option key={l.value} value={l.value}>
                    {i18n.t(l.labelKey)}
                  </option>
                ))}
              </select>
              {errors.level && (
                <span className={styles.errorMsg} role="alert">
                  <span className="material-icons-round">error</span>
                  {errors.level}
                </span>
              )}
            </div>

            {/* Proposed Parent */}
            <div className={`${styles.field} ${styles.gridFull}`} style={{ position: 'relative' }}>
              <label className={styles.label} htmlFor="gov-parent">
                {i18n.t('Proposed Parent Organisation Unit')}
                <span className={styles.required}>*</span>
              </label>
              <input
                id="gov-parent"
                className={`${styles.input} ${errors.proposedParentId ? styles.error : ''}`}
                type="text"
                value={parentSearch}
                onChange={(e) => {
                  setParentSearch(e.target.value)
                  setShowParentDropdown(true)
                  if (!e.target.value) {
                    setValues((v) => ({ ...v, proposedParentId: '', proposedParentName: '' }))
                  }
                }}
                onFocus={() => setShowParentDropdown(true)}
                onBlur={() => setTimeout(() => setShowParentDropdown(false), 150)}
                placeholder={i18n.t('Search parent org unit…')}
                autoComplete="off"
                aria-required="true"
                aria-autocomplete="list"
                role="combobox"
                aria-controls="gov-parent-listbox"
                aria-expanded={showParentDropdown && filteredParents.length > 0}
              />
              {errors.proposedParentId && (
                <span className={styles.errorMsg} role="alert">
                  <span className="material-icons-round">error</span>
                  {errors.proposedParentId}
                </span>
              )}
              {showParentDropdown && filteredParents.length > 0 && (
                <div
                  style={{
                    position: 'absolute',
                    top: 'calc(100% + 4px)',
                    left: 0,
                    right: 0,
                    background: 'var(--surface-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 50,
                    maxHeight: 200,
                    overflowY: 'auto',
                  }}
                  role="listbox"
                  id="gov-parent-listbox"
                  aria-label={i18n.t('Parent organisation unit suggestions')}
                >
                  {filteredParents.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={values.proposedParentId === p.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--space-2)',
                        width: '100%',
                        padding: 'var(--space-2) var(--space-3)',
                        border: 'none',
                        background:
                          values.proposedParentId === p.id ? 'var(--brand-50)' : 'transparent',
                        cursor: 'pointer',
                        fontSize: 'var(--text-sm)',
                        color: 'var(--text-primary)',
                        textAlign: 'left',
                      }}
                      onClick={() => selectParent(p)}
                    >
                      <span
                        className="material-icons-round"
                        style={{ fontSize: 14, color: 'var(--brand-500)' }}
                      >
                        domain
                      </span>
                      {p.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Optional geo section */}
            <div className={styles.sectionTitle}>{i18n.t('Location (optional)')}</div>

            {/* Latitude */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-lat">
                {i18n.t('Latitude')}
              </label>
              <input
                id="gov-lat"
                className={styles.input}
                type="text"
                value={values.latitude}
                onChange={(e) => set('latitude', e.target.value)}
                placeholder="e.g. 8.4847"
              />
            </div>

            {/* Longitude */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-lng">
                {i18n.t('Longitude')}
              </label>
              <input
                id="gov-lng"
                className={styles.input}
                type="text"
                value={values.longitude}
                onChange={(e) => set('longitude', e.target.value)}
                placeholder="e.g. -13.2344"
              />
            </div>

            {/* Opening Date */}
            <div className={styles.field}>
              <label className={styles.label} htmlFor="gov-openingDate">
                {i18n.t('Opening Date')}
              </label>
              <input
                id="gov-openingDate"
                className={styles.input}
                type="date"
                value={values.openingDate}
                onChange={(e) => set('openingDate', e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={styles.footer}>
          <button type="button" className={`${styles.btn} ${styles.btnGhost}`} onClick={onCancel}>
            <span className="material-icons-round">arrow_back</span>
            {i18n.t('Cancel')}
          </button>
          <div className={styles.footerRight}>
            <button
              type="button"
              className={`${styles.btn} ${styles.btnDefault}`}
              onClick={handleSaveDraft}
            >
              <span className="material-icons-round">save</span>
              {i18n.t('Save as Draft')}
            </button>
            <button type="submit" className={`${styles.btn} ${styles.btnPrimary}`}>
              <span className="material-icons-round">send</span>
              {i18n.t('Submit for Review')}
            </button>
          </div>
        </div>
      </form>
    </div>
  )
}

export default RequestForm
