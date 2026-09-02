/**
 * Nutrition plan pricing (server-only). Amount in whole EUR.
 */

const DEFAULT_PRICE_EUR = 25

export function getNutritionPriceEur() {
  const raw = process.env.NUTRITION_PLAN_PRICE_EUR?.trim()
  const parsed = raw ? Number.parseInt(raw, 10) : DEFAULT_PRICE_EUR
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_PRICE_EUR
}

export function getStripeNutritionPriceId() {
  return process.env.STRIPE_NUTRITION_PRICE_ID?.trim() || null
}

export function formatNutritionOrderRef(orderId) {
  if (!orderId) return '—'
  return String(orderId).slice(0, 8).toUpperCase()
}

export function getNutritionProductName(locale = 'el') {
  return locale === 'en' ? 'Moove Personalized Nutrition Plan' : 'Moove Προσωποποιημένο Διατροφικό Πλάνο'
}
