import { sendPaidConfirmationEmail } from '../../email/sendPaidConfirmation.js'
import {
  activatePackagePayment,
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  readJsonBody,
} from '../_lib.js'

async function fetchOverviewStats(supabase) {
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

  return {
    members: membersCount ?? 0,
    pendingPayments: pendingPayments ?? 0,
    activePackages: activePackages ?? 0,
    weekBookings: weekBookingsCount,
  }
}

async function fetchPendingPayments(supabase) {
  const { data: bookings, error } = await supabase
    .from('posing_bookings')
    .select(
      'id, plan_key, status, created_at, user_id, user_package_id, slot:availability_slots(start_at, end_at), user_package:user_packages(id, status, sessions_total)',
    )
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })

  if (error) throw new Error(error.message)

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

  return (bookings ?? []).map((b) => ({
    ...b,
    profiles: profilesById.get(b.user_id) ?? null,
    slot: Array.isArray(b.slot) ? b.slot[0] ?? null : b.slot,
    user_package: Array.isArray(b.user_package) ? b.user_package[0] ?? null : b.user_package,
  }))
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const bookingId = body?.booking_id
      if (!bookingId || typeof bookingId !== 'string') {
        return json(res, 400, { ok: false, error: 'missing_booking_id' })
      }

      const { data: booking } = await supabase
        .from('posing_bookings')
        .select('id, status, user_package_id')
        .eq('id', bookingId)
        .maybeSingle()

      if (!booking) return json(res, 404, { ok: false, error: 'booking_not_found' })
      if (!booking.user_package_id) {
        return json(res, 400, { ok: false, error: 'missing_package' })
      }

      const paymentRef = `manual:${user.id}:${Date.now()}`
      const result = await activatePackagePayment(supabase, {
        bookingId,
        userPackageId: booking.user_package_id,
        paymentRef,
        paymentMethod: 'manual',
        confirmedBy: user.id,
      })

      if (!result.ok) {
        const status = result.error === 'invalid_booking_status' ? 409 : 500
        return json(res, status, { ok: false, error: result.error })
      }

      if (!result.already) {
        try {
          await sendPaidConfirmationEmail(bookingId)
        } catch (error) {
          console.error('admin manual confirm paid confirmation email error:', error)
        }
      }

      return json(res, 200, { ok: true, already: result.already ?? false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server_error'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const view = req.query?.view
  if (view === 'stats') {
    try {
      const stats = await fetchOverviewStats(supabase)
      return json(res, 200, { ok: true, stats })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'stats_failed'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (view === 'payments') {
    try {
      const payments = await fetchPendingPayments(supabase)
      return json(res, 200, { ok: true, payments })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'payments_failed'
      return json(res, 500, { ok: false, error: message })
    }
  }

  const status = req.query?.status
  let query = supabase
    .from('posing_bookings')
    .select('id, plan_key, status, created_at, payment_email_sent_at, user_id, slot:availability_slots(start_at, end_at)')
    .order('created_at', { ascending: false })
    .limit(50)

  if (status) {
    query = query.eq('status', status)
  }

  const { data: bookings, error } = await query
  if (error) return json(res, 500, { ok: false, error: error.message })

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

  const enriched = (bookings ?? []).map((b) => ({
    ...b,
    profiles: profilesById.get(b.user_id) ?? null,
  }))

  return json(res, 200, { ok: true, bookings: enriched })
}
