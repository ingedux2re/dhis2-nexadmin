
// Re-export and locally import the canonical GeoJsonGeometry from the central
// types module. The weak `{ type: string; coordinates: unknown }` duplicate has
// been removed so that all geometry code benefits from the precise union types.
import type { GeoJsonGeometry } from './index'
// src/types/orgUnit.ts


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
  ancestors?: OrgUnitRef[] // ← NEW: full ancestor chain for breadcrumb display
  featureType?: FeatureType
  geometry?: GeoJsonGeometry
  openingDate?: string
  closedDate?: string
  lastUpdated?: string
}

export interface OrgUnitIntegrityItem {
  id: string
  name: string
  shortName: string
  level: number
  path: string
  parent?: OrgUnitRef
  featureType?: FeatureType
  geometry?: GeoJsonGeometry
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

// ── Phase 3: Bulk Operations ──────────────────────────────────────────────────

export interface BulkMovePayload {
  orgUnitId: string
  newParentId: string
}

export interface BulkRenamePayload {
  orgUnitId: string
  newName: string
  newShortName?: string
}

export interface BulkOperationResult {
  success: boolean
  completed: number
  total: number
  rolledBack: number
  errors: string[]
}

export type BulkRenameMode = 'find-replace' | 'prefix' | 'suffix' | 'regex'
