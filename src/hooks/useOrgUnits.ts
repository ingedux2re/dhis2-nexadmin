import { useDataQuery } from '@dhis2/app-runtime'
import type { OrgUnitsResponse, OrgUnitsQueryParams } from '../types/orgUnit'

const ORG_UNITS_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: (vars: OrgUnitsQueryParams) => ({
      fields: [
        'id',
        'name',
        'shortName',
        'code',
        'level',
        'path',
        'parent[id,name]',
        'openingDate',
        'closedDate',
        'lastUpdated',
      ],
      paging: true,
      page: vars.page ?? 1,
      pageSize: vars.pageSize ?? 50,
      ...(vars.query ? { query: vars.query } : {}),
      ...(vars.level !== undefined ? { level: vars.level } : {}),
      ...(vars.withinUserHierarchy ? { withinUserHierarchy: true } : {}),
      ...(vars.order ? { order: vars.order } : { order: 'name:asc' }),
      ...(vars.filter?.length ? { filter: vars.filter } : {}),
    }),
  },
}

export interface UseOrgUnitsResult {
  orgUnits: OrgUnitsResponse['organisationUnits']
  pager: OrgUnitsResponse['pager'] | undefined
  loading: boolean
  error: Error | undefined
  refetch: (newVars?: OrgUnitsQueryParams) => void
}

export const useOrgUnits = (initialParams: OrgUnitsQueryParams = {}): UseOrgUnitsResult => {
  const { loading, error, data, refetch } = useDataQuery<{
    orgUnits: OrgUnitsResponse
  }>(ORG_UNITS_QUERY, { variables: initialParams })

  return {
    orgUnits: data?.orgUnits?.organisationUnits ?? [],
    pager: data?.orgUnits?.pager,
    loading,
    error: error as Error | undefined,
    refetch,
  }
}
