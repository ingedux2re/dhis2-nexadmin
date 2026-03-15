import { useMemo } from 'react'
import type { OrgUnitIntegrityItem } from '../types/orgUnit'

export type Severity = 'error' | 'warning' | 'info'

export interface DuplicatePair {
  id: string
  idA: string
  nameA: string
  idB: string
  nameB: string
  level: number
  matchType: 'exact' | 'fuzzy'
  similarity: number
  severity: Severity
}

function normalize(s: string): string {
  return s.toLowerCase().trim().replace(/\s+/g, ' ')
}

function levenshtein(a: string, b: string): number {
  const m = a.length
  const n = b.length
  if (m === 0) return n
  if (n === 0) return m

  let prev = Array.from({ length: n + 1 }, (_, j) => j)
  for (let i = 1; i <= m; i++) {
    const curr: number[] = new Array(n + 1).fill(0)
    curr[0] = i
    for (let j = 1; j <= n; j++) {
      curr[j] =
        a[i - 1] === b[j - 1] ? prev[j - 1] : 1 + Math.min(prev[j - 1], prev[j], curr[j - 1])
    }
    prev = curr
  }
  return prev[n]
}

function similarityPct(normA: string, normB: string, dist: number): number {
  const maxLen = Math.max(normA.length, normB.length)
  if (maxLen === 0) return 100
  return Math.round((1 - dist / maxLen) * 100)
}

export function useDuplicateDetector(orgUnits: OrgUnitIntegrityItem[]): DuplicatePair[] {
  return useMemo(() => {
    if (orgUnits.length === 0) return []

    // Group by level for O(n²) within each level, not across all
    const byLevel = new Map<number, OrgUnitIntegrityItem[]>()
    for (const ou of orgUnits) {
      const list = byLevel.get(ou.level) ?? []
      list.push(ou)
      byLevel.set(ou.level, list)
    }

    const pairs: DuplicatePair[] = []

    for (const [level, items] of byLevel) {
      for (let i = 0; i < items.length; i++) {
        for (let j = i + 1; j < items.length; j++) {
          const a = items[i]
          const b = items[j]
          const normA = normalize(a.name)
          const normB = normalize(b.name)

          if (normA === normB) {
            pairs.push({
              id: `${a.id}-${b.id}`,
              idA: a.id,
              nameA: a.name,
              idB: b.id,
              nameB: b.name,
              level,
              matchType: 'exact',
              similarity: 100,
              severity: 'error',
            })
            continue
          }

          // Only run Levenshtein if names are similar enough in length (perf guard)
          const lenDiff = Math.abs(normA.length - normB.length)
          if (lenDiff > 3) continue

          const dist = levenshtein(normA, normB)
          if (dist <= 2) {
            const sim = similarityPct(normA, normB, dist)
            pairs.push({
              id: `${a.id}-${b.id}`,
              idA: a.id,
              nameA: a.name,
              idB: b.id,
              nameB: b.name,
              level,
              matchType: 'fuzzy',
              similarity: sim,
              severity: dist === 1 ? 'warning' : 'info',
            })
          }
        }
      }
    }

    // Sort: error first, then by level, then by similarity desc
    return pairs.sort((a, b) => {
      const severityOrder = { error: 0, warning: 1, info: 2 }
      const s = severityOrder[a.severity] - severityOrder[b.severity]
      if (s !== 0) return s
      if (a.level !== b.level) return a.level - b.level
      return b.similarity - a.similarity
    })
  }, [orgUnits])
}
