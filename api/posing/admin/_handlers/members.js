import { cors, ensureAdmin, getSupabaseAdmin, getUserFromRequest, json } from '../../_lib.js'

const PROFILE_SELECT = 'id, full_name, email, phone, division, role, avatar_url, created_at, updated_at'

export async function handleAdminMembers(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data: members, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .order('created_at', { ascending: false })

    if (error) return json(res, 500, { ok: false, error: error.message })

    const memberList = members ?? []
    const memberIds = memberList.map((m) => m.id)

    let packagesByUser = new Map()
    let bookingsByUser = new Map()

    if (memberIds.length > 0) {
      const [{ data: packages }, { data: bookings }] = await Promise.all([
        supabase
          .from('user_packages')
          .select('id, user_id, plan_key, status, sessions_total, sessions_used, created_at')
          .in('user_id', memberIds)
          .order('created_at', { ascending: false }),
        supabase
          .from('posing_bookings')
          .select('id, user_id, status, plan_key, created_at, slot:availability_slots(start_at)')
          .in('user_id', memberIds)
          .order('created_at', { ascending: false })
          .limit(200),
      ])

      for (const pkg of packages ?? []) {
        const list = packagesByUser.get(pkg.user_id) ?? []
        list.push(pkg)
        packagesByUser.set(pkg.user_id, list)
      }

      for (const booking of bookings ?? []) {
        const list = bookingsByUser.get(booking.user_id) ?? []
        if (list.length < 3) {
          list.push({
            ...booking,
            slot: Array.isArray(booking.slot) ? booking.slot[0] ?? null : booking.slot,
          })
          bookingsByUser.set(booking.user_id, list)
        }
      }
    }

    const enriched = memberList.map((member) => ({
      ...member,
      user_packages: packagesByUser.get(member.id) ?? [],
      recent_bookings: bookingsByUser.get(member.id) ?? [],
    }))

    return json(res, 200, { ok: true, members: enriched })
  }

  if (req.method === 'DELETE') {
    const memberId = req.query?.id
    if (!memberId || typeof memberId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }

    if (memberId === user.id) {
      return json(res, 403, { ok: false, error: 'cannot_delete_self' })
    }

    const { data: target } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', memberId)
      .maybeSingle()

    if (!target) return json(res, 404, { ok: false, error: 'member_not_found' })
    if (target.role === 'admin') {
      return json(res, 403, { ok: false, error: 'cannot_delete_admin' })
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(memberId)
    if (deleteError) {
      return json(res, 500, { ok: false, error: deleteError.message })
    }

    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'method_not_allowed' })
}
