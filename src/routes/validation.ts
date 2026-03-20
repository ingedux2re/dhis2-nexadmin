// ── Validation Rules Page ─────────────────────────────────────
// UI: DHIS2 validation rule management and violation reporting
import { Icons } from '../components/layout'

export function ValidationPage(): string {
  const rules = [
    { uid: 'a3Da5HkFCa', name: 'ANC Visits Consistency',       operator: 'ANC 1 >= ANC 2 >= ANC 3', importance: 'MEDIUM', leftSide: 'ANC 1st Visit', rightSide: 'ANC 2nd Visit', violations: 12, period: 'Monthly', status: 'Active' },
    { uid: 'YDJDSrXCnf5', name: 'Malaria Cases vs Deaths',     operator: 'Cases > Deaths',           importance: 'HIGH',   leftSide: 'Malaria Cases', rightSide: 'Malaria Deaths', violations: 0, period: 'Weekly',  status: 'Active' },
    { uid: 'aNG3Jhk7G5p', name: 'HIV Tests vs Positives',      operator: 'Tests >= Positives',       importance: 'HIGH',   leftSide: 'HIV Tests', rightSide: 'HIV Positive',     violations: 3, period: 'Monthly', status: 'Active' },
    { uid: 'n5nS0SmkUpq', name: 'Births Facility Consistency', operator: 'Total >= Skilled',         importance: 'MEDIUM', leftSide: 'Total Births', rightSide: 'Skilled Births',  violations: 7, period: 'Monthly', status: 'Active' },
    { uid: 'B1JGXnBQHhF', name: 'BCG Doses Threshold',         operator: 'BCG ≤ Population * 1.2', importance: 'LOW',    leftSide: 'BCG Doses', rightSide: 'Expected Infants',   violations: 0, period: 'Monthly', status: 'Active' },
    { uid: 'lTbRJx7gbOF', name: 'Old OPD Check (deprecated)',  operator: 'OPD_old >= 0',             importance: 'LOW',    leftSide: 'OPD Old', rightSide: 'Zero',                violations: 0, period: 'Monthly', status: 'Inactive' },
  ]

  const importanceColor: Record<string, string> = { HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-neutral' }
  const statusColor: Record<string, string>     = { Active: 'badge-success', Inactive: 'badge-neutral' }

  const rowsHtml = rules.map(r => `
    <tr>
      <td class="td-check"><input type="checkbox" class="table-checkbox"/></td>
      <td>
        <div style="font-weight:var(--font-medium);color:var(--color-gray-900);">${r.name}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray-400);margin-top:1px;">${r.uid}</div>
      </td>
      <td style="font-size:var(--text-xs);font-family:var(--font-mono);color:var(--color-gray-600);">${r.operator}</td>
      <td><span class="badge ${importanceColor[r.importance]}">${r.importance}</span></td>
      <td style="font-size:var(--text-sm);color:var(--color-gray-500);">${r.period}</td>
      <td style="text-align:center;">
        ${r.violations > 0
          ? `<span class="badge badge-danger" style="font-variant-numeric:tabular-nums;">${r.violations}</span>`
          : `<span class="badge badge-success">${Icons.check}</span>`}
      </td>
      <td><span class="badge ${statusColor[r.status]}">${r.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
        </div>
      </td>
    </tr>
  `).join('')

  const totalViolations = rules.reduce((sum, r) => sum + r.violations, 0)

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Validation Rules</h1>
        <p class="page-subtitle">Data quality constraints enforced during data entry · <strong>${totalViolations}</strong> active violations</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.refresh} Run Validation</button>
        <button class="btn btn-primary btn-md">${Icons.plus} New Rule</button>
      </div>
    </div>

    ${totalViolations > 0 ? `
    <div class="alert alert-warning" style="margin-bottom:var(--space-5);">
      <span class="alert-icon">${Icons.warning}</span>
      <div>
        <strong>${totalViolations} validation violations detected</strong> across the current reporting period.
        Review and resolve data inconsistencies before closing the period.
      </div>
    </div>` : ''}

    <div class="tabs">
      <a href="#" class="tab-item active">All Rules <span class="badge badge-neutral" style="margin-left:2px;">447</span></a>
      <a href="#" class="tab-item">With Violations <span class="badge badge-danger" style="margin-left:2px;">${totalViolations}</span></a>
      <a href="#" class="tab-item">HIGH Priority</a>
      <a href="#" class="tab-item">Inactive</a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search validation rules…"/>
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
              <th class="sortable"><div class="th-inner">Rule Name ${Icons.sortAsc}</div></th>
              <th>Expression</th>
              <th>Importance</th>
              <th>Period</th>
              <th style="text-align:center;">Violations</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–6</strong> of <strong>447</strong> rules</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">…</span>
          <button class="page-btn">18</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}
