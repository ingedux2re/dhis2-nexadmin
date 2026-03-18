// ─────────────────────────────────────────────────────────────────────────────
// src/i18n.ts
// DHIS2 NexAdmin — i18n initialization
//
// IMPORTANT — namespace must be 'default', not 'translation'.
//
// @dhis2/app-adapter calls i18n.setDefaultNamespace('default') at startup,
// overriding i18next's default namespace from 'translation' to 'default'.
// If we load resources into 'translation', all i18n.t() lookups fall back
// to returning the key (English) even after changeLanguage('fr').
//
// Translations are loaded from src/locales/{lang}/translations.json
// which are generated from i18n/*.po files by:
//   yarn d2-app-scripts i18n generate
// ─────────────────────────────────────────────────────────────────────────────

import i18n from '@dhis2/d2-i18n'
import enTranslations from './locales/en/translations.json'
import frTranslations from './locales/fr/translations.json'

// Must match what @dhis2/app-adapter sets via i18n.setDefaultNamespace()
const NS = 'default'

i18n.addResources('en', NS, enTranslations)
i18n.addResources('fr', NS, frTranslations)

export default i18n

// Usage in components:
//   import i18n from '@dhis2/d2-i18n'
//   i18n.t('Health Dashboard')
//   i18n.t('{{count}} duplicates found', { count: 8 })
