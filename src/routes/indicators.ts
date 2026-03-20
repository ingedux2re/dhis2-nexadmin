// ── Indicators Page ───────────────────────────────────────────
// UI: Indicator management with numerator/denominator preview and groups
import { Icons } from '../components/layout'

export function IndicatorsPage(): string {
  const indicators = [
    { uid: 'Uvn6LCg7dVU', name: 'ANC 1 Coverage',               type: 'Coverage', numerator: 'ANC 1st Visit', denominator: 'Expected Pregnancies', value: '87.4%', trend: 'up',   annualized: true,  groups: 2, status: 'Active' },
    { uid: 'ReUHfIn0pTQ', name: 'ANC 4+ Coverage',              type: 'Coverage', numerator: 'ANC 4th+ Visit', denominator: 'Expected Pregnancies', value: '62.1%', trend: 'up',   annualized: true,  groups: 2, status: 'Active' },
    { uid: 'l1nnMqKn2PN', name: 'Malaria Incidence Rate',        type: 'Rate',     numerator: 'Malaria Confirmed Cases', denominator: 'Population at Risk', value: '12.3', trend: 'down', annualized: true,  groups: 3, status: 'Active' },
    { uid: 'n5nS0SmkUpq', name: 'HIV Testing Rate',              type: 'Rate',     numerator: 'HIV Tests Performed', denominator: 'Population 15+', value: '44.8%', trend: 'up',   annualized: false, groups: 2, status: 'Active' },
    { uid: 'FbKK4ofIv5R', name: 'Immunization DPT3 Coverage',    type: 'Coverage', numerator: 'DPT3 Doses Given', denominator: 'Surviving Infants', value: '93.2%', trend: 'flat', annualized: true,  groups: 3, status: 'Active' },
    { uid: 'lJm0t2bdHvN', name: 'Skilled Birth Attendance',      type: 'Coverage', numerator: 'Births by Skilled Staff', denominator: 'Expected Births', value: '78.9%', trend: 'up',   annualized: false, groups: 4, status: 'Active' },
    { uid: 'pKSrWkRZm9F', name: 'TB Treatment Success Rate',     type: 'Rate',     numerator: 'TB Cured + Completed', denominator: 'TB Registered', value: '85.1%', trend: 'up',   annualized: false, groups: 2, status: 'Active' },
    { uid: 'Bpx0589u8y0', name: 'Old OPD Utilization (depr.)',  type: 'Rate',     numerator: 'OPD Attendance (old)', denominator: 'Population', value: 'N/A',   trend: 'flat', annualized: false, groups: 0, status: 'Deprecated' },
  ]

  const typeColor: Record<string, string>   = { Coverage: 'badge-primary', Rate: 'badge-info', Ratio: 'badge-warning' }
  const statusColor: Record<string, string> = { Active: 'badge-success', Deprecated: 'badge-warning' }

  const rowsHtml = indicators.map(ind => `
    <tr>
      <td class="td-check">
        <input type="checkbox" class="table-checkbox" aria-label="Select ${ind.name}"/>
      </td>
      <td style="max-width:200px;">
        <div style="font-weight:var(--font-medium);color:var(--color-gray-900);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${ind.name}">${ind.name}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray-400);margin-top:1px;">${ind.uid}</div>
      </td>
      <td><span class="badge ${typeColor[ind.type] || 'badge-neutral'}">${ind.type}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);max-width:150px;">
        <span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${ind.numerator}">${ind.numerator}</span>
      </td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);max-width:150px;">
        <span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${ind.denominator}">${ind.denominator}</span>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:4px;">
          <span style="font-weight:var(--font-semibold);color:var(--color-gray-800);">${ind.value}</span>
          ${ind.trend === 'up'   ? `<span style="color:var(--color-success-500);">${Icons.arrowUp}</span>` : ''}
          ${ind.trend === 'down' ? `<span style="color:var(--color-danger-500);">${Icons.arrowDown}</span>` : ''}
        </div>
      </td>
      <td style="text-align:center;">
        ${ind.annualized
          ? `<span style="color:var(--color-success-500);">${Icons.check}</span>`
          : `<span style="color:var(--color-gray-300);">—</span>`}
      </td>
      <td>
        ${ind.groups > 0
          ? `<span class="badge badge-neutral">${ind.groups} group${ind.groups > 1 ? 's' : ''}</span>`
          : `<span style="font-size:var(--text-xs);color:var(--color-gray-300);">—</span>`}
      </td>
      <td><span class="badge ${statusColor[ind.status] || 'badge-neutral'}">
        <span class="badge-dot" style="background:currentColor;"></span>${ind.status}
      </span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm btn-icon" data-dropdown>${Icons.moreVert}</button>
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
        <p class="page-subtitle">Coverage rates, performance ratios, and composite calculations · <strong>${indicators.length}</strong> of 1,204 shown</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.download} Export</button>
        <button class="btn btn-primary btn-md">${Icons.plus} New Indicator</button>
      </div>
    </div>

    <div class="tabs">
      <a href="#" class="tab-item active">All <span class="badge badge-neutral" style="margin-left:2px;">1,204</span></a>
      <a href="#" class="tab-item">Coverage</a>
      <a href="#" class="tab-item">Rate</a>
      <a href="#" class="tab-item">Ratio</a>
      <a href="#" class="tab-item">Deprecated <span class="badge badge-warning" style="margin-left:2px;">24</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search indicators…"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} Filter</button>
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
              <th class="sortable"><div class="th-inner">Name ${Icons.sortAsc}</div></th>
              <th>Type</th>
              <th>Numerator</th>
              <th>Denominator</th>
              <th>Latest Value</th>
              <th>Annualized</th>
              <th>Groups</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–8</strong> of <strong>1,204</strong> indicators</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">…</span>
          <button class="page-btn">49</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}
