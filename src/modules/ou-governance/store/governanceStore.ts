// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/store/governanceStore.ts
//
// Lightweight in-memory store for governance requests.
// Uses a simple module-level array so data persists across navigations within
// the same session.  No backend — this is an MVP demo.
// ─────────────────────────────────────────────────────────────────────────────

import type {
  GovernanceRequest,
  WorkflowStatus,
  DemoRole,
  FacilityType,
  OrgUnitLevel,
  RequestFormValues,
  TimelineEvent,
} from '../types'

// ── Helpers ───────────────────────────────────────────────────────────────────

let _nextSeq = 1

function makeReference(): string {
  return `REQ-${String(_nextSeq++).padStart(4, '0')}`
}

function uid(): string {
  return Math.random().toString(36).slice(2, 13).toUpperCase()
}

function now(): string {
  return new Date().toISOString()
}

function makeEvent(
  status: WorkflowStatus,
  role: DemoRole,
  actionKey: string,
  comment?: string
): TimelineEvent {
  return {
    id: uid(),
    timestamp: now(),
    status,
    role,
    actionKey,
    comment,
  }
}

// ── Action key labels (used by timeline) ─────────────────────────────────────

export const ACTION_LABELS: Record<string, string> = {
  DRAFT_CREATED: 'Draft created',
  SUBMITTED: 'Submitted for review',
  UNDER_REVIEW: 'Review started',
  VALIDATED: 'Validated by Region',
  REJECTED: 'Rejected',
  CREATED: 'Organisation unit created',
  PENDING_USER: 'Pending user assignment',
  USER_CREATED: 'User account created',
}

// ── Mock seed data ────────────────────────────────────────────────────────────

function makeSeedRequest(
  facilityName: string,
  facilityType: FacilityType,
  status: WorkflowStatus,
  daysAgo: number,
  proposedParentName: string
): GovernanceRequest {
  const createdAt = new Date(Date.now() - daysAgo * 864e5).toISOString()
  const ref = makeReference()
  const timeline: TimelineEvent[] = [
    {
      id: uid(),
      timestamp: createdAt,
      status: 'DRAFT',
      role: 'DISTRICT',
      actionKey: 'DRAFT_CREATED',
    },
  ]

  if (
    status === 'SUBMITTED' ||
    status === 'UNDER_REVIEW' ||
    status === 'VALIDATED' ||
    status === 'CREATED' ||
    status === 'REJECTED'
  ) {
    timeline.push({
      id: uid(),
      timestamp: new Date(Date.now() - (daysAgo - 1) * 864e5).toISOString(),
      status: 'SUBMITTED',
      role: 'DISTRICT',
      actionKey: 'SUBMITTED',
    })
  }
  if (
    status === 'UNDER_REVIEW' ||
    status === 'VALIDATED' ||
    status === 'CREATED' ||
    status === 'REJECTED'
  ) {
    timeline.push({
      id: uid(),
      timestamp: new Date(Date.now() - (daysAgo - 2) * 864e5).toISOString(),
      status: 'UNDER_REVIEW',
      role: 'REGION',
      actionKey: 'UNDER_REVIEW',
    })
  }
  if (status === 'VALIDATED' || status === 'CREATED') {
    timeline.push({
      id: uid(),
      timestamp: new Date(Date.now() - (daysAgo - 3) * 864e5).toISOString(),
      status: 'VALIDATED',
      role: 'REGION',
      actionKey: 'VALIDATED',
      comment: 'Coordinates verified. Facility meets requirements.',
    })
  }
  if (status === 'CREATED') {
    timeline.push({
      id: uid(),
      timestamp: new Date(Date.now() - (daysAgo - 4) * 864e5).toISOString(),
      status: 'CREATED',
      role: 'ADMIN',
      actionKey: 'CREATED',
    })
  }
  if (status === 'REJECTED') {
    timeline.push({
      id: uid(),
      timestamp: new Date(Date.now() - (daysAgo - 3) * 864e5).toISOString(),
      status: 'REJECTED',
      role: 'REGION',
      actionKey: 'REJECTED',
      comment: 'Insufficient documentation. Missing GPS coordinates.',
    })
  }

  return {
    id: uid(),
    reference: ref,
    facilityName,
    shortName: facilityName.slice(0, 50),
    facilityType,
    level: 5,
    proposedParentId: 'ou_' + uid().slice(0, 8),
    proposedParentName,
    latitude: status === 'REJECTED' ? '' : `${(Math.random() * 10 + 5).toFixed(4)}`,
    longitude: status === 'REJECTED' ? '' : `${(Math.random() * 10 + 15).toFixed(4)}`,
    openingDate: '2026-01-01',
    status,
    lastUpdated: timeline[timeline.length - 1].timestamp,
    createdAt,
    regionComment:
      status === 'VALIDATED' || status === 'CREATED'
        ? 'Coordinates verified. Facility meets requirements.'
        : status === 'REJECTED'
          ? 'Insufficient documentation. Missing GPS coordinates.'
          : '',
    adminComment: status === 'CREATED' ? 'UID assigned and org unit created in DHIS2.' : '',
    assignedUid: status === 'CREATED' ? uid().slice(0, 11) : undefined,
    timeline,
    createdByRole: 'DISTRICT',
  }
}

