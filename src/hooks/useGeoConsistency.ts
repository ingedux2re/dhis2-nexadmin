// src/hooks/useGeoConsistency.ts
import { useMemo } from 'react'
import type { OrgUnitIntegrityItem, GeoJsonGeometry } from '../types/orgUnit'
import type { Severity } from './useDuplicateDetector'
import {
  GEO_BOUNDING_BOX,
  MAX_LEVEL_REQUIRING_GEOMETRY,
  MIN_COORDINATE_DECIMAL_PLACES,
} from '../constants/geoConfig'

export type GeoIssueType = 'missing-geometry' | 'outside-boundary' | 'low-precision'

export interface GeoIssue {
  id: string
  orgUnitId: string
  orgUnitName: string
  level: number
  issueType: GeoIssueType
  details: string
  severity: Severity
  lat?: number
  lng?: number
}

function extractPoint(geometry: GeoJsonGeometry): [number, number] | null {
  if (geometry.type === 'Point') {
    const coords = geometry.coordinates as number[]
    if (Array.isArray(coords) && coords.length >= 2) {
      return [coords[0], coords[1]] // [lng, lat]
    }
  }
  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    // Use the centroid of the first outer ring as a representative point
    let ring: number[][]
    if (geometry.type === 'Polygon') {
      ring = (geometry.coordinates as number[][][])[0]
    } else {
      ring = (geometry.coordinates as unknown as number[][][][])[0][0]
    }
    if (Array.isArray(ring) && ring.length > 0) {
      const lng = ring.reduce((sum, c) => sum + c[0], 0) / ring.length
      const lat = ring.reduce((sum, c) => sum + c[1], 0) / ring.length
      return [lng, lat]
    }
  }
  return null
}

function countDecimalPlaces(n: number): number {
  const s = String(n)
  const dot = s.indexOf('.')
  return dot === -1 ? 0 : s.length - dot - 1
}

export function useGeoConsistency(orgUnits: OrgUnitIntegrityItem[]): GeoIssue[] {
  return useMemo(() => {
    if (orgUnits.length === 0) return []

    const issues: GeoIssue[] = []

    for (const ou of orgUnits) {
      // Only check units at levels requiring geometry (configurable via geoConfig.ts)
      if (ou.level > MAX_LEVEL_REQUIRING_GEOMETRY) continue

      // Missing geometry
      if (!ou.geometry) {
        issues.push({
          id: `missing-geo-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          level: ou.level,
          issueType: 'missing-geometry',
          details: `Level ${ou.level} unit has no geometry`,
          severity: ou.level <= 2 ? 'error' : 'warning',
        })
        continue
      }

      const point = extractPoint(ou.geometry)
      if (!point) continue
      const [lng, lat] = point

      // Outside configured bounding box
      if (
        lng < GEO_BOUNDING_BOX.minLng ||
        lng > GEO_BOUNDING_BOX.maxLng ||
        lat < GEO_BOUNDING_BOX.minLat ||
        lat > GEO_BOUNDING_BOX.maxLat
      ) {
        issues.push({
          id: `outside-bbox-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          level: ou.level,
          issueType: 'outside-boundary',
          details: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) are outside ${GEO_BOUNDING_BOX.label}`,
          severity: 'error',
          lat,
          lng,
        })
        continue
      }

      // Low precision: fewer than MIN_COORDINATE_DECIMAL_PLACES decimal places
      // (Point only — polygon coordinate precision varies by data source)
      if (ou.geometry.type === 'Point') {
        const lngDec = countDecimalPlaces(lng)
        const latDec = countDecimalPlaces(lat)
        if (lngDec < MIN_COORDINATE_DECIMAL_PLACES || latDec < MIN_COORDINATE_DECIMAL_PLACES) {
          issues.push({
            id: `low-precision-${ou.id}`,
            orgUnitId: ou.id,
            orgUnitName: ou.name,
            level: ou.level,
            issueType: 'low-precision',
            details: `Coordinates have insufficient precision (${latDec}/${lngDec} decimal places, minimum ${MIN_COORDINATE_DECIMAL_PLACES} required)`,
            severity: 'info',
            lat,
            lng,
          })
        }
      }
    }

    // Sort: error first, then by level, then by name
    return issues.sort((a, b) => {
      const order = { error: 0, warning: 1, info: 2 }
      const s = order[a.severity] - order[b.severity]
      if (s !== 0) return s
      if (a.level !== b.level) return a.level - b.level
      return a.orgUnitName.localeCompare(b.orgUnitName)
    })
  }, [orgUnits])
}
