// ── Governance Page ───────────────────────────────────────────
// UI: Metadata quality scoring, orphan detection, and governance rule management
import { Icons } from '../components/layout'

export function GovernancePage(): string {
  // UI: Governance dimension scores
  const dimensions = [
    { label: 'Naming Conventions',   score: 91, issues: 8,   color: '#22c55e', stroke: 'var(--color-success-500)' },
    { label: 'Dataset Coverage',     score: 84, issues: 29,  color: '#f59e0b', stroke: 'var(--color-warning-500)' },
    { label: 'Orphaned Elements',    score: 67, issues: 47,  color: '#ef4444', stroke: 'var(--color-danger-500)'  },
    { label: 'Category Consistency', score: 79, issues: 21,  color: '#f59e0b', stroke: 'var(--color-warning-500)' },
    { label: 'Sharing Config',       score: 88, issues: 12,  color: '#22c55e', stroke: 'var(--color-success-500)' },
    { label: 'Version Hygiene',      score: 72, issues: 34,  color: '#f59e0b', stroke: 'var(--color-warning-500)' },
  ]

  const overall = Math.round(dimensions.reduce((a, d) => a + d.score, 0) / dimensions.length)
  const overallColor = overall >= 85 ? 'var(--color-success-500)' : overall >= 70 ? 'var(--color-warning-500)' : 'var(--color-danger-500)'
  const circumference = 2 * Math.PI * 42  // r=42
  const dashOffset = circumference * (1 - overall / 100)

  // UI: Issue list
  const issues = [
    { severity: 'Critical', category: 'Orphaned',   title: '12 data elements not assigned to any dataset',                  count: 12,  action: 'Auto-fix available' },
    { severity: 'Critical', category: 'Orphaned',   title: '3 indicators referencing deleted data elements',                count: 3,   action: 'Manual review required' },
    { severity: 'High',     category: 'Naming',     title: 'Data elements missing short name',                              count: 31,  action: 'Bulk fix available' },
    { severity: 'High',     category: 'Coverage',   title: 'Datasets with no org unit assignment',                          count: 7,   action: 'Manual review required' },
    { severity: 'Medium',   category: 'Sharing',    title: 'Public metadata objects with no sharing restrictions',          count: 18,  action: 'Bulk fix available' },
    { severity: 'Medium',   category: 'Category',   title: 'Data elements sharing name but different category combos',      count: 9,   action: 'Review required' },
    { severity: 'Medium',   category: 'Version',    title: 'Deprecated elements still referenced in active indicators',     count: 6,   action: 'Manual review required' },
    { severity: 'Low',      category: 'Naming',     title: 'Elements with inconsistent prefix style',                       count: 24,  action: 'Bulk fix available' },
    { severity: 'Low',      category: 'Coverage',   title: 'Indicators with no associated dataset',                         count: 44,  action: 'Review optional' },
  ]

  const severityBadge: Record<string, string> = {
    Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-primary', Low: 'badge-neutral'
  }
  const categoryBadge: Record<string, string> = {
    Orphaned: 'badge-danger', Naming: 'badge-info', Coverage: 'badge-warning', Sharing: 'badge-primary', Category: 'badge-neutral', Version: 'badge-warning'
  }

  const issuesHtml = issues.map(i => `
    <tr>
      <td><span class="badge ${severityBadge[i.severity]}">${i.severity}</span></td>
      <td><span class="badge ${categoryBadge[i.category] || 'badge-neutral'}">${i.category}</span></td>
      <td class="td-primary" style="max-width:340px;"><div class="truncate" title="${i.title}">${i.title}</div></td>
      <td style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-gray-800);">${i.count}</td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-500);">${i.action}</td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm" style="font-size:var(--text-xs);">${Icons.eye} Inspect</button>
          ${i.action.includes('fix') || i.action.includes('Bulk') ? `<button class="btn btn-outline-primary btn-sm" style="font-size:var(--text-xs);">${Icons.check} Fix</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('')

  // UI: Dimension score bars
  const dimBarsHtml = dimensions.map(d => `
    <div style="margin-bottom:var(--space-3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:5px;">
        <span style="font-size:var(--text-sm);color:var(--color-gray-700);">${d.label}</span>
        <div style="display:flex;align-items:center;gap:var(--space-2);">
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">${d.issues} issues</span>
          <span style="font-size:var(--text-sm);font-weight:var(--font-bold);color:${d.color};">${d.score}</span>
        </div>
      </div>
      <div class="progress-bar">
        <div class="progress-fill" style="width:${d.score}%;background:${d.color};"></div>
      </div>
    </div>
  `).join('')

  // UI: Governance rules table
  const rules = [
    { rule: 'All data elements must have a short name',           scope: 'Data Elements', auto: true,  enabled: true  },
    { rule: 'No data element should exist without a dataset',     scope: 'Data Elements', auto: false, enabled: true  },
    { rule: 'Datasets must have at least one org unit assigned',  scope: 'Datasets',      auto: false, enabled: true  },
    { rule: 'Indicators must reference valid data elements',      scope: 'Indicators',    auto: false, enabled: true  },
    { rule: 'Public objects must have explicit sharing settings', scope: 'All Metadata',  auto: true,  enabled: false },
    { rule: 'Deprecated elements must not be referenced',         scope: 'All Metadata',  auto: false, enabled: true  },
  ]

  const rulesHtml = rules.map(r => `
    <tr>
      <td class="td-primary">${r.rule}</td>
      <td><span class="badge badge-neutral">${r.scope}</span></td>
      <td>
        <span class="badge ${r.auto ? 'badge-success' : 'badge-neutral'}">
          ${r.auto ? 'Auto-fix' : 'Manual'}
        </span>
      </td>
      <td>
        <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
          <input type="checkbox" ${r.enabled ? 'checked' : ''} style="accent-color:var(--color-primary-600);width:14px;height:14px;"/>
          <span style="font-size:var(--text-xs);color:var(--color-gray-600);">${r.enabled ? 'Enabled' : 'Disabled'}</span>
        </label>
      </td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit rule">${Icons.edit}</button>
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Governance</h1>
        <p class="page-subtitle">Metadata quality assessment, rule enforcement, and compliance reporting</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.refresh} <span>Re-scan</span></button>
        <button class="btn btn-secondary btn-md">${Icons.download} <span>Export Report</span></button>
        <button class="btn btn-primary btn-md">${Icons.check} <span>Run Auto-Fix</span></button>
      </div>
    </div>

    <!-- Top row: Score + Dimensions -->
    <div style="display:grid;grid-template-columns:auto 1fr;gap:var(--space-5);margin-bottom:var(--space-6);">

      <!-- Overall Score Ring -->
      <div class="card" style="min-width:200px;">
        <div class="card-header"><div class="card-title">Overall Score</div></div>
        <div class="card-body" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
          <div class="score-ring">
            <svg viewBox="0 0 100 100" width="100" height="100">
              <circle class="score-ring-bg" cx="50" cy="50" r="42"/>
              <circle class="score-ring-fill"
                cx="50" cy="50" r="42"
                stroke="${overallColor}"
                stroke-dasharray="${circumference}"
                stroke-dashoffset="${dashOffset}"
              />
            </svg>
            <div class="score-ring-label">
              <span class="score-ring-value" style="color:${overallColor};">${overall}</span>
              <span class="score-ring-unit">/100</span>
            </div>
          </div>
          <div style="text-align:center;">
            <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-warning-600);">Needs Attention</div>
            <div style="font-size:var(--text-xs);color:var(--color-gray-400);margin-top:2px;">Last scan: 2 min ago</div>
          </div>
          <div style="width:100%;display:flex;flex-direction:column;gap:var(--space-2);">
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
              <span style="color:var(--color-danger-600);font-weight:var(--font-semibold);">● Critical</span><span>15 issues</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
              <span style="color:var(--color-warning-600);font-weight:var(--font-semibold);">● High</span><span>38 issues</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
              <span style="color:var(--color-primary-600);font-weight:var(--font-semibold);">● Medium</span><span>27 issues</span>
            </div>
            <div style="display:flex;justify-content:space-between;font-size:var(--text-xs);">
              <span style="color:var(--color-gray-500);font-weight:var(--font-semibold);">● Low</span><span>68 issues</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Dimension Scores -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Dimension Scores</div>
            <div class="card-subtitle">Score breakdown by governance category</div>
          </div>
        </div>
        <div class="card-body">${dimBarsHtml}</div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <a href="#" class="tab-item active">Issues <span class="badge badge-danger" style="margin-left:4px;">148</span></a>
      <a href="#" class="tab-item">Rules</a>
      <a href="#" class="tab-item">Reports</a>
      <a href="#" class="tab-item">History</a>
    </div>

    <!-- Issues Table -->
    <div class="card" style="overflow:hidden;margin-bottom:var(--space-6);">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search issues…" aria-label="Search issues"/>
          </div>
          <span class="filter-chip active">Severity: All</span>
          <span class="filter-chip">Category</span>
          <span class="filter-chip">Fix: Available</span>
        </div>
        <div class="table-toolbar-right">
          <button class="btn btn-secondary btn-sm">${Icons.download} Export</button>
        </div>
      </div>
      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Severity</th>
              <th>Category</th>
              <th class="sortable"><div class="th-inner">Issue ${Icons.sortAsc}</div></th>
              <th>Count</th>
              <th>Fix Type</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${issuesHtml}</tbody>
        </table>
      </div>
    </div>

    <!-- Governance Rules -->
    <div class="section-header">
      <div>
        <div class="section-title">Governance Rules</div>
        <div class="section-subtitle">Configure which quality checks are enforced</div>
      </div>
      <button class="btn btn-primary btn-sm">${Icons.plus} Add Rule</button>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th>Rule</th>
              <th>Scope</th>
              <th>Fix Type</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rulesHtml}</tbody>
        </table>
      </div>
    </div>
  `
}
