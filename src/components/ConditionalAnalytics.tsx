import { Analytics } from '@vercel/analytics/react'
import { useCookieConsent } from '../cookies/CookieConsentProvider'

export function ConditionalAnalytics() {
  const { analyticsAllowed } = useCookieConsent()

  if (!analyticsAllowed) return null

  return <Analytics />
}
