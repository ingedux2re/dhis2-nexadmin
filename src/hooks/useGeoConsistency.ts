import { useMemo } from 'react'
import type { OrgUnitIntegrityItem, GeoJsonGeometry } from '../types/orgUnit'
import type { Severity } from './useDuplicateDetector'

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

// Sierra Leone bounding box
const SL_BBOX = {
  minLng: -13.5,
  maxLng: -10.2,
  minLat: 6.9,
  maxLat: 10.0,
}

// Levels ≤ 4 must have geometry (country, region, district, chiefdom)
const MAX_LEVEL_REQUIRING_GEOMETRY = 4

function extractPoint(geometry: GeoJsonGeometry): [number, number] | null {
  if (geometry.type === 'Point') {
    const coords = geometry.coordinates as number[]
    if (Array.isArray(coords) && coords.length >= 2) {
      return [coords[0], coords[1]] // [lng, lat]
    }
  }
  if (geometry.type === 'Polygon' || geometry.type === 'MultiPolygon') {
    // Use the first coordinate of the outer ring as a representative point
    let ring: number[][]
    if (geometry.type === 'Polygon') {
      ring = (geometry.coordinates as number[][][])[0]
    } else {
      ring = (geometry.coordinates as number[][][][])[0][0]
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
      // Only check units at levels requiring geometry
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

      // Outside Sierra Leone bounding box
      if (
        lng < SL_BBOX.minLng ||
        lng > SL_BBOX.maxLng ||
        lat < SL_BBOX.minLat ||
        lat > SL_BBOX.maxLat
      ) {
        issues.push({
          id: `outside-bbox-${ou.id}`,
          orgUnitId: ou.id,
          orgUnitName: ou.name,
          level: ou.level,
          issueType: 'outside-boundary',
          details: `Coordinates (${lat.toFixed(4)}, ${lng.toFixed(4)}) are outside Sierra Leone`,
          severity: 'error',
          lat,
          lng,
        })
        continue
      }

      // Low precision: fewer than 4 decimal places (Point only — polygons vary by source)
      if (ou.geometry.type === 'Point') {
        const lngDec = countDecimalPlaces(lng)
        const latDec = countDecimalPlaces(lat)
        if (lngDec < 4 || latDec < 4) {
          issues.push({
            id: `low-precision-${ou.id}`,
            orgUnitId: ou.id,
            orgUnitName: ou.name,
            level: ou.level,
            issueType: 'low-precision',
            details: `Coordinates have insufficient precision (${latDec}/${lngDec} decimal places)`,
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
