/**
 * Moove program catalog pricing (server-only). Amounts in whole EUR.
 */

export const PROGRAM_KEYS = [
  'peach_start',
  'peach_workout_b',
  'peach_workout_c',
  'peach_build_wa_heavy',
  'peach_build_wb',
  'peach_build_wc',
  'peach_build_wd',
]

/** @type {Record<string, number>} */
export const CATALOG_PRICES_EUR = {
  peach_start: 45,
  peach_workout_b: 45,
  peach_workout_c: 45,
  peach_build_wa_heavy: 60,
  peach_build_wb: 45,
  peach_build_wc: 45,
  peach_build_wd: 45,
}

/** @type {Record<string, { el: string; en: string }>} */
export const PROGRAM_NAMES = {
  peach_start: {
    el: 'Peach Collection – 1. Peach Start',
    en: 'Peach Collection – 1. Peach Start',
  },
  peach_workout_b: {
    el: 'Peach Collection – 2. Workout B',
    en: 'Peach Collection – 2. Workout B',
  },
  peach_workout_c: {
    el: 'Peach Collection – 3. Workout C',
    en: 'Peach Collection – 3. Workout C',
  },
  peach_build_wa_heavy: {
    el: 'Peach Build – WA Heavy Glutes',
    en: 'Peach Build – WA Heavy Glutes',
  },
  peach_build_wb: {
    el: 'Peach Build – Workout B: Glute & Unilateral Strength',
    en: 'Peach Build – Workout B: Glute & Unilateral Strength',
  },
  peach_build_wc: {
    el: 'Peach Build – Workout C: Posterior Chain',
    en: 'Peach Build – Workout C: Posterior Chain',
  },
  peach_build_wd: {
    el: 'Peach Build – Workout D: Glute Volume & Pump',
    en: 'Peach Build – Workout D: Glute Volume & Pump',
  },
}

const STRIPE_PRICE_ENV = {
  peach_start: 'STRIPE_PRICE_PROGRAM_PEACH_START',
  peach_workout_b: 'STRIPE_PRICE_PROGRAM_PEACH_WORKOUT_B',
  peach_workout_c: 'STRIPE_PRICE_PROGRAM_PEACH_WORKOUT_C',
  peach_build_wa_heavy: 'STRIPE_PRICE_PROGRAM_PEACH_BUILD_WA_HEAVY',
  peach_build_wb: 'STRIPE_PRICE_PROGRAM_PEACH_BUILD_WB',
  peach_build_wc: 'STRIPE_PRICE_PROGRAM_PEACH_BUILD_WC',
  peach_build_wd: 'STRIPE_PRICE_PROGRAM_PEACH_BUILD_WD',
}

export function getCatalogPriceEur(programKey) {
  return CATALOG_PRICES_EUR[programKey] ?? null
}

export function getProgramName(programKey, locale = 'el') {
  const names = PROGRAM_NAMES[programKey]
  if (!names) return programKey
  return locale === 'en' ? names.en : names.el
}

export function isValidProgramKey(programKey) {
  return PROGRAM_KEYS.includes(programKey)
}

export function getStripePriceEnvKey(programKey) {
  return STRIPE_PRICE_ENV[programKey] ?? null
}

export function formatPurchaseRef(purchaseId) {
  if (!purchaseId) return '—'
  return String(purchaseId).slice(0, 8).toUpperCase()
}
