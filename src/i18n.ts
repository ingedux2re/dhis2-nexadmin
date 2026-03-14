// ─────────────────────────────────────────────────────────────────────────────
// src/i18n.ts
// DHIS2 NexAdmin — i18n initialization
//
// @dhis2/d2-i18n is built on i18next.
// The actual translation JSON is generated from .po files by:
//   yarn d2-app-scripts i18n generate  → writes i18n/i18n.js
// This module bootstraps i18next with the generated bundle.
// ─────────────────────────────────────────────────────────────────────────────

import i18n from '@dhis2/d2-i18n'

// d2-i18n auto-detects and loads translations from the i18n/ folder
// when bundled by d2-app-scripts. No manual configuration needed.
// This import ensures the module is initialized before any component renders.

export default i18n

// Usage in components:
//   import i18n from '@dhis2/d2-i18n'
//   i18n.t('Health Dashboard')
//   i18n.t('{{count}} duplicates found', { count: 8 })
