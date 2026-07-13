import { cors, ensureAdmin, getSupabaseAdmin, getUserFromRequest, json } from '../_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(weekStart.getDate() - weekStart.getDay() + (weekStart.getDay() === 0 ? -6 : 1))
  weekStart.setHours(0, 0, 0, 0)
  const weekEnd = new Date(weekStart)
  weekEnd.setDate(weekEnd.getDate() + 7)

  const [
    { count: membersCount },
    { count: pendingPayments },
    { count: activePackages },
    { data: weekBookings },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true })
      .neq('role', 'admin'),
    supabase
      .from('posing_bookings')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'pending_payment'),
    supabase
      .from('user_packages')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'active'),
    supabase
      .from('posing_bookings')
      .select('id, slot:availability_slots(start_at)')
      .in('status', ['confirmed', 'pending_payment']),
  ])

  const weekBookingsCount = (weekBookings ?? []).filter((b) => {
    const slot = Array.isArray(b.slot) ? b.slot[0] : b.slot
    if (!slot?.start_at) return false
    const start = new Date(slot.start_at)
    return start >= weekStart && start < weekEnd
  }).length

  return json(res, 200, {
    ok: true,
    stats: {
      members: membersCount ?? 0,
      pendingPayments: pendingPayments ?? 0,
      activePackages: activePackages ?? 0,
      weekBookings: weekBookingsCount,
    },
  })
}
