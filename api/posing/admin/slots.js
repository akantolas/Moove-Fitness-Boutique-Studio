import {
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  readJsonBody,
} from '../_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const from = req.query?.from
    const to = req.query?.to
    if (!from || !to) {
      return json(res, 400, { ok: false, error: 'missing_from_to' })
    }

    const { data: slots, error } = await supabase
      .from('availability_slots')
      .select('id, start_at, end_at, is_blocked')
      .gte('start_at', from)
      .lte('start_at', to)
      .order('start_at', { ascending: true })

    if (error) return json(res, 500, { ok: false, error: error.message })

    const slotIds = (slots ?? []).map((s) => s.id)
    let bookingsBySlot = new Map()
    if (slotIds.length > 0) {
      const { data: bookings } = await supabase
        .from('posing_bookings')
        .select('id, slot_id, status, plan_key, user_id')
        .in('slot_id', slotIds)
        .not('status', 'eq', 'cancelled')

      const userIds = [...new Set((bookings ?? []).map((b) => b.user_id))]
      let profilesById = new Map()
      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id, full_name, email')
          .in('id', userIds)
        for (const p of profiles ?? []) {
          profilesById.set(p.id, p)
        }
      }

      for (const b of bookings ?? []) {
        bookingsBySlot.set(b.slot_id, {
          ...b,
          profiles: profilesById.get(b.user_id) ?? null,
        })
      }
    }

    const enriched = (slots ?? []).map((s) => ({
      ...s,
      booking: bookingsBySlot.get(s.id) ?? null,
    }))

    return json(res, 200, { ok: true, slots: enriched })
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const { start_at, end_at, is_blocked } = body
      if (!start_at || !end_at) {
        return json(res, 400, { ok: false, error: 'missing_times' })
      }

      const blocked = is_blocked === true

      const { data, error } = await supabase
        .from('availability_slots')
        .insert({ start_at, end_at, is_blocked: blocked })
        .select('id, start_at, end_at, is_blocked')
        .single()

      if (error) return json(res, 500, { ok: false, error: error.message })
      return json(res, 201, { ok: true, slot: data })
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_json' })
    }
  }

  if (req.method === 'PATCH') {
    try {
      const body = await readJsonBody(req)
      const { id, is_blocked } = body
      if (!id || typeof is_blocked !== 'boolean') {
        return json(res, 400, { ok: false, error: 'missing_fields' })
      }

      const { data: booking } = await supabase
        .from('posing_bookings')
        .select('id')
        .eq('slot_id', id)
        .not('status', 'eq', 'cancelled')
        .maybeSingle()

      if (booking) {
        return json(res, 409, { ok: false, error: 'slot_has_booking' })
      }

      const { data, error } = await supabase
        .from('availability_slots')
        .update({ is_blocked })
        .eq('id', id)
        .select('id, start_at, end_at, is_blocked')
        .single()

      if (error) return json(res, 500, { ok: false, error: error.message })
      return json(res, 200, { ok: true, slot: data })
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_json' })
    }
  }

  if (req.method === 'DELETE') {
    const slotId = req.query?.id
    if (!slotId) return json(res, 400, { ok: false, error: 'missing_id' })

    const { data: booking } = await supabase
      .from('posing_bookings')
      .select('id')
      .eq('slot_id', slotId)
      .not('status', 'eq', 'cancelled')
      .maybeSingle()

    if (booking) {
      return json(res, 409, { ok: false, error: 'slot_has_booking' })
    }

    const { error } = await supabase.from('availability_slots').delete().eq('id', slotId)
    if (error) return json(res, 500, { ok: false, error: error.message })
    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'method_not_allowed' })
}
