// src/__mocks__/d2-i18n.ts
const i18n = {
  t: (key: string, options?: Record<string, string | number>): string => {
    if (!options) return key
    // Résoudre les interpolations : i18n.t('{{total}} total', { total: 5 }) → '5 total'
    return Object.entries(options).reduce((str, [k, v]) => str.replace(`{{${k}}}`, String(v)), key)
  },
  language: 'en',
}

export default i18n
