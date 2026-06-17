import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { readCookieConsent, writeCookieConsent, type CookieConsent } from './consent'

type CookieConsentContextValue = {
  consent: CookieConsent | null
  hasDecided: boolean
  analyticsAllowed: boolean
  showBanner: boolean
  showPreferences: boolean
  acceptAll: () => void
  rejectOptional: () => void
  savePreferences: (analytics: boolean) => void
  openPreferences: () => void
  closePreferences: () => void
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export function CookieConsentProvider({ children }: { children: ReactNode }) {
  const [consent, setConsent] = useState<CookieConsent | null>(() => readCookieConsent())
  const [showPreferences, setShowPreferences] = useState(false)

  const hasDecided = consent !== null
  const showBanner = !hasDecided
  const analyticsAllowed = consent?.analytics ?? false

  const acceptAll = useCallback(() => {
    setConsent(writeCookieConsent(true))
    setShowPreferences(false)
  }, [])

  const rejectOptional = useCallback(() => {
    setConsent(writeCookieConsent(false))
    setShowPreferences(false)
  }, [])

  const savePreferences = useCallback((analytics: boolean) => {
    setConsent(writeCookieConsent(analytics))
    setShowPreferences(false)
  }, [])

  const openPreferences = useCallback(() => {
    setShowPreferences(true)
  }, [])

  const closePreferences = useCallback(() => {
    setShowPreferences(false)
  }, [])

  const value = useMemo(
    () => ({
      consent,
      hasDecided,
      analyticsAllowed,
      showBanner,
      showPreferences,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences,
      closePreferences,
    }),
    [
      consent,
      hasDecided,
      analyticsAllowed,
      showBanner,
      showPreferences,
      acceptAll,
      rejectOptional,
      savePreferences,
      openPreferences,
      closePreferences,
    ],
  )

  return (
    <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
  )
}

export function useCookieConsent() {
  const context = useContext(CookieConsentContext)
  if (!context) {
    throw new Error('useCookieConsent must be used within CookieConsentProvider')
  }
  return context
}
