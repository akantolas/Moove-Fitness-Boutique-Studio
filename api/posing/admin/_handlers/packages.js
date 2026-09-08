import {
  fetchBookingCancellationSnapshot,
  packageNameForLocale,
  sendCancellationEmails,
  sessionTimeForLocale,
} from '../../../../lib/email/sendCancellationEmails.js'
import {
  cancelUserPackage,
  cors,
  ensureAdmin,
  getCancellableBookingsForPackage,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  normalizeBookingLocale,
} from '../../_lib.js'

export async function handleAdminPackages(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  if (req.method !== 'DELETE') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const packageId = req.query?.id
  if (!packageId || typeof packageId !== 'string') {
    return json(res, 400, { ok: false, error: 'missing_id' })
  }

  const locale = normalizeBookingLocale(req.query?.locale)

  try {
    const supabase = getSupabaseAdmin()
    const { data: pkg } = await supabase
      .from('user_packages')
      .select('id, status')
      .eq('id', packageId)
      .maybeSingle()

    if (!pkg) return json(res, 404, { ok: false, error: 'package_not_found' })

    const toCancel = await getCancellableBookingsForPackage(supabase, packageId)
    const snapshots = await Promise.all(
      toCancel.map((booking) => fetchBookingCancellationSnapshot(supabase, booking.id)),
    )

    const result = await cancelUserPackage(supabase, { packageId })

    if (!result.ok) {
      const status =
        result.error === 'package_not_found'
          ? 404
          : result.error === 'package_not_cancellable'
            ? 409
            : 500
      return json(res, status, { ok: false, error: result.error })
    }

    if (!result.already) {
      for (const snapshot of snapshots) {
        if (!snapshot) continue
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
          console.error('admin package cancellation email failed:', {
            packageId,
            bookingId: snapshot.bookingId,
            error: emailResult.error,
          })
        }
      }
    }

    return json(res, 200, {
      ok: true,
      already: result.already ?? false,
      cancelledBookings: result.cancelledBookingIds?.length ?? 0,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'package_cancel_failed'
    return json(res, 500, { ok: false, error: message })
  }
}
