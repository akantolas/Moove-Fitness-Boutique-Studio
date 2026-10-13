import {
  readJsonBody,
  ensureAdmin,
  getUserFromRequest,
} from '../../../posing/_lib.js'
import {
  activateNutritionOrder,
  cors,
  formatNutritionOrderRef,
  generateAndSendNutritionPlan,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
} from '../../_lib.js'
import {
  activateProgramPurchase,
  sendProgramAccessFlowEmail,
} from '../../../programs/_lib.js'
import { parsePagination } from '../../../_pagination.js'

export async function handleAdminNutritionOrders(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user)))
    return json(res, 403, { ok: false, error: 'forbidden' })
  const supabase = getSupabaseAdmin()
  try {
    if (req.method === 'POST') {
      const body = await readJsonBody(req)
      const orderId = body.order_id ?? body.orderId
      if (!orderId || typeof orderId !== 'string')
        return json(res, 400, { ok: false, error: 'missing_order_id' })
      const { data: order, error } = await supabase
        .from('nutrition_plan_orders')
        .select('*')
        .eq('id', orderId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!order) return json(res, 404, { ok: false, error: 'order_not_found' })
      if (body.action === 'confirm') {
        if (!['pending_payment', 'paid'].includes(order.status))
          return json(res, 409, { ok: false, error: 'invalid_order_status' })
        let result,
          programFailed = false
        if (order.program_purchase_id) {
          const { data: purchase, error: purchaseError } = await supabase
            .from('moove_program_purchases')
            .select('id,status')
            .eq('id', order.program_purchase_id)
            .maybeSingle()
          if (purchaseError) throw new Error(purchaseError.message)
          if (purchase?.status === 'pending_payment') {
            const bundle = await activateProgramPurchase(supabase, {
              purchaseId: purchase.id,
              paymentRef: 'manual:' + user.id + ':' + Date.now(),
              paymentMethod: 'manual',
              confirmedBy: user.id,
              includeNutrition: true,
            })
            if (!bundle.ok) return json(res, 409, bundle)
            try {
              await sendProgramAccessFlowEmail(
                bundle.purchase,
                normalizeBookingLocale(bundle.purchase.locale),
                { supabase },
              )
            } catch {
              programFailed = true
            }
            result = {
              ok: true,
              already: false,
              order: bundle.nutritionOrders.find((n) => n.id === order.id),
            }
          }
        }
        if (!result)
          result = await activateNutritionOrder(supabase, {
            nutritionOrderId: orderId,
            paymentRef: 'manual:' + user.id + ':' + Date.now(),
            paymentMethod: 'manual',
            confirmedBy: user.id,
          })
        if (!result.ok) return json(res, 409, result)
        let delivered = { ok: true }
        if (
          !result.order?.plan_email_sent_at ||
          result.order.delivery_status === 'failed'
        ) {
          try {
            delivered = await generateAndSendNutritionPlan(
              supabase,
              result.order,
              normalizeBookingLocale(order.locale),
            )
          } catch {
            delivered = { ok: false }
          }
        }
        return json(res, 200, {
          ok: true,
          already: result.already,
          payment_confirmed: true,
          delivery_failed: !delivered.ok || programFailed,
        })
      }
      if (body.action === 'resend') {
        if (!['paid', 'generation_failed'].includes(order.status))
          return json(res, 409, { ok: false, error: 'not_paid' })
        const delivered = await generateAndSendNutritionPlan(
          supabase,
          order,
          normalizeBookingLocale(order.locale),
          { resend: true },
        )
        return json(
          res,
          delivered.ok ? 200 : 502,
          delivered.ok ? { ok: true } : { ok: false, error: 'delivery_failed' },
        )
      }
      return json(res, 400, { ok: false, error: 'invalid_action' })
    }
    if (req.method !== 'GET')
      return json(res, 405, { ok: false, error: 'method_not_allowed' })
    const view = req.query?.view
    if (view === 'preview') {
      const orderId = req.query?.order_id
      if (!orderId)
        return json(res, 400, { ok: false, error: 'missing_order_id' })
      const { data: order, error } = await supabase
        .from('nutrition_plan_orders')
        .select('pdf_storage_path')
        .eq('id', orderId)
        .maybeSingle()
      if (error) throw new Error(error.message)
      if (!order?.pdf_storage_path)
        return json(res, 404, { ok: false, error: 'pdf_not_found' })
      const signed = await supabase.storage
        .from('nutrition-pdfs')
        .createSignedUrl(order.pdf_storage_path, 3600)
      if (signed.error) throw new Error(signed.error.message)
      return json(res, 200, { ok: true, url: signed.data.signedUrl })
    }
    if (!['payments', 'orders'].includes(view))
      return json(res, 400, { ok: false, error: 'invalid_view' })
    const pagination = parsePagination(req.query)
    let query = supabase
      .from('nutrition_plan_orders')
      .select('*', { count: 'exact' })
      .in(
        'status',
        view === 'payments'
          ? ['pending_payment']
          : ['paid', 'generation_failed'],
      )
      .order('created_at', { ascending: false })
    if (view === 'orders') query = query.range(pagination.from, pagination.to)
    const { data, count, error } = await query
    if (error) throw new Error(error.message)
    const rows = data ?? []
    const parentIds = rows.map((o) => o.program_purchase_id).filter(Boolean)
    const parents = parentIds.length
      ? await supabase
          .from('moove_program_purchases')
          .select('id,status,amount_eur')
          .in('id', parentIds)
      : { data: [] }
    if (parents.error) throw new Error(parents.error.message)
    const enriched = rows.map((o) => {
      const parent = parents.data?.find((p) => p.id === o.program_purchase_id)
      return {
        id: o.id,
        email: o.email,
        amount_eur: o.amount_eur,
        status: o.status,
        purchase_type: o.purchase_type,
        program_key: o.program_key,
        created_at: o.created_at,
        order_ref: formatNutritionOrderRef(o.id),
        payment_method: o.payment_method,
        plan_email_sent_at: o.plan_email_sent_at,
        delivery_status: o.delivery_status,
        responses: o.responses,
        has_pdf: Boolean(o.pdf_storage_path),
        confirms_bundle: parent?.status === 'pending_payment',
        total_amount_eur:
          Number(o.amount_eur) +
          (parent?.status === 'pending_payment'
            ? Number(parent.amount_eur)
            : 0),
      }
    })
    return json(res, 200, {
      ok: true,
      [view === 'payments' ? 'payments' : 'orders']: enriched,
      total: count ?? 0,
      page: pagination.page,
      pageSize: pagination.pageSize,
    })
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'operation_failed',
    })
  }
}
