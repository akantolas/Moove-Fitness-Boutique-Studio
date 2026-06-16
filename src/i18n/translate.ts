import type { TranslationVars } from './types'

export function resolvePath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key]
    }
    return undefined
  }, obj)
}

export function interpolate(template: string, vars?: TranslationVars): string {
  if (!vars) return template
  return template.replace(/\{\{(\w+)\}\}/g, (_, key: string) => String(vars[key] ?? ''))
}

export function createTranslator(dictionary: unknown) {
  return function t(key: string, vars?: TranslationVars): string {
    const value = resolvePath(dictionary, key)
    if (typeof value === 'string') return interpolate(value, vars)
    return key
  }
}
