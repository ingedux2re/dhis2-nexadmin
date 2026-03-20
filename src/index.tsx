import { Hono } from 'hono'
import { serveStatic } from 'hono/cloudflare-workers'
import { Layout } from './components/layout'
import { DashboardPage }    from './routes/dashboard'
import { DataElementsPage } from './routes/elements'
import { DatasetsPage }     from './routes/datasets'
import { BulkOperationsPage }from './routes/bulk'
import { GovernancePage }   from './routes/governance'
import { IndicatorsPage }   from './routes/indicators'
import { OrgUnitsPage }     from './routes/orgunits'
import { ValidationPage }   from './routes/validation'
import { SettingsPage }     from './routes/settings'

const app = new Hono()

// ── Static Assets ─────────────────────────────────────────────
app.use('/static/*', serveStatic({ root: './public' }))

// ── Helper: render page inside the layout shell ───────────────
function page(
  title: string,
  activePage: string,
  content: string,
  breadcrumb?: Array<{ label: string; href?: string }>
) {
  return Layout({ title, activePage, breadcrumb, children: content })
}

// ── Routes ────────────────────────────────────────────────────

// Dashboard
app.get('/', (c) =>
  c.html(page('Dashboard', 'dashboard', DashboardPage()))
)

// Data Elements
app.get('/elements', (c) =>
  c.html(page('Data Elements', 'elements', DataElementsPage(), [
    { label: 'Data Elements' }
  ]))
)

// Datasets
app.get('/datasets', (c) =>
  c.html(page('Datasets', 'datasets', DatasetsPage(), [
    { label: 'Datasets' }
  ]))
)

// Indicators
app.get('/indicators', (c) =>
  c.html(page('Indicators', 'indicators', IndicatorsPage(), [
    { label: 'Indicators' }
  ]))
)

// Org Units
app.get('/orgunits', (c) =>
  c.html(page('Organisation Units', 'orgunits', OrgUnitsPage(), [
    { label: 'Organisation Units' }
  ]))
)

// Bulk Operations
app.get('/bulk', (c) =>
  c.html(page('Bulk Operations', 'bulk', BulkOperationsPage(), [
    { label: 'Tools', href: '/bulk' },
    { label: 'Bulk Operations' }
  ]))
)

// Governance
app.get('/governance', (c) =>
  c.html(page('Governance & Quality', 'governance', GovernancePage(), [
    { label: 'Tools', href: '/governance' },
    { label: 'Governance & Quality' }
  ]))
)

// Validation
app.get('/validation', (c) =>
  c.html(page('Validation Rules', 'validation', ValidationPage(), [
    { label: 'Tools', href: '/validation' },
    { label: 'Validation Rules' }
  ]))
)

// Settings
app.get('/settings', (c) =>
  c.html(page('Settings', 'settings', SettingsPage(), [
    { label: 'Settings' }
  ]))
)

// ── 404 Not Found ─────────────────────────────────────────────
app.notFound((c) => {
  const content = `
    <div class="empty-state" style="min-height:60vh;">
      <div class="empty-state-icon" style="background:var(--color-danger-50);color:var(--color-danger-400);">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <line x1="12" y1="8" x2="12" y2="12"/>
          <line x1="12" y1="16" x2="12.01" y2="16"/>
        </svg>
      </div>
      <h2 class="empty-state-title">Page Not Found</h2>
      <p class="empty-state-desc">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <a href="/" class="btn btn-primary btn-md">Back to Dashboard</a>
    </div>
  `
  return c.html(page('Not Found', '', content), 404)
})

export default app
