import { useEffect, useCallback } from 'react'
import { useDataQuery, useDataMutation } from '@dhis2/app-runtime'
import i18n from '@dhis2/d2-i18n'
import { useAppStore } from '../store'
import { DEFAULT_LOCALE, isSupported, getLocale } from '../constants/i18n'

const ME_QUERY = {
  me: { resource: 'me', params: { fields: 'id,displayName,settings[uiLocale]' } },
}

const UPDATE_LOCALE_MUTATION = {
  resource: 'userSettings/keyUiLocale',
  type: 'create' as const,
  data: ({ locale }: { locale: string }) => locale,
}

interface UseLocaleReturn {
  currentLocale: string
  switchLocale: (code: string) => Promise<void>
  isLoading: boolean
}

export const useLocale = (): UseLocaleReturn => {
  const { currentLocale, setLocale } = useAppStore()
  const { data, loading } = useDataQuery<{ me: { settings: { uiLocale: string } } }>(ME_QUERY)
  const [mutate] = useDataMutation(UPDATE_LOCALE_MUTATION)

  // ── Define applyLocale BEFORE useEffect so it can be in the deps array ──
  const applyLocale = useCallback(
    (code: string): void => {
      const safe = isSupported(code) ? code : DEFAULT_LOCALE
      i18n.changeLanguage(safe)
      setLocale(safe)
      localStorage.setItem('nexadmin_lang', safe)
      document.documentElement.lang = safe
      document.documentElement.dir = getLocale(safe).code === 'ar' ? 'rtl' : 'ltr'
    },
    [setLocale]
  )

  // ── applyLocale is now stable (useCallback) and in deps ─────────────────
  useEffect(() => {
    const dhisLocale = data?.me?.settings?.uiLocale
    const savedLocale = localStorage.getItem('nexadmin_lang')
    const resolved =
      [dhisLocale, savedLocale, DEFAULT_LOCALE].find((l): l is string => !!l && isSupported(l)) ??
      DEFAULT_LOCALE
    applyLocale(resolved)
  }, [data, applyLocale])

  const switchLocale = useCallback(
    async (code: string): Promise<void> => {
      applyLocale(code)
      try {
        await mutate({ locale: code })
      } catch {
        console.warn('[NexAdmin] Could not save locale to DHIS2:', code)
      }
    },
    [applyLocale, mutate]
  )

  return { currentLocale, switchLocale, isLoading: loading }
}
