import { site, type PosingPlanKey } from '../site'

/** Admin-only catalog reference — mirrors api/posing/pricing.js */
export const CATALOG_PRICES_EUR: Record<PosingPlanKey, number> = {
  single: 70,
  sapphire: 80,
  ruby: 140,
  diamond: 160,
  ruby_july8: 240,
  diamond_july8: 270,
}

export const ALL_PLAN_KEYS = site.posing.planKeys
