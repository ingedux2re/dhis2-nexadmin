// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useDatasetElements.ts
//
// Lazy-loads data elements for a selected dataset.
// Re-fetches whenever a new dataset id is supplied.
//
// FIX: The id field must be a function — (vars) => vars.dataSetId — so that
// @dhis2/app-runtime resolves it as a dynamic GET path.
// Using a literal string like 'dataSetId' causes the runtime to send a POST
// to dataSets/dataSetId, which the server rejects with 405 Method Not Allowed.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import { extractDataElements } from '../services/metadataService'
import type { DataElement } from '../types'

// ── Query variables type ───────────────────────────────────────────────────────

interface DataSetQueryVars {
  dataSetId: string
}

// ── Query ─────────────────────────────────────────────────────────────────────
// id is a function so the runtime resolves it as:
//   GET /api/dataSets/<dataSetId>?fields=...
// This matches the DHIS2 app-runtime convention for dynamic resource IDs
// (same pattern used by useOrgUnits with params: (vars) => ({...})).

const DATASET_ELEMENTS_QUERY = {
  dataSet: {
    resource: 'dataSets',
    id: ({ dataSetId }: DataSetQueryVars) => dataSetId,
    params: {
      fields: [
        'id',
        'displayName',
        'dataSetElements[dataElement[id,name,shortName,code,valueType,domainType,aggregationType,categoryCombo[id,displayName]]]',
      ],
    },
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface DataSetQueryResult {
  dataSet: unknown
}

export interface UseDatasetElementsResult {
  elements: DataElement[]
  dataSetName: string
  loading: boolean
  error: Error | undefined
  /** Load (or reload) elements for the given dataset id */
  fetchForDataset: (dataSetId: string) => void
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useDatasetElements(): UseDatasetElementsResult {
  const { data, loading, error, refetch } = useDataQuery<DataSetQueryResult>(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    DATASET_ELEMENTS_QUERY as any,
    { lazy: true }
  )

  const fetchForDataset = useCallback(
    (dataSetId: string) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      refetch({ dataSetId } as any)
    },
    [refetch]
  )

  const rawDataSet = data?.dataSet as Record<string, unknown> | undefined
  const elements = rawDataSet ? extractDataElements(rawDataSet) : []
  const dataSetName = rawDataSet?.displayName ? String(rawDataSet.displayName) : ''

  return {
    elements,
    dataSetName,
    loading,
    error: error as Error | undefined,
    fetchForDataset,
  }
}
