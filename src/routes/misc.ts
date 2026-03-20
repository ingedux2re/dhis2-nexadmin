// ── Indicators Page ─────────────────────────────────────────
import { Icons } from '../components/layout'

export function IndicatorsPage(): string {
  const indicators = [
    { uid: 'Uvn6LCg7dVU', name: 'ANC 1 Coverage',              type: 'Percentage',   numerator: 'ANC 1st Visit',         denominator: 'Expected Pregnancies', annualized: true,  decimals: 1, status: 'Active'    },
    { uid: 'OdiHJayrsKo', name: 'ANC 4 Coverage',              type: 'Percentage',   numerator: 'ANC 4th Visit',         denominator: 'Expected Pregnancies', annualized: true,  decimals: 1, status: 'Active'    },
    { uid: 'sB79w2hiLp8', name: 'HIV Positivity Rate',         type: 'Percentage',   numerator: 'HIV Positive',          denominator: 'HIV Tests Performed',  annualized: false, decimals: 1, status: 'Active'    },
    { uid: 'ReUHfIn0pTQ', name: 'Malaria Case Fatality Rate',  type: 'Percentage',   numerator: 'Malaria Deaths',        denominator: 'Malaria Confirmed',    annualized: false, decimals: 2, status: 'Active'    },
    { uid: 'AUqdhY4mpvp', name: 'Skilled Birth Attendance',   type: 'Percentage',   numerator: 'Births by skilled HW',  denominator: 'Expected Deliveries',  annualized: true,  decimals: 1, status: 'Active'    },
    { uid: 'GSae40Fyppf', name: 'BCG Coverage',                type: 'Percentage',   numerator: 'BCG Doses Given',       denominator: 'Surviving Infants',    annualized: true,  decimals: 1, status: 'Active'    },
    { uid: 'n5nS0SmkUpq', name: 'OPD Utilisation Rate',       type: 'Rate (per 1k)',numerator: 'OPD Attendance',        denominator: 'Catchment Population', annualized: true,  decimals: 0, status: 'Active'    },
    { uid: 'WnUXhtQcSWz', name: 'Child Malnutrition Rate',    type: 'Percentage',   numerator: 'MUAC Red',              denominator: 'Children U5 Screened', annualized: false, decimals: 1, status: 'Active'    },
    { uid: 'kGj2GteKMJd', name: 'ANC Coverage (old method)',  type: 'Percentage',   numerator: 'ANC Visits (legacy)',   denominator: 'Pop 15-49 female',     annualized: true,  decimals: 1, status: 'Deprecated' },
  ]

  const typeColor: Record<string, string> = { 'Percentage': 'badge-primary', 'Rate (per 1k)': 'badge-info', 'Number': 'badge-neutral' }
  const statusColor: Record<string, string> = { Active: 'badge-success', Deprecated: 'badge-warning' }

  const rowsHtml = indicators.map(i => `
    <tr>
      <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${i.name}"/></td>
      <td class="td-primary" style="max-width:200px;"><div class="truncate" title="${i.name}">${i.name}</div></td>
      <td class="td-mono">${i.uid}</td>
      <td><span class="badge ${typeColor[i.type] || 'badge-neutral'}">${i.type}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);max-width:150px;"><span class="truncate" style="display:block;">${i.numerator}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);max-width:150px;"><span class="truncate" style="display:block;">${i.denominator}</span></td>
      <td style="text-align:center;">${i.annualized ? `<span style="color:var(--color-success-500);">${Icons.check}</span>` : `<span style="color:var(--color-gray-300);">—</span>`}</td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);text-align:center;">${i.decimals}</td>
      <td><span class="badge ${statusColor[i.status] || 'badge-neutral'}">${i.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm btn-icon" data-dropdown title="More">${Icons.moreVert}</button>
            <div class="dropdown-menu" style="display:none;">
              <a href="#" class="dropdown-item">${Icons.link} Open in DHIS2</a>
              <a href="#" class="dropdown-item">${Icons.copy} Duplicate</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item danger">${Icons.trash} Delete</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Indicators</h1>
        <p class="page-subtitle">Manage calculated indicators and their formulas &nbsp;·&nbsp; <strong>${indicators.length}</strong> of 1,204 shown</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.download} <span>Export</span></button>
        <button class="btn btn-primary btn-md">${Icons.plus} <span>New Indicator</span></button>
      </div>
    </div>

    <div class="alert alert-info" style="margin-bottom:var(--space-5);">
      <span class="alert-icon">${Icons.warning}</span>
      <div><strong>Governance Alert:</strong> 3 indicators are referencing deleted or deprecated data elements. <a href="/governance" style="font-weight:var(--font-semibold);">Review in Governance →</a></div>
    </div>

    <div class="tabs">
      <a href="#" class="tab-item active">All <span class="badge badge-neutral" style="margin-left:4px;">1,204</span></a>
      <a href="#" class="tab-item">Percentage</a>
      <a href="#" class="tab-item">Rate</a>
      <a href="#" class="tab-item">Annualized</a>
      <a href="#" class="tab-item">Deprecated <span class="badge badge-warning" style="margin-left:4px;">18</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search indicators…" aria-label="Search indicators"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} <span>Filters</span></button>
        </div>
        <div class="table-toolbar-right">
          <button class="btn btn-ghost btn-sm btn-icon" title="Refresh">${Icons.refresh}</button>
        </div>
      </div>

      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" class="table-checkbox" data-select-all aria-label="Select all"/></th>
              <th class="sortable"><div class="th-inner">Name ${Icons.sortAsc}</div></th>
              <th>UID</th>
              <th>Type</th>
              <th>Numerator</th>
              <th>Denominator</th>
              <th>Annualized</th>
              <th>Decimals</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–9</strong> of <strong>1,204</strong> indicators</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="padding:0 4px;color:var(--color-gray-400);font-size:var(--text-xs);">…</span>
          <button class="page-btn">49</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}


// ── Organisation Units Page ──────────────────────────────────
export function OrgUnitsPage(): string {
  const orgunits = [
    { uid: 'ImspTQPwCqd', name: 'Sierra Leone',              level: 1, parent: '—',           type: 'Country',    children: 14,  status: 'Active' },
    { uid: 'O6uvpzGd5pu', name: 'Bo',                        level: 2, parent: 'Sierra Leone', type: 'District',   children: 36,  status: 'Active' },
    { uid: 'fdc6uOvgoji', name: 'Badjia',                    level: 3, parent: 'Bo',           type: 'Chiefdom',   children: 8,   status: 'Active' },
    { uid: 'jNb63DIHuwU', name: 'Kakua',                     level: 3, parent: 'Bo',           type: 'Chiefdom',   children: 12,  status: 'Active' },
    { uid: 'kJq2mPyFpX',  name: 'Bumpe Ngao',                level: 3, parent: 'Bo',           type: 'Chiefdom',   children: 7,   status: 'Active' },
    { uid: 'eIQbndfxQMb', name: 'Bombali',                   level: 2, parent: 'Sierra Leone', type: 'District',   children: 28,  status: 'Active' },
    { uid: 'YuQRtpLP10I', name: 'Makeni City Council',       level: 3, parent: 'Bombali',      type: 'Council',    children: 22,  status: 'Active' },
    { uid: 'at6UHUQatSo', name: 'Kenema',                    level: 2, parent: 'Sierra Leone', type: 'District',   children: 24,  status: 'Active' },
    { uid: 'Rp268JB6Ne4', name: 'Bo Government Hospital',   level: 4, parent: 'Bo',           type: 'Facility',   children: 0,   status: 'Active' },
    { uid: 'cDw53Ej8rKt', name: 'Old Clinic (Decommissioned)', level: 4, parent: 'Kakua',     type: 'Facility',   children: 0,   status: 'Inactive' },
  ]

  const levelColors: Record<number, string> = { 1: 'badge-primary', 2: 'badge-info', 3: 'badge-warning', 4: 'badge-neutral' }
  const typeColors: Record<string, string>  = { Country: 'badge-primary', District: 'badge-info', Chiefdom: 'badge-warning', Council: 'badge-neutral', Facility: 'badge-neutral' }
  const statusColors: Record<string, string> = { Active: 'badge-success', Inactive: 'badge-danger' }

  const rowsHtml = orgunits.map(o => `
    <tr>
      <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${o.name}"/></td>
      <td class="td-primary">
        <span style="display:inline-block;width:${(o.level - 1) * 16}px;"></span>
        ${o.level > 1 ? `<span style="color:var(--color-gray-300);margin-right:4px;">└</span>` : ''}
        ${o.name}
      </td>
      <td class="td-mono">${o.uid}</td>
      <td><span class="badge ${levelColors[o.level] || 'badge-neutral'}">L${o.level}</span></td>
      <td><span class="badge ${typeColors[o.type] || 'badge-neutral'}">${o.type}</span></td>
      <td style="color:var(--color-gray-500);font-size:var(--text-xs);">${o.parent}</td>
      <td style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-700);">${o.children > 0 ? o.children : '—'}</td>
      <td><span class="badge ${statusColors[o.status] || 'badge-neutral'}">${o.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm btn-icon" data-dropdown title="More">${Icons.moreVert}</button>
            <div class="dropdown-menu" style="display:none;">
              <a href="#" class="dropdown-item">${Icons.link} Open in DHIS2</a>
              <a href="#" class="dropdown-item">${Icons.copy} Move</a>
              <a href="#" class="dropdown-item">${Icons.governance} Merge</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item danger">${Icons.trash} Delete</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Organisation Units</h1>
        <p class="page-subtitle">Browse and manage the organisation unit hierarchy &nbsp;·&nbsp; <strong>9,641</strong> total units</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.upload} <span>Import</span></button>
        <button class="btn btn-secondary btn-md">${Icons.download} <span>Export</span></button>
        <button class="btn btn-primary btn-md">${Icons.plus} <span>Add Org Unit</span></button>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:var(--space-4);margin-bottom:var(--space-5);">
      ${[
        { label: 'National',  count: '1',     color: 'primary' },
        { label: 'Districts', count: '14',    color: 'info'    },
        { label: 'Chiefdoms',  count: '147',  color: 'warning' },
        { label: 'Facilities', count: '9,479',color: 'neutral' },
      ].map(s => `
        <div class="stat-card">
          <div class="stat-card-header"><span class="stat-card-label">${s.label}</span></div>
          <div class="stat-card-value">${s.count}</div>
        </div>
      `).join('')}
    </div>

    <div class="tabs">
      <a href="#" class="tab-item active">All Levels</a>
      <a href="#" class="tab-item">Level 1 — National</a>
      <a href="#" class="tab-item">Level 2 — District</a>
      <a href="#" class="tab-item">Level 3 — Chiefdom</a>
      <a href="#" class="tab-item">Level 4 — Facility</a>
      <a href="#" class="tab-item">Inactive <span class="badge badge-danger" style="margin-left:4px;">23</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search org units by name, UID…" aria-label="Search org units"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} <span>Filters</span></button>
          <span class="filter-chip">Type</span>
          <span class="filter-chip">Level</span>
        </div>
        <div class="table-toolbar-right">
          <button class="btn btn-ghost btn-sm btn-icon" title="Refresh">${Icons.refresh}</button>
        </div>
      </div>
      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" class="table-checkbox" data-select-all aria-label="Select all"/></th>
              <th>Name</th>
              <th>UID</th>
              <th>Level</th>
              <th>Type</th>
              <th>Parent</th>
              <th>Children</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–10</strong> of <strong>9,641</strong> org units</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="padding:0 4px;color:var(--color-gray-400);font-size:var(--text-xs);">…</span>
          <button class="page-btn">386</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}


