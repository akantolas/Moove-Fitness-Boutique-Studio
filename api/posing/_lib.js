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
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SECRET_KEY
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
  locale = 'el',
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
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

/** Resolve catch-all route key from Vercel query or request URL pathname. */
export function resolveApiPath(req, basePrefix) {
  const fromQuery = req.query?.path
  if (fromQuery !== undefined && fromQuery !== null && fromQuery !== '') {
    const segments = Array.isArray(fromQuery) ? fromQuery : [fromQuery]
    const joined = segments.map((s) => String(s).trim()).filter(Boolean).join('/')
    if (joined) return joined
  }

  const rawUrl = String(req.url ?? '')
  const pathname = rawUrl.split('?')[0]
  const normalizedPrefix = basePrefix.endsWith('/') ? basePrefix : `${basePrefix}/`
  if (pathname === normalizedPrefix.slice(0, -1)) return ''
  if (pathname.startsWith(normalizedPrefix)) {
    return pathname.slice(normalizedPrefix.length).replace(/^\/+|\/+$/g, '')
  }

  return ''
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

export function normalizeBookingLocale(locale) {
  return locale === 'en' ? 'en' : 'el'
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

export function formatSessionTimeWithZone(startTime, locale = 'el') {
  const time = formatSessionTime(startTime, locale)
  const suffix = locale === 'el' ? ' (ώρα Ελλάδας)' : ' (Greece time)'
  return `${time}${suffix}`
}

export async function sendResendEmail({ from, to, subject, html, text, idempotencyKey, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) throw new Error('missing_resend_api_key')

  const recipients = (Array.isArray(to) ? to : [to]).map((entry) => String(entry).trim()).filter(Boolean)
  if (!recipients.length) throw new Error('missing_resend_recipients')

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...(idempotencyKey ? { 'Idempotency-Key': idempotencyKey } : {}),
    },
    body: JSON.stringify({
      from: String(from).trim(),
      to: recipients,
      subject,
      html,
      ...(text ? { text: String(text) } : {}),
      ...(replyTo ? { reply_to: String(replyTo).trim() } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`resend_failed:${response.status}:${body}`)
  }
  return response.json()
}

function getSmtpConfig() {
  const user = process.env.SMTP_USER ?? process.env.SMTP_EMAIL
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD
  if (!user || !pass) return null

  return {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user, pass },
  }
}

export function hasEmailTransportConfig() {
  return Boolean(getSmtpConfig() || process.env.RESEND_API_KEY)
}

export async function sendPosingEmail({ from, to, subject, html, text, idempotencyKey, replyTo }) {
  const smtp = getSmtpConfig()
  if (smtp) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport(smtp)
    const recipients = Array.isArray(to) ? to : [to]
    await transporter.sendMail({
      from: from ?? process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>',
      to: recipients.join(', '),
      subject,
      html,
      ...(text ? { text: String(text) } : {}),
      ...(replyTo ? { replyTo } : {}),
    })
    return { ok: true, provider: 'smtp' }
  }

  if (process.env.RESEND_API_KEY) {
    const result = await sendResendEmail({ from, to, subject, html, text, idempotencyKey, replyTo })
    return { ...result, provider: 'resend' }
  }

  throw new Error('missing_email_config')
}

export async function sendPosingEmailReliable(payload) {
  try {
    return await sendPosingEmail(payload)
  } catch (error) {
    if (!payload.text) throw error
    const { text: _text, ...withoutText } = payload
    return await sendPosingEmail(withoutText)
  }
}

export { buildConfirmationEmail, buildPaymentEmail } from '../email/templates.js'

export async function findBookablePackage(supabase, userId, planKey) {
  const now = new Date().toISOString()

  const { data: pending } = await supabase
    .from('user_packages')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .eq('status', 'pending_payment')
    .limit(1)
    .maybeSingle()

  if (pending) {
    return { mode: 'blocked_pending' }
  }

  const { data: activePackages } = await supabase
    .from('user_packages')
    .select('id, sessions_total, sessions_used, period_end')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .eq('status', 'active')
    .gt('period_end', now)
    .order('created_at', { ascending: false })

  const activeWithRoom = (activePackages ?? []).find((p) => p.sessions_used < p.sessions_total)

  if (activeWithRoom) {
    return {
      mode: 'use_existing',
      userPackage: activeWithRoom,
      remaining: activeWithRoom.sessions_total - activeWithRoom.sessions_used,
    }
  }

  return { mode: 'new_purchase' }
}

