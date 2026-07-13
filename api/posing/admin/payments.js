import { cors, ensureAdmin, getSupabaseAdmin, getUserFromRequest, json } from '../_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  const { data: bookings, error } = await supabase
    .from('posing_bookings')
    .select(
      'id, plan_key, status, created_at, user_id, user_package_id, slot:availability_slots(start_at, end_at), user_package:user_packages(id, status, sessions_total)',
    )
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  if (error) return json(res, 500, { ok: false, error: error.message })

  const userIds = [...new Set((bookings ?? []).map((b) => b.user_id))]
  let profilesById = new Map()
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, full_name, email, phone')
      .in('id', userIds)
    for (const p of profiles ?? []) {
      profilesById.set(p.id, p)
    }
  }

  const payments = (bookings ?? []).map((b) => ({
    ...b,
    profiles: profilesById.get(b.user_id) ?? null,
    slot: Array.isArray(b.slot) ? b.slot[0] ?? null : b.slot,
    user_package: Array.isArray(b.user_package) ? b.user_package[0] ?? null : b.user_package,
  }))

  return json(res, 200, { ok: true, payments })
}
