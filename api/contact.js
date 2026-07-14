import {
  cors,
  hasEmailTransportConfig,
  json,
  readJsonBody,
  sendPosingEmail,
} from './posing/_lib.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const MAX_NAME = 120
const MAX_EMAIL = 254
const MAX_MESSAGE = 4000
const DEFAULT_FROM = 'Moove <noreply@moovefitness.gr>'
const DEFAULT_NOTIFY = 'info@moovefitness.gr'

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function trimField(value, maxLen) {
  return String(value ?? '').trim().slice(0, maxLen)
}

function envOrFallback(key, fallback) {
  const value = process.env[key]?.trim()
  return value || fallback
}

function getContactFromEmail() {
  return envOrFallback('CONTACT_FROM_EMAIL', DEFAULT_FROM)
}

function getContactNotifyEmail() {
  return envOrFallback(
    'CONTACT_NOTIFY_EMAIL',
    envOrFallback('POSE_NOTIFY_EMAIL', DEFAULT_NOTIFY),
  )
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  if (!hasEmailTransportConfig()) {
    return json(res, 503, { ok: false, error: 'missing_email_config' })
  }

  try {
    const body = await readJsonBody(req)

    // Honeypot — bots fill hidden fields; pretend success.
    if (trimField(body._gotcha, 200)) {
      return json(res, 200, { ok: true })
    }

    const name = trimField(body.name, MAX_NAME)
    const email = trimField(body.email, MAX_EMAIL).toLowerCase()
    const message = trimField(body.message, MAX_MESSAGE)

    if (!name || !email || !message) {
      return json(res, 400, { ok: false, error: 'missing_fields' })
    }
    if (!EMAIL_RE.test(email)) {
      return json(res, 400, { ok: false, error: 'invalid_email' })
    }

    const notifyEmail = getContactNotifyEmail()
    const fromEmail = getContactFromEmail()

    const safeName = escapeHtml(name)
    const safeEmail = escapeHtml(email)
    const safeMessage = escapeHtml(message).replace(/\n/g, '<br/>')

    await sendPosingEmail({
      from: fromEmail,
      to: [notifyEmail],
      replyTo: email,
      subject: `Νέο μήνυμα επικοινωνίας — ${name}`,
      html: `<!DOCTYPE html><html><body style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto;padding:24px;">
        <p><strong>Όνομα:</strong> ${safeName}</p>
        <p><strong>Email:</strong> <a href="mailto:${safeEmail}">${safeEmail}</a></p>
        <p><strong>Μήνυμα:</strong></p>
        <p style="white-space:pre-wrap;">${safeMessage}</p>
      </body></html>`,
    })

    return json(res, 200, { ok: true })
  } catch (error) {
    const detail = error instanceof Error ? error.message : String(error)
    console.error('contact email error:', detail)
    if (error instanceof Error && error.stack) {
      console.error(error.stack)
    }
    return json(res, 500, { ok: false, error: 'send_failed' })
  }
}
