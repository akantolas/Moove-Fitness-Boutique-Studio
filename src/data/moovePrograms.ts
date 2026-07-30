/** Public catalog metadata — prices validated server-side in api/programs/_pricing.js */

export type MooveProgramKey =
  | 'peach_start_bundle'
  | 'peach_build'
  | 'peach_sculpt'
  | 'peach_complete'

export type MooveProgramCatalogItem = {
  key: MooveProgramKey
  priceCents: number
  levelKey: string
  durationKey: string
  benefitKey: string
  outcomeKey: string
  workoutCount: number
  imagePath: string
  imagePosition?: string
  featured?: boolean
}

export const mooveProgramCatalog: MooveProgramCatalogItem[] = [
  {
    key: 'peach_start_bundle',
    priceCents: 3490,
    levelKey: 'allLevels',
    durationKey: 'weeks4x3',
    benefitKey: 'foundation',
    outcomeKey: 'foundation',
    workoutCount: 3,
    imagePath: '/programs/peach-start-cover.png',
    imagePosition: 'center center',
  },
  {
    key: 'peach_build',
    priceCents: 4990,
    levelKey: 'intermediate',
    durationKey: 'weeks6',
    benefitKey: 'strength',
    outcomeKey: 'strength',
    workoutCount: 4,
    imagePath: '/image2.jpeg',
    imagePosition: 'center 30%',
  },
  {
    key: 'peach_sculpt',
    priceCents: 5990,
    levelKey: 'intermediateAdvanced',
    durationKey: 'weeks8x45',
    benefitKey: 'definition',
    outcomeKey: 'definition',
    workoutCount: 5,
    imagePath: '/image1.jpeg',
    imagePosition: 'center 52%',
  },
  {
    key: 'peach_complete',
    priceCents: 9990,
    levelKey: 'allLevels',
    durationKey: 'complete',
    benefitKey: 'complete',
    outcomeKey: 'complete',
    workoutCount: 12,
    imagePath: '/image4.jpeg',
    imagePosition: 'center 42%',
    featured: true,
  },
]

export function formatProgramPrice(priceCents: number, locale: string) {
  return new Intl.NumberFormat(locale === 'en' ? 'en-IE' : 'el-GR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(priceCents / 100)
}
