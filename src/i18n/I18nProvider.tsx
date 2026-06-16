import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { createTranslator } from './translate'
import { translations } from './translations'
import { I18nContext } from './context'
import { LOCALE_STORAGE_KEY, type Locale } from './types'

function readStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'el'
  const stored = window.localStorage.getItem(LOCALE_STORAGE_KEY)
  if (stored === 'el' || stored === 'en') return stored
  return window.navigator.language.toLowerCase().startsWith('en') ? 'en' : 'el'
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(readStoredLocale)

  const setLocale = useCallback((next: Locale) => {
    setLocaleState(next)
    window.localStorage.setItem(LOCALE_STORAGE_KEY, next)
  }, [])

  const t = useMemo(() => createTranslator(translations[locale]), [locale])
  const dictionary = translations[locale]

  useEffect(() => {
    document.documentElement.lang = locale
  }, [locale])

  const value = useMemo(
    () => ({ locale, setLocale, t, dictionary }),
    [locale, setLocale, t, dictionary],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}
