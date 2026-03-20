// ── Settings Page ─────────────────────────────────────────────
// UI: Instance configuration, API credentials, and system preferences
import { Icons } from '../components/layout'

export function SettingsPage(): string {
  const tabs = [
    { id: 'connection', label: 'Connection',  icon: Icons.server,     active: true  },
    { id: 'appearance', label: 'Appearance',  icon: Icons.dashboard,  active: false },
    { id: 'governance', label: 'Governance',  icon: Icons.governance, active: false },
    { id: 'users',      label: 'Users',       icon: Icons.bulk,       active: false },
    { id: 'audit',      label: 'Audit Log',   icon: Icons.activity,   active: false },
  ]

  const tabsHtml = tabs.map(t => `
    <a href="#${t.id}" class="tab-item${t.active ? ' active' : ''}">
      ${t.icon}&nbsp; ${t.label}
    </a>
  `).join('')

  // UI: Connection settings form
  const connectionForm = `
    <div class="card" style="max-width:680px;">
      <div class="card-header">
        <div>
          <div class="card-title">DHIS2 Instance Connection</div>
          <div class="card-subtitle">Configure your target DHIS2 instance for API operations</div>
        </div>
        <span class="badge badge-success">
          <span class="badge-dot" style="background:currentColor;"></span>Connected
        </span>
      </div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label" for="instanceUrl">
            Instance URL <span class="form-label-required">*</span>
          </label>
          <input type="url" id="instanceUrl" class="form-control"
            value="https://play.dhis2.org/2.41.3"
            placeholder="https://your-dhis2-instance.org"/>
          <div class="form-hint">The base URL of your DHIS2 instance (without trailing slash)</div>
        </div>

        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="apiUser">
              Username <span class="form-label-required">*</span>
            </label>
            <input type="text" id="apiUser" class="form-control" value="admin"/>
          </div>
          <div class="form-group">
            <label class="form-label" for="apiPass">Password</label>
            <input type="password" id="apiPass" class="form-control" value="••••••••"/>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="apiVersion">API Version</label>
          <select id="apiVersion" class="form-control form-select">
            <option>v41 (DHIS2 2.41)</option>
            <option>v40 (DHIS2 2.40)</option>
            <option>v39 (DHIS2 2.39)</option>
          </select>
          <div class="form-hint">Match the major version of your DHIS2 instance</div>
        </div>

        <div class="form-group">
          <label class="form-label" for="timeout">Request Timeout (seconds)</label>
          <input type="number" id="timeout" class="form-control" value="30" style="max-width:120px;"/>
        </div>

        <div class="form-check" style="margin-bottom:var(--space-4);">
          <input type="checkbox" id="verifySsl" class="form-check-input" checked/>
          <label for="verifySsl" class="form-check-label">Verify SSL certificate</label>
        </div>

        <div style="display:flex;gap:var(--space-3);align-items:center;padding:var(--space-3) var(--space-4);
          background:var(--color-success-50);border:1px solid var(--color-success-100);
          border-radius:var(--border-radius);font-size:var(--text-sm);color:var(--color-success-700);">
          <span>${Icons.successCircle}</span>
          <div>
            <strong>Connection verified</strong> — DHIS2 v2.41.3, Build rev. a8b3c1f
            <span style="color:var(--color-gray-400);font-size:var(--text-xs);display:block;margin-top:2px;">Last tested: 2 minutes ago</span>
          </div>
        </div>
      </div>
      <div class="card-footer" style="display:flex;gap:var(--space-2);justify-content:flex-end;">
        <button class="btn btn-secondary btn-md">Test Connection</button>
        <button class="btn btn-primary btn-md">${Icons.check} Save Changes</button>
      </div>
    </div>
  `

  // UI: Governance rules config
  const governanceRules = [
    { label: 'Enforce Title Case naming',       key: 'titleCase',      enabled: true  },
    { label: 'Detect orphaned data elements',   key: 'orphanDetect',   enabled: true  },
    { label: 'Check sharing settings',          key: 'sharingScan',    enabled: true  },
    { label: 'Validate category combos',        key: 'categoryCheck',  enabled: true  },
    { label: 'Flag deprecated objects in use',  key: 'deprecatedFlag', enabled: true  },
    { label: 'Auto-score on metadata change',   key: 'autoScore',      enabled: false },
  ]

  const govRulesHtml = governanceRules.map(rule => `
    <div style="
      display:flex;align-items:center;justify-content:space-between;
      padding:var(--space-3) var(--space-5);
      border-bottom:1px solid var(--color-gray-100);
    ">
      <div>
        <div style="font-size:var(--text-sm);font-weight:var(--font-medium);color:var(--color-gray-800);">${rule.label}</div>
      </div>
      <!-- UI: Toggle switch -->
      <label style="position:relative;display:inline-block;width:40px;height:22px;cursor:pointer;">
        <input type="checkbox" ${rule.enabled ? 'checked' : ''} style="opacity:0;width:0;height:0;position:absolute;"
          onchange="this.parentElement.querySelector('span').style.background = this.checked ? 'var(--color-primary-600)' : 'var(--color-gray-300)';
                    this.parentElement.querySelector('span')?.querySelector('span')?.style && (this.parentElement.querySelector('span span').style.transform = this.checked ? 'translateX(18px)' : 'translateX(2px)')"/>
        <span style="
          position:absolute;inset:0;
          background:${rule.enabled ? 'var(--color-primary-600)' : 'var(--color-gray-300)'};
          border-radius:99px;
          transition:background var(--transition-base);
        ">
          <span style="
            position:absolute;top:2px;
            width:18px;height:18px;
            background:#fff;border-radius:50%;
            box-shadow:0 1px 3px rgba(0,0,0,.2);
            transition:transform var(--transition-base);
            transform:${rule.enabled ? 'translateX(18px)' : 'translateX(2px)'};
            display:block;
          "></span>
        </span>
      </label>
    </div>
  `).join('')

  // UI: Appearance settings
  const appearanceForm = `
    <div class="card" style="max-width:680px;display:none;" id="tab-appearance">
      <div class="card-header"><div class="card-title">Appearance</div></div>
      <div class="card-body">
        <div class="form-group">
          <label class="form-label">Table Density</label>
          <div style="display:flex;gap:var(--space-3);">
            ${['Compact', 'Normal', 'Comfortable'].map((d, i) => `
              <label style="display:flex;align-items:center;gap:var(--space-2);cursor:pointer;">
                <input type="radio" name="density" ${i === 1 ? 'checked' : ''} style="accent-color:var(--color-primary-600);"/>
                <span style="font-size:var(--text-sm);">${d}</span>
              </label>
            `).join('')}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label">Records Per Page (default)</label>
          <select class="form-control form-select" style="max-width:120px;">
            <option>25</option><option selected>50</option><option>100</option>
          </select>
        </div>
        <div class="form-check">
          <input type="checkbox" class="form-check-input" id="autoRefresh" checked/>
          <label for="autoRefresh" class="form-check-label">Auto-refresh dashboard every 5 minutes</label>
        </div>
      </div>
      <div class="card-footer" style="display:flex;justify-content:flex-end;">
        <button class="btn btn-primary btn-md">${Icons.check} Save Preferences</button>
      </div>
    </div>
  `

  // UI: Instances / environments list
  const instances = [
    { name: 'Production',  url: 'https://hmis.moh.gov',        version: 'v2.41', status: 'Disconnected' },
    { name: 'Staging',     url: 'https://staging.hmis.moh.gov',version: 'v2.41', status: 'Disconnected' },
    { name: 'Demo',        url: 'https://play.dhis2.org',       version: 'v2.41', status: 'Active'       },
  ]

  const instancesHtml = instances.map(inst => `
    <div style="
      display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);
      padding:var(--space-3) var(--space-5);
      border-bottom:1px solid var(--color-gray-100);
    ">
      <div style="display:flex;align-items:center;gap:var(--space-3);">
        <div style="
          width:8px;height:8px;border-radius:50%;flex-shrink:0;
          background:${inst.status === 'Active' ? 'var(--color-success-500)' : 'var(--color-gray-300)'};
        "></div>
        <div>
          <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-gray-800);">${inst.name}</div>
          <div style="font-size:var(--text-xs);font-family:var(--font-mono);color:var(--color-gray-400);">${inst.url}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;gap:var(--space-3);">
        <span class="badge badge-neutral" style="font-family:var(--font-mono);">${inst.version}</span>
        <span class="badge ${inst.status === 'Active' ? 'badge-success' : 'badge-neutral'}">${inst.status}</span>
        <button class="btn btn-secondary btn-sm">
          ${inst.status === 'Active' ? 'Disconnect' : 'Connect'}
        </button>
      </div>
    </div>
  `).join('')

  return `
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">Settings</h1>
        <p class="page-subtitle">Configure DHIS2 connection, governance rules, and preferences</p>
      </div>
    </div>

    <div class="tabs">${tabsHtml}</div>

    <!-- Connection Tab -->
    <div id="tab-connection">
      ${connectionForm}

      <div class="card" style="max-width:680px;margin-top:var(--space-5);overflow:hidden;">
        <div class="card-header">
          <div>
            <div class="card-title">Saved Instances</div>
            <div class="card-subtitle">Switch between DHIS2 environments</div>
          </div>
          <button class="btn btn-primary btn-sm">${Icons.plus} Add Instance</button>
        </div>
        <div>${instancesHtml}</div>
      </div>
    </div>

    <!-- Governance Tab -->
    <div class="card" style="max-width:680px;margin-top:var(--space-5);overflow:hidden;">
      <div class="card-header">
        <div>
          <div class="card-title">Governance Rules</div>
          <div class="card-subtitle">Enable or disable metadata quality checks and scoring criteria</div>
        </div>
        <button class="btn btn-secondary btn-sm">Reset Defaults</button>
      </div>
      <div>${govRulesHtml}</div>
      <div class="card-footer" style="display:flex;justify-content:flex-end;gap:var(--space-2);">
        <button class="btn btn-primary btn-md">${Icons.check} Save Rules</button>
      </div>
    </div>

    ${appearanceForm}

    <!-- Danger Zone -->
    <div class="card" style="max-width:680px;margin-top:var(--space-6);border-color:var(--color-danger-200);">
      <div class="card-header" style="background:var(--color-danger-50);">
        <div>
          <div class="card-title" style="color:var(--color-danger-700);">Danger Zone</div>
          <div class="card-subtitle" style="color:var(--color-danger-500);">Irreversible actions — proceed with extreme caution</div>
        </div>
      </div>
      <div class="card-body" style="display:flex;flex-direction:column;gap:var(--space-4);">
        ${[
          { label: 'Clear Local Cache',   desc: 'Removes locally cached metadata. Will require fresh fetch.', btn: 'Clear Cache',    style: 'secondary' },
          { label: 'Reset Audit Log',     desc: 'Permanently deletes all operation history logs.',             btn: 'Reset Log',      style: 'danger'    },
          { label: 'Factory Reset',       desc: 'Resets NexAdmin to default state. Removes all settings.',     btn: 'Factory Reset',  style: 'danger'    },
        ].map(item => `
          <div style="display:flex;align-items:center;justify-content:space-between;gap:var(--space-4);">
            <div>
              <div style="font-size:var(--text-sm);font-weight:var(--font-semibold);color:var(--color-gray-800);">${item.label}</div>
              <div style="font-size:var(--text-xs);color:var(--color-gray-500);margin-top:2px;">${item.desc}</div>
            </div>
            <button class="btn btn-${item.style} btn-sm" style="flex-shrink:0;">${item.btn}</button>
          </div>
        `).join('<div class="divider" style="margin:var(--space-2) 0;"></div>')}
      </div>
    </div>
  `
}
