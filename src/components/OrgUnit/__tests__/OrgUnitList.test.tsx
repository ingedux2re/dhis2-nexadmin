// src/components/OrgUnit/__tests__/OrgUnitList.test.tsx
import type { ReactNode } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { OrgUnitList } from '../OrgUnitList'
import type { OrgUnitListItem } from '../../../types/orgUnit'

// ── Minimal @dhis2/ui mock ────────────────────────────────────────────────────
jest.mock('@dhis2/ui', () => ({
  DataTable: ({ children }: { children?: ReactNode }) => (
    <table data-testid="data-table">{children}</table>
  ),
  DataTableHead: ({ children }: { children?: ReactNode }) => <thead>{children}</thead>,
  DataTableBody: ({ children }: { children?: ReactNode }) => <tbody>{children}</tbody>,
  DataTableRow: ({ children }: { children?: ReactNode }) => <tr>{children}</tr>,
  DataTableColumnHeader: ({ children }: { children?: ReactNode }) => <th>{children}</th>,
  DataTableCell: ({ children }: { children?: ReactNode }) => <td>{children}</td>,
  Button: ({
    children,
    onClick,
    dataTest,
  }: {
    children?: ReactNode
    onClick?: () => void
    dataTest?: string
  }) => (
    <button onClick={onClick} data-testid={dataTest}>
      {children}
    </button>
  ),
  CircularLoader: () => <span data-testid="circular-loader" />,
  NoticeBox: ({
    children,
    title,
    error,
  }: {
    children?: ReactNode
    title?: string
    error?: boolean
  }) => (
    <div data-testid={error ? 'error-notice' : 'notice-box'}>
      <strong>{title}</strong>
      {children}
    </div>
  ),
  Tag: ({
    children,
    positive,
    negative,
  }: {
    children?: ReactNode
    positive?: boolean
    negative?: boolean
  }) => (
    <span data-testid={positive ? 'tag-positive' : negative ? 'tag-negative' : 'tag'}>
      {children}
    </span>
  ),
}))

// ── Fixtures ──────────────────────────────────────────────────────────────────

const makeUnit = (overrides: Partial<OrgUnitListItem> = {}): OrgUnitListItem => ({
  id: 'ou001',
  name: 'Freetown CHC',
  shortName: 'FCHC',
  code: 'SL001',
  level: 3,
  path: '/root/region/ou001',
  parent: { id: 'region01', name: 'Western Area' },
  openingDate: '2010-01-15',
  closedDate: undefined,
  lastUpdated: '2024-06-01',
  ...overrides,
})

