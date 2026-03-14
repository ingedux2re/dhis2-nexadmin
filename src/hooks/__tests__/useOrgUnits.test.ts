import { renderHook } from '@testing-library/react'
import { useOrgUnits } from '../useOrgUnits'

const mockRefetch = jest.fn()
const mockUseDataQuery = jest.fn()

jest.mock('@dhis2/app-runtime', () => ({
  useDataQuery: (...args: unknown[]) => mockUseDataQuery(...args),
}))

const makeOrgUnit = (id: string) => ({
  id,
  name: `Org Unit ${id}`,
  shortName: `OU ${id}`,
  level: 2,
  path: `/rootId/${id}`,
})

const makePager = () => ({ page: 1, pageSize: 50, pageCount: 3, total: 120 })

describe('useOrgUnits', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('returns loading state when query is pending', () => {
    mockUseDataQuery.mockReturnValue({
      loading: true,
      error: undefined,
      data: undefined,
      refetch: mockRefetch,
    })
    const { result } = renderHook(() => useOrgUnits())
    expect(result.current.loading).toBe(true)
    expect(result.current.orgUnits).toEqual([])
    expect(result.current.pager).toBeUndefined()
    expect(result.current.error).toBeUndefined()
  })

  it('returns org units and pager on success', () => {
    const units = [makeOrgUnit('abc'), makeOrgUnit('def')]
    mockUseDataQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: { orgUnits: { organisationUnits: units, pager: makePager() } },
      refetch: mockRefetch,
    })
    const { result } = renderHook(() => useOrgUnits({ pageSize: 50 }))
    expect(result.current.orgUnits).toHaveLength(2)
    expect(result.current.orgUnits[0].id).toBe('abc')
    expect(result.current.pager?.total).toBe(120)
  })

  it('returns error when query fails', () => {
    const err = new Error('Network error')
    mockUseDataQuery.mockReturnValue({
      loading: false,
      error: err,
      data: undefined,
      refetch: mockRefetch,
    })
    const { result } = renderHook(() => useOrgUnits())
    expect(result.current.error).toBe(err)
    expect(result.current.orgUnits).toEqual([])
  })

  it('returns empty array when organisationUnits is missing', () => {
    mockUseDataQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: { orgUnits: { pager: makePager() } },
      refetch: mockRefetch,
    })
    const { result } = renderHook(() => useOrgUnits())
    expect(result.current.orgUnits).toEqual([])
  })

  it('passes initialParams as variables to useDataQuery', () => {
    mockUseDataQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: undefined,
      refetch: mockRefetch,
    })
    renderHook(() => useOrgUnits({ page: 2, pageSize: 20, query: 'health' }))
    expect(mockUseDataQuery).toHaveBeenCalledWith(
      expect.any(Object),
      expect.objectContaining({ variables: { page: 2, pageSize: 20, query: 'health' } })
    )
  })

  it('exposes refetch function from useDataQuery', () => {
    mockUseDataQuery.mockReturnValue({
      loading: false,
      error: undefined,
      data: undefined,
      refetch: mockRefetch,
    })
    const { result } = renderHook(() => useOrgUnits())
    result.current.refetch({ page: 3 })
    expect(mockRefetch).toHaveBeenCalledWith({ page: 3 })
  })
})
