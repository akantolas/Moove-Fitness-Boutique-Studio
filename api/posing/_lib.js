/**
 * Shared helpers for Move & Pose Vercel API routes.
 */

import { createClient } from '@supabase/supabase-js'

export const PACKAGE_KEYS = ['single', 'sapphire', 'ruby', 'diamond']

const STRIPE_LINK_ENV = {
  single: 'STRIPE_LINK_SINGLE',
  sapphire: 'STRIPE_LINK_SAPPHIRE',
  ruby: 'STRIPE_LINK_RUBY',
  diamond: 'STRIPE_LINK_DIAMOND',
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('missing_supabase_admin_config')
  }
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } })
}

export function getAdminEmails() {
  return (process.env.POSE_ADMIN_EMAILS ?? 'info@moovefitness.gr')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
}

export function isAdminEmail(email) {
  return getAdminEmails().includes(String(email ?? '').toLowerCase())
}

export async function getUserFromRequest(req) {
  const authHeader = req.headers.authorization ?? req.headers.Authorization
  if (!authHeader?.startsWith('Bearer ')) return null
  const token = authHeader.slice(7)
  const supabase = getSupabaseAdmin()
  const { data, error } = await supabase.auth.getUser(token)
  if (error || !data.user) return null
  return data.user
}

export async function ensureAdmin(user) {
  if (!user?.email) return false
  if (isAdminEmail(user.email)) {
    await getSupabaseAdmin()
      .from('profiles')
      .update({ role: 'admin' })
      .eq('id', user.id)
    return true
  }
  const { data } = await getSupabaseAdmin()
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .maybeSingle()
  return data?.role === 'admin'
}

export function stripeLinkForPackage(packageKey) {
  const envKey = STRIPE_LINK_ENV[packageKey] ?? STRIPE_LINK_ENV.single
  return process.env[envKey] ?? process.env.STRIPE_LINK_SINGLE ?? ''
}

const STRIPE_PRICE_ENV = {
  single: 'STRIPE_PRICE_SINGLE',
  sapphire: 'STRIPE_PRICE_SAPPHIRE',
  ruby: 'STRIPE_PRICE_RUBY',
  diamond: 'STRIPE_PRICE_DIAMOND',
}

export async function createStripeCheckoutUrl({
  planKey,
  bookingId,
  userPackageId,
  customerEmail,
}) {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceEnv = STRIPE_PRICE_ENV[planKey] ?? STRIPE_PRICE_ENV.single
  const priceId = process.env[priceEnv]
  if (!secret || !priceId) {
    return { url: stripeLinkForPackage(planKey), sessionId: null }
  }

  const successUrl =
    process.env.POSE_SUCCESS_URL ?? 'https://moovefitness.gr/posing?payment=success'
  const cancelUrl = process.env.POSE_CANCEL_URL ?? 'https://moovefitness.gr/posing#booking'

  const params = new URLSearchParams()
  params.set('mode', 'payment')
  params.set('line_items[0][price]', priceId)
  params.set('line_items[0][quantity]', '1')
  params.set('success_url', successUrl)
  params.set('cancel_url', cancelUrl)
  params.set('customer_email', customerEmail)
  params.set('metadata[booking_id]', bookingId)
  params.set('metadata[user_package_id]', userPackageId)
  params.set('metadata[plan_key]', planKey)

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
  return {
    url: session.url ?? stripeLinkForPackage(planKey),
    sessionId: session.id ?? null,
  }
}

export function json(res, status, body) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

export async function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8')
        resolve(raw ? JSON.parse(raw) : {})
      } catch (error) {
        reject(error)
      }
    })
    req.on('error', reject)
  })
}

export async function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

export function formatSessionTime(startTime, locale = 'el') {
  const date = new Date(startTime)
  if (Number.isNaN(date.getTime())) return startTime
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(date)
}

export async function sendResendEmail({ from, to, subject, html, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) throw new Error('missing_resend_api_key')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({ from, to, subject, html }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`resend_failed:${response.status}:${body}`)
  }
  return response.json()
}

export function buildPaymentEmail({ attendeeName, packageName, sessionTime, stripeLink, locale }) {
  const isEl = locale === 'el'
  const paySection = stripeLink
    ? `<p style="margin:20px 0;"><a href="${stripeLink}" style="display:inline-block;background:#c026d3;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">${isEl ? 'Πληρωμή μέσω Stripe' : 'Pay with Stripe'}</a></p>`
    : `<p>${isEl ? 'Ο σύνδεσμος πληρωμής δεν είναι ρυθμισμένος — θα επικοινωνήσουμε σύντομα.' : 'Payment link is not configured yet — we will contact you shortly.'}</p>`

  return `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
    <p>${isEl ? `Γεια σου ${attendeeName},` : `Hi ${attendeeName},`}</p>
    <p>${isEl ? 'Η κράτησή σου καταχωρήθηκε.' : 'Your booking has been reserved.'}</p>
    <p><strong>${isEl ? 'Ώρα' : 'Time'}:</strong> ${sessionTime}</p>
    <p><strong>${isEl ? 'Πακέτο' : 'Package'}:</strong> ${packageName}</p>
    <p>${isEl ? 'Ολοκλήρωσε την πληρωμή για να επιβεβαιωθεί η συνεδρία.' : 'Complete payment to confirm your session.'}</p>
    ${paySection}
  </body></html>`
}
