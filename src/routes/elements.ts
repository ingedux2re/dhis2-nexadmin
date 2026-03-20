// ── Data Elements Page ───────────────────────────────────────
// UI: High-density data table for browsing, filtering, and managing DHIS2 data elements
import { Icons } from '../components/layout'

export function DataElementsPage(): string {
  const elements = [
    { uid: 'fbfJHSPpUQD', name: 'ANC 1st Visit',               domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'HMIS Monthly',   status: 'Active',     groups: 3 },
    { uid: 'cYeuwXTCPkU', name: 'ANC 2nd Visit',               domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'HMIS Monthly',   status: 'Active',     groups: 3 },
    { uid: 'hfdmMSPBgLG', name: 'ANC 3rd Visit',               domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'Age (0-4, 5+)', dataset: 'HMIS Monthly',   status: 'Active',     groups: 2 },
    { uid: 'rbkr8PL0rwM', name: 'Births attended by skilled',  domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'HMIS Monthly',   status: 'Active',     groups: 4 },
    { uid: 'O05mAByOgAv', name: 'Malaria Confirmed Cases',     domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'Sex / Age',     dataset: 'Malaria Weekly', status: 'Active',     groups: 2 },
    { uid: 'vI2csg55S9C', name: 'Malaria Deaths',              domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'Sex / Age',     dataset: 'Malaria Weekly', status: 'Active',     groups: 2 },
    { uid: 'n5nS0SmkUpq', name: 'HIV Tests Performed',         domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'HIV Age/Sex',   dataset: 'HIV Monthly',    status: 'Active',     groups: 3 },
    { uid: 'l6byfWFUGaP', name: 'HIV Positive',                domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'HIV Age/Sex',   dataset: 'HIV Monthly',    status: 'Active',     groups: 3 },
    { uid: 'Y61h1i61tBe', name: 'MUAC Red (SAM)',              domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'Nutrition',      status: 'Active',     groups: 1 },
    { uid: 'sTzRA8KH3E7', name: 'Patient Name',                domain: 'Tracker',  valueType: 'TEXT',    aggType: 'NONE', categoryCombo: 'N/A',           dataset: 'Tracker',        status: 'Active',     groups: 0 },
    { uid: 'Qn0I6InQgrr', name: 'Date of Birth',               domain: 'Tracker',  valueType: 'DATE',    aggType: 'NONE', categoryCombo: 'N/A',           dataset: 'Tracker',        status: 'Active',     groups: 0 },
    { uid: 'eKdBeWknaEc', name: 'Weight (kg)',                  domain: 'Tracker',  valueType: 'NUMBER',  aggType: 'AVG',  categoryCombo: 'N/A',           dataset: 'Tracker',        status: 'Active',     groups: 1 },
    { uid: 'GQY2lXrypjO', name: 'OPD Attendance (old)',        domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'OPD Monthly',    status: 'Deprecated', groups: 0 },
    { uid: 'bROufk3y7fP', name: 'Unused Element ABC',          domain: 'Aggregate', valueType: 'INTEGER', aggType: 'SUM',  categoryCombo: 'default',       dataset: 'None',           status: 'Orphaned',   groups: 0 },
  ]

  const domainColor: Record<string, string> = { Aggregate: 'badge-primary', Tracker: 'badge-info' }
  const statusColor: Record<string, string> = { Active: 'badge-success', Deprecated: 'badge-warning', Orphaned: 'badge-danger' }

  const rowsHtml = elements.map(e => `
    <tr>
      <td class="td-check"><input type="checkbox" class="table-checkbox" aria-label="Select ${e.name}"/></td>
      <td class="td-primary" style="max-width:220px;"><div class="truncate" title="${e.name}">${e.name}</div></td>
      <td class="td-mono">${e.uid}</td>
      <td><span class="badge ${domainColor[e.domain] || 'badge-neutral'}">${e.domain}</span></td>
      <td><span style="font-family:var(--font-mono);font-size:10px;background:var(--color-gray-100);color:var(--color-gray-700);padding:2px 6px;border-radius:var(--border-radius-sm);">${e.valueType}</span></td>
      <td class="text-gray" style="font-size:var(--text-xs);">${e.aggType}</td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);max-width:140px;"><span class="truncate" style="display:block;" title="${e.categoryCombo}">${e.categoryCombo}</span></td>
      <td style="font-size:var(--text-xs);color:var(--color-gray-600);">${e.dataset}</td>
      <td>${e.groups > 0 ? `<span class="badge badge-neutral">${e.groups}g</span>` : `<span style="color:var(--color-gray-300);font-size:var(--text-xs);">—</span>`}</td>
      <td><span class="badge ${statusColor[e.status] || 'badge-neutral'}"><span class="badge-dot" style="background:currentColor;"></span>${e.status}</span></td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Copy UID" onclick="navigator.clipboard&&navigator.clipboard.writeText('${e.uid}');showToast('UID copied','default',1800)">${Icons.copy}</button>
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm btn-icon" data-dropdown title="More">${Icons.moreVert}</button>
            <div class="dropdown-menu" style="display:none;">
              <a href="#" class="dropdown-item">${Icons.link} Open in DHIS2</a>
              <a href="#" class="dropdown-item">${Icons.tag} Add to Group</a>
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
        <h1 class="page-title">Data Elements</h1>
        <p class="page-subtitle">Manage all DHIS2 data elements &nbsp;·&nbsp; <strong>${elements.length}</strong> of 2,847 shown</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.upload} <span>Import</span></button>
        <button class="btn btn-secondary btn-md">${Icons.download} <span>Export</span></button>
        <button class="btn btn-primary btn-md">${Icons.plus} <span>New Element</span></button>
      </div>
    </div>

    <div class="tabs">
      <a href="#" class="tab-item active">All <span class="badge badge-neutral" style="margin-left:4px;">2,847</span></a>
      <a href="#" class="tab-item">Aggregate <span class="badge badge-neutral" style="margin-left:4px;">2,104</span></a>
      <a href="#" class="tab-item">Tracker <span class="badge badge-neutral" style="margin-left:4px;">743</span></a>
      <a href="#" class="tab-item">Deprecated <span class="badge badge-warning" style="margin-left:4px;">32</span></a>
      <a href="#" class="tab-item">Orphaned <span class="badge badge-danger" style="margin-left:4px;">14</span></a>
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search by name, UID, dataset…" aria-label="Search"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} <span>Filters</span></button>
          <span class="filter-chip active">Domain: All</span>
          <span class="filter-chip">Value Type</span>
          <span class="filter-chip">Category Combo</span>
        </div>
        <div class="table-toolbar-right">
          <span class="table-info" id="selCount">0 selected</span>
          <button class="btn btn-ghost btn-sm btn-icon" title="Refresh">${Icons.refresh}</button>
        </div>
      </div>

      <div class="table-container" style="border:none;border-radius:0;box-shadow:none;">
        <table class="data-table" id="elementsTable">
          <thead>
            <tr>
              <th class="th-check"><input type="checkbox" class="table-checkbox" data-select-all aria-label="Select all"/></th>
              <th class="sortable"><div class="th-inner">Name ${Icons.sortAsc}</div></th>
              <th>UID</th>
              <th>Domain</th>
              <th>Value Type</th>
              <th>Agg. Type</th>
              <th>Category Combo</th>
              <th>Dataset</th>
              <th>Groups</th>
              <th>Status</th>
              <th class="td-actions"></th>
            </tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>

      <div class="table-pagination">
        <div class="pagination-info">Showing <strong>1–14</strong> of <strong>2,847</strong> data elements</div>
        <div class="flex items-center gap-3">
          <div class="flex items-center gap-2">
            <label for="pgSize" style="font-size:var(--text-xs);color:var(--color-gray-500);">Per page:</label>
            <select id="pgSize" class="form-control form-select" style="width:70px;height:26px;font-size:var(--text-xs);padding:0 var(--space-2);">
              <option>25</option><option>50</option><option>100</option>
            </select>
          </div>
          <div class="pagination-controls">
            <button class="page-btn" disabled>‹</button>
            <button class="page-btn active">1</button>
            <button class="page-btn">2</button>
            <button class="page-btn">3</button>
            <span style="padding:0 4px;font-size:var(--text-xs);color:var(--color-gray-400);">…</span>
            <button class="page-btn">114</button>
            <button class="page-btn">›</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Sticky bulk actions bar -->
    <div id="bulkBar" style="display:none;position:sticky;bottom:var(--space-4);z-index:50;">
      <div style="background:var(--color-gray-900);color:#fff;border-radius:var(--border-radius-md);box-shadow:var(--shadow-xl);padding:var(--space-3) var(--space-5);display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);">
        <span style="font-size:var(--text-sm);font-weight:var(--font-medium);"><span id="bulkCount">0</span> elements selected</span>
        <div style="display:flex;gap:var(--space-2);">
          <button class="btn btn-secondary btn-sm">${Icons.tag} Add to Group</button>
          <button class="btn btn-secondary btn-sm">${Icons.copy} Duplicate</button>
          <button class="btn btn-danger btn-sm">${Icons.trash} Delete Selected</button>
        </div>
      </div>
    </div>

    <script>
      (function() {
        var table = document.getElementById('elementsTable');
        var bar   = document.getElementById('bulkBar');
        var cnt   = document.getElementById('bulkCount');
        var sel   = document.getElementById('selCount');
        function update() {
          var n = table ? table.querySelectorAll('tbody .table-checkbox:checked').length : 0;
          if (bar) bar.style.display = n > 0 ? 'block' : 'none';
          if (cnt) cnt.textContent = n;
          if (sel) sel.textContent = n + ' selected';
        }
        if (table) table.addEventListener('change', function(e) {
          if (e.target.classList.contains('table-checkbox')) update();
        });
      })();
    </script>
  `
}
