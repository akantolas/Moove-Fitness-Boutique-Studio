import {
  readJsonBody,
  ensureAdmin,
  getUserFromRequest,
} from '../../../posing/_lib.js'
import {
  activateProgramPurchase,
  cors,
  formatPurchaseRef,
  getProgramName,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
  sendProgramAccessFlowEmail,
} from '../../_lib.js'
import { generateAndSendNutritionPlan } from '../../../nutrition/_lib.js'
import { parsePagination } from '../../../_pagination.js'

export async function handleAdminPrograms(req, res) {
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
      const id = body.purchase_id
      if (!id || typeof id !== 'string')
        return json(res, 400, { ok: false, error: 'missing_purchase_id' })
      if (body.action === 'confirm') {
        const result = await activateProgramPurchase(supabase, {
          purchaseId: id,
          paymentRef: 'manual:' + user.id + ':' + Date.now(),
          paymentMethod: 'manual',
          confirmedBy: user.id,
          includeNutrition: true,
        })
        if (!result.ok) return json(res, 409, result)
        let failed = false
        if (
          !result.purchase.access_email_sent_at ||
          result.purchase.delivery_status === 'failed'
        ) {
          try {
            await sendProgramAccessFlowEmail(
              result.purchase,
              normalizeBookingLocale(result.purchase.locale),
              { supabase },
            )
          } catch {
            failed = true
          }
        }
        for (const order of result.nutritionOrders ?? []) {
          if (order.plan_email_sent_at && order.delivery_status !== 'failed')
            continue
          try {
            const delivered = await generateAndSendNutritionPlan(
              supabase,
              order,
              normalizeBookingLocale(order.locale),
            )
            if (!delivered.ok) failed = true
          } catch {
            failed = true
          }
        }
        return json(res, 200, {
          ok: true,
          already: result.already,
          payment_confirmed: true,
          delivery_failed: failed,
        })
      }
      if (body.action === 'resend-access') {
        const { data: purchase, error } = await supabase
          .from('moove_program_purchases')
          .select('*')
          .eq('id', id)
          .maybeSingle()
        if (error) throw new Error(error.message)
        if (!purchase)
          return json(res, 404, { ok: false, error: 'purchase_not_found' })
        if (purchase.status !== 'paid')
          return json(res, 409, { ok: false, error: 'not_paid' })
        await sendProgramAccessFlowEmail(
          purchase,
          normalizeBookingLocale(purchase.locale),
          { supabase, resend: true },
        )
        return json(res, 200, { ok: true })
      }
      return json(res, 400, { ok: false, error: 'invalid_action' })
    }
    if (req.method !== 'GET')
      return json(res, 405, { ok: false, error: 'method_not_allowed' })
    const view = req.query?.view
    if (!['payments', 'purchases'].includes(view))
      return json(res, 400, { ok: false, error: 'invalid_view' })
    const pagination = parsePagination(req.query)
    let query = supabase
      .from('moove_program_purchases')
      .select('*', { count: 'exact' })
      .eq('status', view === 'payments' ? 'pending_payment' : 'paid')
      .order('created_at', { ascending: false })
    if (view === 'purchases')
      query = query.range(pagination.from, pagination.to)
    const { data, count, error } = await query
    if (error) throw new Error(error.message)
    const rows = data ?? []
    const bundles = rows.length
      ? await supabase
          .from('nutrition_plan_orders')
          .select('program_purchase_id,amount_eur,status')
          .in(
            'program_purchase_id',
            rows.map((p) => p.id),
          )
          .neq('status', 'cancelled')
      : { data: [] }
    if (bundles.error) throw new Error(bundles.error.message)
    const enriched = rows.map((p) => {
      const linked = (bundles.data ?? []).filter(
        (n) => n.program_purchase_id === p.id,
      )
      const nutritionAmount = linked.reduce(
        (sum, n) => sum + Number(n.amount_eur),
        0,
      )
      return {
        id: p.id,
        program_key: p.program_key,
        email: p.email,
        amount_eur: p.amount_eur,
        status: p.status,
        created_at: p.created_at,
        purchase_ref: formatPurchaseRef(p.id),
        program_name: getProgramName(p.program_key, p.locale),
        payment_method: p.payment_method,
        access_email_sent_at: p.access_email_sent_at,
        delivery_status: p.delivery_status,
        includes_nutrition: linked.length > 0,
        total_amount_eur: Number(p.amount_eur) + nutritionAmount,
      }
    })
    return json(res, 200, {
      ok: true,
      [view === 'payments' ? 'payments' : 'purchases']: enriched,
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
