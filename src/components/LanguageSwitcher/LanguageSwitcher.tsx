// src/components/LanguageSwitcher/LanguageSwitcher.tsx
import i18n from '@dhis2/d2-i18n'
import { useLocale } from '../../hooks/useLocale'
import { SUPPORTED_LOCALES } from '../../constants/i18n'
import styles from './LanguageSwitcher.module.css'

export const LanguageSwitcher = () => {
  const { currentLocale, switchLocale } = useLocale()

  return (
    <div className={styles.wrapper} role="group" aria-label={i18n.t('Language')}>
      {SUPPORTED_LOCALES.map((locale) => (
        <button
          type="button"
          key={locale.code}
          className={`${styles.btn} ${currentLocale === locale.code ? styles.active : ''}`}
          onClick={() => void switchLocale(locale.code)}
          title={i18n.t('Switch to {{lang}}', { lang: locale.label })}
          aria-pressed={currentLocale === locale.code}
          aria-label={i18n.t('Switch to {{lang}}', { lang: locale.label })}
        >
          {locale.code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}

export default LanguageSwitcher
