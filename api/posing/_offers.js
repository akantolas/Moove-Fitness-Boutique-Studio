/** September 2026 promotional offer — +1 session on monthly packages (Athens). */

const SEPTEMBER_OFFER_START = new Date('2026-09-01T00:00:00+03:00')
const SEPTEMBER_OFFER_END = new Date('2026-10-01T00:00:00+03:00')
const SEPTEMBER_LOYALTY_END = new Date('2027-04-01T00:00:00+03:00')

const OCTOBER_OFFER_START = new Date('2026-10-01T00:00:00+03:00')
const OCTOBER_OFFER_END = new Date('2026-11-01T00:00:00+03:00')

export const SEPTEMBER_BONUS_PLAN_KEYS = ['sapphire', 'ruby', 'diamond']
export const OCTOBER_BONUS_PLAN_KEYS = ['sapphire', 'ruby', 'diamond']
export const OCTOBER_BONUS_SESSIONS = 2

export function isOctoberOfferActive(now = new Date()) {
  return now >= OCTOBER_OFFER_START && now < OCTOBER_OFFER_END
}

/** @param {string} planKey */
export function getOctoberBonusSessions(planKey, now = new Date()) {
  if (!isOctoberOfferActive(now)) return 0
  return OCTOBER_BONUS_PLAN_KEYS.includes(String(planKey)) ? OCTOBER_BONUS_SESSIONS : 0
}

/**
 * October promo wins while it is live. September loyalty applies only after that.
 * @param {string} planKey
 * @param {{ enrolledInSeptemberOffer: boolean }} state
 */
export function computePosingBonusSessions(planKey, state, now = new Date()) {
  const octoberBonus = getOctoberBonusSessions(planKey, now)
  if (octoberBonus > 0) return octoberBonus
  return computeSeptemberBonusSessions(planKey, state, now)
}

export function isSeptemberOfferActive(now = new Date()) {
  return now >= SEPTEMBER_OFFER_START && now < SEPTEMBER_OFFER_END
}

export function isSeptemberLoyaltyPeriodActive(now = new Date()) {
  return now < SEPTEMBER_LOYALTY_END
}

/** @param {string} planKey */
export function isSeptemberBonusPlanKey(planKey) {
  return SEPTEMBER_BONUS_PLAN_KEYS.includes(String(planKey))
}

/**
 * Pure bonus resolution for tests and server.
 * @param {{ enrolledInSeptemberOffer: boolean }} state
 */
export function computeSeptemberBonusSessions(planKey, state, now = new Date()) {
  if (!isSeptemberBonusPlanKey(planKey)) return 0
  if (!isSeptemberLoyaltyPeriodActive(now)) return 0
  if (isSeptemberOfferActive(now)) return 1
  if (state.enrolledInSeptemberOffer) return 1
  return 0
}

/** @param {string} planKey */
export function getSeptemberBonusSessions(planKey, now = new Date()) {
  return computeSeptemberBonusSessions(planKey, { enrolledInSeptemberOffer: false }, now)
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} userId */
export async function userEnrolledInSeptemberOffer(supabase, userId) {
  const { count, error } = await supabase
    .from('user_packages')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('plan_key', SEPTEMBER_BONUS_PLAN_KEYS)
    .gte('created_at', SEPTEMBER_OFFER_START.toISOString())
    .lt('created_at', SEPTEMBER_OFFER_END.toISOString())

  if (error) {
    console.error('september offer enrollment check failed:', { userId, error: error.message })
    return false
  }

  return (count ?? 0) > 0
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} userId @param {string} planKey */
export async function resolveSeptemberBonusSessions(supabase, userId, planKey, now = new Date()) {
  if (!isSeptemberBonusPlanKey(planKey) || !isSeptemberLoyaltyPeriodActive(now)) return 0
  if (isSeptemberOfferActive(now)) return 1

  const enrolled = await userEnrolledInSeptemberOffer(supabase, userId)
  return computeSeptemberBonusSessions(planKey, { enrolledInSeptemberOffer: enrolled }, now)
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} userId */
export async function isSeptemberLoyaltyEligible(supabase, userId, now = new Date()) {
  if (!isSeptemberLoyaltyPeriodActive(now)) return false
  if (isSeptemberOfferActive(now)) return true
  return userEnrolledInSeptemberOffer(supabase, userId)
}

/** @param {import('@supabase/supabase-js').SupabaseClient} supabase @param {string} userId @param {string} planKey */
export async function resolvePosingBonusSessions(supabase, userId, planKey, now = new Date()) {
  const octoberBonus = getOctoberBonusSessions(planKey, now)
  if (octoberBonus > 0) return octoberBonus
  return resolveSeptemberBonusSessions(supabase, userId, planKey, now)
}

/** @param {{ seenInSession: boolean }} state */
export function shouldShowOffersPopup(state, now = new Date()) {
  return isOctoberOfferActive(now) && !state.seenInSession
}
