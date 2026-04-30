// src/constants/navigation.ts — Competition version: 4 entries, 2 sections
// NOTE: The Sidebar now uses its own inline nav config for simplicity.
// This file is kept as the canonical source for route definitions.

export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  section: NavSection
}

export type NavSection = 'overview' | 'features'

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
    section: 'overview',
  },
  // ── Feature 1: Data Element Engineering ──────────────────────────────────
  {
    id: 'data-element-engineering',
    label: 'Data Element Engineering',
    path: '/data-elements',
    icon: 'data_object',
    section: 'features',
  },
  // ── Feature 2: Bulk Rename ────────────────────────────────────────────────
  {
    id: 'bulk-rename',
    label: 'Bulk Rename',
    path: '/bulk/rename',
    icon: 'drive_file_rename_outline',
    section: 'features',
  },
  // ── Feature 3: Data Integrity ─────────────────────────────────────────────
  {
    id: 'data-integrity',
    label: 'Data Integrity',
    path: '/integrity',
    icon: 'verified_user',
    section: 'features',
  },
]

export const NAV_SECTIONS: Record<NavSection, string> = {
  overview: 'Overview',
  features: 'Features',
}

export function groupBySection(items: NavItem[]): Record<NavSection, NavItem[]> {
  return items.reduce(
    (acc, item) => {
      if (!acc[item.section]) acc[item.section] = []
      acc[item.section].push(item)
      return acc
    },
    {} as Record<NavSection, NavItem[]>
  )
}
