// UI component: Shared inline SVG icon library (no external dependency)
export const Icons = {
  logo: `<svg width="14" height="14" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="1" y="1" width="6" height="6" rx="1.5" fill="currentColor"/>
    <rect x="9" y="1" width="6" height="6" rx="1.5" fill="currentColor" opacity=".6"/>
    <rect x="1" y="9" width="6" height="6" rx="1.5" fill="currentColor" opacity=".6"/>
    <rect x="9" y="9" width="6" height="6" rx="1.5" fill="currentColor"/>
  </svg>`,

  dashboard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
    <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
  </svg>`,

  elements: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>
  </svg>`,

  dataset: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/>
    <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/>
  </svg>`,

  bulk: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
    <circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>`,

  governance: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
  </svg>`,

  orgunit: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
    <circle cx="12" cy="10" r="3"/>
  </svg>`,

  indicators: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
    <line x1="6" y1="20" x2="6" y2="14"/>
  </svg>`,

  validation: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 11 12 14 22 4"/>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
  </svg>`,

  settings: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14"/>
  </svg>`,

  search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
  </svg>`,

  bell: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
    <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>`,

  help: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,

  chevronRight: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="9 18 15 12 9 6"/>
  </svg>`,

  chevronDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"/>
  </svg>`,

  arrowUp: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>`,

  arrowDown: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
  </svg>`,

  plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,

  edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
  </svg>`,

  trash: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
    <path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>`,

  copy: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
  </svg>`,

  eye: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`,

  moreVert: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <circle cx="12" cy="5" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="12" cy="19" r="1"/>
  </svg>`,

  upload: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
  </svg>`,

  download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="8 17 12 21 16 17"/><line x1="12" y1="12" x2="12" y2="21"/>
    <path d="M20.88 18.09A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.29"/>
  </svg>`,

  filter: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
  </svg>`,

  refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/>
    <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
  </svg>`,

  check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>`,

  close: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,

  warning: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>`,

  info: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
  </svg>`,

  successCircle: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
    <polyline points="22 4 12 14.01 9 11.01"/>
  </svg>`,

  tag: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/>
    <line x1="7" y1="7" x2="7.01" y2="7"/>
  </svg>`,

  activity: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
  </svg>`,

  server: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/>
    <line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/>
  </svg>`,

  link: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
  </svg>`,

  sortAsc: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round">
    <line x1="12" y1="19" x2="12" y2="5"/><polyline points="5 12 12 5 19 12"/>
  </svg>`,

  menu: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
  </svg>`,
}

