import { sendPaidConfirmationEmail } from '../../../../lib/email/sendPaidConfirmation.js'
import {
  fetchBookingCancellationSnapshot,
  packageNameForLocale,
  sendCancellationEmails,
  sessionTimeForLocale,
} from '../../../../lib/email/sendCancellationEmails.js'
import {
  activatePackagePayment,
  cancelPosingBooking,
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  normalizeBookingLocale,
  readJsonBody,
} from '../../_lib.js'
import {
  requirePosingTransaction,
  runPosingTransaction,
} from '../../_transactions.js'
import { parsePagination } from '../../../_pagination.js'

async function fetchOverviewStats(supabase) {
  return requirePosingTransaction(supabase, 'posing_admin_stats')
}

async function fetchPendingPayments(supabase) {
  const { data: bookings, error } = await supabase
    .from('posing_bookings')
    .select(
      'id, plan_key, status, amount_eur, created_at, user_id, user_package_id, slot:availability_slots(start_at, end_at), user_package:user_packages(id, status, sessions_total, period_end)',
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
    slot: Array.isArray(b.slot) ? (b.slot[0] ?? null) : b.slot,
    user_package: Array.isArray(b.user_package)
      ? (b.user_package[0] ?? null)
      : b.user_package,
  }))
}

export async function handleAdminBookings(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user)))
    return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'PATCH') {
    try {
      const body = await readJsonBody(req)
      const result = await runPosingTransaction(
        supabase,
        'posing_complete_booking',
        {
          p_booking_id: body.booking_id,
          p_actor_id: user.id,
        },
      )
      return json(res, result.ok ? 200 : 409, result)
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_payload' })
    }
  }

  if (req.method === 'POST') {
    try {
      const body = await readJsonBody(req)
      const bookingId = body?.booking_id
      if (!bookingId || typeof bookingId !== 'string') {
        return json(res, 400, { ok: false, error: 'missing_booking_id' })
      }

      const { data: booking, error: lookupError } = await supabase
        .from('posing_bookings')
        .select('id, status, user_package_id, locale')
        .eq('id', bookingId)
        .maybeSingle()

      if (lookupError) throw new Error('booking_lookup_failed')

      if (!booking)
        return json(res, 404, { ok: false, error: 'booking_not_found' })
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

      let deliveryFailed = false
      if (!result.already) {
        try {
          const emailResult = await sendPaidConfirmationEmail(bookingId, { locale: booking.locale })
          deliveryFailed = !emailResult.ok
        } catch {
          deliveryFailed = true
        }
      }

      return json(res, 200, { ok: true, already: result.already ?? false, payment_confirmed: true, delivery_failed: deliveryFailed })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server_error'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method === 'DELETE') {
    const bookingId = req.query?.id
    if (!bookingId || typeof bookingId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }

    const locale = normalizeBookingLocale(req.query?.locale)

    try {
      const snapshot = await fetchBookingCancellationSnapshot(
        supabase,
        bookingId,
      )

      const result = await cancelPosingBooking(supabase, {
        bookingId,
        userId: user.id,
        allowAdmin: true,
      })

      if (!result.ok) {
        const status =
          result.error === 'forbidden'
            ? 403
            : result.error === 'booking_not_found'
              ? 404
              : result.error === 'cannot_cancel'
                ? 409
                : 500
        return json(res, status, { ok: false, error: result.error })
      }

      if (!result.already && snapshot) {
        const emailResult = await sendCancellationEmails({
          bookingId: snapshot.bookingId,
          locale,
          previousStatus: snapshot.previousStatus,
          attendeeName: snapshot.attendeeName,
          userEmail: snapshot.userEmail,
          phone: snapshot.phone,
          division: snapshot.division,
          notes: snapshot.notes,
          durationMinutes: snapshot.durationMinutes,
          packageName: packageNameForLocale(snapshot, locale),
          sessionTime: sessionTimeForLocale(snapshot, locale),
          sessionStartAt: snapshot.sessionStartAt,
        })
        if (!emailResult.ok) {
          console.error('admin booking cancellation email failed:', {
            bookingId,
            error: emailResult.error,
          })
        }
      }

      return json(res, 200, { ok: true, already: result.already ?? false })
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'booking_cancel_failed'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method !== 'GET')
    return json(res, 405, { ok: false, error: 'method_not_allowed' })

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

  try {
    const { page, pageSize } = parsePagination(req.query)
    const status = req.query?.status ?? ''
    if (
      ![
        '',
        'non_cancelled',
        'pending_payment',
        'confirmed',
        'cancelled',
        'completed',
      ].includes(status)
    ) {
      return json(res, 400, { ok: false, error: 'invalid_filter' })
    }
    const from = req.query?.from || null
    const to = req.query?.to || null
    if (
      (from && !Number.isFinite(Date.parse(from))) ||
      (to && !Number.isFinite(Date.parse(to))) ||
      (from && to && Date.parse(from) >= Date.parse(to))
    ) {
      return json(res, 400, { ok: false, error: 'invalid_date_range' })
    }
    const result = await requirePosingTransaction(
      supabase,
      'posing_admin_bookings',
      {
        p_status: status,
        p_member: req.query?.member || null,
        p_from: from,
        p_to: to,
        p_search: String(req.query?.search ?? '').slice(0, 100),
        p_page: page,
        p_page_size: pageSize,
        p_booking_id: req.query?.booking || null,
      },
    )
    return json(res, 200, { ok: true, ...result })
  } catch (error) {
    return json(res, 500, {
      ok: false,
      error: error instanceof Error ? error.message : 'fetch_failed',
    })
  }
}
