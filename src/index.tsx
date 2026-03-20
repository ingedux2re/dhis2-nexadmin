// ── DHIS2 NexAdmin — Main Application Entry Point ─────────────
// Routes all pages through the Layout shell; no business logic here
import { Hono } from 'hono'
import { Layout } from './components/layout'
import { DashboardPage } from './routes/dashboard'
import { DataElementsPage } from './routes/elements'
import { DatasetsPage } from './routes/datasets'
import { BulkOperationsPage } from './routes/bulk'
import { GovernancePage } from './routes/governance'
import {
  IndicatorsPage,
  OrgUnitsPage,
  ValidationPage,
  SettingsPage,
} from './routes/misc'

const app = new Hono()

// ── Dashboard ─────────────────────────────────────────────────
app.get('/', (c) => {
  return c.html(
    Layout({
      title: 'Dashboard',
      activePage: 'dashboard',
      breadcrumb: [{ label: 'Dashboard' }],
      children: DashboardPage(),
    })
  )
})

// ── Data Elements ─────────────────────────────────────────────
app.get('/elements', (c) => {
  return c.html(
    Layout({
      title: 'Data Elements',
      activePage: 'elements',
      breadcrumb: [{ label: 'Metadata' }, { label: 'Data Elements' }],
      children: DataElementsPage(),
    })
  )
})

// ── Datasets ──────────────────────────────────────────────────
app.get('/datasets', (c) => {
  return c.html(
    Layout({
      title: 'Datasets',
      activePage: 'datasets',
      breadcrumb: [{ label: 'Metadata' }, { label: 'Datasets' }],
      children: DatasetsPage(),
    })
  )
})

// ── Indicators ────────────────────────────────────────────────
app.get('/indicators', (c) => {
  return c.html(
    Layout({
      title: 'Indicators',
      activePage: 'indicators',
      breadcrumb: [{ label: 'Metadata' }, { label: 'Indicators' }],
      children: IndicatorsPage(),
    })
  )
})

// ── Organisation Units ────────────────────────────────────────
app.get('/orgunits', (c) => {
  return c.html(
    Layout({
      title: 'Organisation Units',
      activePage: 'orgunits',
      breadcrumb: [{ label: 'Metadata' }, { label: 'Organisation Units' }],
      children: OrgUnitsPage(),
    })
  )
})

// ── Bulk Operations ───────────────────────────────────────────
app.get('/bulk', (c) => {
  return c.html(
    Layout({
      title: 'Bulk Operations',
      activePage: 'bulk',
      breadcrumb: [{ label: 'Tools' }, { label: 'Bulk Operations' }],
      children: BulkOperationsPage(),
    })
  )
})

// ── Governance ────────────────────────────────────────────────
app.get('/governance', (c) => {
  return c.html(
    Layout({
      title: 'Governance',
      activePage: 'governance',
      breadcrumb: [{ label: 'Tools' }, { label: 'Governance' }],
      children: GovernancePage(),
    })
  )
})

// ── Validation Rules ──────────────────────────────────────────
app.get('/validation', (c) => {
  return c.html(
    Layout({
      title: 'Validation Rules',
      activePage: 'validation',
      breadcrumb: [{ label: 'Tools' }, { label: 'Validation Rules' }],
      children: ValidationPage(),
    })
  )
})

// ── Settings ──────────────────────────────────────────────────
app.get('/settings', (c) => {
  return c.html(
    Layout({
      title: 'Settings',
      activePage: 'settings',
      breadcrumb: [{ label: 'System' }, { label: 'Settings' }],
      children: SettingsPage(),
    })
  )
})

export default app
