/**
 * Mirrors public.posing_package_period: a month covers up to 4 sessions and every
 * session beyond that adds a week. Plans sold with a longer period keep it.
 */
export function packageValidityDays(sessionsTotal: number, periodDays = 30) {
  return Math.max(periodDays, 30 + 7 * Math.max(0, sessionsTotal - 4))
}