// ── Validation Rules Page ────────────────────────────────────
export function ValidationPage(): string {
  const rules = [
    { uid: 'xrok0aVM0wj', name: 'ANC visits in logical order',        importance: 'HIGH',   leftSide: 'ANC 1st Visit',        operator: '>=', rightSide: 'ANC 4th Visit',    period: 'Monthly', status: 'Active'  },
    { uid: 'tMYXS02GPFP', name: 'HIV tests >= HIV positive',          importance: 'HIGH',   leftSide: 'HIV Tests Performed',  operator: '>=', rightSide: 'HIV Positive',     period: 'Monthly', status: 'Active'  },
    { uid: 'vLhkE0LlgAi', name: 'Malaria deaths < confirmed cases',   importance: 'HIGH',   leftSide: 'Malaria Confirmed',    operator: '>',  rightSide: 'Malaria Deaths',   period: 'Weekly',  status: 'Active'  },
    { uid: 'IaKTHbMECGz', name: 'Births not exceed expected',         importance: 'MEDIUM', leftSide: 'Expected Pregnancies', operator: '>=', rightSide: 'Births (skilled)', period: 'Monthly', status: 'Active'  },
    { uid: 'YCkiSRNkyGU', name: 'OPD < catchment population',        importance: 'LOW',    leftSide: 'Population',           operator: '>=', rightSide: 'OPD Attendance',   period: 'Monthly', status: 'Active'  },
    { uid: 'MtfNPlJLi5J', name: 'Vaccinations within coverage range', importance: 'MEDIUM', leftSide: 'Vaccinated',          operator: '<=', rightSide: 'Pop * 1.2',        period: 'Monthly', status: 'Inactive' },
  ]

  const impColor: Record<string, string> = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-neutral' }
  const statusColor: Record<string, string> = { Active: 'badge-success', Inactive: 'badge-neutral' }

  const rowsHtml = rules.map(r => `
    <tr>
      <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${r.name}"/></td>
      <td class="td-primary" style="max-width:220px;"><div class="truncate" title="${r.name}">${r.name}</div></td>
      <td class="td-mono">${r.uid}</td>
      <td><span class="badge ${impColor[r.importance]}">${r.importance}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);">${r.leftSide}</td>
      <td><code style="font-weight:var(--font-bold);font-size:var(--text-sm);color:var(--color-primary-700);">${r.operator}</code></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);">${r.rightSide}</td>
      <td><span class="badge badge-neutral">${r.period}</span></td>
      <td><span class="badge ${statusColor[r.status]}">${r.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Run check">${Icons.check}</button>
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Validation Rules</h1>
        <p class="page-subtitle">Define and enforce data quality validation rules for reporting periods</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.check} <span>Run All Checks</span></button>
        <button class="btn btn-primary btn-md">${Icons.plus} <span>New Rule</span></button>
      </div>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search validation rules…"/>
          </div>
          <span class="filter-chip active">Importance: All</span>
          <span class="filter-chip">Period</span>
          <span class="filter-chip">Status</span>
        </div>
        <div class="table-toolbar-right">
          <button class="btn btn-ghost btn-sm btn-icon" title="Refresh">${Icons.refresh}</button>
        </div>
      </div>
      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" class="table-checkbox" data-select-all/></th>
              <th>Name</th><th>UID</th><th>Importance</th>
              <th>Left Side</th><th>Op</th><th>Right Side</th>
              <th>Period</th><th>Status</th><th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
    </div>
  `
}


// ── Settings Page ────────────────────────────────────────────
export function SettingsPage(): string {
  const sections = [
    {
      title: 'DHIS2 Connection',
      icon: Icons.server,
      fields: [
        { label: 'Server URL',    type: 'text',     value: 'https://play.dhis2.org/2.41.3', hint: 'Base URL of your DHIS2 instance' },
        { label: 'API Version',   type: 'text',     value: '41',                             hint: 'DHIS2 API version (e.g. 40, 41)' },
        { label: 'Username',      type: 'text',     value: 'admin',                          hint: 'Admin API username' },
        { label: 'Password',      type: 'password', value: '••••••••••',                    hint: 'Stored securely' },
      ]
    },
    {
      title: 'Governance Settings',
      icon: Icons.governance,
      fields: [
        { label: 'Auto-scan Interval',    type: 'text',  value: '60 minutes',       hint: 'How often governance checks run automatically' },
        { label: 'Score Threshold (Warn)',type: 'text',  value: '70',               hint: 'Score below which a warning is shown' },
        { label: 'Score Threshold (Critical)',type:'text',value:'50',               hint: 'Score below which critical alert is raised' },
      ]
    },
    {
      title: 'Display Preferences',
      icon: Icons.settings,
      fields: [
        { label: 'Default Page Size', type: 'text', value: '25', hint: 'Default rows per table page' },
        { label: 'Date Format',       type: 'text', value: 'YYYY-MM-DD', hint: 'Displayed date format' },
      ]
    },
  ]

  const sectionsHtml = sections.map(sec => `
    <div class="card" style="margin-bottom:var(--space-5);">
      <div class="card-header">
        <div style="display:flex;align-items:center;gap:var(--space-2);">
          <span style="color:var(--color-primary-600);">${sec.icon}</span>
          <div class="card-title">${sec.title}</div>
        </div>
      </div>
      <div class="card-body">
        <div class="form-row" style="grid-template-columns:repeat(2,1fr);">
          ${sec.fields.map(f => `
            <div class="form-group" style="margin-bottom:0;">
              <label class="form-label">${f.label}</label>
              <input type="${f.type}" class="form-control" value="${f.value}" ${f.type === 'password' ? '' : ''}/>
              ${f.hint ? `<div class="form-hint">${f.hint}</div>` : ''}
            </div>
          `).join('')}
        </div>
      </div>
      <div class="card-footer" style="display:flex;justify-content:flex-end;gap:var(--space-2);">
        <button class="btn btn-secondary btn-sm">Reset</button>
        <button class="btn btn-primary btn-sm">${Icons.check} Save Changes</button>
      </div>
    </div>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure DHIS2 connection, governance thresholds, and display preferences</p>
      </div>
    </div>

    <div class="alert alert-success" style="margin-bottom:var(--space-5);">
      <span class="alert-icon">${Icons.successCircle}</span>
      <span>Connected to <strong>play.dhis2.org</strong> &nbsp;·&nbsp; DHIS2 v2.41.3 &nbsp;·&nbsp; All systems operational</span>
    </div>

    <div class="tabs" style="margin-bottom:var(--space-5);">
      <a href="#" class="tab-item active">Connection</a>
      <a href="#" class="tab-item">Governance</a>
      <a href="#" class="tab-item">Display</a>
      <a href="#" class="tab-item">Users &amp; Access</a>
      <a href="#" class="tab-item">About</a>
    </div>

    ${sectionsHtml}
  `
}
