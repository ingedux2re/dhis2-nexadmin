// ── Org Units Page ────────────────────────────────────────────
// UI: Organisation unit hierarchy browser with level filters and coordinate data
import { Icons } from '../components/layout'

export function OrgUnitsPage(): string {
  const orgunits = [
    { uid: 'ImspTQPwCqd', name: 'Sierra Leone',          level: 1, levelName: 'Country',   parent: '—',               children: 14,  coords: true,  active: true,  datasets: 12, users: 0   },
    { uid: 'O6uvpzGd5pu', name: 'Bo',                    level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 16,  coords: true,  active: true,  datasets: 8,  users: 4   },
    { uid: 'fdc6uOvgoji', name: 'Bombali',                level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 14,  coords: true,  active: true,  datasets: 8,  users: 3   },
    { uid: 'lc3eMKXaEfw', name: 'Bonthe',                 level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 9,   coords: true,  active: true,  datasets: 8,  users: 2   },
    { uid: 'jmIPBj66vD6', name: 'Bo Kakua Town',          level: 3, levelName: 'Chiefdom',  parent: 'Bo',              children: 4,   coords: true,  active: true,  datasets: 5,  users: 1   },
    { uid: 'PMa2VCrupOd', name: 'Bo Government Hospital', level: 4, levelName: 'Facility',  parent: 'Bo Kakua Town',   children: 0,   coords: true,  active: true,  datasets: 3,  users: 8   },
    { uid: 'Rp268JB6Ne4', name: 'Kenema',                 level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 18,  coords: true,  active: true,  datasets: 8,  users: 5   },
    { uid: 'g8upMTyEZGZ', name: 'Port Loko',              level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 12,  coords: true,  active: true,  datasets: 8,  users: 3   },
    { uid: 'qhqAxPSTUXp', name: 'Old Admin Unit (2018)',  level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 0,   coords: false, active: false, datasets: 0,  users: 0   },
    { uid: 'YmmeuGbqOwR', name: 'Western Area Rural',     level: 2, levelName: 'District',  parent: 'Sierra Leone',    children: 21,  coords: true,  active: true,  datasets: 8,  users: 7   },
  ]

  const levelColor: Record<number, string> = {
    1: 'badge-primary', 2: 'badge-info', 3: 'badge-warning', 4: 'badge-neutral', 5: 'badge-neutral'
  }

  const levelColors = ['', 'var(--color-primary-500)', 'var(--color-info-500)', 'var(--color-warning-500)', 'var(--color-gray-400)', 'var(--color-gray-300)']

  const rowsHtml = orgunits.map(ou => `
    <tr>
      <td class="td-check">
        <input type="checkbox" class="table-checkbox" aria-label="Select ${ou.name}"/>
      </td>
      <td>
        <div style="display:flex;align-items:center;gap:var(--space-2);">
          <div style="width:3px;height:28px;border-radius:2px;background:${levelColors[ou.level]};flex-shrink:0;"></div>
          <div>
            <div style="font-weight:var(--font-medium);color:${ou.active ? 'var(--color-gray-900)' : 'var(--color-gray-400)'};
              ${!ou.active ? 'text-decoration:line-through;' : ''}">${ou.name}</div>
            <div style="font-family:var(--font-mono);font-size:10px;color:var(--color-gray-400);margin-top:1px;">${ou.uid}</div>
          </div>
        </div>
      </td>
      <td>
        <span class="badge ${levelColor[ou.level] || 'badge-neutral'}" style="gap:4px;">
          <span style="font-size:9px;opacity:.7;">L${ou.level}</span> ${ou.levelName}
        </span>
      </td>
      <td style="font-size:var(--text-sm);color:var(--color-gray-500);">${ou.parent}</td>
      <td style="text-align:center;font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-700);">
        ${ou.children > 0 ? ou.children : `<span style="color:var(--color-gray-300);">—</span>`}
      </td>
      <td style="text-align:center;">
        ${ou.coords
          ? `<span style="color:var(--color-success-500);">${Icons.check}</span>`
          : `<span style="color:var(--color-gray-300);">—</span>`}
      </td>
      <td style="font-size:var(--text-sm);text-align:center;color:var(--color-gray-700);">
        ${ou.datasets > 0 ? ou.datasets : `<span style="color:var(--color-gray-300);">—</span>`}
      </td>
      <td style="font-size:var(--text-sm);text-align:center;color:var(--color-gray-700);">
        ${ou.users > 0 ? ou.users : `<span style="color:var(--color-gray-300);">—</span>`}
      </td>
      <td>
        ${ou.active
          ? `<span class="badge badge-success"><span class="badge-dot" style="background:currentColor;"></span>Active</span>`
          : `<span class="badge badge-danger"><span class="badge-dot" style="background:currentColor;"></span>Inactive</span>`}
      </td>
      <td class="td-actions">
        <div class="td-actions-group">
          <button class="btn btn-ghost btn-sm btn-icon" title="View">${Icons.eye}</button>
          <button class="btn btn-ghost btn-sm btn-icon" title="Edit">${Icons.edit}</button>
          <div class="dropdown">
            <button class="btn btn-ghost btn-sm btn-icon" data-dropdown>${Icons.moreVert}</button>
            <div class="dropdown-menu" style="display:none;">
              <a href="#" class="dropdown-item">${Icons.link} Open in DHIS2</a>
              <a href="#" class="dropdown-item">${Icons.orgunit} View Hierarchy</a>
              <a href="#" class="dropdown-item">${Icons.copy} Copy UID</a>
              <div class="dropdown-divider"></div>
              <a href="#" class="dropdown-item danger">${Icons.trash} Deactivate</a>
            </div>
          </div>
        </div>
      </td>
    </tr>
  `).join('')

  // UI: Level filter badges
  const levelFilters = [
    { label: 'All Levels', count: '9,641', active: true  },
    { label: 'L1 Country', count: '1',     active: false },
    { label: 'L2 District',count: '149',   active: false },
    { label: 'L3 Chiefdom',count: '1,164', active: false },
    { label: 'L4 Facility',count: '8,327', active: false },
  ]

  const levelFilterHtml = levelFilters.map(lf => `
    <span class="filter-chip${lf.active ? ' active' : ''}">${lf.label}
      <span class="badge badge-neutral" style="margin-left:2px;padding:0 4px;">${lf.count}</span>
    </span>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Organisation Units</h1>
        <p class="page-subtitle">Browse and manage the geographic hierarchy · <strong>9,641</strong> units across 5 levels</p>
      </div>
      <div class="page-header-actions">
        <button class="btn btn-secondary btn-md">${Icons.download} Export</button>
        <button class="btn btn-primary btn-md">${Icons.plus} Add Org Unit</button>
      </div>
    </div>

    <div class="filter-bar" style="margin-bottom:var(--space-4);border:1px solid var(--border-color);border-radius:var(--border-radius-md);">
      <span style="font-size:var(--text-xs);font-weight:var(--font-semibold);color:var(--color-gray-500);text-transform:uppercase;letter-spacing:.06em;">Level:</span>
      ${levelFilterHtml}
    </div>

    <div class="card" style="overflow:hidden;">
      <div class="table-toolbar">
        <div class="table-toolbar-left">
          <div class="table-search">
            ${Icons.search}
            <input type="text" placeholder="Search by name, UID, or parent…"/>
          </div>
          <button class="btn btn-secondary btn-sm">${Icons.filter} Filter</button>
          <span class="filter-chip active">Active Only</span>
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
              <th>Level</th>
              <th>Parent</th>
              <th style="text-align:center;">Children</th>
              <th style="text-align:center;">Coordinates</th>
              <th style="text-align:center;">Datasets</th>
              <th style="text-align:center;">Users</th>
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
          <span style="font-size:var(--text-xs);color:var(--color-gray-400);">…</span>
          <button class="page-btn">386</button>
          <button class="page-btn">›</button>
        </div>
      </div>
    </div>
  `
}
