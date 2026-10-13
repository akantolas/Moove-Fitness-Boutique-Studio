/**
 * Shared helpers for Move & Pose Vercel API routes.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { createClient } from '@supabase/supabase-js'
import { PLAN_KEYS } from './_pricing.js'
import { runPosingTransaction } from './_transactions.js'

let localEnvLoaded = false

function parseEnvValue(raw) {
  let val = raw.trim()
  if (
    (val.startsWith('"') && val.endsWith('"')) ||
    (val.startsWith("'") && val.endsWith("'"))
  ) {
    val = val.slice(1, -1)
  }
  return val
}

/** Load `.env.local` when API runs outside Vercel (e.g. `vercel dev` missed vars). */
function ensureLocalEnvLoaded() {
  if (localEnvLoaded) return
  localEnvLoaded = true

  const file = join(process.cwd(), '.env.local')
  if (!existsSync(file)) return

  for (const raw of readFileSync(file, 'utf8').split(/\r?\n/)) {
    const line = raw.trim()
    if (!line || line.startsWith('#')) continue
    const eq = line.indexOf('=')
    if (eq <= 0) continue
    const key = line.slice(0, eq).trim()
    if (process.env[key]) continue
    process.env[key] = parseEnvValue(line.slice(eq + 1))
  }
}

ensureLocalEnvLoaded()

export const PACKAGE_KEYS = PLAN_KEYS

const STRIPE_LINK_ENV = {
  single: 'STRIPE_LINK_SINGLE',
  sapphire: 'STRIPE_LINK_SAPPHIRE',
  ruby: 'STRIPE_LINK_RUBY',
  diamond: 'STRIPE_LINK_DIAMOND',
  ruby_july8: 'STRIPE_LINK_RUBY_JULY8',
  diamond_july8: 'STRIPE_LINK_DIAMOND_JULY8',
}

export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY
  if (!url || !key) {
    throw new Error('missing_supabase_admin_config')
  }
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
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
  ruby_july8: 'STRIPE_PRICE_RUBY_JULY8',
  diamond_july8: 'STRIPE_PRICE_DIAMOND_JULY8',
}

export async function createStripeCheckoutUrl({
  planKey,
  bookingId,
  userPackageId,
  customerEmail,
  locale = 'el',
  amountEur = null,
  packageName = 'Move & Pose',
  useDynamicPrice = false,
}) {
  const secret = process.env.STRIPE_SECRET_KEY
  const priceEnv = STRIPE_PRICE_ENV[planKey] ?? STRIPE_PRICE_ENV.single
  const priceId = process.env[priceEnv]
  const resolvedAmount =
    amountEur != null ? Math.round(Number(amountEur)) : null
  const needsDynamic = useDynamicPrice || !priceId

  if (!secret || (needsDynamic && (!resolvedAmount || resolvedAmount <= 0))) {
    return { url: stripeLinkForPackage(planKey), sessionId: null }
  }

  const successUrl =
    process.env.POSE_SUCCESS_URL ??
    'https://moovefitness.gr/posing?payment=success'
  const cancelUrl =
    process.env.POSE_CANCEL_URL ?? 'https://moovefitness.gr/posing#booking'

  const params = new URLSearchParams()
  params.set('mode', 'payment')
  if (needsDynamic && resolvedAmount) {
    params.set('line_items[0][price_data][currency]', 'eur')
    params.set(
      'line_items[0][price_data][unit_amount]',
      String(resolvedAmount * 100),
    )
    params.set('line_items[0][price_data][product_data][name]', packageName)
  } else if (priceId) {
    params.set('line_items[0][price]', priceId)
  } else {
    return { url: stripeLinkForPackage(planKey), sessionId: null }
  }
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
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, PATCH, DELETE, OPTIONS',
  )
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

/** Resolve catch-all route key from Vercel query or request URL pathname. */
export function resolveApiPath(req, basePrefix) {
  const fromQuery = req.query?.path
  if (fromQuery !== undefined && fromQuery !== null && fromQuery !== '') {
    const segments = Array.isArray(fromQuery) ? fromQuery : [fromQuery]
    const joined = segments
      .map((s) => String(s).trim())
      .filter(Boolean)
      .join('/')
    if (joined) return joined
  }

  const rawUrl = String(req.url ?? '')
  const pathname = rawUrl.split('?')[0]
  const normalizedPrefix = basePrefix.endsWith('/')
    ? basePrefix
    : `${basePrefix}/`
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

export async function sendResendEmail({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
  replyTo,
  attachments,
}) {
  const apiKey = process.env.RESEND_API_KEY?.trim()
  if (!apiKey) throw new Error('missing_resend_api_key')

  const recipients = (Array.isArray(to) ? to : [to])
    .map((entry) => String(entry).trim())
    .filter(Boolean)
  if (!recipients.length) throw new Error('missing_resend_recipients')

  const resendAttachments = (attachments ?? []).map((file) => ({
    filename: file.filename,
    content:
      typeof file.content === 'string' &&
      /^[A-Za-z0-9+/=\r\n]+$/.test(file.content.trim())
        ? file.content.trim()
        : Buffer.from(file.content, 'utf8').toString('base64'),
    ...(file.contentType
      ? { content_type: file.contentType.split(';')[0].trim() }
      : {}),
  }))

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
      ...(resendAttachments.length ? { attachments: resendAttachments } : {}),
    }),
  })

  if (!response.ok) {
    const body = await response.text()
    throw new Error(`resend_failed:${response.status}:${body}`)
  }
  return response.json()
}

