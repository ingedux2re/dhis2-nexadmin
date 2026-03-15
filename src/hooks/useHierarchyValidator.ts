import { useMemo } from 'react'
import type { OrgUnitIntegrityItem } from '../types/orgUnit'
import type { Severity } from './useDuplicateDetector'

export type ViolationType = 'missing-parent' | 'orphan' | 'level-gap' | 'circular-ref'

export interface HierarchyViolation {
  id: string
  orgUnitId: string
  orgUnitName: string
  violationType: ViolationType
  details: string
  severity: Severity
}

function detectCircularRef(ou: OrgUnitIntegrityItem): boolean {
  // path format: "/rootId/parentId/ouId"
  // A circular ref means the same segment appears twice
  const segments = ou.path.split('/').filter(Boolean)
  return new Set(segments).size !== segments.length
}

export function useHierarchyValidator(orgUnits: OrgUnitIntegrityItem[]): HierarchyViolation[] {
  return useMemo(() => {
    if (orgUnits.length === 0) return []

    const idMap = new Map<string, OrgUnitIntegrityItem>()
    for (const ou of orgUnits) idMap.set(ou.id, ou)

    const violations: HierarchyViolation[] = []

    for (const ou of orgUnits) {
      // Circular reference check (works for all levels)
      if (detectCircularRef(ou)) {
        violations.push({
          id: `circular-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          violationType: 'circular-ref',
          details: `Path contains a repeated segment: ${ou.path}`,
          severity: 'error',
        })
        // Skip further checks for this OU to avoid cascading false positives
        continue
      }

      // Root-level OUs (level 1) are expected to have no parent
      if (ou.level === 1) continue

      // Missing parent reference
      if (!ou.parent) {
        violations.push({
          id: `missing-parent-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          violationType: 'missing-parent',
          details: `Level ${ou.level} unit has no parent reference`,
          severity: 'error',
        })
        continue
      }

      // Orphan: parent referenced but not present in dataset
      const parentOU = idMap.get(ou.parent.id)
      if (!parentOU) {
        violations.push({
          id: `orphan-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          violationType: 'orphan',
          details: `Parent "${ou.parent.name}" (${ou.parent.id}) not found in hierarchy`,
          severity: 'error',
        })
        continue
      }

      // Level gap: parent level should be exactly one less
      if (parentOU.level !== ou.level - 1) {
        violations.push({
          id: `level-gap-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          violationType: 'level-gap',
          details: `Expected parent at level ${ou.level - 1}, found "${parentOU.name}" at level ${parentOU.level}`,
          severity: 'warning',
        })
      }
    }

    // Sort: error first, then warning, then by org unit name
    return violations.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 }
      const s = order[a.severity] - order[b.severity]
      if (s !== 0) return s
      return a.orgUnitName.localeCompare(b.orgUnitName)
    })
  }, [orgUnits])
}
