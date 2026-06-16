import { createContext } from 'react'
import type { Dictionary } from './types-export'
import type { Locale, TranslationVars } from './types'

export type I18nContextValue = {
  locale: Locale
  setLocale: (locale: Locale) => void
  t: (key: string, vars?: TranslationVars) => string
  dictionary: Dictionary
}

export const I18nContext = createContext<I18nContextValue | null>(null)
