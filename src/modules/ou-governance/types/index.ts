// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/types/index.ts
//
// Shared TypeScript types for the Organisation Unit Governance Workflow module.
// ─────────────────────────────────────────────────────────────────────────────

// ── Workflow states ───────────────────────────────────────────────────────────

export type WorkflowStatus =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'UNDER_REVIEW'
  | 'VALIDATED'
  | 'CREATED'
  | 'REJECTED'
  | 'PENDING_USER'
  | 'USER_CREATED'

// ── Role simulation (demo only) ───────────────────────────────────────────────

export type DemoRole = 'DISTRICT' | 'REGION' | 'ADMIN'

// ── Facility types ────────────────────────────────────────────────────────────

export type FacilityType =
  | 'health_centre'
  | 'hospital'
  | 'clinic'
  | 'dispensary'
  | 'pharmacy'
  | 'laboratory'
  | 'other'

// ── Organisation Unit levels ──────────────────────────────────────────────────

export type OrgUnitLevel = 1 | 2 | 3 | 4 | 5

// ── Timeline event ────────────────────────────────────────────────────────────

export interface TimelineEvent {
  id: string
  /** ISO timestamp */
  timestamp: string
  /** Workflow status reached at this step */
  status: WorkflowStatus
  /** Role that performed this action */
  role: DemoRole
  /** Optional free-text comment */
  comment?: string
  /** Display label key (looked up via i18n) */
  actionKey: string
}

// ── Governance request ────────────────────────────────────────────────────────

export interface GovernanceRequest {
  id: string
  /** Display-friendly sequential number e.g. "REQ-0001" */
  reference: string
  // ── Form fields ─────────────────────────────────────────────────
  facilityName: string
  shortName: string
  facilityType: FacilityType
  /** DHIS2 level (1 = national, 5 = facility) */
  level: OrgUnitLevel
  proposedParentId: string
  proposedParentName: string
  latitude: string
  longitude: string
  openingDate: string
  // ── Workflow metadata ─────────────────────────────────────────────
  status: WorkflowStatus
  /** ISO timestamp of last status change */
  lastUpdated: string
  /** ISO timestamp of initial creation */
  createdAt: string
  /** Free-text comment from Region officer */
  regionComment: string
  /** Free-text comment from Admin */
  adminComment: string
  /** Assigned UID after CREATED (simulated) */
  assignedUid?: string
  /** Full chronological audit trail */
  timeline: TimelineEvent[]
  /** Role that created the request */
  createdByRole: DemoRole
}

// ── Form state (new / edit) ───────────────────────────────────────────────────

export interface RequestFormValues {
  facilityName: string
  shortName: string
  facilityType: FacilityType | ''
  level: OrgUnitLevel | ''
  proposedParentId: string
  proposedParentName: string
  latitude: string
  longitude: string
  openingDate: string
}

export const EMPTY_FORM: RequestFormValues = {
  facilityName: '',
  shortName: '',
  facilityType: '',
  level: '',
  proposedParentId: '',
  proposedParentName: '',
  latitude: '',
  longitude: '',
  openingDate: '',
}

// ── Allowed transitions per role ──────────────────────────────────────────────

export type StatusTransition = {
  from: WorkflowStatus
  to: WorkflowStatus
  role: DemoRole
  /** i18n key for the action button label */
  labelKey: string
  /** Material icon name */
  icon: string
  /** Button variant */
  variant: 'primary' | 'success' | 'danger' | 'warning'
}

export const ALLOWED_TRANSITIONS: StatusTransition[] = [
  // District
  {
    from: 'DRAFT',
    to: 'SUBMITTED',
    role: 'DISTRICT',
    labelKey: 'Submit for Review',
    icon: 'send',
    variant: 'primary',
  },
  // Region
  {
    from: 'SUBMITTED',
    to: 'UNDER_REVIEW',
    role: 'REGION',
    labelKey: 'Start Review',
    icon: 'rate_review',
    variant: 'primary',
  },
  {
    from: 'UNDER_REVIEW',
    to: 'VALIDATED',
    role: 'REGION',
    labelKey: 'Validate',
    icon: 'check_circle',
    variant: 'success',
  },
  {
    from: 'UNDER_REVIEW',
    to: 'REJECTED',
    role: 'REGION',
    labelKey: 'Reject',
    icon: 'cancel',
    variant: 'danger',
  },
  // Admin
  {
    from: 'VALIDATED',
    to: 'CREATED',
    role: 'ADMIN',
    labelKey: 'Mark as Created',
    icon: 'add_circle',
    variant: 'success',
  },
]

/**
 * Returns the allowed transitions for a given status + role combination.
 */
export function getAllowedTransitions(status: WorkflowStatus, role: DemoRole): StatusTransition[] {
  return ALLOWED_TRANSITIONS.filter((t) => t.from === status && t.role === role)
}
