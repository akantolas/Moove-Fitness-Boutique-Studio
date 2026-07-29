/** Public catalog metadata — prices validated server-side in api/programs/_pricing.js */

export type MooveProgramKey =
  | 'peach_start'
  | 'peach_workout_b'
  | 'peach_workout_c'
  | 'peach_sculpt_a'
  | 'peach_sculpt_b'
  | 'peach_sculpt_c'
  | 'peach_sculpt_d'
  | 'peach_sculpt_e'
  | 'peach_build_wa_heavy'
  | 'peach_build_wb'
  | 'peach_build_wc'
  | 'peach_build_wd'

export type MooveProgramCatalogItem = {
  key: MooveProgramKey
  priceEur: number
  levelKey: string
  durationKey: string
  collectionKey: 'collection' | 'build' | 'sculpt'
  benefitKey: string
  outcomeKey: string
  imagePath: string
  imagePosition?: string
  featured?: boolean
}

export const mooveProgramCatalog: MooveProgramCatalogItem[] = [
  {
    key: 'peach_start',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
    collectionKey: 'collection',
    benefitKey: 'foundation',
    outcomeKey: 'foundation',
    imagePath: '/programs/peach-start-cover.png',
    imagePosition: 'center center',
  },
  {
    key: 'peach_workout_b',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
    collectionKey: 'collection',
    benefitKey: 'shape',
    outcomeKey: 'shape',
    imagePath: '/programs/peach-workout-b-cover.png',
    imagePosition: 'center center',
  },
  {
    key: 'peach_workout_c',
    priceEur: 45,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
    collectionKey: 'collection',
    benefitKey: 'sculpt',
    outcomeKey: 'sculpt',
    imagePath: '/programs/peach-workout-c-cover.png',
    imagePosition: 'center center',
  },
  {
    key: 'peach_sculpt_a',
    priceEur: 60,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    collectionKey: 'sculpt',
    benefitKey: 'definition',
    outcomeKey: 'definition',
    imagePath: '/image2.jpeg',
    imagePosition: 'center 38%',
    featured: true,
  },
  {
    key: 'peach_sculpt_b',
    priceEur: 60,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    collectionKey: 'sculpt',
    benefitKey: 'symmetry',
    outcomeKey: 'symmetry',
    imagePath: '/image1.jpeg',
    imagePosition: 'center 52%',
  },
  {
    key: 'peach_sculpt_c',
    priceEur: 60,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    collectionKey: 'sculpt',
    benefitKey: 'posterior',
    outcomeKey: 'posterior',
    imagePath: '/image4.jpeg',
    imagePosition: 'center 58%',
  },
  {
    key: 'peach_sculpt_d',
    priceEur: 60,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    collectionKey: 'sculpt',
    benefitKey: 'volume',
    outcomeKey: 'volume',
    imagePath: '/image5.jpeg',
    imagePosition: 'center 45%',
  },
  {
    key: 'peach_sculpt_e',
    priceEur: 60,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    collectionKey: 'sculpt',
    benefitKey: 'conditioning',
    outcomeKey: 'conditioning',
    imagePath: '/image2.jpeg',
    imagePosition: 'center 62%',
  },
  {
    key: 'peach_build_wa_heavy',
    priceEur: 60,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
    collectionKey: 'build',
    benefitKey: 'strength',
    outcomeKey: 'strength',
    imagePath: '/image2.jpeg',
    imagePosition: 'center 30%',
    featured: true,
  },
  {
    key: 'peach_build_wb',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
    collectionKey: 'build',
    benefitKey: 'unilateral',
    outcomeKey: 'unilateral',
    imagePath: '/image5.jpeg',
    imagePosition: 'center 68%',
  },
  {
    key: 'peach_build_wc',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
    collectionKey: 'build',
    benefitKey: 'posterior',
    outcomeKey: 'posterior',
    imagePath: '/image1.jpeg',
    imagePosition: 'center 68%',
  },
  {
    key: 'peach_build_wd',
    priceEur: 45,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
    collectionKey: 'build',
    benefitKey: 'volume',
    outcomeKey: 'volume',
    imagePath: '/image4.jpeg',
    imagePosition: 'center 42%',
  },
]
