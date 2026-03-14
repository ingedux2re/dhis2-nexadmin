// src/components/OrgUnit/__tests__/OrgUnitForm.test.tsx
import type { ReactNode } from 'react' // [1] ReactNode au lieu de React.ReactNode
import { render, screen, fireEvent } from '@testing-library/react'
import { OrgUnitForm } from '../OrgUnitForm'
import type { OrgUnitListItem } from '../../../types/orgUnit'

jest.mock('@dhis2/ui', () => {
  // [5] ReactFinalForm : utiliser l'implémentation réelle de react-final-form
  // (installé transitivement par @dhis2/ui)
  const realRFF = jest.requireActual('react-final-form')

  // Mini-composant partagé pour InputField et TextAreaField
  const Field = ({
    label,
    value,
    onChange,
    dataTest,
    validationText,
  }: {
    label?: string
    value?: string
    onChange?: (v: { value: string }) => void
    dataTest?: string
    validationText?: string
  }) => (
    <div>
      {label && <label>{label}</label>}
      {/* [6] data-testid (pas data-test) pour getByTestId */}
      <input
        data-testid={dataTest}
        value={value ?? ''}
        onChange={(e) => onChange?.({ value: e.target.value })}
      />
      {validationText && <span>{validationText}</span>}
    </div>
  )

  return {
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
      // [6] data-testid pour getByTestId
      <button
        onClick={onClick}
        data-testid={dataTest}
        disabled={disabled}
        type={(type as 'button' | 'submit' | 'reset') ?? 'button'}
      >
        {children}
      </button>
    ),
    InputField: Field,
    TextAreaField: Field,
    NoticeBox: ({ children, title }: { children?: ReactNode; title?: string }) => (
      <div data-testid="form-error">
        <strong>{title}</strong>
        {children}
      </div>
    ),
    CircularLoader: () => <span />,
    ReactFinalForm: realRFF, // [5] vrai react-final-form
  }
})

// [2] async pour satisfaire onSave: (...) => Promise<void>
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
    // [mock async + typed]
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
    // [3] prop `unit` (pas `orgUnit`)
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
    // [3] prop `unit`
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
    // [3] prop `unit`   [4] error string pas Error object
    render(
      <OrgUnitForm
        unit={makeEditTarget()}
        saving={false}
        error="Conflict" // [4] string, pas new Error(...)
        onSave={noop}
        onClose={noop}
      />
    )
    expect(screen.getByTestId('form-error')).toBeTruthy()
  })
})
