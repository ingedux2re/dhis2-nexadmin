// ─────────────────────────────────────────────────────────────────────────────
// src/constants/i18n.ts
// DHIS2 NexAdmin — Supported locales + i18n configuration
// ─────────────────────────────────────────────────────────────────────────────
//
// TO ADD A NEW LANGUAGE:
//   1. Add an entry to SUPPORTED_LOCALES below
//   2. Create i18n/<code>.po and translate all msgid strings
//   3. Run: yarn d2-app-scripts i18n generate
//   4. The LanguageSwitcher component auto-renders the new button
// ─────────────────────────────────────────────────────────────────────────────

export interface SupportedLocale {
  /** ISO 639-1 language code used by DHIS2 uiLocale and i18next */
  code: string
  /** Display name in the native language */
  label: string
  /** Emoji flag for UI display */
  flag: string
  /** Plural forms rule (CLDR) */
  pluralForms: string
}

export const SUPPORTED_LOCALES: SupportedLocale[] = [
  {
    code: 'en',
    label: 'English',
    flag: '🇬🇧',
    pluralForms: 'nplurals=2; plural=(n != 1)',
  },
  {
    code: 'fr',
    label: 'Français',
    flag: '🇫🇷',
    pluralForms: 'nplurals=2; plural=(n > 1)',
  },
  // ─── Add new languages below ───────────────────────────────────────────
  // {
  //   code: 'es',
  //   label: 'Español',
  //   flag: '🇪🇸',
  //   pluralForms: 'nplurals=2; plural=(n != 1)',
  // },
  // {
  //   code: 'pt',
  //   label: 'Português',
  //   flag: '🇵🇹',
  //   pluralForms: 'nplurals=2; plural=(n != 1)',
  // },
  // {
  //   code: 'ar',
  //   label: 'العربية',
  //   flag: '🇸🇦',
  //   pluralForms: 'nplurals=6; plural=...',
  //   // Note: also set dir="rtl" in useLocale hook for Arabic
  // },
]

/** Fallback locale when DHIS2 uiLocale is not in SUPPORTED_LOCALES */
export const DEFAULT_LOCALE = 'en'

/** Map of locale code → locale object for O(1) lookup */
export const LOCALE_MAP: Record<string, SupportedLocale> = Object.fromEntries(
  SUPPORTED_LOCALES.map((l) => [l.code, l])
)

/**
 * Normalise a locale code to the base language tag we store in LOCALE_MAP.
 * DHIS2 stores locales in Java format (e.g. 'fr', 'fr_FR', 'pt_BR').
 * The @dhis2/app-adapter converts them to BCP 47 (e.g. 'fr', 'fr-FR', 'pt-BR')
 * before calling i18n.changeLanguage().  We only have translations for the
 * two-letter base code ('fr', 'pt', …), so we strip the region/script suffix.
 * Examples: 'fr' → 'fr', 'fr-FR' → 'fr', 'fr_FR' → 'fr', 'pt-BR' → 'pt'
 */
export const normaliseLocale = (code: string): string => code.split(/[-_]/)[0].toLowerCase()

/** Returns true if the given locale code (or its base language) is supported */
export const isSupported = (code: string): boolean =>
  code in LOCALE_MAP || normaliseLocale(code) in LOCALE_MAP

/** Returns the locale for a code, falling back to DEFAULT_LOCALE */
export const getLocale = (code: string): SupportedLocale =>
  LOCALE_MAP[code] ?? LOCALE_MAP[normaliseLocale(code)] ?? LOCALE_MAP[DEFAULT_LOCALE]