export async function activatePackagePayment(
  supabase,
  { bookingId, userPackageId, paymentRef, paymentMethod = 'stripe', confirmedBy = null },
) {
  const now = new Date().toISOString()

  const { data: booking } = await supabase
    .from('posing_bookings')
    .select('id, status, user_package_id')
    .eq('id', bookingId)
    .maybeSingle()

  if (!booking) return { ok: false, error: 'booking_not_found' }
  if (booking.status === 'confirmed') return { ok: true, already: true }
  if (booking.status !== 'pending_payment') {
    return { ok: false, error: 'invalid_booking_status' }
  }

  const packageId = userPackageId ?? booking.user_package_id
  if (!packageId) return { ok: false, error: 'missing_package' }

  const { data: userPackage } = await supabase
    .from('user_packages')
    .select('id, status')
    .eq('id', packageId)
    .maybeSingle()

  if (!userPackage) return { ok: false, error: 'package_not_found' }
  if (userPackage.status !== 'pending_payment' && userPackage.status !== 'active') {
    return { ok: false, error: 'invalid_package_status' }
  }

  const pkgUpdate = {
    status: 'active',
    stripe_payment_id: paymentRef,
    sessions_used: 1,
    updated_at: now,
  }
  if (paymentMethod) pkgUpdate.payment_method = paymentMethod
  if (confirmedBy) pkgUpdate.confirmed_by = confirmedBy

  let { error: pkgError } = await supabase
    .from('user_packages')
    .update(pkgUpdate)
    .eq('id', packageId)

  if (pkgError && /payment_method|confirmed_by/.test(pkgError.message)) {
    const fallbackUpdate = {
      status: 'active',
      stripe_payment_id: paymentRef,
      sessions_used: 1,
      updated_at: now,
    }
    ;({ error: pkgError } = await supabase
      .from('user_packages')
      .update(fallbackUpdate)
      .eq('id', packageId))
  }

  if (pkgError) return { ok: false, error: pkgError.message }

  const { error: bookError } = await supabase
    .from('posing_bookings')
    .update({
      status: 'confirmed',
      stripe_session_id: paymentRef,
      updated_at: now,
    })
    .eq('id', bookingId)

  if (bookError) return { ok: false, error: bookError.message }

  return { ok: true }
}

export async function cancelPosingBooking(supabase, { bookingId, userId, allowAdmin = false }) {
  const { data: booking, error } = await supabase
    .from('posing_bookings')
    .select('id, user_id, status, user_package_id, slot:availability_slots(start_at)')
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !booking) return { ok: false, error: 'booking_not_found' }
  if (!allowAdmin && booking.user_id !== userId) return { ok: false, error: 'forbidden' }
  if (booking.status === 'cancelled') return { ok: true, already: true }
  if (booking.status === 'completed' || booking.status === 'cancelled') {
    return { ok: false, error: 'cannot_cancel' }
  }

  const now = new Date()
  const nowIso = now.toISOString()
  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
  const slotStart = slot?.start_at ? new Date(slot.start_at) : null

  if (booking.status === 'confirmed') {
    if (!slotStart || slotStart <= now) {
      return { ok: false, error: 'cannot_cancel' }
    }

    if (booking.user_package_id) {
      const { data: userPackage } = await supabase
        .from('user_packages')
        .select('sessions_used')
        .eq('id', booking.user_package_id)
        .maybeSingle()

      if (userPackage) {
        await supabase
          .from('user_packages')
          .update({
            sessions_used: Math.max(0, userPackage.sessions_used - 1),
            updated_at: nowIso,
          })
          .eq('id', booking.user_package_id)
      }
    }
  }

  if (booking.status === 'pending_payment' && booking.user_package_id) {
    await supabase
      .from('user_packages')
      .update({ status: 'cancelled', updated_at: nowIso })
      .eq('id', booking.user_package_id)
      .eq('status', 'pending_payment')
  }

  const { error: cancelError } = await supabase
    .from('posing_bookings')
    .update({ status: 'cancelled', updated_at: nowIso })
    .eq('id', bookingId)

  if (cancelError) return { ok: false, error: cancelError.message }

  return { ok: true }
}