// UI Component: Build the full app shell layout HTML
export function Layout(props: {
  title: string
  activePage: string
  breadcrumb?: Array<{ label: string; href?: string }>
  children: string
}) {
  const { title, activePage, breadcrumb = [], children } = props

  const navItems = [
    { id: 'dashboard',   href: '/',            label: 'Dashboard',       icon: Icons.dashboard,   section: 'overview' },
    { id: 'elements',    href: '/elements',     label: 'Data Elements',   icon: Icons.elements,    section: 'metadata' },
    { id: 'datasets',    href: '/datasets',     label: 'Datasets',        icon: Icons.dataset,     section: 'metadata' },
    { id: 'indicators',  href: '/indicators',   label: 'Indicators',      icon: Icons.indicators,  section: 'metadata' },
    { id: 'orgunits',    href: '/orgunits',     label: 'Org Units',       icon: Icons.orgunit,     section: 'metadata' },
    { id: 'bulk',        href: '/bulk',         label: 'Bulk Operations', icon: Icons.bulk,        section: 'tools', badge: 'Beta' },
    { id: 'governance',  href: '/governance',   label: 'Governance',      icon: Icons.governance,  section: 'tools' },
    { id: 'validation',  href: '/validation',   label: 'Validation Rules',icon: Icons.validation,  section: 'tools' },
    { id: 'settings',    href: '/settings',     label: 'Settings',        icon: Icons.settings,    section: 'system' },
  ]

  const sections: Record<string, { label: string; items: typeof navItems }> = {
    overview: { label: 'Overview',  items: [] },
    metadata: { label: 'Metadata',  items: [] },
    tools:    { label: 'Tools',     items: [] },
    system:   { label: 'System',    items: [] },
  }

  navItems.forEach(item => sections[item.section].items.push(item))

  const breadcrumbHtml = breadcrumb.length
    ? `<nav class="topbar-breadcrumb" aria-label="Breadcrumb">
        <a href="/">Home</a>
        ${breadcrumb.map((b, i) =>
          `<span class="sep">${Icons.chevronRight}</span>
           ${b.href && i < breadcrumb.length - 1
             ? `<a href="${b.href}">${b.label}</a>`
             : `<span class="current">${b.label}</span>`}`
        ).join('')}
      </nav>`
    : `<nav class="topbar-breadcrumb"><span class="current">${title}</span></nav>`

  const sidebarSections = Object.entries(sections)
    .filter(([, sec]) => sec.items.length > 0)
    .map(([, sec]) => `
      <div class="sidebar-section">
        <div class="sidebar-section-label">${sec.label}</div>
        ${sec.items.map(item => `
          <a href="${item.href}"
             class="sidebar-item${item.id === activePage ? ' active' : ''}"
             title="${item.label}">
            <span class="sidebar-item-icon">${item.icon}</span>
            <span class="sidebar-item-text">${item.label}</span>
            ${item.badge ? `<span class="sidebar-item-badge">${item.badge}</span>` : ''}
          </a>
        `).join('')}
      </div>
    `).join('<div class="sidebar-divider"></div>')

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <meta name="description" content="DHIS2 NexAdmin — System Engineering Toolkit"/>
  <title>${title} · DHIS2 NexAdmin</title>
  <link rel="preconnect" href="https://fonts.googleapis.com"/>
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin/>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
  <link href="/static/style.css" rel="stylesheet"/>
</head>
<body>
  <div class="app-shell">

    <!-- ── Sidebar ─────────────────────────────────────────── -->
    <aside class="sidebar" id="sidebar" role="navigation" aria-label="Main navigation">
      <a href="/" class="sidebar-brand" aria-label="DHIS2 NexAdmin Home">
        <div class="sidebar-brand-icon">${Icons.logo}</div>
        <div class="sidebar-brand-text">
          <span class="sidebar-brand-name">NexAdmin</span>
          <span class="sidebar-brand-sub">DHIS2 Toolkit v2.0</span>
        </div>
      </a>

      <nav class="sidebar-nav">
        ${sidebarSections}
      </nav>

      <div class="sidebar-footer">
        <div class="sidebar-user" role="button" tabindex="0" aria-label="User menu">
          <div class="sidebar-avatar" aria-hidden="true">SA</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">System Admin</div>
            <div class="sidebar-user-role">Super User</div>
          </div>
        </div>
      </div>
    </aside>

    <!-- ── Main Area ───────────────────────────────────────── -->
    <div class="main-area">

      <!-- ── Topbar ──────────────────────────────────────── -->
      <header class="topbar" role="banner">
        <div class="topbar-left">
          <button class="mobile-menu-btn" aria-label="Open menu" id="mobileMenuBtn">
            ${Icons.menu}
          </button>
          ${breadcrumbHtml}
        </div>
        <div class="topbar-right">
          <div class="topbar-instance-badge">
            <span class="topbar-instance-dot"></span>
            <span>play.dhis2.org</span>
          </div>
          <div class="topbar-search" role="search">
            ${Icons.search}
            <input type="text" placeholder="Search metadata…" aria-label="Search metadata"/>
          </div>
          <button class="topbar-btn" aria-label="Notifications">
            ${Icons.bell}
            <span class="notif-dot"></span>
          </button>
          <button class="topbar-btn" aria-label="Help">
            ${Icons.help}
          </button>
        </div>
      </header>

      <!-- ── Page Content ────────────────────────────────── -->
      <main class="page-content" id="main-content" tabindex="-1">
        <div class="page-inner">
          ${children}
        </div>
      </main>

    </div><!-- /main-area -->
  </div><!-- /app-shell -->

  <!-- Toast container -->
  <div class="toast-container" id="toastContainer" aria-live="polite"></div>

  <script>
    // UI: Mobile menu toggle
    const mobileBtn = document.getElementById('mobileMenuBtn');
    const sidebar   = document.getElementById('sidebar');
    if (mobileBtn && sidebar) {
      mobileBtn.addEventListener('click', () => {
        sidebar.style.display = sidebar.style.display === 'flex' ? 'none' : 'flex';
      });
    }

    // UI: Toast helper
    window.showToast = function(msg, type = 'default', duration = 3500) {
      const container = document.getElementById('toastContainer');
      if (!container) return;
      const toast = document.createElement('div');
      toast.className = 'toast ' + type;
      toast.textContent = msg;
      container.appendChild(toast);
      setTimeout(() => { toast.style.opacity = '0'; toast.style.transition = 'opacity 300ms'; setTimeout(() => toast.remove(), 300); }, duration);
    };

    // UI: Checkbox select-all
    document.querySelectorAll('[data-select-all]').forEach(cb => {
      cb.addEventListener('change', e => {
        const table = e.target.closest('table');
        if (table) table.querySelectorAll('tbody .table-checkbox').forEach(c => { c.checked = e.target.checked; c.closest('tr').classList.toggle('selected', e.target.checked); });
      });
    });

    document.querySelectorAll('tbody .table-checkbox').forEach(cb => {
      cb.addEventListener('change', e => {
        e.target.closest('tr').classList.toggle('selected', e.target.checked);
      });
    });

    // UI: Dropdown toggle
    document.querySelectorAll('[data-dropdown]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const menu = btn.nextElementSibling;
        if (menu) menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
      });
    });
    document.addEventListener('click', () => {
      document.querySelectorAll('.dropdown-menu').forEach(m => m.style.display = 'none');
    });
  </script>
</body>
</html>`
}
