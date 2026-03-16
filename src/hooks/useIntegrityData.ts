// src/hooks/useIntegrityData.ts
// ─────────────────────────────────────────────────────────────────────────────
// Shared DHIS2 data query for all Data Integrity pages.
//
// Previously each page (DuplicateDetector, HierarchyValidator, GeoConsistency)
// defined its own copy of INTEGRITY_QUERY with slightly different field sets,
// causing drift.  This hook provides a single, complete field set so every
// integrity algorithm gets all the data it needs from one query.
//
// Usage:
//   const { orgUnits, loading, error, run } = useIntegrityData()
//   // Call run() when the user clicks "Scan / Run Validation / Run Geo Check"
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import type { OrgUnitIntegrityItem } from '../types/orgUnit'

// Complete field set required by all three integrity algorithms:
//   - useDuplicateDetector : id, name, level, parent
//   - useHierarchyValidator: id, name, level, path, parent
//   - useGeoConsistency    : id, name, level, geometry, featureType
const INTEGRITY_QUERY = {
  orgUnits: {
    resource: 'organisationUnits',
    params: {
      fields: [
        'id',
        'name',
        'shortName',
        'level',
        'path',
        'parent[id,name]',
        'geometry',
        'featureType',
      ],
      paging: false,
    },
  },
}

interface IntegrityData {
  orgUnits: {
    organisationUnits: OrgUnitIntegrityItem[]
  }
}

export interface UseIntegrityDataResult {
  orgUnits: OrgUnitIntegrityItem[]
  loading: boolean
  error: Error | undefined
  /** Call this to trigger (or re-trigger) the query, e.g. on button click. */
  run: () => void
}

export function useIntegrityData(): UseIntegrityDataResult {
  const { data, loading, error, refetch } = useDataQuery<IntegrityData>(INTEGRITY_QUERY, {
    lazy: true,
  })

  const run = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    orgUnits: data?.orgUnits?.organisationUnits ?? [],
    loading,
    error: error as Error | undefined,
    run,
  }
}
