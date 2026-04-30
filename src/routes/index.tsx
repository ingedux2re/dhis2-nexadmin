// src/routes/index.tsx — Competition version: 3 features only
import type React from 'react'
import { lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from '../components/Layout/Layout'

const Dashboard = lazy(() => import('../pages/Dashboard'))
const BulkRename = lazy(() => import('../pages/BulkRename'))
const DataIntegrity = lazy(() => import('../pages/DataIntegrity'))
const DataElementEngineering = lazy(
  () => import('../modules/data-elements/views/DataElementEngineeringPage')
)

export const AppRoutes: React.FC = () => (
  <Layout>
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/data-elements" element={<DataElementEngineering />} />
      <Route path="/bulk/rename" element={<BulkRename />} />
      <Route path="/integrity" element={<DataIntegrity />} />
      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </Layout>
)

export default AppRoutes
