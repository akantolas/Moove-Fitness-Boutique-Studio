import { cors, ensureAdmin, getSupabaseAdmin, getUserFromRequest, json, readJsonBody } from '../../_lib.js'
import { CATALOG_PRICES_EUR, PLAN_KEYS } from '../../_pricing.js'

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
    let pricesByUser = new Map()

    if (memberIds.length > 0) {
      const [{ data: packages }, { data: bookings }, { data: planPrices }] = await Promise.all([
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
        supabase
          .from('profile_plan_prices')
          .select('user_id, plan_key, price_eur, note, updated_at')
          .in('user_id', memberIds),
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

      for (const row of planPrices ?? []) {
        const list = pricesByUser.get(row.user_id) ?? []
        list.push({
          plan_key: row.plan_key,
          price_eur: row.price_eur,
          note: row.note,
          catalog_price_eur: CATALOG_PRICES_EUR[row.plan_key] ?? null,
          updated_at: row.updated_at,
        })
        pricesByUser.set(row.user_id, list)
      }
    }

    const enriched = memberList.map((member) => ({
      ...member,
      user_packages: packagesByUser.get(member.id) ?? [],
      recent_bookings: bookingsByUser.get(member.id) ?? [],
      plan_prices: pricesByUser.get(member.id) ?? [],
    }))

    return json(res, 200, { ok: true, members: enriched })
  }

  if (req.method === 'PATCH') {
    let body
    try {
      body = await readJsonBody(req)
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_json' })
    }

    const userId = body.user_id
    const planKey = body.plan_key
    const priceEur = Math.round(Number(body.price_eur))
    const note = typeof body.note === 'string' ? body.note.trim() : null

    if (!userId || !planKey || !PLAN_KEYS.includes(planKey)) {
      return json(res, 400, { ok: false, error: 'invalid_payload' })
    }
    if (!priceEur || priceEur <= 0) {
      return json(res, 400, { ok: false, error: 'invalid_price' })
    }

    const { data: member } = await supabase
      .from('profiles')
      .select('id')
      .eq('id', userId)
      .maybeSingle()

    if (!member) return json(res, 404, { ok: false, error: 'member_not_found' })

    const now = new Date().toISOString()
    const { data: row, error } = await supabase
      .from('profile_plan_prices')
      .upsert(
        {
          user_id: userId,
          plan_key: planKey,
          price_eur: priceEur,
          note: note || null,
          updated_at: now,
        },
        { onConflict: 'user_id,plan_key' },
      )
      .select('plan_key, price_eur, note, updated_at')
      .single()

    if (error) return json(res, 500, { ok: false, error: error.message })

    return json(res, 200, {
      ok: true,
      plan_price: {
        ...row,
        catalog_price_eur: CATALOG_PRICES_EUR[planKey] ?? null,
      },
    })
  }

  if (req.method === 'DELETE') {
    const memberId = req.query?.id
    const planKey = req.query?.plan_key

    if (planKey && typeof planKey === 'string') {
      if (!memberId || typeof memberId !== 'string') {
        return json(res, 400, { ok: false, error: 'missing_id' })
      }
      if (!PLAN_KEYS.includes(planKey)) {
        return json(res, 400, { ok: false, error: 'invalid_plan_key' })
      }

      const { error } = await supabase
        .from('profile_plan_prices')
        .delete()
        .eq('user_id', memberId)
        .eq('plan_key', planKey)

      if (error) return json(res, 500, { ok: false, error: error.message })
      return json(res, 200, { ok: true })
    }
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
