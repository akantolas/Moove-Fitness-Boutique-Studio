import { readJsonBody, ensureAdmin, getUserFromRequest } from '../../../posing/_lib.js'
import {
  activateNutritionOrder,
  cors,
  formatNutritionOrderRef,
  generateAndSendNutritionPlan,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
} from '../../_lib.js'
import { getPayPalUrl, getRevolutUrl } from '../../../posing/_pricing.js'

async function fetchPendingNutritionOrders(supabase) {
  const { data, error } = await supabase
    .from('nutrition_plan_orders')
    .select('*')
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

async function fetchRecentPaidNutritionOrders(supabase) {
  const { data, error } = await supabase
    .from('nutrition_plan_orders')
    .select('*')
    .in('status', ['paid', 'generation_failed'])
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function handleAdminNutritionOrders(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const action = body?.action
      const orderId = body?.order_id ?? body?.orderId

      if (!orderId || typeof orderId !== 'string') {
        return json(res, 400, { ok: false, error: 'missing_order_id' })
      }

      if (action === 'confirm') {
        const { data: existing } = await supabase
          .from('nutrition_plan_orders')
          .select('locale')
          .eq('id', orderId)
          .maybeSingle()

        if (!existing) return json(res, 404, { ok: false, error: 'order_not_found' })

        const paymentRef = `manual:${user.id}:${Date.now()}`
        const result = await activateNutritionOrder(supabase, {
          nutritionOrderId: orderId,
          paymentRef,
          paymentMethod: 'manual',
          confirmedBy: user.id,
        })

        if (!result.ok) {
          const status = result.error === 'invalid_order_status' ? 409 : 500
          return json(res, status, { ok: false, error: result.error })
        }

        if (!result.already && result.order) {
          const locale = normalizeBookingLocale(existing.locale)
          await generateAndSendNutritionPlan(supabase, result.order, locale)
        }

        return json(res, 200, { ok: true, already: result.already ?? false })
      }

      if (action === 'resend') {
        const { data: order } = await supabase
          .from('nutrition_plan_orders')
          .select('*')
          .eq('id', orderId)
          .maybeSingle()

        if (!order) return json(res, 404, { ok: false, error: 'order_not_found' })
        if (order.status !== 'paid' && order.status !== 'generation_failed') {
          return json(res, 400, { ok: false, error: 'not_paid' })
        }

        const locale = normalizeBookingLocale(order.locale)
        const genResult = await generateAndSendNutritionPlan(supabase, order, locale)
        if (!genResult.ok) {
          return json(res, 500, { ok: false, error: genResult.error })
        }

        return json(res, 200, { ok: true })
      }

      return json(res, 400, { ok: false, error: 'invalid_action' })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server_error'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const view = req.query?.view
  try {
    if (view === 'payments') {
      const orders = await fetchPendingNutritionOrders(supabase)
      const enriched = orders.map((o) => ({
        id: o.id,
        email: o.email,
        amount_eur: o.amount_eur,
        status: o.status,
        purchase_type: o.purchase_type,
        program_key: o.program_key,
        created_at: o.created_at,
        order_ref: formatNutritionOrderRef(o.id),
      }))
      return json(res, 200, { ok: true, payments: enriched })
    }

    if (view === 'orders') {
      const orders = await fetchRecentPaidNutritionOrders(supabase)
      const enriched = orders.map((o) => ({
        id: o.id,
        email: o.email,
        amount_eur: o.amount_eur,
        status: o.status,
        purchase_type: o.purchase_type,
        program_key: o.program_key,
        payment_method: o.payment_method,
        created_at: o.created_at,
        order_ref: formatNutritionOrderRef(o.id),
        plan_email_sent_at: o.plan_email_sent_at,
        responses: o.responses,
      }))
      return json(res, 200, { ok: true, orders: enriched })
    }

    if (view === 'preview') {
      const orderId = req.query?.order_id
      if (!orderId) return json(res, 400, { ok: false, error: 'missing_order_id' })

      const { data: order } = await supabase
        .from('nutrition_plan_orders')
        .select('pdf_storage_path')
        .eq('id', orderId)
        .maybeSingle()

      if (!order?.pdf_storage_path) {
        return json(res, 404, { ok: false, error: 'pdf_not_found' })
      }

      const { data: signed, error } = await supabase.storage
        .from('nutrition-pdfs')
        .createSignedUrl(order.pdf_storage_path, 3600)

      if (error) return json(res, 500, { ok: false, error: error.message })
      return json(res, 200, { ok: true, url: signed.signedUrl })
    }

    return json(res, 400, { ok: false, error: 'invalid_view' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    return json(res, 500, { ok: false, error: message })
  }
}
