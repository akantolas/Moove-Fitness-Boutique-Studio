import { createHmac, timingSafeEqual } from 'node:crypto'
import { sendPaidConfirmationEmail } from '../email/sendPaidConfirmation.js'
import { activatePackagePayment, getSupabaseAdmin, json, readRawBody } from './_lib.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

function verifyStripeSignature(payload, signatureHeader, secret) {
  if (!secret || !signatureHeader) return false
  const parts = signatureHeader.split(',').reduce((acc, part) => {
    const [key, value] = part.split('=')
    if (key && value) acc[key] = value
    return acc
  }, {})
  const timestamp = parts.t
  const signature = parts.v1
  if (!timestamp || !signature) return false

  const signed = `${timestamp}.${payload}`
  const expected = createHmac('sha256', secret).update(signed).digest('hex')
  try {
    const a = Buffer.from(expected, 'utf8')
    const b = Buffer.from(signature, 'utf8')
    return a.length === b.length && timingSafeEqual(a, b)
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature']

  if (secret && !verifyStripeSignature(rawBody, signature, secret)) {
    return json(res, 400, { ok: false, error: 'invalid_signature' })
  }

  let event
  try {
    event = JSON.parse(rawBody)
  } catch {
    return json(res, 400, { ok: false, error: 'invalid_json' })
  }

  if (event.type !== 'checkout.session.completed') {
    return json(res, 200, { ok: true, skipped: true })
  }

  const session = event.data?.object
  const bookingId = session?.metadata?.booking_id
  const userPackageId = session?.metadata?.user_package_id

  if (!bookingId || !userPackageId) {
    return json(res, 200, { ok: true, skipped: true, reason: 'missing_metadata' })
  }

  const supabase = getSupabaseAdmin()
  const result = await activatePackagePayment(supabase, {
    bookingId,
    userPackageId,
    paymentRef: session.id,
    paymentMethod: 'stripe',
  })

  if (!result.ok) {
    return json(res, 500, { ok: false, error: result.error })
  }

  if (!result.already) {
    try {
      await sendPaidConfirmationEmail(bookingId)
    } catch (error) {
      console.error('stripe webhook paid confirmation email error:', error)
    }
  }

  return json(res, 200, { ok: true, already: result.already ?? false })
}