function getSmtpConfig() {
  ensureLocalEnvLoaded()
  const user = process.env.SMTP_USER ?? process.env.SMTP_EMAIL
  const pass = process.env.SMTP_PASS ?? process.env.SMTP_PASSWORD
  if (!user || !pass) return null

  return {
    host: process.env.SMTP_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT ?? 587),
    secure:
      process.env.SMTP_SECURE === 'true' ||
      Number(process.env.SMTP_PORT ?? 587) === 465,
    auth: { user, pass },
  }
}

export function hasEmailTransportConfig() {
  return Boolean(getSmtpConfig() || process.env.RESEND_API_KEY?.trim())
}

export async function sendPosingEmail({
  from,
  to,
  subject,
  html,
  text,
  idempotencyKey,
  replyTo,
  attachments,
}) {
  const smtp = getSmtpConfig()
  if (smtp) {
    const nodemailer = await import('nodemailer')
    const transporter = nodemailer.createTransport(smtp)
    const recipients = Array.isArray(to) ? to : [to]
    await transporter.sendMail({
      from:
        from ??
        process.env.POSE_FROM_EMAIL ??
        'Move & Pose <info@moovefitness.gr>',
      to: recipients.join(', '),
      subject,
      html,
      ...(text ? { text: String(text) } : {}),
      ...(replyTo ? { replyTo } : {}),
      ...(attachments?.length
        ? {
            attachments: attachments.map((file) => ({
              filename: file.filename,
              content: file.content,
              contentType: file.contentType,
            })),
          }
        : {}),
    })
    return { ok: true, provider: 'smtp' }
  }

  if (process.env.RESEND_API_KEY?.trim()) {
    const result = await sendResendEmail({
      from,
      to,
      subject,
      html,
      text,
      idempotencyKey,
      replyTo,
      attachments,
    })
    return { ...result, provider: 'resend' }
  }

  throw new Error('missing_email_config')
}

export async function sendPosingEmailReliable(payload) {
  try {
    return await sendPosingEmail(payload)
  } catch (error) {
    if (payload.text) {
      const { text: _text, ...withoutText } = payload
      try {
        return await sendPosingEmail(withoutText)
      } catch (retryError) {
        if (!payload.attachments?.length) throw retryError
      }
    }
    if (payload.attachments?.length) {
      const { attachments: _attachments, ...withoutAttachments } = payload
      return await sendPosingEmail(withoutAttachments)
    }
    throw error
  }
}

export {
  buildConfirmationEmail,
  buildPaymentEmail,
} from '../../lib/email/templates.js'

export async function findBookablePackage(supabase, userId, planKey) {
  const now = new Date().toISOString()

  const { data: pending } = await supabase
    .from('user_packages')
    .select('id')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .eq('status', 'pending_payment')
    .gt('period_end', now)
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

  const activeWithRoom = (activePackages ?? []).find(
    (p) => p.sessions_used < p.sessions_total,
  )

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
  {
    bookingId,
    userPackageId,
    paymentRef,
    paymentMethod = 'stripe',
    confirmedBy = null,
    paidAt = null,
  },
) {
  return runPosingTransaction(supabase, 'posing_activate_payment', {
    p_booking_id: bookingId,
    p_package_id: userPackageId ?? null,
    p_payment_ref: paymentRef,
    p_method: paymentMethod,
    p_actor_id: confirmedBy,
    p_paid_at: paidAt ?? undefined,
  })
}

export async function cancelPosingBooking(
  supabase,
  { bookingId, userId, allowAdmin = false },
) {
  return runPosingTransaction(supabase, 'posing_cancel_booking', {
    p_booking_id: bookingId,
    p_user_id: userId,
    p_allow_admin: allowAdmin,
  })
}

export function isBookingCancellable(
  { status, slotStartAt },
  now = new Date(),
) {
  if (status === 'cancelled' || status === 'completed') return false
  if (status === 'pending_payment') return true
  if (status === 'confirmed') {
    if (!slotStartAt) return false
    return new Date(slotStartAt) > now
  }
  return false
}

export function isPackageCancellable(status) {
  return status === 'pending_payment' || status === 'active'
}

export async function getCancellableBookingsForPackage(
  supabase,
  packageId,
  now = new Date(),
) {
  const { data: bookings, error } = await supabase
    .from('posing_bookings')
    .select('id, status, slot:availability_slots(start_at)')
    .eq('user_package_id', packageId)
    .in('status', ['pending_payment', 'confirmed'])

  if (error) throw new Error(error.message)

  return (bookings ?? []).filter((booking) => {
    const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
    return isBookingCancellable(
      { status: booking.status, slotStartAt: slot?.start_at },
      now,
    )
  })
}

export async function cancelUserPackage(supabase, { packageId, actorId }) {
  return runPosingTransaction(supabase, 'posing_cancel_package', {
    p_package_id: packageId,
    p_actor_id: actorId,
  })
}
