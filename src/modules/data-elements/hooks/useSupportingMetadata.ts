// ─────────────────────────────────────────────────────────────────────────────
// src/modules/data-elements/hooks/useSupportingMetadata.ts
//
// Lazy-loads categoryCombos, optionSets, and dataSets needed by both tabs.
// Call load() once — typically when the page mounts or the user opens a tab.
// Results are memoised for the lifetime of the component tree.
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback } from 'react'
import { useDataQuery } from '@dhis2/app-runtime'
import type { MetaRef, DataSet } from '../types'

// ── Query ─────────────────────────────────────────────────────────────────────

const SUPPORTING_QUERY = {
  categoryCombos: {
    resource: 'categoryCombos',
    params: {
      fields: ['id', 'displayName'],
      paging: false,
      // Exclude the internal "default" categoryCombo from the dropdown
      // so it appears as a separate "(default)" option in the UI.
      filter: 'name:ne:default',
    },
  },
  optionSets: {
    resource: 'optionSets',
    params: {
      fields: ['id', 'displayName'],
      paging: false,
    },
  },
  dataSets: {
    resource: 'dataSets',
    params: {
      fields: ['id', 'displayName'],
      paging: false,
      order: 'displayName:asc',
    },
  },
}

// ── Types ─────────────────────────────────────────────────────────────────────

interface SupportingData {
  categoryCombos: { categoryCombos: MetaRef[] }
  optionSets: { optionSets: MetaRef[] }
  dataSets: { dataSets: DataSet[] }
}

export interface UseSupportingMetadataResult {
  categoryCombos: MetaRef[]
  optionSets: MetaRef[]
  dataSets: DataSet[]
  loading: boolean
  error: Error | undefined
  /** Trigger the query (call once on mount or tab activation) */
  load: () => void
}

// ── Hook ─────────────────────────────────────────────────────────────────────

export function useSupportingMetadata(): UseSupportingMetadataResult {
  const { data, loading, error, refetch } = useDataQuery<SupportingData>(SUPPORTING_QUERY, {
    lazy: true,
  })

  const load = useCallback(() => {
    refetch()
  }, [refetch])

  return {
    categoryCombos: data?.categoryCombos?.categoryCombos ?? [],
    optionSets: data?.optionSets?.optionSets ?? [],
    dataSets: data?.dataSets?.dataSets ?? [],
    loading,
    error: error as Error | undefined,
    load,
  }
}
