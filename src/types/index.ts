// ─────────────────────────────────────────────────────────────────────────────
// src/types/index.ts
// DHIS2 NexAdmin — Global type definitions
// ─────────────────────────────────────────────────────────────────────────────

// ── DHIS2 base types ─────────────────────────────────────────────────────────

export interface DhisIdentifiable {
  id: string
  displayName: string
  code?: string
  created?: string
  lastUpdated?: string
}

export interface DhisPager {
  page: number
  pageCount: number
  total: number
  pageSize: number
  nextPage?: string
  prevPage?: string
}

export interface DhisApiResponse<T> {
  pager?: DhisPager
  [key: string]: T | DhisPager | undefined
}

// ── Org Unit types ────────────────────────────────────────────────────────────

export type OuLevel = 1 | 2 | 3 | 4 | 5

export interface OrganisationUnit extends DhisIdentifiable {
  shortName?: string
  path: string
  level: OuLevel
  parent?: Pick<OrganisationUnit, 'id' | 'displayName' | 'path'>
  children?: OrganisationUnit[]
  featureType?: 'NONE' | 'MULTI_POLYGON' | 'POLYGON' | 'POINT' | 'SYMBOL'
  coordinates?: string
  geometry?: GeoJsonGeometry
  organisationUnitGroups?: DhisIdentifiable[]
  openingDate?: string
  closedDate?: string
  comment?: string
  contactPerson?: string
  phoneNumber?: string
  email?: string
  url?: string
}

export interface GeoJsonGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon'
  coordinates: number[] | number[][] | number[][][]
}

// ── Workflow / WFR types ──────────────────────────────────────────────────────

export type WfrStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'APPROVED'
  | 'CREATED'
  | 'REJECTED'
  | 'SKIPPED'

export type WfrType = 'NEW_FACILITY' | 'RENAME' | 'MERGE' | 'MOVE' | 'CLOSE'

export interface WorkflowRequest {
  id: string // e.g. WFR-2026-006
  type: WfrType
  status: WfrStatus
  facilityName: string
  district: string
  submittedBy: string
  submittedDate: string
  reviewedBy?: string
  reviewedDate?: string
  notes?: string
  ouId?: string // set once CREATED in DHIS2
}

// ── User Provisioning types ───────────────────────────────────────────────────

export type ProvisionStatus = 'PENDING' | 'PROVISIONED' | 'SKIPPED'

export interface UserProvisionRequest {
  wfrId: string
  facilityName: string
  ouId: string
  submittedBy: string
  district: string
  status: ProvisionStatus
  username?: string
  provisionedAt?: string
}

// ── Notification types ────────────────────────────────────────────────────────

export type NotificationChannel = 'EMAIL' | 'SMS' | 'BOTH'
export type NotificationEvent =
  | 'WFR_SUBMITTED'
  | 'WFR_APPROVED'
  | 'WFR_REJECTED'
  | 'USER_PROVISIONED'

export interface NotificationRule {
  event: NotificationEvent
  channel: NotificationChannel
  enabled: boolean
  templateSubject?: string
  templateBody: string
}

// ── App store types ───────────────────────────────────────────────────────────

export interface AppState {
  /** ISO 639-1 locale code currently active */
  currentLocale: string
  setLocale: (locale: string) => void

  /** Global loading overlay (used for bulk operations) */
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void

  /** Sidebar open state (mobile) */
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void

  /** Currently active page id */
  activePage: PageId
  setActivePage: (page: PageId) => void
}

export type PageId =
  | 'dashboard'
  | 'f1-bulk-reorg'
  | 'f2-impact-analyzer'
  | 'f3-duplicate-detector'
  | 'f4-bulk-rename'
  | 'f5-hierarchy-validator'
  | 'f6-geo-consistency'
  | 'f7-audit-log'
  | 'f8-snapshots'
  | 'f9-simulator'
  | 'f10-wizard'
  | 'f11-workflow'
  | 'f12-user-provisioning'
  | 'settings'

// ── Dashboard KPI types ───────────────────────────────────────────────────────

export interface DashboardKpi {
  label: string
  value: number | string
  unit?: string
  trend?: 'up' | 'down' | 'neutral'
  severity?: 'ok' | 'warning' | 'critical'
}

export interface IntegrityScore {
  score: number // 0–100
  label: 'ok' | 'warning' | 'critical'
  breakdown: {
    duplicates: number
    hierarchyViolations: number
    geoInconsistencies: number
    missingCodes: number
  }
}
