import {
  activatePackagePayment,
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
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  try {
    const user = await getUserFromRequest(req)
    if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
    if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

    const body = await readJsonBody(req)
    const bookingId = body?.booking_id
    if (!bookingId || typeof bookingId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_booking_id' })
    }

    const supabase = getSupabaseAdmin()

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

    return json(res, 200, { ok: true, already: result.already ?? false })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    return json(res, 500, { ok: false, error: message })
  }
}
