import { createHmac, timingSafeEqual } from 'node:crypto'
import { sendPaidConfirmationEmail } from '../../lib/email/sendPaidConfirmation.js'
import {
  activateProgramPurchase,
  normalizeBookingLocale,
  sendProgramAccessFlowEmail,
} from '../programs/_lib.js'
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

async function handleMooveProgramCheckout(supabase, session) {
  const purchaseId = session?.metadata?.purchase_id
  if (!purchaseId) {
    return { handled: false, reason: 'missing_purchase_id' }
  }

  const locale = normalizeBookingLocale(session?.metadata?.locale)
  const result = await activateProgramPurchase(supabase, {
    purchaseId,
    paymentRef: session.id,
    paymentMethod: 'stripe',
  })

  if (!result.ok) {
    return { handled: true, ok: false, error: result.error }
  }

  if (!result.already && result.purchase) {
    try {
      await sendProgramAccessFlowEmail(result.purchase, locale)
      await supabase
        .from('moove_program_purchases')
        .update({
          access_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchaseId)
    } catch (error) {
      console.error('stripe webhook program access email failed:', {
        purchaseId,
        error: error instanceof Error ? error.message : error,
      })
    }
  }

  return { handled: true, ok: true, already: result.already ?? false }
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
  const supabase = getSupabaseAdmin()

  if (session?.metadata?.product_type === 'moove_program') {
    const programResult = await handleMooveProgramCheckout(supabase, session)
    if (programResult.handled) {
      if (!programResult.ok) {
        return json(res, 500, { ok: false, error: programResult.error })
      }
      return json(res, 200, {
        ok: true,
        type: 'moove_program',
        already: programResult.already ?? false,
      })
    }
  }

  const bookingId = session?.metadata?.booking_id
  const userPackageId = session?.metadata?.user_package_id

  if (!bookingId || !userPackageId) {
    return json(res, 200, { ok: true, skipped: true, reason: 'missing_metadata' })
  }

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
    const emailResult = await sendPaidConfirmationEmail(bookingId, {
      locale: session?.metadata?.locale,
    })
    if (!emailResult.ok) {
      console.error('stripe webhook paid confirmation email failed:', {
        bookingId,
        error: emailResult.error,
      })
    }
  }

  return json(res, 200, { ok: true, already: result.already ?? false })
}
