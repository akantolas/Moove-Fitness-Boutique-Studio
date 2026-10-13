import { cors, getSupabaseAdmin, json, PACKAGE_KEYS } from '../_lib.js'
import { requirePosingTransaction } from '../_transactions.js'

export async function handleSlots(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET')
    return json(res, 405, { ok: false, error: 'method_not_allowed' })
  const { from, to, plan = 'single' } = req.query ?? {}
  if (
    !from ||
    !to ||
    !Number.isFinite(Date.parse(from)) ||
    !Number.isFinite(Date.parse(to)) ||
    Date.parse(from) >= Date.parse(to)
  ) {
    return json(res, 400, { ok: false, error: 'invalid_date_range' })
  }
  if (!PACKAGE_KEYS.includes(plan))
    return json(res, 400, { ok: false, error: 'invalid_plan' })
  try {
    const slots = await requirePosingTransaction(
      getSupabaseAdmin(),
      'posing_available_slots',
      {
        p_from: from,
        p_to: to,
        p_plan_key: plan,
      },
    )
    return json(res, 200, { ok: true, slots })
  } catch (error) {
    return json(res, 503, {
      ok: false,
      error: error instanceof Error ? error.message : 'slots_fetch_failed',
    })
  }
}
