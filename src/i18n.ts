// ─────────────────────────────────────────────────────────────────────────────
// src/i18n.ts
// DHIS2 NexAdmin — i18n initialization
//
// @dhis2/d2-i18n is built on i18next.
// Translations are loaded from src/locales/{lang}/translations.json
// which are generated from i18n/*.po files by:
//   yarn d2-app-scripts i18n generate
// ─────────────────────────────────────────────────────────────────────────────

import i18n from '@dhis2/d2-i18n'
import enTranslations from './locales/en/translations.json'
import frTranslations from './locales/fr/translations.json'

// Load all translations into the 'translation' namespace (d2-i18n default)
const NS = 'translation'

i18n.addResources('en', NS, enTranslations)
i18n.addResources('fr', NS, frTranslations)

export default i18n

// Usage in components:
//   import i18n from '@dhis2/d2-i18n'
//   i18n.t('Health Dashboard')
//   i18n.t('{{count}} duplicates found', { count: 8 })
