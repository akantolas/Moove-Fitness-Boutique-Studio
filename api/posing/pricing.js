/**
 * Move & Pose catalog pricing (server-only).
 * Amounts in whole EUR.
 */

export const PLAN_KEYS = [
  'single',
  'sapphire',
  'ruby',
  'diamond',
  'ruby_july8',
  'diamond_july8',
]

/** @type {Record<string, number>} */
export const CATALOG_PRICES_EUR = {
  single: 70,
  sapphire: 80,
  ruby: 140,
  diamond: 160,
  ruby_july8: 240,
  diamond_july8: 270,
}

export function getCatalogPriceEur(planKey) {
  return CATALOG_PRICES_EUR[planKey] ?? null
}

export function formatPriceEUR(amountEur, locale = 'el') {
  const n = Number(amountEur)
  if (!n || Number.isNaN(n)) return locale === 'el' ? '—' : '—'
  return `${n}€`
}

export function getPayPalBaseUrl() {
  return (
    process.env.POSE_PAYPAL_URL?.trim() ||
    process.env.PAYPAL_ME_URL?.trim() ||
    'https://www.paypal.me/magdalinisamara'
  ).replace(/\/$/, '')
}

export function getRevolutBaseUrl() {
  return (
    process.env.POSE_REVOLUT_URL?.trim() ||
    process.env.REVOLUT_ME_URL?.trim() ||
    'https://revolut.me/magdaqsn9'
  ).replace(/\/$/, '')
}

export function getPayPalUrl(amountEur) {
  const base = getPayPalBaseUrl()
  const amount = Math.round(Number(amountEur))
  if (!amount || Number.isNaN(amount)) return base
  return `${base}/${amount}EUR`
}

export function getRevolutUrl(amountEur) {
  const base = getRevolutBaseUrl()
  const amount = Math.round(Number(amountEur))
  if (!amount || Number.isNaN(amount)) return base
  const url = new URL(base)
  url.searchParams.set('currency', 'EUR')
  url.searchParams.set('amount', String(amount))
  return url.toString()
}

/**
 * @param {import('@supabase/supabase-js').SupabaseClient} supabase
 * @param {string} planKey
 * @param {string} userId
 */
export async function resolvePlanPrice(supabase, planKey, userId) {
  const catalog = getCatalogPriceEur(planKey)
  if (!catalog) {
    return { amountEur: null, source: 'unknown', catalogPriceEur: null }
  }

  const { data: override } = await supabase
    .from('profile_plan_prices')
    .select('price_eur, note')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .maybeSingle()

  if (override?.price_eur) {
    return {
      amountEur: override.price_eur,
      source: 'override',
      catalogPriceEur: catalog,
      note: override.note ?? null,
    }
  }

  return {
    amountEur: catalog,
    source: 'catalog',
    catalogPriceEur: catalog,
    note: null,
  }
}
