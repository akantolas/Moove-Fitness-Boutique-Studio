import { timingSafeEqual } from 'node:crypto'
import { buildAdminNewSignupEmail } from '../../../lib/email/templates.js'
import {
  cors,
  getSupabaseAdmin,
  json,
  readJsonBody,
  sendPosingEmailReliable,
} from '../_lib.js'

function readBearerSecret(req) {
  const auth = req.headers?.authorization ?? req.headers?.Authorization
  if (typeof auth === 'string' && auth.toLowerCase().startsWith('bearer ')) {
    return auth.slice(7).trim()
  }
  const headerSecret = req.headers?.['x-webhook-secret']
  return typeof headerSecret === 'string' ? headerSecret.trim() : ''
}

function secretsMatch(provided, expected) {
  if (!provided || !expected) return false
  try {
    const a = Buffer.from(provided, 'utf8')
    const b = Buffer.from(expected, 'utf8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function resolveProvider(authUser) {
  const identities = authUser?.identities
  if (Array.isArray(identities) && identities.length > 0) {
    const providers = identities.map((entry) => entry?.provider).filter(Boolean)
    if (providers.includes('google')) return 'google'
    if (providers.includes('email')) return 'email'
    return String(providers[0])
  }
  const provider = authUser?.app_metadata?.provider
  return typeof provider === 'string' && provider ? provider : 'email'
}

export async function handleSignupNotify(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const expectedSecret = process.env.POSE_SIGNUP_WEBHOOK_SECRET?.trim()
  if (!expectedSecret) {
    return json(res, 500, { ok: false, error: 'missing_webhook_secret' })
  }
  if (!secretsMatch(readBearerSecret(req), expectedSecret)) {
    return json(res, 401, { ok: false, error: 'unauthorized' })
  }

  const notifyEmail = process.env.POSE_NOTIFY_EMAIL?.trim()
  if (!notifyEmail) {
    return json(res, 200, { ok: true, skipped: true, reason: 'missing_notify_email' })
  }

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return json(res, 400, { ok: false, error: 'invalid_json' })
  }

  const record = body?.record ?? body
  const userId = record?.id
  const userEmail = typeof record?.email === 'string' ? record.email.trim() : ''
  const profileName =
    (typeof record?.full_name === 'string' && record.full_name.trim()) ||
    userEmail.split('@')[0] ||
    'there'

  if (!userId || typeof userId !== 'string') {
    return json(res, 400, { ok: false, error: 'missing_user_id' })
  }
  if (!userEmail) {
    return json(res, 200, { ok: true, skipped: true, reason: 'missing_email' })
  }
  if (record?.role === 'admin') {
    return json(res, 200, { ok: true, skipped: true, reason: 'admin_user' })
  }

  let provider = 'email'
  try {
    const supabase = getSupabaseAdmin()
    const { data, error } = await supabase.auth.admin.getUserById(userId)
    if (!error && data?.user) {
      provider = resolveProvider(data.user)
    }
  } catch (error) {
    console.error('signup notify provider lookup error:', error)
  }

  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'
  const email = buildAdminNewSignupEmail({
    profileName,
    userEmail,
    provider,
    locale: 'el',
  })

  try {
    await sendPosingEmailReliable({
      from,
      to: [notifyEmail],
      replyTo: userEmail,
      subject: email.subject,
      html: email.html,
      text: email.text,
      idempotencyKey: `posing-signup-notify-${userId}`,
    })
  } catch (error) {
    console.error('signup notify email error:', { userId, error })
    return json(res, 500, { ok: false, error: 'send_failed' })
  }

  return json(res, 200, { ok: true })
}