// ── Module-level store ────────────────────────────────────────────────────────

let _requests: GovernanceRequest[] = [
  makeSeedRequest('Kailahun Health Centre', 'health_centre', 'DRAFT', 7, 'Kailahun District'),
  makeSeedRequest('Bo City Hospital', 'hospital', 'SUBMITTED', 5, 'Bo District'),
  makeSeedRequest('Kenema Central Clinic', 'clinic', 'UNDER_REVIEW', 4, 'Kenema District'),
  makeSeedRequest('Makeni Dispensary', 'dispensary', 'VALIDATED', 3, 'Bombali District'),
  makeSeedRequest('Freetown Lab', 'laboratory', 'CREATED', 2, 'Western Area Urban'),
  makeSeedRequest('Pujehun Pharmacy', 'pharmacy', 'REJECTED', 3, 'Pujehun District'),
]

// ── Public API ────────────────────────────────────────────────────────────────

export function getAll(): GovernanceRequest[] {
  return [..._requests]
}

export function getById(id: string): GovernanceRequest | undefined {
  return _requests.find((r) => r.id === id)
}

export function createRequest(
  values: RequestFormValues,
  role: DemoRole,
  asDraft: boolean
): GovernanceRequest {
  const id = uid()
  const ts = now()
  const status: WorkflowStatus = asDraft ? 'DRAFT' : 'SUBMITTED'
  const timeline: TimelineEvent[] = [makeEvent('DRAFT', role, 'DRAFT_CREATED')]
  if (!asDraft) {
    timeline.push(makeEvent('SUBMITTED', role, 'SUBMITTED'))
  }

  const req: GovernanceRequest = {
    id,
    reference: makeReference(),
    facilityName: values.facilityName,
    shortName: values.shortName || values.facilityName.slice(0, 50),
    facilityType: (values.facilityType as FacilityType) || 'other',
    level: (values.level as OrgUnitLevel) || 5,
    proposedParentId: values.proposedParentId,
    proposedParentName: values.proposedParentName,
    latitude: values.latitude,
    longitude: values.longitude,
    openingDate: values.openingDate,
    status,
    lastUpdated: ts,
    createdAt: ts,
    regionComment: '',
    adminComment: '',
    timeline,
    createdByRole: role,
  }
  _requests = [req, ..._requests]
  return req
}

export function updateRequest(
  id: string,
  values: Partial<RequestFormValues>
): GovernanceRequest | null {
  const idx = _requests.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const existing = _requests[idx]
  // Cast facilityType / level to their strict types; empty string falls back to existing value.
  const updated: GovernanceRequest = {
    ...existing,
    ...values,
    facilityType:
      values.facilityType != null && (values.facilityType as string) !== ''
        ? (values.facilityType as FacilityType)
        : existing.facilityType,
    level:
      values.level != null && String(values.level) !== ''
        ? (values.level as OrgUnitLevel)
        : existing.level,
    lastUpdated: now(),
  }
  _requests = [..._requests.slice(0, idx), updated, ..._requests.slice(idx + 1)]
  return updated
}

export function transitionRequest(
  id: string,
  newStatus: WorkflowStatus,
  role: DemoRole,
  comment?: string
): GovernanceRequest | null {
  const idx = _requests.findIndex((r) => r.id === id)
  if (idx === -1) return null
  const existing = _requests[idx]
  const ts = now()

  const event = makeEvent(newStatus, role, newStatus, comment)

  const assignedUid = newStatus === 'CREATED' ? uid().slice(0, 11) : existing.assignedUid

  const updated: GovernanceRequest = {
    ...existing,
    status: newStatus,
    lastUpdated: ts,
    regionComment: role === 'REGION' && comment !== undefined ? comment : existing.regionComment,
    adminComment: role === 'ADMIN' && comment !== undefined ? comment : existing.adminComment,
    assignedUid,
    timeline: [...existing.timeline, event],
  }

  _requests = [..._requests.slice(0, idx), updated, ..._requests.slice(idx + 1)]
  return updated
}

export function deleteRequest(id: string): void {
  _requests = _requests.filter((r) => r.id !== id)
}
