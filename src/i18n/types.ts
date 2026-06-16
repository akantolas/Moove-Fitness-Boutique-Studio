export type Locale = 'el' | 'en'

export const LOCALES: Locale[] = ['el', 'en']

export const LOCALE_STORAGE_KEY = 'moove-locale'

export type TranslationVars = Record<string, string | number>
