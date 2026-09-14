/** September 2026 promotional offer — +1 session on monthly packages (Athens). */

const SEPTEMBER_OFFER_START = new Date('2026-09-01T00:00:00+03:00')
const SEPTEMBER_OFFER_END = new Date('2026-10-01T00:00:00+03:00')
const SEPTEMBER_LOYALTY_END = new Date('2027-04-01T00:00:00+03:00')

const OFFERS_POPUP_STORAGE_KEY = 'posing_offers_popup_session_sept2026_v1'

export const SEPTEMBER_BONUS_PLAN_KEYS = ['sapphire', 'ruby', 'diamond'] as const

export function isSeptemberOfferActive(now = new Date()) {
  return now >= SEPTEMBER_OFFER_START && now < SEPTEMBER_OFFER_END
}

export function isSeptemberLoyaltyPeriodActive(now = new Date()) {
  return now < SEPTEMBER_LOYALTY_END
}

export function isSeptemberBonusPlanKey(planKey: string) {
  return (SEPTEMBER_BONUS_PLAN_KEYS as readonly string[]).includes(planKey)
}

export function getSeptemberBonusSessions(planKey: string, now = new Date()) {
  if (!isSeptemberBonusPlanKey(planKey)) return 0
  if (!isSeptemberLoyaltyPeriodActive(now)) return 0
  if (isSeptemberOfferActive(now)) return 1
  return 0
}

export function shouldShowSeptemberBonusBadge(
  planKey: string,
  septemberLoyaltyEligible: boolean,
  now = new Date(),
) {
  if (!isSeptemberBonusPlanKey(planKey)) return false
  return isSeptemberOfferActive(now) || (septemberLoyaltyEligible && isSeptemberLoyaltyPeriodActive(now))
}

export function shouldShowOffersPopup(
  { seenInSession }: { seenInSession: boolean },
  now = new Date(),
) {
  return isSeptemberOfferActive(now) && !seenInSession
}

export function hasSeenOffersPopup(): boolean {
  if (typeof window === 'undefined') return true
  try {
    return window.sessionStorage.getItem(OFFERS_POPUP_STORAGE_KEY) === '1'
  } catch {
    return true
  }
}

export function markOffersPopupSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(OFFERS_POPUP_STORAGE_KEY, '1')
  } catch {
    // ignore quota / private mode
  }
}

export function clearOffersPopupSeen(): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.removeItem(OFFERS_POPUP_STORAGE_KEY)
  } catch {
    // ignore
  }
}

export function scrollToPosingPackages() {
  document.getElementById('packages')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

export function scrollToPosingBooking() {
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
