// ── Dashboard Page ───────────────────────────────────────────
// UI: Enterprise home page with KPI cards, activity feed, and system health
import { Icons } from '../components/layout'

export function DashboardPage(): string {
  // UI: KPI stat cards
  const stats = [
    { label: 'Data Elements',  value: '2,847', delta: '+124',  dir: 'up',   icon: Icons.elements,   color: 'primary' },
    { label: 'Datasets',       value: '183',   delta: '+12',   dir: 'up',   icon: Icons.dataset,    color: 'success' },
    { label: 'Indicators',     value: '1,204', delta: '−8',    dir: 'down', icon: Icons.indicators, color: 'warning' },
    { label: 'Org Units',      value: '9,641', delta: '+301',  dir: 'up',   icon: Icons.orgunit,    color: 'info'    },
    { label: 'Validation Rules',value: '447',  delta: '0',     dir: 'flat', icon: Icons.validation, color: 'danger'  },
    { label: 'Active Users',   value: '56',    delta: '+3',    dir: 'up',   icon: Icons.bulk,       color: 'primary' },
  ]

  const statsHtml = stats.map(s => `
    <div class="stat-card">
      <div class="stat-card-header">
        <span class="stat-card-label">${s.label}</span>
        <span class="stat-card-icon ${s.color}">${s.icon}</span>
      </div>
      <div class="stat-card-value">${s.value}</div>
      <div class="stat-card-delta ${s.dir}">
        ${s.dir === 'up' ? Icons.arrowUp : s.dir === 'down' ? Icons.arrowDown : ''}
        <span>${s.delta} this month</span>
      </div>
    </div>
  `).join('')

  // UI: Recent activity feed
  const activities = [
    { color: 'primary', text: '<strong>System Admin</strong> updated Data Element <code>ANC 1st Visit</code>', time: '2 min ago' },
    { color: 'success', text: '<strong>Data Manager</strong> created Dataset <code>HMIS Monthly 2025</code>', time: '18 min ago' },
    { color: 'warning', text: '<strong>Bulk Operation</strong> renamed 47 elements — validation pending', time: '1 hour ago' },
    { color: 'danger',  text: '<strong>Governance Alert</strong> — 12 orphaned indicators detected', time: '3 hours ago' },
    { color: 'primary', text: '<strong>System Admin</strong> merged 3 duplicate Organisation Units', time: '5 hours ago' },
    { color: 'success', text: '<strong>Data Manager</strong> approved governance report Q1 2025', time: 'Yesterday' },
    { color: 'primary', text: '<strong>System Admin</strong> added 201 new Org Units — National level', time: 'Yesterday' },
  ]

  const activityHtml = activities.map(a => `
    <div class="activity-item">
      <span class="activity-dot ${a.color}"></span>
      <div class="activity-content">
        <div class="activity-text">${a.text}</div>
        <div class="activity-time">${a.time}</div>
      </div>
    </div>
  `).join('')

  // UI: Pending tasks table
  const tasks = [
    { task: 'Validate HMIS Monthly Dataset', priority: 'High',   status: 'Pending',     assigned: 'System Admin', due: 'Today' },
    { task: 'Resolve 12 orphaned indicators', priority: 'High',  status: 'In Progress', assigned: 'Data Manager', due: 'Tomorrow' },
    { task: 'Bulk rename malaria elements',   priority: 'Medium',status: 'Pending',     assigned: 'System Admin', due: 'Mar 22' },
    { task: 'Governance review Q1 2025',      priority: 'Low',   status: 'Review',      assigned: 'Admin',        due: 'Mar 25' },
  ]

  const taskPriorityBadge: Record<string, string> = {
    High: 'badge-danger', Medium: 'badge-warning', Low: 'badge-neutral'
  }
  const taskStatusBadge: Record<string, string> = {
    Pending: 'badge-neutral', 'In Progress': 'badge-primary', Review: 'badge-warning', Done: 'badge-success'
  }

  const tasksHtml = tasks.map(t => `
    <tr>
      <td class="td-primary">${t.task}</td>
      <td><span class="badge ${taskPriorityBadge[t.priority]}">${t.priority}</span></td>
      <td><span class="badge ${taskStatusBadge[t.status]}">${t.status}</span></td>
      <td class="text-gray">${t.assigned}</td>
      <td class="text-gray">${t.due}</td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
        </div>
      </td>
    </tr>
  `).join('')

  // UI: System health indicators
  const healthItems = [
    { label: 'Data Element Coverage', value: 94, color: 'success' },
    { label: 'Dataset Completeness',  value: 87, color: 'success' },
    { label: 'Orphaned Elements',     value: 12, color: 'danger',  invert: true },
    { label: 'Governance Score',      value: 78, color: 'warning' },
  ]

  const healthHtml = healthItems.map(h => `
    <div style="margin-bottom: var(--space-3);">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="font-size:var(--text-sm);color:var(--color-gray-700);">${h.label}</span>
        <span style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-gray-800);">${h.value}${h.invert ? '' : '%'}</span>
      </div>
      <div class="progress-bar">
        <div class="progress-fill ${h.color}" style="width:${h.invert ? Math.min(h.value * 8, 100) : h.value}%;"></div>
      </div>
    </div>
  `).join('')

  // UI: Quick actions panel
  const quickActions = [
    { label: 'New Data Element',  href: '/elements?action=new',   icon: Icons.elements,   color: 'var(--color-primary-50)',  border: 'var(--color-primary-200)' },
    { label: 'New Dataset',       href: '/datasets?action=new',    icon: Icons.dataset,    color: 'var(--color-success-50)',  border: 'var(--color-success-200)' },
    { label: 'Run Bulk Operation',href: '/bulk',                   icon: Icons.bulk,       color: 'var(--color-warning-50)',  border: 'var(--color-warning-200)' },
    { label: 'Governance Check',  href: '/governance',             icon: Icons.governance, color: 'var(--color-info-50)',     border: 'var(--color-info-200)'    },
  ]

  const quickActionsHtml = quickActions.map(q => `
    <a href="${q.href}" style="
      display:flex;align-items:center;gap:var(--space-3);
      padding:var(--space-3) var(--space-4);
      background:${q.color};border:1px solid ${q.border};
      border-radius:var(--border-radius);text-decoration:none;
      transition:box-shadow var(--transition-base);
    " onmouseover="this.style.boxShadow='var(--shadow-sm)'" onmouseout="this.style.boxShadow='none'">
      <span style="color:var(--color-gray-700);">${q.icon}</span>
      <span style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-800);">${q.label}</span>
      <span style="margin-left:auto;color:var(--color-gray-400);">${Icons.chevronRight}</span>
    </a>
  `).join('')

  return `
    <!-- Page Header -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Dashboard</h1>
        <p class="page-subtitle">System overview for DHIS2 instance · Last synced 2 minutes ago</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.refresh} <span>Refresh</span></button>
        <button class="btn btn-primary btn-md">${Icons.download} <span>Export Report</span></button>
      </div>
    </div>

    <!-- Instance Alert -->
    <div class="alert alert-info" style="margin-bottom:var(--space-5);">
      <span class="alert-icon">${Icons.info}</span>
      <div>
        <strong>Connected to:</strong> play.dhis2.org — DHIS2 v2.41.3 &nbsp;|&nbsp;
        <strong>Environment:</strong> Demo &nbsp;|&nbsp;
        <strong>Last backup:</strong> Today at 06:00 UTC
      </div>
    </div>

    <!-- KPI Stats Grid -->
    <div class="stats-grid">${statsHtml}</div>

    <!-- Main Dashboard Grid -->
    <div class="dashboard-grid">

      <!-- Left Column -->
      <div style="display:flex;flex-direction:column;gap:var(--space-5);">

        <!-- Pending Tasks -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Pending Tasks</div>
              <div class="card-subtitle">Actions requiring your attention</div>
            </div>
            <a href="#" class="btn btn-ghost btn-sm">View all</a>
          </div>
          <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Assigned</th>
                  <th>Due</th>
                  <th class="td-actions"></th>
                </tr>
              </thead>
              <tbody>${tasksHtml}</tbody>
            </table>
          </div>
        </div>

        <!-- Recent Activity -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Recent Activity</div>
              <div class="card-subtitle">Audit log — last 24 hours</div>
            </div>
            <div style="display:flex;gap:var(--space-2);">
              <button class="btn btn-ghost btn-sm">${Icons.filter} Filter</button>
              <a href="#" class="btn btn-ghost btn-sm">View all</a>
            </div>
          </div>
          <div class="activity-list">${activityHtml}</div>
        </div>

      </div>

      <!-- Right Column -->
      <div style="display:flex;flex-direction:column;gap:var(--space-5);">

        <!-- Quick Actions -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">Quick Actions</div>
          </div>
          <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-2);">
            ${quickActionsHtml}
          </div>
        </div>

        <!-- System Health -->
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">System Health</div>
              <div class="card-subtitle">Metadata quality indicators</div>
            </div>
            <a href="/governance" class="btn btn-ghost btn-sm">Details</a>
          </div>
          <div class="card-body">
            ${healthHtml}
            <div class="divider" style="margin:var(--space-4) 0;"></div>
            <div style="display:flex;justify-content:space-between;align-items:center;">
              <span style="font-size:var(--text-sm);color:var(--color-gray-600);">Overall Governance Score</span>
              <span style="font-size:var(--text-xl);font-weight:var(--font-bold);color:var(--color-warning-600);">78<span style="font-size:var(--text-sm);color:var(--color-gray-400);">/100</span></span>
            </div>
          </div>
        </div>

        <!-- Server Info -->
        <div class="card">
          <div class="card-header">
            <div class="card-title">${Icons.server}&nbsp; Server Info</div>
          </div>
          <div class="card-body-sm">
            ${[
              ['DHIS2 Version', '2.41.3'],
              ['Java Version',  'OpenJDK 17'],
              ['Database',      'PostgreSQL 14'],
              ['Revision',      'a8b3c1f'],
              ['Uptime',        '14 days'],
            ].map(([k, v]) => `
              <div style="display:flex;justify-content:space-between;padding:var(--space-2) var(--space-1);border-bottom:1px solid var(--color-gray-100);">
                <span style="font-size:var(--text-sm);color:var(--color-gray-500);">${k}</span>
                <span style="font-size:var(--text-sm);font-weight:var(--font-medium);font-family:var(--font-mono);color:var(--color-gray-800);">${v}</span>
              </div>
            `).join('')}
          </div>
        </div>

      </div>
    </div>
  `
}
