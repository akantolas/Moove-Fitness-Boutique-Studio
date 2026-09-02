import { readJsonBody, ensureAdmin, getUserFromRequest, hasEmailTransportConfig } from '../../../posing/_lib.js'
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

async function fetchPendingProgramPayments(supabase) {
  const { data, error } = await supabase
    .from('moove_program_purchases')
    .select('*')
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)
  return data ?? []
}

async function fetchRecentPaidPurchases(supabase) {
  const { data, error } = await supabase
    .from('moove_program_purchases')
    .select('*')
    .eq('status', 'paid')
    .order('created_at', { ascending: false })
    .limit(50)

  if (error) throw new Error(error.message)
  return data ?? []
}

export async function handleAdminPrograms(req, res) {
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

      if (action === 'confirm') {
        const purchaseId = body?.purchase_id
        if (!purchaseId || typeof purchaseId !== 'string') {
          return json(res, 400, { ok: false, error: 'missing_purchase_id' })
        }

        const { data: existing } = await supabase
          .from('moove_program_purchases')
          .select('locale, status, access_email_sent_at')
          .eq('id', purchaseId)
          .maybeSingle()

        if (!existing) return json(res, 404, { ok: false, error: 'purchase_not_found' })

        const emailStillPending = !existing.access_email_sent_at
        const isPendingPayment = existing.status === 'pending_payment'

        if (emailStillPending && !hasEmailTransportConfig()) {
          return json(res, 503, { ok: false, error: 'missing_email_config' })
        }

        let result
        if (isPendingPayment) {
          const paymentRef = `manual:${user.id}:${Date.now()}`
          result = await activateProgramPurchase(supabase, {
            purchaseId,
            paymentRef,
            paymentMethod: 'manual',
            confirmedBy: user.id,
          })
        } else if (existing.status === 'paid' && emailStillPending) {
          const { data: paidPurchase } = await supabase
            .from('moove_program_purchases')
            .select('*')
            .eq('id', purchaseId)
            .maybeSingle()
          if (!paidPurchase) return json(res, 404, { ok: false, error: 'purchase_not_found' })
          result = { ok: true, already: true, purchase: paidPurchase }
        } else if (existing.status === 'paid') {
          return json(res, 200, { ok: true, already: true })
        } else {
          return json(res, 409, { ok: false, error: 'invalid_purchase_status' })
        }

        if (!result.ok) {
          const status = result.error === 'invalid_purchase_status' ? 409 : 500
          return json(res, status, { ok: false, error: result.error })
        }

        if (emailStillPending && result.purchase) {
          const locale = normalizeBookingLocale(existing.locale)
          try {
            await sendProgramAccessFlowEmail(result.purchase, locale)
            await supabase
              .from('moove_program_purchases')
              .update({
                access_email_sent_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              })
              .eq('id', purchaseId)
          } catch (emailError) {
            const emailMessage = emailError instanceof Error ? emailError.message : 'email_failed'
            return json(res, 502, {
              ok: false,
              error:
                emailMessage === 'missing_email_config'
                  ? 'missing_email_config'
                  : 'payment_confirmed_email_failed',
              email_sent: false,
            })
          }
        }

        return json(res, 200, { ok: true, already: result.already ?? false, email_sent: emailStillPending })
      }

      if (action === 'resend-access') {
        const purchaseId = body?.purchase_id
        if (!purchaseId || typeof purchaseId !== 'string') {
          return json(res, 400, { ok: false, error: 'missing_purchase_id' })
        }

        const { data: purchase } = await supabase
          .from('moove_program_purchases')
          .select('*')
          .eq('id', purchaseId)
          .maybeSingle()

        if (!purchase) return json(res, 404, { ok: false, error: 'purchase_not_found' })
        if (purchase.status !== 'paid' || !purchase.access_token) {
          return json(res, 400, { ok: false, error: 'not_paid' })
        }

        if (!hasEmailTransportConfig()) {
          return json(res, 503, { ok: false, error: 'missing_email_config' })
        }

        const locale = normalizeBookingLocale(purchase.locale)
        await sendProgramAccessFlowEmail(purchase, locale)
        await supabase
          .from('moove_program_purchases')
          .update({
            access_email_sent_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', purchaseId)

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
      const payments = await fetchPendingProgramPayments(supabase)
      const enriched = payments.map((p) => ({
        id: p.id,
        program_key: p.program_key,
        email: p.email,
        amount_eur: p.amount_eur,
        status: p.status,
        created_at: p.created_at,
        purchase_ref: formatPurchaseRef(p.id),
        program_name: getProgramName(p.program_key, p.locale),
      }))
      return json(res, 200, { ok: true, payments: enriched })
    }

    if (view === 'purchases') {
      const purchases = await fetchRecentPaidPurchases(supabase)
      const enriched = purchases.map((p) => ({
        id: p.id,
        program_key: p.program_key,
        email: p.email,
        amount_eur: p.amount_eur,
        status: p.status,
        payment_method: p.payment_method,
        created_at: p.created_at,
        purchase_ref: formatPurchaseRef(p.id),
        program_name: getProgramName(p.program_key, p.locale),
        access_email_sent_at: p.access_email_sent_at,
      }))
      return json(res, 200, { ok: true, purchases: enriched })
    }

    return json(res, 400, { ok: false, error: 'invalid_view' })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    return json(res, 500, { ok: false, error: message })
  }
}
