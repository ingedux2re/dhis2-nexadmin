// ── Governance Page ───────────────────────────────────────────
// UI: Metadata quality scoring, orphan detection, and governance reporting
import { Icons } from '../components/layout'

export function GovernancePage(): string {
  // UI: Governance score ring chart (SVG-based, no external library)
  function scoreRing(score: number, color: string, size = 100) {
    const r = 38
    const circ = 2 * Math.PI * r
    const dash = (score / 100) * circ
    return `
      <div class="score-ring" style="width:${size}px;height:${size}px;">
        <svg width="${size}" height="${size}" viewBox="0 0 100 100">
          <circle class="score-ring-bg" cx="50" cy="50" r="${r}"/>
          <circle class="score-ring-fill"
            cx="50" cy="50" r="${r}"
            stroke="${color}"
            stroke-dasharray="${dash.toFixed(1)} ${circ.toFixed(1)}"
            style="stroke-dashoffset:0;transform:rotate(-90deg);transform-origin:50% 50%;"/>
        </svg>
        <div class="score-ring-label">
          <span class="score-ring-value" style="color:${color}">${score}</span>
          <span class="score-ring-unit">/100</span>
        </div>
      </div>
    `
  }

  // UI: Score breakdown categories
  const scoreCategories = [
    { label: 'Naming Convention',    score: 82, weight: '25%', issues: 47,  color: 'var(--color-success-500)' },
    { label: 'Orphaned Objects',     score: 65, weight: '20%', issues: 14,  color: 'var(--color-warning-500)' },
    { label: 'Category Compliance',  score: 91, weight: '20%', issues: 8,   color: 'var(--color-success-500)' },
    { label: 'Dataset Completeness', score: 88, weight: '20%', issues: 23,  color: 'var(--color-success-500)' },
    { label: 'Sharing Settings',     score: 57, weight: '15%', issues: 62,  color: 'var(--color-danger-500)'  },
  ]

  const scoreBreakdownHtml = scoreCategories.map(cat => `
    <div style="display:flex;align-items:center;gap:var(--space-4);padding:var(--space-3) 0;border-bottom:1px solid var(--color-gray-100);">
      <div style="flex:1;min-width:0;">
        <div style="display:flex;justify-content:space-between;margin-bottom:6px;">
          <span style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-800);">${cat.label}</span>
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">weight: ${cat.weight}</span>
        </div>
        <div class="progress-bar" style="height:8px;">
          <div style="height:100%;border-radius:99px;background:${cat.color};width:${cat.score}%;transition:width 600ms ease;"></div>
        </div>
      </div>
      <div style="text-align:right;min-width:80px;">
        <div style="font-size:var(--text-lg);font-weight:var(--font-bold);color:var(--color-gray-900);">${cat.score}<span style="font-size:var(--text-xs);color:var(--color-gray-400);">/100</span></div>
        <div style="font-size:var(--text-xs);color:var(--color-danger-500);">${cat.issues} issue${cat.issues !== 1 ? 's' : ''}</div>
      </div>
    </div>
  `).join('')

  // UI: Issues table
  const issues = [
    { id: 'GOV-001', severity: 'Critical', category: 'Orphaned Objects',    object: 'bROufk3y7fP',  name: 'Unused Element ABC',         desc: 'Data element not assigned to any dataset',          status: 'Open'     },
    { id: 'GOV-002', severity: 'Critical', category: 'Orphaned Objects',    object: 'GQY2lXrypjO',  name: 'OPD Attendance (old)',        desc: 'Deprecated element still receiving data entries',   status: 'Open'     },
    { id: 'GOV-003', severity: 'High',     category: 'Naming Convention',   object: 'n5nS0SmkUpq',  name: 'hiv tests performed',         desc: 'Name does not follow Title Case convention',       status: 'Open'     },
    { id: 'GOV-004', severity: 'High',     category: 'Sharing Settings',    object: 'pBOMPrpg1QX',  name: 'HMIS Monthly Report',         desc: 'Dataset is publicly readable — restrict access',   status: 'Review'   },
    { id: 'GOV-005', severity: 'Medium',   category: 'Naming Convention',   object: 'l6byfWFUGaP',  name: 'HIV Positive',                desc: 'Ambiguous name — should specify test type',        status: 'Open'     },
    { id: 'GOV-006', severity: 'Medium',   category: 'Category Compliance', object: 'rbkr8PL0rwM',  name: 'Births attended by skilled', desc: 'Missing disaggregation by facility type',          status: 'Open'     },
    { id: 'GOV-007', severity: 'Low',      category: 'Dataset Completeness',object: 'Lpw6GcnCNpP',  name: 'Emergency Health (Old)',      desc: 'Completeness below 15% — consider archiving',      status: 'Resolved' },
    { id: 'GOV-008', severity: 'Low',      category: 'Sharing Settings',    object: 'XuFcuFpyMHF',  name: 'TB Program Report',           desc: 'No user group assigned for data entry access',     status: 'Open'     },
  ]

  const sevColor: Record<string, string>    = { Critical: 'badge-danger', High: 'badge-warning', Medium: 'badge-info', Low: 'badge-neutral' }
  const statusColor: Record<string, string> = { Open: 'badge-danger', Review: 'badge-warning', Resolved: 'badge-success' }

  const issuesHtml = issues.map(iss => `
    <tr>
      <td class="td-mono" style="font-size:var(--text-xs);">${iss.id}</td>
      <td><span class="badge ${sevColor[iss.severity] || 'badge-neutral'}">${iss.severity}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-500);">${iss.category}</td>
      <td>
        <div style="font-weight:var(--font-medium);color:var(--color-gray-900);font-size:var(--text-sm);">${iss.name}</div>
        <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray-400);margin-top:1px;">${iss.object}</div>
      </td>
      <td style="font-size:var(--text-sm);color:var(--color-gray-600);max-width:240px;">
        <span style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${iss.desc}">${iss.desc}</span>
      </td>
      <td><span class="badge ${statusColor[iss.status] || 'badge-neutral'}">
        <span class="badge-dot" style="background:currentColor;"></span>${iss.status}
      </span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Resolve">${Icons.check}</button>
        </div>
      </td>
    </tr>
  `).join('')

  // UI: Trend metrics
  const trendCards = [
    { label: 'Issues This Month',   value: '154',  delta: '−32',  dir: 'down', note: 'vs last month' },
    { label: 'Resolved This Month', value: '88',   delta: '+21',  dir: 'up',   note: 'vs last month' },
    { label: 'Open Critical',       value: '2',    delta: '0',    dir: 'flat', note: 'unchanged'     },
    { label: 'Score Trend',         value: '+4',   delta: '78→82',dir: 'up',   note: 'score points'  },
  ]

  const trendsHtml = trendCards.map(t => `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-label">${t.label}</span>
      </div>
      <div class="stat-card-value">${t.value}</div>
      <div class="stat-card-delta ${t.dir}">
        ${t.dir === 'up' ? Icons.arrowUp : t.dir === 'down' ? Icons.arrowDown : ''}
        <span>${t.delta} ${t.note}</span>
      </div>
    </div>
  `).join('')

  return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Governance &amp; Quality</h1>
        <p class="page-subtitle">Metadata governance scoring, compliance checks, and issue resolution</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.refresh} Re-run Analysis</button>
        <button class="btn btn-primary btn-md">${Icons.download} Export Report</button>
      </div>
    </div>

    <!-- Trend Stats -->
    <div class="stats-grid" style="grid-template-columns:repeat(4,1fr);margin-bottom:var(--space-5);">
      ${trendsHtml}
    </div>

    <!-- Score Overview + Breakdown -->
    <div style="display:grid;grid-template-columns:auto 1fr;gap:var(--space-5);margin-bottom:var(--space-6);" class="dashboard-grid">

      <!-- Overall Score Card -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Overall Score</div>
            <div class="card-subtitle">Last analysed: Mar 18, 2025</div>
          </div>
          <span class="badge badge-warning">Needs Work</span>
        </div>
        <div class="card-body" style="display:flex;flex-direction:column;align-items:center;gap:var(--space-4);">
          ${scoreRing(78, 'var(--color-warning-500)', 110)}
          <div style="text-align:center;">
            <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-warning-700);">Fair — Improvement Needed</div>
            <div style="font-size:var(--text-xs);color:var(--color-gray-400);margin-top:4px;">Target: ≥ 85 for compliant status</div>
          </div>
          <div style="display:flex;gap:var(--space-3);width:100%;justify-content:center;">
            <div style="text-align:center;">
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--color-danger-600);">7</div>
              <div style="font-size:var(--text-xs);color:var(--color-gray-500);">Critical</div>
            </div>
            <div style="width:1px;background:var(--border-color);"></div>
            <div style="text-align:center;">
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--color-warning-600);">28</div>
              <div style="font-size:var(--text-xs);color:var(--color-gray-500);">High</div>
            </div>
            <div style="width:1px;background:var(--border-color);"></div>
            <div style="text-align:center;">
              <div style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--color-gray-600);">119</div>
              <div style="font-size:var(--text-xs);color:var(--color-gray-500);">Total</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Score Breakdown -->
      <div class="card">
        <div class="card-header">
          <div>
            <div class="card-title">Score Breakdown by Category</div>
            <div class="card-subtitle">Weighted contribution to overall governance score</div>
          </div>
          <button class="btn btn-ghost btn-sm">Configure Rules</button>
        </div>
        <div class="card-body">
          ${scoreBreakdownHtml}
        </div>
      </div>

    </div>

    <!-- Issues Table -->
    <div class="section-header">
      <div>
        <div class="section-title">Open Issues</div>
        <div class="section-subtitle">All detected governance violations requiring action</div>
      </div>
    </div>

    <div class="tabs">
      <a href="#" class="tab-item active">All Issues <span class="badge badge-neutral" style="margin-left:2px;">154</span></a>
      <a href="#" class="tab-item">Critical <span class="badge badge-danger" style="margin-left:2px;">7</span></a>
      <a href="#" class="tab-item">High <span class="badge badge-warning" style="margin-left:2px;">28</span></a>
      <a href="#" class="tab-item">Resolved <span class="badge badge-success" style="margin-left:2px;">88</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search issues…" aria-label="Search governance issues"/>
          </div>
          <span class="filter-chip active">Status: Open</span>
          <span class="filter-chip">Category</span>
          <span class="filter-chip">Severity</span>
        </div>
        <div class="table-toolbar-right">
          <button class="btn btn-success btn-sm">${Icons.check} Resolve Selected</button>
        </div>
      </div>

      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Severity</th>
              <th>Category</th>
              <th>Object</th>
              <th>Description</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${issuesHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–8</strong> of <strong>154</strong> issues</div>
        <div class="pagination-controls">
          <button class="page-btn" disabled>‹</button>
          <button class="page-btn active">1</button>
          <button class="page-btn">2</button>
          <button class="page-btn">3</button>
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">…</span>
          <button class="page-btn">7</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}
