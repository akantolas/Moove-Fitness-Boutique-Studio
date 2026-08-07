import mealLibrary from './_mealLibrary.json' with { type: 'json' }
import { calculateNutritionPlan } from './_engine.js'
import { buildWeeklyMealPlan } from './_matcher.js'
import { buildShoppingList } from './_shoppingList.js'
import { generateNutritionPdfBuffer } from './_pdf.js'
import {
  formatNutritionOrderRef,
  getNutritionPriceEur,
  getNutritionProductName,
  getStripeNutritionPriceId,
} from './_pricing.js'
import {
  cors,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
} from '../posing/_lib.js'
import { programsSuccessUrl, programsCancelUrl } from '../programs/_lib.js'
import {
  sendNutritionGenerationFailedEmail,
  sendNutritionPlanEmail,
} from '../../lib/email/sendNutritionEmails.js'

const ORDER_RATE_WINDOW_MS = 60 * 60 * 1000

export async function createCombinedStripeCheckout({
  programPurchaseId,
  nutritionOrderId,
  programKey,
  customerEmail,
  locale,
  programAmountCents,
  nutritionAmountEur,
  programName,
  programRef,
}) {
  const secret = process.env.STRIPE_SECRET_KEY
  const nutritionPriceId = getStripeNutritionPriceId()
  const resolvedProgramCents = Math.round(Number(programAmountCents))
  const resolvedNutrition = Math.round(Number(nutritionAmountEur))
  const nutritionProductName = getNutritionProductName(locale)

  if (!secret || resolvedProgramCents <= 0 || resolvedNutrition <= 0) {
    return { url: '', sessionId: null }
  }

  const params = new URLSearchParams()
  params.set('mode', 'payment')
  params.set('line_items[0][price_data][currency]', 'eur')
  params.set('line_items[0][price_data][unit_amount]', String(resolvedProgramCents))
  params.set('line_items[0][price_data][product_data][name]', programName)
  params.set('line_items[0][quantity]', '1')

  if (nutritionPriceId) {
    params.set('line_items[1][price]', nutritionPriceId)
    params.set('line_items[1][quantity]', '1')
  } else {
    params.set('line_items[1][price_data][currency]', 'eur')
    params.set('line_items[1][price_data][unit_amount]', String(resolvedNutrition * 100))
    params.set('line_items[1][price_data][product_data][name]', nutritionProductName)
    params.set('line_items[1][quantity]', '1')
  }

  params.set('success_url', programsSuccessUrl(programRef))
  params.set('cancel_url', programsCancelUrl())
  params.set('customer_email', customerEmail)
  params.set('metadata[product_type]', 'program_with_nutrition')
  params.set('metadata[purchase_id]', programPurchaseId)
  params.set('metadata[nutrition_order_id]', nutritionOrderId)
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

export async function countRecentNutritionOrders(supabase, email) {
  const since = new Date(Date.now() - ORDER_RATE_WINDOW_MS).toISOString()
  const { count } = await supabase
    .from('nutrition_plan_orders')
    .select('id', { count: 'exact', head: true })
    .eq('email', email.toLowerCase())
    .gte('created_at', since)
  return count ?? 0
}

export async function activateNutritionOrder(
  supabase,
  { nutritionOrderId, paymentRef, paymentMethod = 'stripe', confirmedBy = null },
) {
  const now = new Date().toISOString()

  const { data: order } = await supabase
    .from('nutrition_plan_orders')
    .select('*')
    .eq('id', nutritionOrderId)
    .maybeSingle()

  if (!order) return { ok: false, error: 'order_not_found' }
  if (order.status === 'paid') return { ok: true, already: true, order }
  if (order.status !== 'pending_payment') {
    return { ok: false, error: 'invalid_order_status' }
  }

  const update = {
    status: 'paid',
    payment_method: paymentMethod,
    stripe_session_id: paymentMethod === 'stripe' ? paymentRef : order.stripe_session_id,
    updated_at: now,
  }
  if (confirmedBy) update.confirmed_by = confirmedBy

  const { data: updated, error } = await supabase
    .from('nutrition_plan_orders')
    .update(update)
    .eq('id', nutritionOrderId)
    .eq('status', 'pending_payment')
    .select('*')
    .maybeSingle()

  if (error) return { ok: false, error: error.message }
  if (!updated) return { ok: false, error: 'activate_conflict' }

  return { ok: true, order: updated }
}

export async function uploadNutritionPdf(supabase, orderId, locale, pdfBuffer) {
  const path = `${orderId}/${locale}.pdf`
  const { error } = await supabase.storage.from('nutrition-pdfs').upload(path, pdfBuffer, {
    contentType: 'application/pdf',
    upsert: true,
  })
  if (error) {
    console.error('nutrition pdf upload failed:', error.message)
    return null
  }
  return path
}

export function buildNutritionPlanFromResponses(responses, locale = 'el') {
  const enriched = { ...responses, locale }
  const calculated = calculateNutritionPlan(enriched)
  const mealPlanResult = buildWeeklyMealPlan(mealLibrary, enriched, calculated)
  if (!mealPlanResult.ok) {
    return { ok: false, error: mealPlanResult.error, calculated }
  }
  const shoppingList = buildShoppingList(mealPlanResult, locale)
  return {
    ok: true,
    calculated,
    mealPlan: mealPlanResult,
    shoppingList,
  }
}

export async function generateAndSendNutritionPlan(supabase, order, locale) {
  const responses = order.responses ?? {}
  const plan = buildNutritionPlanFromResponses(responses, locale)

  if (!plan.ok) {
    await supabase
      .from('nutrition_plan_orders')
      .update({
        status: 'generation_failed',
        calculated: plan.calculated ?? null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', order.id)

    await sendNutritionGenerationFailedEmail({
      orderId: order.id,
      email: order.email,
      error: plan.error,
      locale,
    })
    return { ok: false, error: plan.error }
  }

  const pdfBuffer = await generateNutritionPdfBuffer({
    locale,
    responses,
    calculated: plan.calculated,
    mealPlan: plan.mealPlan,
    shoppingList: plan.shoppingList,
  })

  const storagePath = await uploadNutritionPdf(supabase, order.id, locale, pdfBuffer)

  await supabase
    .from('nutrition_plan_orders')
    .update({
      calculated: plan.calculated,
      meal_plan: plan.mealPlan,
      pdf_storage_path: storagePath,
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  const filename =
    locale === 'en' ? 'moove-nutrition-plan.pdf' : 'moove-diatrofiko-plan.pdf'

  await sendNutritionPlanEmail({
    email: order.email,
    locale,
    name: responses.name,
    pdfBuffer,
    filename,
    orderId: order.id,
  })

  await supabase
    .from('nutrition_plan_orders')
    .update({
      plan_email_sent_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', order.id)

  return { ok: true }
}

export {
  cors,
  json,
  getSupabaseAdmin,
  normalizeBookingLocale,
  formatNutritionOrderRef,
  getNutritionPriceEur,
}
