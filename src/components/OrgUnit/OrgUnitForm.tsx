// src/components/OrgUnit/OrgUnitForm.tsx
import { useState } from 'react'
import {
  Modal,
  ModalTitle,
  ModalContent,
  ModalActions,
  Button,
  ButtonStrip,
  InputField,
  TextAreaField,
  NoticeBox,
} from '@dhis2/ui'
import type { OrgUnit, OrgUnitCreatePayload, OrgUnitUpdatePayload } from '../../types/orgUnit'
import styles from './OrgUnitForm.module.css'
import i18n from '../../i18n'

// ── types ─────────────────────────────────────────────────────────────────────
interface Props {
  unit?: OrgUnit | null
  saving?: boolean
  error?: string | null
  onSave: (payload: OrgUnitCreatePayload | OrgUnitUpdatePayload) => Promise<void>
  onClose: () => void
}

interface FormValues {
  name: string
  shortName: string
  code: string
  openingDate: string
  closedDate: string
  description: string
  comment: string
  parentId: string
}

type FormErrors = Partial<Record<keyof FormValues, string>>

function validate(v: FormValues): FormErrors {
  const e: FormErrors = {}
  if (!v.name.trim()) e.name = 'Name is required'
  if (!v.shortName.trim()) e.shortName = 'Short name is required'
  if (!v.openingDate) e.openingDate = 'Opening date is required'
  if (!v.parentId.trim()) e.parentId = 'Parent org unit is required'
  return e
}

// ── DHIS2 UI fires { value?: string } — unwrap to plain string ────────────────
type D2Payload = { value?: string }
const unwrap =
  (setter: (v: string) => void) =>
  ({ value }: D2Payload) =>
    setter(value ?? '')

// ── Normalize ISO date string to YYYY-MM-DD for input[type=date] ──────────────
// DHIS2 returns "2010-01-01T00:00:00.000" — browsers require exactly "2010-01-01"
function toDateInput(value?: string): string {
  if (!value) return ''
  return value.slice(0, 10)
}

// ── component ─────────────────────────────────────────────────────────────────
export function OrgUnitForm({ unit, saving = false, error, onSave, onClose }: Props) {
  const isEdit = Boolean(unit)

  const [values, setValues] = useState<FormValues>({
    name: unit?.name ?? '',
    shortName: unit?.shortName ?? '',
    code: unit?.code ?? '',
    openingDate: toDateInput(unit?.openingDate),
    closedDate: toDateInput(unit?.closedDate),
    description: unit?.description ?? '',
    comment: unit?.comment ?? '',
    parentId: unit?.parent?.id ?? '',
  })

  const [errors, setErrors] = useState<FormErrors>({})
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({})

  const set = (field: keyof FormValues) => (val: string) =>
    setValues((prev) => ({ ...prev, [field]: val }))

  const touch = (field: keyof FormValues) => () =>
    setTouched((prev) => ({ ...prev, [field]: true }))

  const fieldError = (field: keyof FormValues) => (touched[field] ? errors[field] : undefined)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate(values)
    setErrors(errs)
    const allTouched = Object.keys(values).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<keyof FormValues, boolean>
    )
    setTouched(allTouched)
    if (Object.keys(errs).length > 0) return

    await onSave({
      name: values.name.trim(),
      shortName: values.shortName.trim(),
      openingDate: values.openingDate,
      parent: { id: values.parentId.trim() },
      ...(values.code && { code: values.code.trim() }),
      ...(values.closedDate && { closedDate: values.closedDate }),
      ...(values.description && { description: values.description.trim() }),
      ...(values.comment && { comment: values.comment.trim() }),
    })
  }

  return (
    <Modal large onClose={onClose}>
      <ModalTitle>
        {isEdit ? i18n.t('Edit organisation unit') : i18n.t('Create organisation unit')}
      </ModalTitle>

      <form onSubmit={handleSubmit}>
        <ModalContent className={styles.grid}>
          {error && (
            <NoticeBox error title={i18n.t('Save failed')} className={styles.fullWidth}>
              {error}
            </NoticeBox>
          )}

          <InputField
            label={i18n.t('Name *')}
            dataTest="orgunit-form-name"
            value={values.name}
            onChange={unwrap(set('name'))}
            onBlur={touch('name')}
            error={Boolean(fieldError('name'))}
            validationText={fieldError('name')}
          />

          <InputField
            label={i18n.t('Short name *')}
            dataTest="orgunit-form-shortname"
            value={values.shortName}
            onChange={unwrap(set('shortName'))}
            onBlur={touch('shortName')}
            error={Boolean(fieldError('shortName'))}
            validationText={fieldError('shortName')}
          />

          <InputField
            label={i18n.t('Code')}
            dataTest="orgunit-form-code"
            value={values.code}
            onChange={unwrap(set('code'))}
          />

          <InputField
            label={i18n.t('Opening date *')}
            type="date"
            dataTest="orgunit-form-opening-date"
            value={values.openingDate}
            onChange={unwrap(set('openingDate'))}
            onBlur={touch('openingDate')}
            error={Boolean(fieldError('openingDate'))}
            validationText={fieldError('openingDate')}
          />

          <InputField
            label={i18n.t('Closed date')}
            type="date"
            dataTest="orgunit-form-closed-date"
            value={values.closedDate}
            onChange={unwrap(set('closedDate'))}
          />

          <InputField
            label={i18n.t('Parent org unit ID *')}
            helpText={i18n.t('Enter the ID of the parent organisation unit')}
            dataTest="orgunit-form-parent"
            value={values.parentId}
            onChange={unwrap(set('parentId'))}
            onBlur={touch('parentId')}
            error={Boolean(fieldError('parentId'))}
            validationText={fieldError('parentId')}
          />

          <TextAreaField
            label={i18n.t('Description')}
            dataTest="orgunit-form-description"
            className={styles.fullWidth}
            value={values.description}
            onChange={unwrap(set('description'))}
          />

          <TextAreaField
            label={i18n.t('Comment')}
            dataTest="orgunit-form-comment"
            className={styles.fullWidth}
            value={values.comment}
            onChange={unwrap(set('comment'))}
          />
        </ModalContent>

        <ModalActions>
          <ButtonStrip end>
            <Button onClick={onClose} disabled={saving} dataTest="orgunit-form-cancel">
              {i18n.t('Cancel')}
            </Button>
            <Button primary type="submit" loading={saving} dataTest="orgunit-form-save">
              {isEdit ? i18n.t('Save changes') : i18n.t('Create')}
            </Button>
          </ButtonStrip>
        </ModalActions>
      </form>
    </Modal>
  )
}
