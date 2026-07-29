/** Public catalog metadata — prices validated server-side in api/programs/_pricing.js */

export type MooveProgramKey =
  | 'peach_start'
  | 'peach_workout_b'
  | 'peach_workout_c'
  | 'peach_build_wa_heavy'
  | 'peach_build_wb'
  | 'peach_build_wc'
  | 'peach_build_wd'

export type MooveProgramCatalogItem = {
  key: MooveProgramKey
  priceEur: number
  levelKey: string
  durationKey: string
}

export const mooveProgramCatalog: MooveProgramCatalogItem[] = [
  {
    key: 'peach_start',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
  },
  {
    key: 'peach_workout_b',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
  },
  {
    key: 'peach_workout_c',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
  },
  {
    key: 'peach_build_wa_heavy',
    priceEur: 60,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
  },
  {
    key: 'peach_build_wb',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
  },
  {
    key: 'peach_build_wc',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
  },
  {
    key: 'peach_build_wd',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
  },
]
