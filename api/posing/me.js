import {
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
} from '../_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  try {
    const user = await getUserFromRequest(req)
    if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

    const supabase = getSupabaseAdmin()
    const isAdmin = await ensureAdmin(user)

    const [packagesRes, bookingsRes, profileRes] = await Promise.all([
      supabase
        .from('user_packages')
        .select('id, plan_key, sessions_total, sessions_used, status, period_start, period_end, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase
        .from('posing_bookings')
        .select(
          'id, plan_key, status, created_at, slot:availability_slots(start_at, end_at)',
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false }),
      supabase.from('profiles').select('full_name, email, role').eq('id', user.id).maybeSingle(),
    ])

    if (packagesRes.error || bookingsRes.error) {
      return json(res, 500, { ok: false, error: packagesRes.error?.message ?? bookingsRes.error?.message ?? 'fetch_failed' })
    }

    const packages = (packagesRes.data ?? []).map((p) => ({
      ...p,
      sessions_remaining: Math.max(0, p.sessions_total - p.sessions_used),
    }))

    return json(res, 200, {
      ok: true,
      profile: profileRes.data ?? { email: user.email },
      isAdmin,
      packages,
      bookings: bookingsRes.data ?? [],
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    return json(res, 500, { ok: false, error: message })
  }
}
