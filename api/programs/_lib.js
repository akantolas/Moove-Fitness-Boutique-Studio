import { randomBytes } from 'node:crypto'
import {
  cors,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
  sendPosingEmailReliable,
} from '../posing/_lib.js'
import { getPayPalUrl, getRevolutUrl } from '../posing/_pricing.js'
import {
  formatPurchaseRef,
  getCatalogPriceCents,
  getCatalogPriceEur,
  getIncludedWorkoutKeys,
  getProgramName,
  getStripePriceEnvKey,
  getWorkoutGroup,
  isValidProgramKey,
} from './_pricing.js'
import { getProgramContentForApi } from './_catalog.js'
import {
  sendMooveProgramAccessEmail,
  sendMooveProgramOrderNotifyEmail,
  sendMooveProgramPaymentEmail,
} from '../../lib/email/sendProgramEmails.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const ORDER_RATE_LIMIT = 5
const ORDER_RATE_WINDOW_MS = 60 * 60 * 1000
const DEDUP_WINDOW_MS = 15 * 60 * 1000

export function programsAccessUrl(token) {
  const base = process.env.SITE_URL?.trim()?.replace(/\/$/, '') ?? 'https://moovefitness.gr'
  return `${base}/programmata/access/${token}`
}

export function programsSuccessUrl(purchaseRef) {
  const base = process.env.MOOVE_PROGRAM_SUCCESS_URL?.trim() ?? 'https://moovefitness.gr/programmata?payment=success'
  const url = new URL(base)
  if (purchaseRef) url.searchParams.set('purchase', purchaseRef)
  return url.toString()
}

export function programsCancelUrl() {
  return process.env.MOOVE_PROGRAM_CANCEL_URL?.trim() ?? 'https://moovefitness.gr/programmata'
}

export function generateAccessToken() {
  return randomBytes(32).toString('base64url')
}

export async function createProgramStripeCheckout({
  purchaseId,
  programKey,
  customerEmail,
  locale = 'el',
  amountCents,
  programName,
}) {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceEnvKey = getStripePriceEnvKey(programKey)
  const priceId = priceEnvKey ? process.env[priceEnvKey] : null
  const resolvedAmount = Math.round(Number(amountCents))
  const needsDynamic = !priceId

  if (!secret || (needsDynamic && (!resolvedAmount || resolvedAmount <= 0))) {
    return { url: '', sessionId: null }
  }

  const purchaseRef = formatPurchaseRef(purchaseId)
  const params = new URLSearchParams()
  params.set('mode', 'payment')
  if (needsDynamic) {
    params.set('line_items[0][price_data][currency]', 'eur')
    params.set('line_items[0][price_data][unit_amount]', String(resolvedAmount))
    params.set('line_items[0][price_data][product_data][name]', programName)
  } else {
    params.set('line_items[0][price]', priceId)
  }
  params.set('line_items[0][quantity]', '1')
  params.set('success_url', programsSuccessUrl(purchaseRef))
  params.set('cancel_url', programsCancelUrl())
  params.set('customer_email', customerEmail)
  params.set('metadata[product_type]', 'moove_program')
  params.set('metadata[purchase_id]', purchaseId)
  params.set('metadata[program_key]', programKey)
  params.set('metadata[locale]', locale === 'en' ? 'en' : 'el')

  const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`stripe_checkout_failed:${response.status}:${body}`)
  }

  const session = await response.json()
  return { url: session.url ?? '', sessionId: session.id ?? null }
}

export async function findRecentPendingPurchase(supabase, email, programKey) {
  const since = new Date(Date.now() - DEDUP_WINDOW_MS).toISOString()
  const { data } = await supabase
    .from('moove_program_purchases')
    .select('*')
    .eq('email', email.toLowerCase())
    .eq('program_key', programKey)
    .eq('status', 'pending_payment')
    .gte('created_at', since)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export async function countRecentOrders(supabase, email) {
  const since = new Date(Date.now() - ORDER_RATE_WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('moove_program_purchases')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('created_at', since)
  return count ?? 0
}

export async function activateProgramPurchase(
  supabase,
  { purchaseId, paymentRef, paymentMethod = 'stripe', confirmedBy = null },
) {
  const now = new Date().toISOString()

  const { data: purchase } = await supabase
    .from('moove_program_purchases')
    .select('*')
    .eq('id', purchaseId)
    .maybeSingle()

  if (!purchase) return { ok: false, error: 'purchase_not_found' }
  if (purchase.status === 'paid') return { ok: true, already: true, purchase }
  if (purchase.status !== 'pending_payment') {
    return { ok: false, error: 'invalid_purchase_status' }
  }

  const accessToken = generateAccessToken()
  const update = {
    status: 'paid',
    payment_method: paymentMethod,
    access_token: accessToken,
    stripe_session_id: paymentMethod === 'stripe' ? paymentRef : purchase.stripe_session_id,
    updated_at: now,
  }
  if (confirmedBy) update.confirmed_by = confirmedBy

  const { data: updated, error } = await supabase
    .from('moove_program_purchases')
    .update(update)
    .eq('id', purchaseId)
    .eq('status', 'pending_payment')
    .select('*')
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!updated) return { ok: false, error: 'activate_conflict' }

  return { ok: true, purchase: updated }
}

export async function sendProgramPaymentFlowEmails({
  purchase,
  stripeLink,
  paypalLink,
  revolutLink,
  locale,
}) {
  const programName = getProgramName(purchase.program_key, locale)
  const amountEur = purchase.amount_eur

  await sendMooveProgramPaymentEmail({
    email: purchase.email,
    programName,
    purchaseId: purchase.id,
    amountEur,
    stripeLink,
    paypalLink,
    revolutLink,
    locale,
  })

  await sendMooveProgramOrderNotifyEmail({
    email: purchase.email,
    programName,
    purchaseId: purchase.id,
    amountEur,
    stripeLink,
    paypalLink,
    revolutLink,
    locale,
  })
}

export async function sendProgramAccessFlowEmail(purchase, locale) {
  if (!purchase.access_token) return
  const programName = getProgramName(purchase.program_key, locale)
  await sendMooveProgramAccessEmail({
    email: purchase.email,
    programName,
    accessUrl: programsAccessUrl(purchase.access_token),
    locale,
  })
}

export {
  cors,
  json,
  getSupabaseAdmin,
  normalizeBookingLocale,
  isValidProgramKey,
  getCatalogPriceCents,
  getCatalogPriceEur,
  getIncludedWorkoutKeys,
  getProgramName,
  getWorkoutGroup,
  formatPurchaseRef,
  getProgramContentForApi,
  getPayPalUrl,
  getRevolutUrl,
}
