// src/types/index.ts — Competition version: stripped to what is actively used
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

// ── GeoJSON geometry ─────────────────────────────────────────────────────────

export interface GeoJsonGeometry {
  type: 'Point' | 'Polygon' | 'MultiPolygon'
  coordinates: number[] | number[][] | number[][][]
}

// ── App store types ───────────────────────────────────────────────────────────

export interface AppState {
  currentLocale: string
  setLocale: (locale: string) => void
  globalLoading: boolean
  setGlobalLoading: (loading: boolean) => void
  sidebarOpen: boolean
  setSidebarOpen: (open: boolean) => void
}
