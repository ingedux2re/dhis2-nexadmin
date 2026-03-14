// src/components/OrgUnit/__tests__/OrgUnitForm.test.tsx
import type { ReactNode } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrgUnitForm } from '../OrgUnitForm'
import type { OrgUnitListItem } from '../../../types/orgUnit'

// Mock minimal — aucun React requis, aucun ReactFinalForm
jest.mock('@dhis2/ui', () => ({
  Modal: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ModalTitle: ({ children }: { children?: ReactNode }) => <h2>{children}</h2>,
  ModalContent: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ModalActions: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  ButtonStrip: ({ children }: { children?: ReactNode }) => <div>{children}</div>,
  Button: ({
    children,
    onClick,
    dataTest,
    disabled,
    type,
  }: {
    children?: ReactNode
    onClick?: () => void
    dataTest?: string
    disabled?: boolean
    type?: string
  }) => (
    <button
      onClick={onClick}
      data-testid={dataTest}
      disabled={disabled}
      type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
    >
      {children}
    </button>
  ),
  InputField: ({
    label,
    value,
    onChange,
    dataTest,
    validationText,
  }: {
    label?: string
    value?: string
    dataTest?: string
    validationText?: string
    onChange?: (p: { value: string }) => void
  }) => (
    <div>
      {label && <label>{label}</label>}
      <input
        data-testid={dataTest}
        value={value ?? ''}
        onChange={(e) => onChange?.({ value: e.target.value })}
      />
      {validationText && <span>{validationText}</span>}
    </div>
  ),
  TextAreaField: ({
    label,
    value,
    onChange,
    dataTest,
  }: {
    label?: string
    value?: string
    dataTest?: string
    onChange?: (p: { value: string }) => void
  }) => (
    <div>
      {label && <label>{label}</label>}
      <textarea
        data-testid={dataTest}
        value={value ?? ''}
        onChange={(e) => onChange?.({ value: e.target.value })}
      />
    </div>
  ),
  NoticeBox: ({ children, title }: { children?: ReactNode; title?: string }) => (
    <div data-testid="form-error">
      <strong>{title}</strong>
      {children}
    </div>
  ),
  CircularLoader: () => <span />,
}))

const noop = async () => {}

const makeEditTarget = (): OrgUnitListItem => ({
  id: 'xyz789',
  name: 'District Clinic',
  shortName: 'DC',
  code: 'DC001',
  level: 3,
  path: '/root/parent/xyz789',
  parent: { id: 'parentId', name: 'Province' },
  openingDate: '2000-06-15',
  closedDate: undefined,
})

describe('OrgUnitForm', () => {
  it('renders create title', () => {
    render(<OrgUnitForm saving={false} error={undefined} onSave={noop} onClose={noop} />)
    expect(screen.getByText('Create organisation unit')).toBeTruthy()
  })

  it('shows validation errors on empty save', () => {
    render(<OrgUnitForm saving={false} error={undefined} onSave={noop} onClose={noop} />)
    fireEvent.click(screen.getByTestId('orgunit-form-save'))
    expect(screen.getByText('Name is required')).toBeTruthy()
    expect(screen.getByText('Short name is required')).toBeTruthy()
    expect(screen.getByText('Opening date is required')).toBeTruthy()
    expect(screen.getByText('Parent org unit is required')).toBeTruthy()
  })

  it('calls onSave with correct payload', async () => {
    const onSave = jest.fn().mockResolvedValue(undefined)
    render(<OrgUnitForm saving={false} error={undefined} onSave={onSave} onClose={noop} />)
    fireEvent.change(screen.getByTestId('orgunit-form-name'), { target: { value: 'New Clinic' } })
    fireEvent.change(screen.getByTestId('orgunit-form-shortname'), { target: { value: 'NC' } })
    fireEvent.change(screen.getByTestId('orgunit-form-opening-date'), {
      target: { value: '2024-01-01' },
    })
    fireEvent.change(screen.getByTestId('orgunit-form-parent'), { target: { value: 'parentUid' } })
    fireEvent.click(screen.getByTestId('orgunit-form-save'))
    expect(onSave).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Clinic',
        shortName: 'NC',
        openingDate: '2024-01-01',
        parent: { id: 'parentUid' },
      })
    )
  })

  it('calls onClose on cancel', () => {
    const onClose = jest.fn()
    render(<OrgUnitForm saving={false} error={undefined} onSave={noop} onClose={onClose} />)
    fireEvent.click(screen.getByTestId('orgunit-form-cancel'))
    expect(onClose).toHaveBeenCalled()
  })

  it('renders edit title', () => {
    render(
      <OrgUnitForm
        unit={makeEditTarget()}
        saving={false}
        error={undefined}
        onSave={noop}
        onClose={noop}
      />
    )
    expect(screen.getByText('Edit organisation unit')).toBeTruthy()
  })

  it('pre-populates name field', () => {
    render(
      <OrgUnitForm
        unit={makeEditTarget()}
        saving={false}
        error={undefined}
        onSave={noop}
        onClose={noop}
      />
    )
    expect((screen.getByTestId('orgunit-form-name') as HTMLInputElement).value).toBe(
      'District Clinic'
    )
  })

  it('shows error notice on save failure', () => {
    render(
      <OrgUnitForm
        unit={makeEditTarget()}
        saving={false}
        error="Conflict"
        onSave={noop}
        onClose={noop}
      />
    )
    expect(screen.getByTestId('form-error')).toBeTruthy()
  })
})
