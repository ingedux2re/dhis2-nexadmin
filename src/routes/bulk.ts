// ── Bulk Operations Page ──────────────────────────────────────
// UI: Wizard-style multi-step interface for running bulk metadata operations
import { Icons } from '../components/layout'

export function BulkOperationsPage(): string {
  // UI: Available operation types
  const operations = [
    {
      id: 'rename',
      title: 'Bulk Rename',
      desc: 'Rename data elements, indicators, or datasets using search & replace patterns.',
      icon: Icons.edit,
      color: 'var(--color-primary-500)',
      bg: 'var(--color-primary-50)',
      border: 'var(--color-primary-200)',
      badge: null,
    },
    {
      id: 'group',
      title: 'Group Assignment',
      desc: 'Assign or remove elements from data element groups in bulk.',
      icon: Icons.tag,
      color: 'var(--color-success-600)',
      bg: 'var(--color-success-50)',
      border: 'var(--color-success-200)',
      badge: null,
    },
    {
      id: 'delete',
      title: 'Bulk Delete',
      desc: 'Safely delete multiple metadata objects after dependency checking.',
      icon: Icons.trash,
      color: 'var(--color-danger-600)',
      bg: 'var(--color-danger-50)',
      border: 'var(--color-danger-200)',
      badge: 'Caution',
    },
    {
      id: 'sharing',
      title: 'Sharing Settings',
      desc: 'Update public access and user group sharing across multiple objects.',
      icon: Icons.bulk,
      color: 'var(--color-warning-600)',
      bg: 'var(--color-warning-50)',
      border: 'var(--color-warning-200)',
      badge: null,
    },
    {
      id: 'transfer',
      title: 'Category Transfer',
      desc: 'Reassign category combos across a set of data elements.',
      icon: Icons.dataset,
      color: 'var(--color-info-600)',
      bg: 'var(--color-info-50)',
      border: 'var(--color-info-200)',
      badge: 'Beta',
    },
    {
      id: 'merge',
      title: 'Merge Duplicates',
      desc: 'Detect and merge duplicate metadata objects with data migration.',
      icon: Icons.governance,
      color: 'var(--color-primary-700)',
      bg: 'var(--color-primary-50)',
      border: 'var(--color-primary-200)',
      badge: 'Beta',
    },
  ]

  const opsHtml = operations.map(op => `
    <div
      class="op-card"
      data-op="${op.id}"
      style="
        background:${op.bg};
        border:1.5px solid ${op.border};
        border-radius:var(--border-radius-md);
        padding:var(--space-4);
        cursor:pointer;
        transition:box-shadow var(--transition-base), border-color var(--transition-base), transform 80ms ease;
        display:flex;flex-direction:column;gap:var(--space-3);
        position:relative;
      "
      tabindex="0"
      role="button"
      aria-label="${op.title}"
      onmouseover="this.style.boxShadow='var(--shadow-md)';this.style.transform='translateY(-1px)'"
      onmouseout="this.style.boxShadow='none';this.style.transform='none'"
    >
      ${op.badge ? `<span class="badge ${op.badge === 'Caution' ? 'badge-danger' : 'badge-warning'}" style="position:absolute;top:var(--space-3);right:var(--space-3);">${op.badge}</span>` : ''}
      <div style="width:36px;height:36px;background:#fff;border-radius:var(--border-radius);display:flex;align-items:center;justify-content:center;color:${op.color};box-shadow:var(--shadow-xs);">
        ${op.icon}
      </div>
      <div>
        <div style="font-size:var(--text-md);font-weight:var(--font-semibold);color:var(--color-gray-800);margin-bottom:4px;">${op.title}</div>
        <div style="font-size:var(--text-xs);color:var(--color-gray-500);line-height:var(--leading-relaxed);">${op.desc}</div>
      </div>
      <div style="display:flex;align-items:center;gap:4px;font-size:var(--text-xs);font-weight:var(--font-medium);color:${op.color};">
        Configure <span>${Icons.chevronRight}</span>
      </div>
    </div>
  `).join('')

  // UI: Rename wizard (active step demo)
  const wizardSteps = [
    { num: 1, label: 'Select Operation', done: true,  active: false },
    { num: 2, label: 'Choose Objects',   done: false, active: true  },
    { num: 3, label: 'Configure',        done: false, active: false },
    { num: 4, label: 'Preview Changes',  done: false, active: false },
    { num: 5, label: 'Execute',          done: false, active: false },
  ]

  const wizardNavHtml = wizardSteps.map(s => `
    <div class="wizard-step-item ${s.done ? 'done' : s.active ? 'active' : ''}">
      <span class="wizard-step-num">${s.done ? Icons.check : s.num}</span>
      <span>${s.label}</span>
    </div>
  `).join('')

  // UI: Recent operations log
  const recentOps = [
    { op: 'Bulk Rename',        objects: 47, user: 'System Admin', time: '1 hour ago',  status: 'Completed' },
    { op: 'Group Assignment',   objects: 120,user: 'Data Manager', time: '3 hours ago', status: 'Completed' },
    { op: 'Sharing Settings',   objects: 28, user: 'System Admin', time: 'Yesterday',   status: 'Completed' },
    { op: 'Merge Duplicates',   objects: 6,  user: 'System Admin', time: '2 days ago',  status: 'Completed' },
    { op: 'Bulk Delete',        objects: 3,  user: 'System Admin', time: '3 days ago',  status: 'Rolled Back' },
  ]

  const opStatusBadge: Record<string, string> = {
    Completed: 'badge-success', 'Rolled Back': 'badge-danger', Running: 'badge-warning'
  }

  const recentHtml = recentOps.map(r => `
    <tr>
      <td class="td-primary">${r.op}</td>
      <td style="font-size:var(--text-sm);color:var(--color-gray-700);">${r.objects} objects</td>
      <td style="font-size:var(--text-sm);color:var(--color-gray-600);">${r.user}</td>
      <td class="text-gray">${r.time}</td>
      <td><span class="badge ${opStatusBadge[r.status] || 'badge-neutral'}">${r.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View log">${Icons.eye}</button>
          ${r.status === 'Completed' ? `<button class="btn btn-ghost btn-sm btn-icon" title="Rollback">${Icons.refresh}</button>` : ''}
        </div>
      </td>
    </tr>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Bulk Operations</h1>
        <p class="page-subtitle">Execute mass metadata operations safely with preview and rollback support</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.eye} <span>Audit Log</span></button>
      </div>
    </div>

    <div class="alert alert-warning" style="margin-bottom:var(--space-5);">
      <span class="alert-icon">${Icons.warning}</span>
      <div>
        <strong>Important:</strong> Bulk operations are irreversible once executed without rollback.
        Always review the <strong>Preview Changes</strong> step before confirming.
        A backup snapshot is created automatically before each operation.
      </div>
    </div>

    <!-- Operation Selection Grid -->
    <div class="section-header">
      <div>
        <div class="section-title">Select Operation Type</div>
        <div class="section-subtitle">Choose what kind of bulk change you want to perform</div>
      </div>
    </div>

    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:var(--space-4);margin-bottom:var(--space-8);">
      ${opsHtml}
    </div>

    <!-- Wizard Panel (active example: Rename) -->
    <div class="section-header" style="margin-bottom:var(--space-4);">
      <div>
        <div class="section-title">Configure Operation</div>
        <div class="section-subtitle">Bulk Rename — currently active</div>
      </div>
    </div>

    <div class="wizard-layout">
      <!-- Steps Panel -->
      <div class="wizard-steps-panel">
        <div style="padding:var(--space-3) var(--space-4);font-size:var(--text-xs);font-weight:var(--font-semibold);color:var(--color-gray-500);text-transform:uppercase;letter-spacing:.06em;border-bottom:1px solid var(--border-color);">
          Steps
        </div>
        ${wizardNavHtml}
      </div>

      <!-- Step Content Panel -->
      <div style="display:flex;flex-direction:column;gap:var(--space-4);">
        <div class="card">
          <div class="card-header">
            <div>
              <div class="card-title">Step 2 — Choose Objects</div>
              <div class="card-subtitle">Select the metadata objects you want to rename</div>
            </div>
            <span class="badge badge-primary">In Progress</span>
          </div>
          <div class="card-body">
            <div class="form-row" style="margin-bottom:var(--space-4);">
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Object Type <span class="form-label-required">*</span></label>
                <select class="form-control form-select">
                  <option>Data Elements</option>
                  <option>Indicators</option>
                  <option>Datasets</option>
                  <option>Organisation Units</option>
                </select>
              </div>
              <div class="form-group" style="margin-bottom:0;">
                <label class="form-label">Filter by Group</label>
                <select class="form-control form-select">
                  <option value="">All Groups</option>
                  <option>Malaria</option>
                  <option>HIV/AIDS</option>
                  <option>Maternal Health</option>
                </select>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Search &amp; Filter Objects</label>
              <div class="table-search" style="width:100%;margin-bottom:var(--space-3);">
                ${Icons.search}
                <input type="text" placeholder="Type to filter objects by name or UID…" aria-label="Filter objects"/>
              </div>
            </div>

            <!-- Mini preview table -->
            <div class="table-container" style="max-height:260px;overflow-y:auto;">
              <table class="data-table">
                <thead>
                  <tr>
                    <th class="th-check"><input type="checkbox" class="table-checkbox" data-select-all aria-label="Select all"/></th>
                    <th>Name</th>
                    <th>UID</th>
                    <th>Type</th>
                  </tr>
                </thead>
                <tbody>
                  ${[
                    ['ANC 1st Visit', 'fbfJHSPpUQD', 'Aggregate'],
                    ['ANC 2nd Visit', 'cYeuwXTCPkU', 'Aggregate'],
                    ['ANC 3rd Visit', 'hfdmMSPBgLG', 'Aggregate'],
                    ['Malaria Confirmed Cases', 'O05mAByOgAv', 'Aggregate'],
                    ['HIV Tests Performed', 'n5nS0SmkUpq', 'Aggregate'],
                  ].map(([name, uid, type]) => `
                    <tr>
                      <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${name}"/></td>
                      <td class="td-primary">${name}</td>
                      <td class="td-mono">${uid}</td>
                      <td><span class="badge badge-primary">${type}</span></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div style="margin-top:var(--space-2);font-size:var(--text-xs);color:var(--color-gray-500);">
              0 of 2,847 objects selected
            </div>
          </div>
        </div>

        <!-- Navigation buttons -->
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="btn btn-secondary btn-md">← Back</button>
          <div style="display:flex;gap:var(--space-2);">
            <button class="btn btn-ghost btn-md">Save Draft</button>
            <button class="btn btn-primary btn-md">Continue → Configure</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Recent Operations -->
    <div style="margin-top:var(--space-8);">
      <div class="section-header">
        <div>
          <div class="section-title">Recent Operations</div>
          <div class="section-subtitle">History of bulk operations with rollback options</div>
        </div>
        <button class="btn btn-ghost btn-sm">${Icons.download} Export Log</button>
      </div>

      <div class="card" style="overflow:hidden;">
        <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
          <table class="data-table">
            <thead>
              <tr>
                <th>Operation</th>
                <th>Objects Affected</th>
                <th>Executed By</th>
                <th>Time</th>
                <th>Status</th>
                <th class="td-actions"></th>
              </tr>
            </thead>
            <tbody>${recentHtml}</tbody>
          </table>
        </div>
      </div>
    </div>

    <script>
      // UI: op card click highlight
      document.querySelectorAll('.op-card').forEach(function(card) {
        card.addEventListener('click', function() {
          document.querySelectorAll('.op-card').forEach(function(c) {
            c.style.outline = 'none';
          });
          card.style.outline = '2px solid var(--color-primary-500)';
          card.style.outlineOffset = '2px';
        });
        card.addEventListener('keydown', function(e) {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); card.click(); }
        });
      });
    </script>
  `
}
