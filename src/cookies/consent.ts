export const COOKIE_CONSENT_VERSION = 1
export const COOKIE_CONSENT_STORAGE_KEY = 'moove-cookie-consent'

export type CookieConsent = {
  version: number
  essential: true
  analytics: boolean
  decidedAt: string
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

export function readCookieConsent(): CookieConsent | null {
  if (typeof window === 'undefined') return null

  try {
    const raw = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (!raw) return null

    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return null
    if (parsed.version !== COOKIE_CONSENT_VERSION) return null
    if (parsed.essential !== true) return null
    if (typeof parsed.analytics !== 'boolean') return null
    if (typeof parsed.decidedAt !== 'string') return null

    return {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      analytics: parsed.analytics,
      decidedAt: parsed.decidedAt,
    }
  } catch {
    return null
  }
}

export function writeCookieConsent(analytics: boolean): CookieConsent {
  const consent: CookieConsent = {
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    analytics,
    decidedAt: new Date().toISOString(),
  }

  window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent))
  return consent
}
