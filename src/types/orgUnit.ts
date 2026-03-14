export type FeatureType = 'NONE' | 'MULTI_POLYGON' | 'POLYGON' | 'POINT' | 'SYMBOL'

export interface OrgUnitRef {
  id: string
  name: string
}

export interface OrgUnit {
  id: string
  name: string
  shortName: string
  code?: string
  description?: string
  comment?: string
  level: number
  path: string
  parent?: OrgUnitRef
  openingDate?: string
  closedDate?: string
  featureType?: FeatureType
  geometry?: GeoJsonGeometry
  organisationUnitGroups?: OrgUnitRef[]
  dataSets?: OrgUnitRef[]
  programs?: OrgUnitRef[]
  created?: string
  lastUpdated?: string
}

export interface OrgUnitListItem {
  id: string
  name: string
  shortName: string
  code?: string
  level: number
  path: string
  parent?: OrgUnitRef
  openingDate?: string
  closedDate?: string
  lastUpdated?: string
}

export interface Pager {
  page: number
  pageSize: number
  pageCount?: number
  total?: number
  nextPage?: string
  prevPage?: string
}

export interface OrgUnitsResponse {
  organisationUnits: OrgUnitListItem[]
  pager: Pager
}

export interface OrgUnitCreatePayload {
  name: string
  shortName: string
  code?: string
  description?: string
  comment?: string
  openingDate: string
  parent?: { id: string }
  closedDate?: string
}
export type OrgUnitUpdatePayload = Partial<OrgUnitCreatePayload>
export type OrgUnitPatchPayload = OrgUnitUpdatePayload

export interface OrgUnitsQueryParams {
  page?: number
  pageSize?: number
  query?: string
  level?: number
  withinUserHierarchy?: boolean
  order?: string
  filter?: string[]
}

interface GeoJsonGeometry {
  type: string
  coordinates: unknown
}
