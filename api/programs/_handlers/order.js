import { readJsonBody } from '../../posing/_lib.js'
import {
  cors,
  countRecentOrders,
  createProgramStripeCheckout,
  findRecentPendingPurchase,
  formatPurchaseRef,
  getCatalogPriceCents,
  getCatalogPriceEur,
  getProgramName,
  getSupabaseAdmin,
  isValidProgramKey,
  json,
  normalizeBookingLocale,
} from './_lib.js'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function handleOrder(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  try {
    const body = await readJsonBody(req)
    const programKey = String(body?.programKey ?? body?.program_key ?? '').trim()
    const email = String(body?.email ?? '').trim().toLowerCase()
    const locale = normalizeBookingLocale(body?.locale)

    if (!isValidProgramKey(programKey)) {
      return json(res, 400, { ok: false, error: 'invalid_program' })
    }
    if (!email || !EMAIL_RE.test(email)) {
      return json(res, 400, { ok: false, error: 'invalid_email' })
    }

    const amountCents = getCatalogPriceCents(programKey)
    const amountEur = getCatalogPriceEur(programKey)
    if (!amountCents || !amountEur) {
      return json(res, 400, { ok: false, error: 'invalid_program' })
    }

    const supabase = getSupabaseAdmin()
    const recentCount = await countRecentOrders(supabase, email)
    if (recentCount >= 5) {
      return json(res, 429, { ok: false, error: 'rate_limit' })
    }

    let purchase = await findRecentPendingPurchase(supabase, email, programKey)
    if (!purchase) {
      const { data: inserted, error: insertError } = await supabase
        .from('moove_program_purchases')
        .insert({
          program_key: programKey,
          email,
          amount_eur: amountEur,
          locale,
          status: 'pending_payment',
        })
        .select('*')
        .single()

      if (insertError) {
        return json(res, 500, { ok: false, error: insertError.message })
      }
      purchase = inserted
    }

    const programName = getProgramName(programKey, locale)
    const checkout = await createProgramStripeCheckout({
      purchaseId: purchase.id,
      programKey,
      customerEmail: email,
      locale,
      amountCents,
      programName,
    })

    if (checkout.sessionId && checkout.sessionId !== purchase.stripe_session_id) {
      await supabase
        .from('moove_program_purchases')
        .update({
          stripe_session_id: checkout.sessionId,
          updated_at: new Date().toISOString(),
        })
        .eq('id', purchase.id)
    }

    if (!checkout.url) {
      return json(res, 503, { ok: false, error: 'stripe_unavailable' })
    }

    return json(res, 200, {
      ok: true,
      purchaseId: purchase.id,
      purchaseRef: formatPurchaseRef(purchase.id),
      status: purchase.status,
      checkoutUrl: checkout.url,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    console.error('programs order error:', message)
    return json(res, 500, { ok: false, error: message })
  }
}

export async function handleOrderStatus(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const ref = String(req.query?.ref ?? '').trim()
  if (!ref) return json(res, 400, { ok: false, error: 'missing_ref' })

  const supabase = getSupabaseAdmin()
  const { data: purchases } = await supabase
    .from('moove_program_purchases')
    .select('id, status, program_key, created_at')
    .order('created_at', { ascending: false })
    .limit(200)

  const purchase = (purchases ?? []).find((p) => formatPurchaseRef(p.id) === ref.toUpperCase())
  if (!purchase) return json(res, 404, { ok: false, error: 'not_found' })

  return json(res, 200, {
    ok: true,
    status: purchase.status,
    purchaseRef: formatPurchaseRef(purchase.id),
  })
}
