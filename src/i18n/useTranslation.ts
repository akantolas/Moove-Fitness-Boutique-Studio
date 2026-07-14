import { useContext } from 'react'
import { site } from '../site'
import { I18nContext } from './context'
import type { TranslationVars } from './types'

export function useTranslation() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useTranslation must be used within I18nProvider')
  return ctx
}

export function useSiteVars(): TranslationVars {
  const { locale } = useTranslation()
  return {
    name: site.name,
    tagline: site.tagline,
    owner: locale === 'en' ? site.ownerNameEn : site.ownerName,
    coach: locale === 'en' ? site.posing.coachNameEn : site.posing.coachName,
    brand: site.posing.brandName,
    email: site.email,
    address: site.addressLine,
    bookingUrl: site.bookingUrl,
  }
}
