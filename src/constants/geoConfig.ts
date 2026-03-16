// src/constants/geoConfig.ts
// ─────────────────────────────────────────────────────────────────────────────
// DHIS2 NexAdmin — Geo-consistency configuration
//
// These values are deployment-specific and must be updated when deploying
// NexAdmin against a different DHIS2 instance or country.
//
// HOW TO OVERRIDE:
//   Update the constants below to match the bounding box of the country/region
//   and the maximum org unit level that is expected to carry geometry.
//
// Sierra Leone defaults (used for the reference implementation):
//   Bounding box: approx. W -13.5, E -10.2, S 6.9, N 10.0
//   Max level with mandatory geometry: 4 (country, region, district, chiefdom)
// ─────────────────────────────────────────────────────────────────────────────

export interface GeoBoundingBox {
  /** Minimum longitude (western boundary) */
  minLng: number
  /** Maximum longitude (eastern boundary) */
  maxLng: number
  /** Minimum latitude (southern boundary) */
  minLat: number
  /** Maximum latitude (northern boundary) */
  maxLat: number
  /** Human-readable name for use in error messages */
  label: string
}

/**
 * Expected bounding box for all org unit coordinates.
 * Update this when deploying against a different country.
 *
 * Sierra Leone reference: { minLng: -13.5, maxLng: -10.2, minLat: 6.9, maxLat: 10.0 }
 */
export const GEO_BOUNDING_BOX: GeoBoundingBox = {
  minLng: -13.5,
  maxLng: -10.2,
  minLat: 6.9,
  maxLat: 10.0,
  label: 'Sierra Leone',
}

/**
 * Org unit levels at or below this value are expected to carry geometry.
 * Levels above this threshold (e.g. individual health posts) are not checked.
 *
 * Sierra Leone: level 4 = chiefdom — the lowest administrative level
 * that should always have a polygon or point.
 */
export const MAX_LEVEL_REQUIRING_GEOMETRY = 4

/**
 * Minimum number of decimal places required on Point coordinates.
 * Values with fewer decimal places are flagged as "low precision".
 * 4 decimal places ≈ 11 m accuracy — sufficient for facility mapping.
 */
export const MIN_COORDINATE_DECIMAL_PLACES = 4
