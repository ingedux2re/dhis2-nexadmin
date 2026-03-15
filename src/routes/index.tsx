import type React from 'react'
import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'

const OrgUnitManagement = lazy(() => import('../pages/OrgUnitManagement'))
const HierarchyViewer = lazy(() => import('../pages/HierarchyViewer'))
const OrgUnitGroups = lazy(() => import('../pages/OrgUnitGroups'))
const UserManagement = lazy(() => import('../pages/UserManagement'))
const RolesAuthorities = lazy(() => import('../pages/RolesAuthorities'))
const UserGroups = lazy(() => import('../pages/UserGroups'))
const AuditLog = lazy(() => import('../pages/AuditLog'))
const AccessControl = lazy(() => import('../pages/AccessControl'))
const UsageStatistics = lazy(() => import('../pages/UsageStatistics'))
const DataQuality = lazy(() => import('../pages/DataQuality'))
const SystemSettings = lazy(() => import('../pages/SystemSettings'))
const Notifications = lazy(() => import('../pages/Notifications'))
const DuplicateDetector = lazy(() => import('../pages/DuplicateDetector'))
const HierarchyValidator = lazy(() => import('../pages/HierarchyValidator'))
const GeoConsistency = lazy(() => import('../pages/GeoConsistency'))
// Phase 3 – Bulk Operations
const BulkReorganise = lazy(() => import('../pages/BulkReorganise'))
const BulkRename = lazy(() => import('../pages/BulkRename'))

export const AppRoutes: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Navigate to="/org-units" replace />} />
      <Route path="/org-units" element={<OrgUnitManagement />} />
      <Route path="/org-units/hierarchy" element={<HierarchyViewer />} />
      <Route path="/org-units/groups" element={<OrgUnitGroups />} />
      <Route path="/integrity/duplicates" element={<DuplicateDetector />} />
      <Route path="/integrity/hierarchy" element={<HierarchyValidator />} />
      <Route path="/integrity/geo" element={<GeoConsistency />} />
      {/* Phase 3 – Bulk Operations */}
      <Route path="/bulk/reorganise" element={<BulkReorganise />} />
      <Route path="/bulk/rename" element={<BulkRename />} />
      <Route path="/users" element={<UserManagement />} />
      <Route path="/users/roles" element={<RolesAuthorities />} />
      <Route path="/users/groups" element={<UserGroups />} />
      <Route path="/governance/audit" element={<AuditLog />} />
      <Route path="/governance/access" element={<AccessControl />} />
      <Route path="/analytics/usage" element={<UsageStatistics />} />
      <Route path="/analytics/quality" element={<DataQuality />} />
      <Route path="/system/settings" element={<SystemSettings />} />
      <Route path="/system/notifications" element={<Notifications />} />
      <Route path="*" element={<Navigate to="/org-units" replace />} />
    </Routes>
  </Layout>
)

export default AppRoutes
