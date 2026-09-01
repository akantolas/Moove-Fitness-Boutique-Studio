/** September 2026 promotional offer — +1 session on monthly packages (Athens). */

const SEPTEMBER_OFFER_START = new Date('2026-09-01T00:00:00+03:00')
const SEPTEMBER_OFFER_END = new Date('2026-10-01T00:00:00+03:00')

const OFFERS_POPUP_STORAGE_KEY = 'posing_offers_popup_seen_sept2026_v1'

export const SEPTEMBER_BONUS_PLAN_KEYS = ['sapphire', 'ruby', 'diamond'] as const

export function isSeptemberOfferActive(now = new Date()) {
  return now >= SEPTEMBER_OFFER_START && now < SEPTEMBER_OFFER_END
}

export function getSeptemberBonusSessions(planKey: string, now = new Date()) {
  if (!isSeptemberOfferActive(now)) return 0
  return (SEPTEMBER_BONUS_PLAN_KEYS as readonly string[]).includes(planKey) ? 1 : 0
}

export function hasSeenOffersPopup(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.localStorage.getItem(OFFERS_POPUP_STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function markOffersPopupSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(OFFERS_POPUP_STORAGE_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}

export function scrollToPosingPackages() {
  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToPosingBooking() {
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
