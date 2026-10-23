import { createHmac, timingSafeEqual } from 'node:crypto'
import { sendLatePaymentEmails } from '../../lib/email/sendLatePaymentEmails.js'
import { sendPaidConfirmationEmail } from '../../lib/email/sendPaidConfirmation.js'
import { generateAndSendNutritionPlan } from '../nutrition/_lib.js'
import {
  activateProgramPurchase,
  normalizeBookingLocale,
  sendProgramAccessFlowEmail,
} from '../programs/_lib.js'
import {
  activatePackagePayment,
  getSupabaseAdmin,
  json,
  readRawBody,
} from './_lib.js'

export const config = {
  api: {
    bodyParser: false,
  },
}

/** Stripe's own libraries reject events signed more than 5 minutes ago. */
export const STRIPE_SIGNATURE_TOLERANCE_SECONDS = 300

export function verifyStripeSignature(
  payload,
  signatureHeader,
  secret,
  nowSeconds = Date.now() / 1000,
) {
  if (!secret || !signatureHeader) return false
  let timestamp = null
  const signatures = []
  for (const part of signatureHeader.split(',')) {
    const [key, value] = part.split('=')
    if (key === 't') timestamp = value
    // Stripe sends one v1 per active secret while a secret is being rolled.
    if (key === 'v1' && value) signatures.push(value)
  }
  if (!timestamp || signatures.length === 0) return false
  if (
    !Number.isFinite(Number(timestamp)) ||
    Math.abs(nowSeconds - Number(timestamp)) > STRIPE_SIGNATURE_TOLERANCE_SECONDS
  ) {
    return false
  }

  const signed = `${timestamp}.${payload}`
  const expected = Buffer.from(
    createHmac('sha256', secret).update(signed).digest('hex'),
    'utf8',
  )
  return signatures.some((signature) => {
    const candidate = Buffer.from(signature, 'utf8')
    return (
      candidate.length === expected.length &&
      timingSafeEqual(candidate, expected)
    )
  })
}

async function handleProgramWithNutritionCheckout(supabase, session) {
  const purchaseId = session?.metadata?.purchase_id
  const nutritionOrderId = session?.metadata?.nutrition_order_id
  if (!purchaseId || !nutritionOrderId) {
    return { handled: false, reason: 'missing_metadata' }
  }

  const locale = normalizeBookingLocale(session?.metadata?.locale)

  const programResult = await activateProgramPurchase(supabase, {
    purchaseId,
    paymentRef: session.id,
    paymentMethod: 'stripe',
    includeNutrition: true,
    nutritionOrderId,
  })

  if (!programResult.ok) {
    return { handled: true, ok: false, error: programResult.error }
  }

  const nutritionOrder = programResult.nutritionOrders.find(
    (order) => order.id === nutritionOrderId,
  )

  if (
    programResult.purchase &&
    (!programResult.purchase.access_email_sent_at ||
      programResult.purchase.delivery_status === 'failed')
  ) {
    try {
      await sendProgramAccessFlowEmail(programResult.purchase, locale, {
        supabase,
      })
      await supabase
        .from('moove_program_purchases')
        .update({
          access_email_sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchaseId)
    } catch (error) {
      console.error('stripe webhook bundled program email failed:', {
        purchaseId,
        error,
      })
    }
  }

  if (
    nutritionOrder &&
    (!nutritionOrder.plan_email_sent_at ||
      nutritionOrder.delivery_status === 'failed')
  ) {
    try {
      await generateAndSendNutritionPlan(supabase, nutritionOrder, locale)
    } catch (error) {
      console.error('stripe webhook bundled nutrition plan failed:', {
        nutritionOrderId,
        error,
      })
    }
  }

  return { handled: true, ok: true }
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

  if (
    result.purchase &&
    (!result.purchase.access_email_sent_at ||
      result.purchase.delivery_status === 'failed')
  ) {
    try {
      await sendProgramAccessFlowEmail(result.purchase, locale, { supabase })
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
  if (req.method !== 'POST')
    return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const secret = process.env.STRIPE_WEBHOOK_SECRET
  const rawBody = await readRawBody(req)
  const signature = req.headers['stripe-signature']

  if (!secret)
    return json(res, 503, { ok: false, error: 'stripe_not_configured' })
  if (!verifyStripeSignature(rawBody, signature, secret)) {
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

  const productType = session?.metadata?.product_type

  if (productType === 'program_with_nutrition') {
    const bundledResult = await handleProgramWithNutritionCheckout(
      supabase,
      session,
    )
    if (bundledResult.handled) {
      if (!bundledResult.ok) {
        return json(res, 500, { ok: false, error: bundledResult.error })
      }
      return json(res, 200, { ok: true, type: 'program_with_nutrition' })
    }
  }

  if (productType === 'moove_program') {
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
    return json(res, 200, {
      ok: true,
      skipped: true,
      reason: 'missing_metadata',
    })
  }

  const result = await activatePackagePayment(supabase, {
    bookingId,
    userPackageId,
    paymentRef: session.id,
    paymentMethod: 'stripe',
    paidAt: Number.isFinite(event.created)
      ? new Date(event.created * 1000).toISOString()
      : null,
  })

  if (!result.ok) {
    return json(res, 500, { ok: false, error: result.error })
  }

  if (!result.already) {
    const sendEmail = result.credit_only
      ? sendLatePaymentEmails
      : sendPaidConfirmationEmail
    const emailResult = await sendEmail(bookingId, {
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
