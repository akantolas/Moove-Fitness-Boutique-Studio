import { el } from './el'
import { en } from './en'

export const translations = { el, en } as const

export type TranslationTree = typeof el | typeof en
