// ─────────────────────────────────────────────────────────────────────────────
// src/constants/__tests__/i18n.test.ts
// Unit tests for i18n constants — Phase 0
// ─────────────────────────────────────────────────────────────────────────────

import {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_MAP,
  isSupported,
  getLocale,
  normaliseLocale,
} from '../i18n'

describe('i18n constants', () => {
  it('SUPPORTED_LOCALES has EN and FR', () => {
    const codes = SUPPORTED_LOCALES.map((l) => l.code)
    expect(codes).toContain('en')
    expect(codes).toContain('fr')
  })

  it('DEFAULT_LOCALE is en', () => {
    expect(DEFAULT_LOCALE).toBe('en')
  })

  it('LOCALE_MAP provides O(1) access', () => {
    expect(LOCALE_MAP['en'].label).toBe('English')
    expect(LOCALE_MAP['fr'].label).toBe('Français')
  })

  it('isSupported returns true for en and fr', () => {
    expect(isSupported('en')).toBe(true)
    expect(isSupported('fr')).toBe(true)
  })

  it('isSupported returns false for unsupported code', () => {
    expect(isSupported('xx')).toBe(false)
    expect(isSupported('')).toBe(false)
  })

  it('isSupported handles regional variants (fr-FR, fr_FR)', () => {
    expect(isSupported('fr-FR')).toBe(true)
    expect(isSupported('fr_FR')).toBe(true)
    expect(isSupported('en-GB')).toBe(true)
  })

  it('normaliseLocale strips region and script suffixes', () => {
    expect(normaliseLocale('fr')).toBe('fr')
    expect(normaliseLocale('fr-FR')).toBe('fr')
    expect(normaliseLocale('fr_FR')).toBe('fr')
    expect(normaliseLocale('pt-BR')).toBe('pt')
    expect(normaliseLocale('EN')).toBe('en')
  })

  it('getLocale returns correct locale for known code', () => {
    const locale = getLocale('fr')
    expect(locale.code).toBe('fr')
    expect(locale.flag).toBe('🇫🇷')
  })

  it('getLocale falls back to DEFAULT_LOCALE for unknown code', () => {
    const locale = getLocale('xx')
    expect(locale.code).toBe(DEFAULT_LOCALE)
  })

  it('getLocale resolves regional variant to base locale', () => {
    expect(getLocale('fr-FR').code).toBe('fr')
    expect(getLocale('fr_FR').code).toBe('fr')
  })

  it('each locale has required fields', () => {
    for (const locale of SUPPORTED_LOCALES) {
      expect(locale.code).toBeTruthy()
      expect(locale.label).toBeTruthy()
      expect(locale.flag).toBeTruthy()
      expect(locale.pluralForms).toBeTruthy()
    }
  })
})
