/** July promotional offers — visible until end of July 2026 (Athens). */
const JULY_OFFER_END = new Date('2026-08-01T00:00:00+03:00')

const OFFERS_POPUP_STORAGE_KEY = 'posing_offers_popup_seen_v1'

export function isJulyOfferActive(now = new Date()) {
  return now < JULY_OFFER_END
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

export function scrollToPosingBooking() {
  document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
