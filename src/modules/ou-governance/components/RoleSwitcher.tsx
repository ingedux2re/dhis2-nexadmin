// ─────────────────────────────────────────────────────────────────────────────
// src/modules/ou-governance/components/RoleSwitcher.tsx
//
// Demo-mode role switcher.  NOT real auth — purely UI simulation for demo/
// competition purposes.
// ─────────────────────────────────────────────────────────────────────────────

import type { FC } from 'react'
import i18n from '@dhis2/d2-i18n'
import type { DemoRole } from '../types'
import styles from './RoleSwitcher.module.css'

// ── Role definitions ──────────────────────────────────────────────────────────

interface RoleDef {
  id: DemoRole
  labelKey: string
  icon: string
  activeClass: string
}

const ROLES: RoleDef[] = [
  {
    id: 'DISTRICT',
    labelKey: 'District Officer',
    icon: 'location_city',
    activeClass: styles.activeDistrict,
  },
  {
    id: 'REGION',
    labelKey: 'Region Officer',
    icon: 'map',
    activeClass: styles.activeRegion,
  },
  {
    id: 'ADMIN',
    labelKey: 'National Admin',
    icon: 'admin_panel_settings',
    activeClass: styles.activeAdmin,
  },
]

// ── Props ─────────────────────────────────────────────────────────────────────

interface RoleSwitcherProps {
  currentRole: DemoRole
  onRoleChange: (role: DemoRole) => void
}

// ── Component ─────────────────────────────────────────────────────────────────

export const RoleSwitcher: FC<RoleSwitcherProps> = ({ currentRole, onRoleChange }) => (
  <div className={styles.wrapper} role="group" aria-label={i18n.t('Demo role switcher')}>
    <span className={styles.label}>{i18n.t('Role')}</span>

    <span className={styles.demoBadge}>
      <span className="material-icons-round">science</span>
      {i18n.t('Demo')}
    </span>

    <div className={styles.buttons}>
      {ROLES.map((role) => {
        const isActive = currentRole === role.id
        return (
          <button
            key={role.id}
            type="button"
            className={`${styles.roleBtn} ${isActive ? role.activeClass : ''}`}
            onClick={() => onRoleChange(role.id)}
            aria-pressed={isActive}
            title={i18n.t(role.labelKey)}
          >
            <span className="material-icons-round" aria-hidden="true">
              {role.icon}
            </span>
            {i18n.t(role.labelKey)}
          </button>
        )
      })}
    </div>
  </div>
)

export default RoleSwitcher
