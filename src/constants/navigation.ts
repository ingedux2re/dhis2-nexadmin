export interface NavItem {
  id: string
  label: string
  path: string
  icon: string
  section: NavSection
}

export type NavSection =
  | 'overview'
  | 'org-units'
  | 'data-integrity'
  | 'bulk-operations'
  | 'users'
  | 'governance'
  | 'analytics'
  | 'system'

export const NAV_ITEMS: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    path: '/',
    icon: 'dashboard',
    section: 'overview',
  },
  {
    id: 'ou-management',
    label: 'Org Unit Management',
    path: '/org-units',
    icon: 'domain',
    section: 'org-units',
  },
  {
    id: 'ou-hierarchy',
    label: 'Hierarchy Viewer',
    path: '/org-units/hierarchy',
    icon: 'account_tree',
    section: 'org-units',
  },
  {
    id: 'ou-groups',
    label: 'Org Unit Groups',
    path: '/org-units/groups',
    icon: 'folder_special',
    section: 'org-units',
  },
  {
    id: 'duplicate-detector',
    label: 'Duplicate Detector',
    path: '/integrity/duplicates',
    icon: 'content_copy',
    section: 'data-integrity',
  },
  {
    id: 'hierarchy-validator',
    label: 'Hierarchy Validator',
    path: '/integrity/hierarchy',
    icon: 'rule',
    section: 'data-integrity',
  },
  {
    id: 'geo-consistency',
    label: 'Geo Consistency',
    path: '/integrity/geo',
    icon: 'map',
    section: 'data-integrity',
  },
  // ─── Phase 3 – Bulk Operations ─────────────────────────────────────────────
  {
    id: 'bulk-reorganise',
    label: 'Bulk Reorganise',
    path: '/bulk/reorganise',
    icon: 'move_down',
    section: 'bulk-operations',
  },
  {
    id: 'bulk-rename',
    label: 'Bulk Rename',
    path: '/bulk/rename',
    icon: 'drive_file_rename_outline',
    section: 'bulk-operations',
  },
  // ───────────────────────────────────────────────────────────────────────────
  {
    id: 'user-management',
    label: 'User Management',
    path: '/users',
    icon: 'people',
    section: 'users',
  },
  {
    id: 'user-roles',
    label: 'Roles & Authorities',
    path: '/users/roles',
    icon: 'admin_panel_settings',
    section: 'users',
  },
  {
    id: 'user-groups',
    label: 'User Groups',
    path: '/users/groups',
    icon: 'group',
    section: 'users',
  },
  {
    id: 'audit-log',
    label: 'Audit Log',
    path: '/governance/audit',
    icon: 'history',
    section: 'governance',
  },
  {
    id: 'access-control',
    label: 'Access Control',
    path: '/governance/access',
    icon: 'lock',
    section: 'governance',
  },
  {
    id: 'usage-stats',
    label: 'Usage Statistics',
    path: '/analytics/usage',
    icon: 'bar_chart',
    section: 'analytics',
  },
  {
    id: 'data-quality',
    label: 'Data Quality',
    path: '/analytics/quality',
    icon: 'verified',
    section: 'analytics',
  },
  {
    id: 'system-settings',
    label: 'System Settings',
    path: '/system/settings',
    icon: 'settings',
    section: 'system',
  },
  {
    id: 'notifications',
    label: 'Notifications',
    path: '/system/notifications',
    icon: 'notifications',
    section: 'system',
  },
]

export const NAV_SECTIONS: Record<NavSection, string> = {
  overview: 'Overview',
  'org-units': 'Organisation Units',
  'data-integrity': 'Data Integrity',
  'bulk-operations': 'Bulk Operations',
  users: 'Users & Access',
  governance: 'Governance',
  analytics: 'Analytics',
  system: 'System',
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
