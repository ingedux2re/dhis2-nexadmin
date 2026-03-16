// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useDatasetElements.ts
//
// Lazy-loads data elements for a selected dataset.
// Re-fetches whenever a new dataset id is supplied.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import { extractDataElements } from '../services/metadataService'
import type { DataElement } from '../types'

// ── Query ─────────────────────────────────────────────────────────────────────
// The id field uses a dynamic variable string — refetch({ dataSetId: '...' })
// injects the real value at call time.

const DATASET_ELEMENTS_QUERY = {
  dataSet: {
    resource: 'dataSets',
    id: 'dataSetId' as unknown as string,
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
    DATASET_ELEMENTS_QUERY,
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
