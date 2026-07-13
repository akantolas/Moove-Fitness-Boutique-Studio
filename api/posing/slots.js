import { cors, getSupabaseAdmin, json } from './_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const from = req.query?.from
  const to = req.query?.to
  if (!from || !to) {
    return json(res, 400, { ok: false, error: 'missing_from_to' })
  }

  try {
    const supabase = getSupabaseAdmin()
    const { data: slots, error } = await supabase
      .from('availability_slots')
      .select('id, start_at, end_at, is_blocked')
      .gte('start_at', from)
      .lte('start_at', to)
      .eq('is_blocked', false)
      .order('start_at', { ascending: true })

    if (error) return json(res, 500, { ok: false, error: error.message })

    const slotIds = (slots ?? []).map((s) => s.id)
    let bookedIds = new Set()
    if (slotIds.length > 0) {
      const { data: bookings } = await supabase
        .from('posing_bookings')
        .select('slot_id')
        .in('slot_id', slotIds)
        .not('status', 'eq', 'cancelled')
      bookedIds = new Set((bookings ?? []).map((b) => b.slot_id))
    }

    const available = (slots ?? []).filter((s) => !bookedIds.has(s.id))
    return json(res, 200, { ok: true, slots: available })
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'server_error',
    })
  }
}
