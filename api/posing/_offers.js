/** September 2026 promotional offer — +1 session on monthly packages (Athens). */

const SEPTEMBER_OFFER_START = new Date('2026-09-01T00:00:00+03:00')
const SEPTEMBER_OFFER_END = new Date('2026-10-01T00:00:00+03:00')

export const SEPTEMBER_BONUS_PLAN_KEYS = ['sapphire', 'ruby', 'diamond']

export function isSeptemberOfferActive(now = new Date()) {
  return now >= SEPTEMBER_OFFER_START && now < SEPTEMBER_OFFER_END
}

/** @param {string} planKey */
export function getSeptemberBonusSessions(planKey, now = new Date()) {
  if (!isSeptemberOfferActive(now)) return 0
  return SEPTEMBER_BONUS_PLAN_KEYS.includes(String(planKey)) ? 1 : 0
}

/** @param {{ seenInSession: boolean }} state */
export function shouldShowOffersPopup(state, now = new Date()) {
  return isSeptemberOfferActive(now) && !state.seenInSession
}
