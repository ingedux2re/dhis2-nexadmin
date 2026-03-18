import { useEffect, useCallback, useRef } from 'react'
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

  // ── Guard: only apply the auto-detected locale once on initial load. ──────
  // Without this, every re-render that calls the hook (e.g. after a language
  // switch triggers a store update) would re-run the effect and revert to the
  // DHIS2/localStorage locale, overwriting the user's manual selection.
  const initialised = useRef(false)

  // ── applyLocale is stable (useCallback with only setLocale as dep) ────────
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

  // ── Run only once: when ME_QUERY data first arrives ───────────────────────
  useEffect(() => {
    // Skip if already initialised (user already chose a language manually)
    if (initialised.current) return
    // Wait until the query has resolved (data !== undefined means it returned)
    if (data === undefined) return

    initialised.current = true

    const dhisLocale = data?.me?.settings?.uiLocale
    const savedLocale = localStorage.getItem('nexadmin_lang')
    // Priority: 1) user's saved preference (localStorage), 2) DHIS2 uiLocale, 3) default 'en'
    const resolved =
      [savedLocale, dhisLocale, DEFAULT_LOCALE].find((l): l is string => !!l && isSupported(l)) ??
      DEFAULT_LOCALE
    applyLocale(resolved)
  }, [data, applyLocale])

  const switchLocale = useCallback(
    async (code: string): Promise<void> => {
      // Mark as initialised so the useEffect guard above never overwrites this
      initialised.current = true
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
