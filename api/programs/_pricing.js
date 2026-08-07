/** Moove program products and workout access (server-only). */

export const LEGACY_PROGRAM_KEYS = [
  'peach_start',
  'peach_workout_b',
  'peach_workout_c',
  'peach_sculpt_a',
  'peach_sculpt_b',
  'peach_sculpt_c',
  'peach_sculpt_d',
  'peach_sculpt_e',
  'peach_build_wa_heavy',
  'peach_build_wb',
  'peach_build_wc',
  'peach_build_wd',
]

export const PROGRAM_KEYS = [
  'peach_start_bundle',
  'peach_build',
  'peach_sculpt',
  'peach_complete',
]

export const PROGRAM_WORKOUTS = {
  peach_start_bundle: ['peach_start', 'peach_workout_b', 'peach_workout_c'],
  peach_build: ['peach_build_wa_heavy', 'peach_build_wb', 'peach_build_wc', 'peach_build_wd'],
  peach_sculpt: [
    'peach_sculpt_a',
    'peach_sculpt_b',
    'peach_sculpt_c',
    'peach_sculpt_d',
    'peach_sculpt_e',
  ],
  peach_complete: [
    'peach_start',
    'peach_workout_b',
    'peach_workout_c',
    'peach_build_wa_heavy',
    'peach_build_wb',
    'peach_build_wc',
    'peach_build_wd',
    'peach_sculpt_a',
    'peach_sculpt_b',
    'peach_sculpt_c',
    'peach_sculpt_d',
    'peach_sculpt_e',
  ],
}

/** @type {Record<string, number>} */
export const CATALOG_PRICES_CENTS = {
  peach_start_bundle: 3490,
  peach_build: 4990,
  peach_sculpt: 5990,
  peach_complete: 9990,
}

/** @type {Record<string, { el: string; en: string }>} */
export const PROGRAM_NAMES = {
  peach_start_bundle: {
    el: 'Peach Start',
    en: 'Peach Start',
  },
  peach_build: {
    el: 'Peach Build',
    en: 'Peach Build',
  },
  peach_sculpt: {
    el: 'Peach Sculpt',
    en: 'Peach Sculpt',
  },
  peach_complete: {
    el: 'Complete Collection',
    en: 'Complete Collection',
  },
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
  peach_sculpt_a: {
    el: 'Peach Sculpt – Workout A',
    en: 'Peach Sculpt – Workout A',
  },
  peach_sculpt_b: {
    el: 'Peach Sculpt – Workout B: Glute Pump Symmetry',
    en: 'Peach Sculpt – Workout B: Glute Pump Symmetry',
  },
  peach_sculpt_c: {
    el: 'Peach Sculpt – Workout C: Posterior Chain',
    en: 'Peach Sculpt – Workout C: Posterior Chain',
  },
  peach_sculpt_d: {
    el: 'Peach Sculpt – Workout D: Leg Volume & Pump',
    en: 'Peach Sculpt – Workout D: Leg Volume & Pump',
  },
  peach_sculpt_e: {
    el: 'Peach Sculpt – Workout E: Conditioning & Burn',
    en: 'Peach Sculpt – Workout E: Conditioning & Burn',
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
  peach_start_bundle: 'STRIPE_PRICE_PROGRAM_PEACH_START_BUNDLE',
  peach_build: 'STRIPE_PRICE_PROGRAM_PEACH_BUILD',
  peach_sculpt: 'STRIPE_PRICE_PROGRAM_PEACH_SCULPT',
  peach_complete: 'STRIPE_PRICE_PROGRAM_PEACH_COMPLETE',
}

export function getCatalogPriceCents(programKey) {
  return CATALOG_PRICES_CENTS[programKey] ?? null
}

export function centsToEurAmount(cents) {
  const parsed = Number(cents)
  if (!Number.isFinite(parsed)) return null
  return Number((parsed / 100).toFixed(2))
}

export function getCatalogPriceEur(programKey) {
  const cents = getCatalogPriceCents(programKey)
  return cents === null ? null : centsToEurAmount(cents)
}

export function getProgramName(programKey, locale = 'el') {
  const names = PROGRAM_NAMES[programKey]
  if (!names) return programKey
  return locale === 'en' ? names.en : names.el
}

export function isValidProgramKey(programKey) {
  return PROGRAM_KEYS.includes(programKey)
}

export function getIncludedWorkoutKeys(programKey) {
  if (PROGRAM_WORKOUTS[programKey]) return [...PROGRAM_WORKOUTS[programKey]]
  if (LEGACY_PROGRAM_KEYS.includes(programKey)) return [programKey]
  return []
}

export function getWorkoutGroup(workoutKey) {
  if (workoutKey === 'peach_start' || workoutKey.startsWith('peach_workout_')) return 'start'
  if (workoutKey.startsWith('peach_build_')) return 'build'
  if (workoutKey.startsWith('peach_sculpt_')) return 'sculpt'
  return 'other'
}

export function getStripePriceEnvKey(programKey) {
  return STRIPE_PRICE_ENV[programKey] ?? null
}

export function formatPurchaseRef(purchaseId) {
  if (!purchaseId) return '—'
  return String(purchaseId).slice(0, 8).toUpperCase()
}
