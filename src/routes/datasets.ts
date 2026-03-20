// ── Datasets Page ─────────────────────────────────────────────
// UI: Dataset management with period type, form type, org unit assignment overview
import { Icons } from '../components/layout'

export function DatasetsPage(): string {
  const datasets = [
    { uid: 'lyLU2wR22tC', name: 'HMIS Monthly Report',       periodType: 'Monthly',   formType: 'DEFAULT',    elements: 187, orgunits: 1204, open: true,  status: 'Active'   },
    { uid: 'aLpVgfXiz0f', name: 'Malaria Weekly Report',     periodType: 'Weekly',    formType: 'CUSTOM',     elements: 34,  orgunits: 876,  open: true,  status: 'Active'   },
    { uid: 'EDzMBk0RRji', name: 'HIV Monthly Report',        periodType: 'Monthly',   formType: 'SECTION',    elements: 72,  orgunits: 654,  open: true,  status: 'Active'   },
    { uid: 'N4fIX1HL3TQ', name: 'Nutrition Quarterly',       periodType: 'Quarterly', formType: 'SECTION',    elements: 45,  orgunits: 423,  open: false, status: 'Active'   },
    { uid: 'TuL8IOPzpHh', name: 'EPI Monthly Coverage',      periodType: 'Monthly',   formType: 'DEFAULT',    elements: 28,  orgunits: 1100, open: true,  status: 'Active'   },
    { uid: 'OsPTWNqq26W', name: 'WASH Facility Survey',      periodType: 'Yearly',    formType: 'CUSTOM',     elements: 93,  orgunits: 289,  open: false, status: 'Active'   },
    { uid: 'YFTkV3R3aaX', name: 'CRVS Birth Registration',   periodType: 'Monthly',   formType: 'DEFAULT',    elements: 19,  orgunits: 78,   open: true,  status: 'Active'   },
    { uid: 'BfMAe6Itzgt', name: 'IDSR Weekly Surveillance',  periodType: 'Weekly',    formType: 'SECTION',    elements: 52,  orgunits: 540,  open: true,  status: 'Active'   },
    { uid: 'Lpw6GcOgbuo', name: 'RMNCAH Annual Summary',     periodType: 'Yearly',    formType: 'CUSTOM',     elements: 114, orgunits: 204,  open: false, status: 'Active'   },
    { uid: 'a0E3gHbJroY', name: 'OPD Register (Legacy)',     periodType: 'Monthly',   formType: 'DEFAULT',    elements: 8,   orgunits: 0,    open: false, status: 'Deprecated'},
  ]

  const periodColors: Record<string, string> = {
    Monthly: 'badge-primary', Weekly: 'badge-info', Quarterly: 'badge-warning', Yearly: 'badge-neutral'
  }
  const formColors: Record<string, string> = {
    DEFAULT: 'badge-neutral', CUSTOM: 'badge-success', SECTION: 'badge-primary'
  }
  const statusColors: Record<string, string> = { Active: 'badge-success', Deprecated: 'badge-warning' }

  const rowsHtml = datasets.map(d => {
    const completeness = d.orgunits > 0 ? Math.floor(60 + Math.random() * 38) : 0
    const compColor = completeness >= 90 ? 'var(--color-success-500)' : completeness >= 70 ? 'var(--color-warning-500)' : 'var(--color-danger-500)'
    return `
      <tr>
        <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${d.name}"/></td>
        <td class="td-primary" style="max-width:240px;"><div class="truncate" title="${d.name}">${d.name}</div></td>
        <td class="td-mono">${d.uid}</td>
        <td><span class="badge ${periodColors[d.periodType] || 'badge-neutral'}">${d.periodType}</span></td>
        <td><span class="badge ${formColors[d.formType] || 'badge-neutral'}">${d.formType}</span></td>
        <td style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-700);">${d.elements}</td>
        <td style="font-size:var(--text-sm);color:var(--color-gray-600);">${d.orgunits.toLocaleString()}</td>
        <td>
          ${d.orgunits > 0 ? `
            <div style="display:flex;align-items:center;gap:var(--space-2);min-width:100px;">
              <div class="progress-bar" style="flex:1;height:5px;">
                <div class="progress-fill" style="width:${completeness}%;background:${compColor};"></div>
              </div>
              <span style="font-size:var(--text-xs);font-weight:var(--font-semibold);color:${compColor};min-width:30px;">${completeness}%</span>
            </div>` : `<span style="color:var(--color-gray-300);font-size:var(--text-xs);">N/A</span>`}
        </td>
        <td>
          <span style="display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--font-medium);color:${d.open ? 'var(--color-success-600)' : 'var(--color-gray-500)'};">
            <span style="width:6px;height:6px;border-radius:50%;background:${d.open ? 'var(--color-success-500)' : 'var(--color-gray-300)'};flex-shrink:0;"></span>
            ${d.open ? 'Open' : 'Closed'}
          </span>
        </td>
        <td><span class="badge ${statusColors[d.status] || 'badge-neutral'}">${d.status}</span></td>
        <td class="td-actions">
          <div class="td-actions-group">
            <button class="btn btn-ghost btn-sm btn-icon" title="View dataset">${Icons.eye}</button>
            <button class="btn btn-ghost btn-sm btn-icon" title="Edit dataset">${Icons.edit}</button>
            <div class="dropdown">
              <button class="btn btn-ghost btn-sm btn-icon" data-dropdown title="More">${Icons.moreVert}</button>
              <div class="dropdown-menu" style="display:none;">
                <a href="#" class="dropdown-item">${Icons.link} Open in DHIS2</a>
                <a href="#" class="dropdown-item">${Icons.download} Export Metadata</a>
                <a href="#" class="dropdown-item">${Icons.copy} Duplicate</a>
                <div class="dropdown-divider"></div>
                <a href="#" class="dropdown-item danger">${Icons.trash} Delete</a>
              </div>
            </div>
          </div>
        </td>
      </tr>
    `
  }).join('')

  // UI: Summary cards
  const summaryCards = [
    { label: 'Total Datasets',     value: '183',    icon: Icons.dataset,    color: 'primary' },
    { label: 'Avg. Completeness',  value: '82%',    icon: Icons.activity,   color: 'success' },
    { label: 'Open Datasets',      value: '141',    icon: Icons.check,      color: 'info'    },
    { label: 'Deprecated',         value: '9',      icon: Icons.warning,    color: 'warning' },
  ]

  const summaryHtml = summaryCards.map(s => `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-label">${s.label}</span>
        <span class="stat-card-icon ${s.color}">${s.icon}</span>
      </div>
      <div class="stat-card-value">${s.value}</div>
    </div>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Datasets</h1>
        <p class="page-subtitle">Manage data collection forms and their assignments &nbsp;·&nbsp; <strong>${datasets.length}</strong> of 183 shown</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.download} <span>Export</span></button>
        <button class="btn btn-primary btn-md">${Icons.plus} <span>New Dataset</span></button>
      </div>
    </div>

    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:var(--space-5);">${summaryHtml}</div>

    <div class="tabs">
      <a href="#" class="tab-item active">All Datasets <span class="badge badge-neutral" style="margin-left:4px;">183</span></a>
      <a href="#" class="tab-item">Monthly</a>
      <a href="#" class="tab-item">Weekly</a>
      <a href="#" class="tab-item">Quarterly</a>
      <a href="#" class="tab-item">Yearly</a>
      <a href="#" class="tab-item">Deprecated <span class="badge badge-warning" style="margin-left:4px;">9</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search datasets…" aria-label="Search datasets"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} <span>Filters</span></button>
          <span class="filter-chip active">Period: All</span>
          <span class="filter-chip">Form Type</span>
          <span class="filter-chip">Status</span>
        </div>
        <div class="table-toolbar-right">
          <span class="table-info">0 selected</span>
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
              <th>Period Type</th>
              <th>Form Type</th>
              <th>Elements</th>
              <th>Org Units</th>
              <th style="min-width:140px;">Completeness</th>
              <th>Data Entry</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–10</strong> of <strong>183</strong> datasets</div>
        <div class="flex items-center gap-3">
          <div class="pagination-controls">
            <button class="page-btn" disabled>‹</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <span style="padding:0 4px;color:var(--color-gray-400);font-size:var(--text-xs);">…</span>
            <button class="page-btn">19</button>
            <button class="page-btn">›</button>
          </div>
        </div>
      </div>
    </div>
  `
}
