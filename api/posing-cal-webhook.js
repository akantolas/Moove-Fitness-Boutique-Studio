/**
 * Vercel serverless: Cal.com BOOKING_CREATED → payment + prep email via Resend.
 *
 * @see docs/posing-booking-setup.md
 *
 * Env (Vercel → Project → Settings → Environment Variables):
 *   CAL_WEBHOOK_SECRET
 *   RESEND_API_KEY
 *   POSE_FROM_EMAIL       — e.g. Move & Pose <bookings@moovefitness.gr>
 *   POSE_NOTIFY_EMAIL     — copy to coach, e.g. info@moovefitness.gr
 *   STRIPE_LINK_SINGLE
 *   STRIPE_LINK_SAPPHIRE
 *   STRIPE_LINK_RUBY
 *   STRIPE_LINK_DIAMOND
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

export const config = {
  api: {
    bodyParser: false,
  },
}

const PACKAGE_KEYS = ['single', 'sapphire', 'ruby', 'diamond']
const PACKAGE_NAMES = {
  single: ['1 Posing Session', '1 posing session'],
  sapphire: ['Sapphire'],
  ruby: ['Ruby'],
  diamond: ['Diamond'],
}

const EMAIL_COPY = {
  el: {
    subject: 'Move & Pose — επιβεβαίωση κράτησης & πληρωμή',
    greeting: (name) => `Γεια σου ${name},`,
    intro: 'Η κράτησή σου για online posing coaching έχει καταχωρηθεί.',
    session: 'Ημερομηνία & ώρα',
    package: 'Πακέτο',
    payTitle: 'Ολοκλήρωσε την πληρωμή',
    payBody:
      'Η συνεδρία επιβεβαιώνεται μετά την πληρωμή. Παρακαλούμε ολοκλήρωσε την πληρωμή εντός 24 ωρών πριν τη συνεδρία.',
    payButton: 'Πληρωμή μέσω Stripe',
    prepTitle: 'Προετοιμασία για τη συνεδρία',
    prepItems: [
      'Σταθερό internet',
      'Κάμερα (κινητό ή laptop)',
      'Χώρος για κίνηση',
      'Optional: posing trunks / competition wear',
    ],
    calNote:
      'Θα λάβεις και το email επιβεβαίωσης από το Cal.com με τον σύνδεσμο της online συνεδρίας.',
    footer: 'Move & Pose — The Posing Academy',
    notifySubject: (name) => `Νέα κράτηση Move & Pose — ${name}`,
    notifyIntro: 'Νέα κράτηση posing coaching:',
  },
  en: {
    subject: 'Move & Pose — booking confirmation & payment',
    greeting: (name) => `Hi ${name},`,
    intro: 'Your online posing coaching slot has been reserved.',
    session: 'Date & time',
    package: 'Package',
    payTitle: 'Complete your payment',
    payBody:
      'Your session is confirmed after payment. Please complete payment within 24 hours before the session.',
    payButton: 'Pay with Stripe',
    prepTitle: 'Session preparation',
    prepItems: [
      'Stable internet',
      'Camera (phone or laptop)',
      'Space to move',
      'Optional: posing trunks / competition wear',
    ],
    calNote:
      'You will also receive a Cal.com confirmation email with the online session link.',
    footer: 'Move & Pose — The Posing Academy',
    notifySubject: (name) => `New Move & Pose booking — ${name}`,
    notifyIntro: 'New posing coaching booking:',
  },
}

const PACKAGE_FEATURES = {
  single: {
    el: ['Μία online posing συνεδρία.'],
    en: ['One online posing session.'],
  },
  sapphire: {
    el: [
      '15 min launch call',
      "1:1 posing session 30' ανά δύο εβδομάδες",
      'Check-ins & feedback ανά δύο εβδομάδες',
    ],
    en: [
      '15 min launch call',
      "Fortnightly 1:1 posing sessions 30'",
      'Fortnightly check-ins & feedback',
    ],
  },
  ruby: {
    el: [
      '15 min launch call',
      "Εβδομαδιαία 1:1 posing sessions 30'",
      'Εβδομαδιαία check-ins & feedback',
    ],
    en: [
      '15 min launch call',
      "Weekly 1:1 posing sessions 30'",
      'Weekly check-ins & feedback',
    ],
  },
  diamond: {
    el: [
      '15 min launch call',
      "Εβδομαδιαία 1:1 posing sessions 40'",
      'Εβδομαδιαία check-ins & feedback',
      'Stage presence & heels technique',
    ],
    en: [
      '15 min launch call',
      "Weekly 1:1 posing sessions 40'",
      'Weekly check-ins & feedback',
      'Stage presence & heels technique',
    ],
  },
}

function readRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = []
    req.on('data', (chunk) => chunks.push(chunk))
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
    req.on('error', reject)
  })
}

function verifySignature(secret, rawBody, signatureHeader) {
  if (!secret || !signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signatureHeader, 'utf8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function normalizePackageKey(value) {
  if (!value || typeof value !== 'string') return null
  const key = value.trim().toLowerCase()
  if (PACKAGE_KEYS.includes(key)) return key

  for (const [packageKey, names] of Object.entries(PACKAGE_NAMES)) {
    if (names.some((name) => name.toLowerCase() === key)) return packageKey
  }
  return null
}

function extractPackageKey(payload) {
  const metadata = payload?.metadata ?? {}
  const fromMetadata = normalizePackageKey(metadata.packageKey)
  if (fromMetadata) return { key: fromMetadata, source: 'metadata' }

  const responses = payload?.responses ?? {}
  const userFields = payload?.userFieldsResponses ?? {}

  for (const bucket of [responses, userFields]) {
    for (const [fieldKey, field] of Object.entries(bucket)) {
      const value =
        typeof field === 'string'
          ? field
          : field && typeof field === 'object' && 'value' in field
            ? field.value
            : null
      if (!value) continue
      const normalized = normalizePackageKey(String(value))
      if (normalized) return { key: normalized, source: fieldKey }
      if (fieldKey.toLowerCase().includes('package') || fieldKey === 'package') {
        const byName = normalizePackageKey(String(value))
        if (byName) return { key: byName, source: fieldKey }
      }
    }
  }

  const notes = payload?.additionalNotes ?? responses?.notes?.value ?? ''
  const notesMatch = String(notes).match(/packageKey[=:]\s*(\w+)/i)
  if (notesMatch) {
    const fromNotes = normalizePackageKey(notesMatch[1])
    if (fromNotes) return { key: fromNotes, source: 'notes' }
  }

  return { key: 'single', source: 'default' }
}

function resolveLocale(payload) {
  const metadataLocale = payload?.metadata?.locale
  if (metadataLocale === 'el' || metadataLocale === 'en') return metadataLocale
  const attendeeLocale = payload?.attendees?.[0]?.language?.locale
  if (typeof attendeeLocale === 'string' && attendeeLocale.startsWith('el')) return 'el'
  return 'en'
}

function formatSessionTime(startTime, locale) {
  if (!startTime) return '—'
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

function packageDisplayName(packageKey, metadataName, locale) {
  if (metadataName && typeof metadataName === 'string') return metadataName
  const names = PACKAGE_NAMES[packageKey] ?? PACKAGE_NAMES.single
  return names[0]
}

function stripeLinkForPackage(packageKey) {
  const envMap = {
    single: process.env.STRIPE_LINK_SINGLE,
    sapphire: process.env.STRIPE_LINK_SAPPHIRE,
    ruby: process.env.STRIPE_LINK_RUBY,
    diamond: process.env.STRIPE_LINK_DIAMOND,
  }
  return envMap[packageKey] ?? envMap.single ?? ''
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
}

function buildCustomerEmail({ attendeeName, attendeeEmail, packageKey, packageName, sessionTime, stripeLink, locale }) {
  const copy = EMAIL_COPY[locale] ?? EMAIL_COPY.en
  const features = PACKAGE_FEATURES[packageKey]?.[locale] ?? PACKAGE_FEATURES.single.en
  const featureList = features.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const prepList = copy.prepItems.map((item) => `<li>${escapeHtml(item)}</li>`).join('')
  const paySection = stripeLink
    ? `<p style="margin:16px 0 8px;">${escapeHtml(copy.payBody)}</p>
       <p style="margin:20px 0;">
         <a href="${escapeHtml(stripeLink)}" style="display:inline-block;background:#c026d3;color:#fff;padding:12px 24px;border-radius:999px;text-decoration:none;font-weight:600;">
           ${escapeHtml(copy.payButton)}
         </a>
       </p>`
    : `<p style="margin:16px 0;color:#b45309;">Payment link not configured — we will contact you shortly.</p>`

  return `<!DOCTYPE html>
<html lang="${locale}">
  <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#111;max-width:560px;margin:0 auto;padding:24px;">
    <p>${escapeHtml(copy.greeting(attendeeName))}</p>
    <p>${escapeHtml(copy.intro)}</p>
    <table style="width:100%;border-collapse:collapse;margin:20px 0;">
      <tr><td style="padding:8px 0;color:#666;">${escapeHtml(copy.session)}</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(sessionTime)}</td></tr>
      <tr><td style="padding:8px 0;color:#666;">${escapeHtml(copy.package)}</td><td style="padding:8px 0;font-weight:600;">${escapeHtml(packageName)}</td></tr>
    </table>
    <ul style="margin:0 0 20px;padding-left:20px;">${featureList}</ul>
    <h2 style="font-size:18px;margin:24px 0 8px;">${escapeHtml(copy.payTitle)}</h2>
    ${paySection}
    <h2 style="font-size:18px;margin:24px 0 8px;">${escapeHtml(copy.prepTitle)}</h2>
    <ul style="margin:0 0 20px;padding-left:20px;">${prepList}</ul>
    <p style="color:#666;font-size:14px;">${escapeHtml(copy.calNote)}</p>
    <p style="color:#999;font-size:12px;margin-top:32px;">${escapeHtml(copy.footer)}</p>
  </body>
</html>`
}

function buildNotifyEmail({ attendeeName, attendeeEmail, packageKey, packageName, sessionTime, stripeLink, locale, bookingUid }) {
  const copy = EMAIL_COPY[locale] ?? EMAIL_COPY.en
  return `<!DOCTYPE html>
<html lang="${locale}">
  <body style="font-family:system-ui,sans-serif;line-height:1.6;color:#111;max-width:560px;margin:0 auto;padding:24px;">
    <p>${escapeHtml(copy.notifyIntro)}</p>
    <ul style="padding-left:20px;">
      <li><strong>Name:</strong> ${escapeHtml(attendeeName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(attendeeEmail)}</li>
      <li><strong>Package:</strong> ${escapeHtml(packageName)} (${escapeHtml(packageKey)})</li>
      <li><strong>Session:</strong> ${escapeHtml(sessionTime)}</li>
      <li><strong>Booking UID:</strong> ${escapeHtml(bookingUid)}</li>
      ${stripeLink ? `<li><strong>Stripe:</strong> <a href="${escapeHtml(stripeLink)}">${escapeHtml(stripeLink)}</a></li>` : ''}
    </ul>
  </body>
</html>`
}

async function sendResendEmail({ from, to, subject, html, idempotencyKey }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    throw new Error('missing_resend_api_key')
  }

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

export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    return res.status(204).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'method_not_allowed' })
  }

  const secret = process.env.CAL_WEBHOOK_SECRET
  const rawBody = await readRawBody(req)
  const signature = req.headers['x-cal-signature-256']

  if (secret && !verifySignature(secret, rawBody, signature)) {
    return res.status(401).json({ ok: false, error: 'invalid_signature' })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return res.status(400).json({ ok: false, error: 'invalid_json' })
  }

  if (event.triggerEvent !== 'BOOKING_CREATED') {
    return res.status(200).json({ ok: true, skipped: true, reason: 'ignored_event' })
  }

  const payload = event.payload ?? {}
  const attendee = payload.attendees?.[0]
  const attendeeEmail = attendee?.email
  const attendeeName = attendee?.name ?? attendee?.firstName ?? 'there'

  if (!attendeeEmail) {
    return res.status(400).json({ ok: false, error: 'missing_attendee_email' })
  }

  const { key: packageKey, source: packageSource } = extractPackageKey(payload)
  const locale = resolveLocale(payload)
  const packageName = packageDisplayName(packageKey, payload.metadata?.packageName, locale)
  const sessionTime = formatSessionTime(payload.startTime, locale)
  const stripeLink = stripeLinkForPackage(packageKey)
  const bookingUid = payload.uid ?? String(payload.bookingId ?? Date.now())

  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <onboarding@resend.dev>'
  const notifyEmail = process.env.POSE_NOTIFY_EMAIL

  try {
    await sendResendEmail({
      from,
      to: [attendeeEmail],
      subject: EMAIL_COPY[locale]?.subject ?? EMAIL_COPY.en.subject,
      html: buildCustomerEmail({
        attendeeName,
        attendeeEmail,
        packageKey,
        packageName,
        sessionTime,
        stripeLink,
        locale,
      }),
      idempotencyKey: `posing-customer-${bookingUid}`,
    })

    if (notifyEmail) {
      await sendResendEmail({
        from,
        to: [notifyEmail],
        subject: (EMAIL_COPY[locale] ?? EMAIL_COPY.en).notifySubject(attendeeName),
        html: buildNotifyEmail({
          attendeeName,
          attendeeEmail,
          packageKey,
          packageName,
          sessionTime,
          stripeLink,
          locale,
          bookingUid,
        }),
        idempotencyKey: `posing-notify-${bookingUid}`,
      })
    }

    return res.status(200).json({
      ok: true,
      bookingUid,
      packageKey,
      packageSource,
      locale,
      emailed: true,
    })
  } catch (error) {
    console.error('posing-cal-webhook error:', error)
    return res.status(500).json({
      ok: false,
      error: error instanceof Error ? error.message : 'email_failed',
    })
  }
}