const makeClosedUnit = (): OrgUnitListItem =>
  makeUnit({ id: 'ou002', name: 'Old Clinic', closedDate: '2022-12-31' })

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('OrgUnitList', () => {
  const noop = jest.fn()

  beforeEach(() => jest.clearAllMocks())

  // ── Loading state ─────────────────────────────────────────────────────────

  it('shows a spinner when loading', () => {
    render(<OrgUnitList orgUnits={[]} loading={true} error={null} onEdit={noop} onDelete={noop} />)
    expect(screen.getByTestId('circular-loader')).toBeTruthy()
    expect(screen.queryByTestId('data-table')).toBeNull()
  })

  // ── Error state ───────────────────────────────────────────────────────────

  it('shows an error notice when error is provided', () => {
    const err = new Error('Network timeout')
    render(<OrgUnitList orgUnits={[]} loading={false} error={err} onEdit={noop} onDelete={noop} />)
    expect(screen.getByTestId('error-notice')).toBeTruthy()
    expect(screen.getByText('Network timeout')).toBeTruthy()
  })

  // ── Empty state ───────────────────────────────────────────────────────────

  it('shows empty-state notice when org units list is empty', () => {
    render(<OrgUnitList orgUnits={[]} loading={false} error={null} onEdit={noop} onDelete={noop} />)
    expect(screen.getByText('No organisation units found')).toBeTruthy()
    expect(screen.queryByTestId('data-table')).toBeNull()
  })

  // ── Table rendering ───────────────────────────────────────────────────────

  it('renders a table with one row per org unit', () => {
    const units = [makeUnit(), makeUnit({ id: 'ou002', name: 'Bo CHC' })]
    render(
      <OrgUnitList orgUnits={units} loading={false} error={null} onEdit={noop} onDelete={noop} />
    )
    expect(screen.getByTestId('data-table')).toBeTruthy()
    expect(screen.getByText('Freetown CHC')).toBeTruthy()
    expect(screen.getByText('Bo CHC')).toBeTruthy()
  })

  it('renders correct column headers', () => {
    render(
      <OrgUnitList
        orgUnits={[makeUnit()]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={noop}
      />
    )
    expect(screen.getByText('Name')).toBeTruthy()
    expect(screen.getByText('Short name')).toBeTruthy()
    expect(screen.getByText('Code')).toBeTruthy()
    expect(screen.getByText('Level')).toBeTruthy()
    expect(screen.getByText('Opening date')).toBeTruthy()
    expect(screen.getByText('Status')).toBeTruthy()
    expect(screen.getByText('Actions')).toBeTruthy()
  })

  it('renders — for missing code', () => {
    render(
      <OrgUnitList
        orgUnits={[makeUnit({ code: undefined })]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={noop}
      />
    )
    expect(screen.getByText('—')).toBeTruthy()
  })

  it('renders — for missing opening date', () => {
    render(
      <OrgUnitList
        orgUnits={[makeUnit({ openingDate: undefined })]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={noop}
      />
    )
    // Two dashes expected: one for code-less, one for date-less — just check at least one
    expect(screen.getAllByText('—').length).toBeGreaterThanOrEqual(1)
  })

  // ── Status tags ───────────────────────────────────────────────────────────

  it('shows Open tag for an active org unit', () => {
    render(
      <OrgUnitList
        orgUnits={[makeUnit()]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={noop}
      />
    )
    expect(screen.getByTestId('tag-positive')).toBeTruthy()
    expect(screen.getByText('Open')).toBeTruthy()
  })

  it('shows Closed tag for a closed org unit', () => {
    render(
      <OrgUnitList
        orgUnits={[makeClosedUnit()]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={noop}
      />
    )
    expect(screen.getByTestId('tag-negative')).toBeTruthy()
    expect(screen.getByText('Closed')).toBeTruthy()
  })

  // ── Action callbacks ──────────────────────────────────────────────────────

  it('calls onEdit with the correct org unit when Edit is clicked', () => {
    const onEdit = jest.fn()
    const unit = makeUnit()
    render(
      <OrgUnitList orgUnits={[unit]} loading={false} error={null} onEdit={onEdit} onDelete={noop} />
    )
    fireEvent.click(screen.getByText('Edit'))
    expect(onEdit).toHaveBeenCalledTimes(1)
    expect(onEdit).toHaveBeenCalledWith(unit)
  })

  it('calls onDelete with the correct org unit when Delete is clicked', () => {
    const onDelete = jest.fn()
    const unit = makeUnit()
    render(
      <OrgUnitList
        orgUnits={[unit]}
        loading={false}
        error={null}
        onEdit={noop}
        onDelete={onDelete}
      />
    )
    fireEvent.click(screen.getByText('Delete'))
    expect(onDelete).toHaveBeenCalledTimes(1)
    expect(onDelete).toHaveBeenCalledWith(unit)
  })

  it('renders Edit and Delete buttons for each row in a multi-row list', () => {
    const units = [
      makeUnit({ id: 'ou001', name: 'Clinic A' }),
      makeUnit({ id: 'ou002', name: 'Clinic B' }),
    ]
    render(
      <OrgUnitList orgUnits={units} loading={false} error={null} onEdit={noop} onDelete={noop} />
    )
    expect(screen.getAllByText('Edit')).toHaveLength(2)
    expect(screen.getAllByText('Delete')).toHaveLength(2)
  })
})
