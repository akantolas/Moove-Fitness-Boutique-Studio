import {
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  readJsonBody,
} from '../../_lib.js'
import { runPosingTransaction } from '../../_transactions.js'

export async function handleAdminSlots(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user)))
    return json(res, 403, { ok: false, error: 'forbidden' })
  const supabase = getSupabaseAdmin()
  try {
    if (req.method === 'GET') {
      const { from, to } = req.query ?? {}
      if (
        !from ||
        !to ||
        !Number.isFinite(Date.parse(from)) ||
        !Number.isFinite(Date.parse(to)) ||
        Date.parse(from) >= Date.parse(to)
      ) {
        return json(res, 400, { ok: false, error: 'invalid_date_range' })
      }
      const { data: slots, error } = await supabase
        .from('availability_slots')
        .select('id,start_at,end_at,is_blocked')
        .is('archived_at', null)
        .gte('start_at', from)
        .lt('start_at', to)
        .order('start_at', { ascending: true })
      if (error) throw new Error(error.message)
      const slotIds = (slots ?? []).map((s) => s.id)
      if (!slotIds.length) return json(res, 200, { ok: true, slots: [] })
      const bookingsResult = await supabase
        .from('posing_bookings')
        .select('id,slot_id,status,plan_key,user_id,duration_minutes')
        .in('slot_id', slotIds)
        .neq('status', 'cancelled')
      if (bookingsResult.error) throw new Error(bookingsResult.error.message)
      const bookings = bookingsResult.data ?? []
      const userIds = [...new Set(bookings.map((b) => b.user_id))]
      const profilesResult = userIds.length
        ? await supabase
            .from('profiles')
            .select('id,full_name,email')
            .in('id', userIds)
        : { data: [] }
      if (profilesResult.error) throw new Error(profilesResult.error.message)
      const profiles = new Map(
        (profilesResult.data ?? []).map((p) => [p.id, p]),
      )
      const bySlot = new Map(
        bookings.map((b) => [
          b.slot_id,
          { ...b, profiles: profiles.get(b.user_id) ?? null },
        ]),
      )
      return json(res, 200, {
        ok: true,
        slots: slots.map((s) => {
          const booking = bySlot.get(s.id) ?? null
          return {
            ...s,
            booking,
            end_at: booking?.duration_minutes
              ? new Date(
                  Date.parse(s.start_at) + booking.duration_minutes * 60000,
                ).toISOString()
              : s.end_at,
          }
        }),
      })
    }
    let action, entries
    if (req.method === 'POST') {
      const body = await readJsonBody(req)
      action = body.action ?? 'create'
      if (!['create', 'archive'].includes(action))
        return json(res, 400, { ok: false, error: 'invalid_action' })
      entries = body.slots ?? [body]
    } else if (req.method === 'PATCH') {
      const body = await readJsonBody(req)
      if (!body.id || typeof body.is_blocked !== 'boolean')
        return json(res, 400, { ok: false, error: 'missing_fields' })
      action = 'block'
      entries = [body]
    } else if (req.method === 'DELETE') {
      if (!req.query?.id)
        return json(res, 400, { ok: false, error: 'missing_id' })
      action = 'archive'
      entries = [{ id: req.query.id }]
    } else return json(res, 405, { ok: false, error: 'method_not_allowed' })
    const result = await runPosingTransaction(supabase, 'posing_edit_slots', {
      p_actor_id: user.id,
      p_action: action,
      p_entries: entries,
    })
    return json(
      res,
      result.ok ? (action === 'create' ? 201 : 200) : 409,
      result,
    )
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'operation_failed',
    })
  }
}
