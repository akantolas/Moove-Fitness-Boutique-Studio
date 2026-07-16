import {
  buildAdminBookingNotifyEmail,
  buildConfirmationEmail,
  buildPaymentEmail,
} from '../../email/templates.js'
import {
  fetchBookingCancellationSnapshot,
  packageNameForLocale,
  sendCancellationEmails,
  sessionTimeForLocale,
} from '../../email/sendCancellationEmails.js'
import {
  cancelPosingBooking,
  cors,
  createStripeCheckoutUrl,
  findBookablePackage,
  formatSessionTime,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  PACKAGE_KEYS,
  readJsonBody,
  sendPosingEmail,
} from '../_lib.js'

async function sendBookingNotify({
  from,
  profileName,
  userEmail,
  packageName,
  sessionTime,
  bookingId,
  status,
  locale,
}) {
  const notifyEmail = process.env.POSE_NOTIFY_EMAIL
  if (!notifyEmail) return

  const { subject, html, text } = buildAdminBookingNotifyEmail({
    profileName,
    userEmail,
    packageName,
    sessionTime,
    bookingId,
    status,
    locale,
  })

  await sendPosingEmail({
    from,
    to: [notifyEmail],
    subject,
    html,
    text,
    idempotencyKey: `posing-notify-${bookingId}`,
  })
}

export async function handleBookings(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req)
    if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

    const bookingId = req.query?.id
    if (!bookingId || typeof bookingId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }

    const locale = req.query?.locale === 'en' ? 'en' : 'el'

    try {
      const supabase = getSupabaseAdmin()
      const snapshot = await fetchBookingCancellationSnapshot(supabase, bookingId)

      const result = await cancelPosingBooking(supabase, {
        bookingId,
        userId: user.id,
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
        try {
          await sendCancellationEmails({
            bookingId: snapshot.bookingId,
            locale,
            previousStatus: snapshot.previousStatus,
            attendeeName: snapshot.attendeeName,
            userEmail: snapshot.userEmail,
            packageName: packageNameForLocale(snapshot, locale),
            sessionTime: sessionTimeForLocale(snapshot, locale),
          })
        } catch (error) {
          console.error('posing cancellation email error:', error)
        }
      }

      return json(res, 200, { ok: true, already: result.already ?? false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server_error'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return json(res, 400, { ok: false, error: 'invalid_json' })
  }

  const { slot_id: slotId, plan_key: planKey, locale = 'el' } = body
  if (!slotId || !planKey || !PACKAGE_KEYS.includes(planKey)) {
    return json(res, 400, { ok: false, error: 'invalid_payload' })
  }

  const supabase = getSupabaseAdmin()

  const { data: slot, error: slotError } = await supabase
    .from('availability_slots')
    .select('id, start_at, end_at, is_blocked')
    .eq('id', slotId)
    .maybeSingle()

  if (slotError || !slot || slot.is_blocked) {
    return json(res, 404, { ok: false, error: 'slot_not_found' })
  }

  const { data: existingBooking } = await supabase
    .from('posing_bookings')
    .select('id')
    .eq('slot_id', slotId)
    .not('status', 'eq', 'cancelled')
    .maybeSingle()

  if (existingBooking) {
    return json(res, 409, { ok: false, error: 'slot_taken' })
  }

  const { data: plan } = await supabase
    .from('package_plans')
    .select('key, name_en, name_el, sessions_total, period_days')
    .eq('key', planKey)
    .single()

  if (!plan) return json(res, 400, { ok: false, error: 'invalid_plan' })

  const profileName =
    user.user_metadata?.full_name ?? user.email?.split('@')[0] ?? 'there'
  const packageName = locale === 'el' ? plan.name_el : plan.name_en
  const sessionTime = formatSessionTime(slot.start_at, locale)
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'

  const bookable = await findBookablePackage(supabase, user.id, planKey)

  if (bookable.mode === 'blocked_pending') {
    return json(res, 409, { ok: false, error: 'payment_required_first' })
  }

  if (bookable.mode === 'use_existing') {
    const userPackage = bookable.userPackage
    if (userPackage.sessions_used >= userPackage.sessions_total) {
      return json(res, 409, { ok: false, error: 'package_sessions_exhausted' })
    }

    const { data: booking, error: bookError } = await supabase
      .from('posing_bookings')
      .insert({
        user_id: user.id,
        slot_id: slotId,
        plan_key: planKey,
        user_package_id: userPackage.id,
        status: 'confirmed',
      })
      .select('id')
      .single()

    if (bookError || !booking) {
      return json(res, 500, { ok: false, error: bookError?.message ?? 'booking_create_failed' })
    }

    const now = new Date().toISOString()
    await supabase
      .from('user_packages')
      .update({
        sessions_used: userPackage.sessions_used + 1,
        updated_at: now,
      })
      .eq('id', userPackage.id)

    try {
      const confirmation = buildConfirmationEmail({
        attendeeName: profileName,
        packageName,
        sessionTime,
        locale,
      })

      await sendPosingEmail({
        from,
        to: [user.email],
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        idempotencyKey: `posing-booking-confirm-${booking.id}`,
      })
      await sendBookingNotify({
        from,
        profileName,
        userEmail: user.email,
        packageName,
        sessionTime,
        bookingId: booking.id,
        status: 'confirmed',
        locale,
      })
    } catch (error) {
      console.error('posing included session email error:', error)
    }

    return json(res, 201, {
      ok: true,
      booking_id: booking.id,
      booking_type: 'included_session',
      status: 'confirmed',
      sessions_remaining: userPackage.sessions_total - userPackage.sessions_used - 1,
      message:
        locale === 'el'
          ? 'Η συνεδρία επιβεβαιώθηκε.'
          : 'Your session is confirmed.',
    })
  }

  const now = new Date()
  const periodEnd = new Date(now)
  periodEnd.setDate(periodEnd.getDate() + plan.period_days)

  const { data: userPackage, error: pkgError } = await supabase
    .from('user_packages')
    .insert({
      user_id: user.id,
      plan_key: planKey,
      sessions_total: plan.sessions_total,
      sessions_used: 0,
      status: 'pending_payment',
      period_start: now.toISOString(),
      period_end: periodEnd.toISOString(),
    })
    .select('id')
    .single()

  if (pkgError || !userPackage) {
    return json(res, 500, { ok: false, error: pkgError?.message ?? 'package_create_failed' })
  }

  const { data: booking, error: bookError } = await supabase
    .from('posing_bookings')
    .insert({
      user_id: user.id,
      slot_id: slotId,
      plan_key: planKey,
      user_package_id: userPackage.id,
      status: 'pending_payment',
    })
    .select('id')
    .single()

  if (bookError || !booking) {
    await supabase.from('user_packages').delete().eq('id', userPackage.id)
    return json(res, 500, { ok: false, error: bookError?.message ?? 'booking_create_failed' })
  }

  let stripeLink = ''
  try {
    const checkout = await createStripeCheckoutUrl({
      planKey,
      bookingId: booking.id,
      userPackageId: userPackage.id,
      customerEmail: user.email,
    })
    stripeLink = checkout.url
    if (checkout.sessionId) {
      await supabase
        .from('posing_bookings')
        .update({ stripe_session_id: checkout.sessionId })
        .eq('id', booking.id)
    }
  } catch (error) {
    console.error('stripe checkout error:', error)
  }

  try {
    const payment = buildPaymentEmail({
      attendeeName: profileName,
      packageName,
      sessionTime,
      stripeLink,
      locale,
    })

    await sendPosingEmail({
      from,
      to: [user.email],
      subject: payment.subject,
      html: payment.html,
      text: payment.text,
      idempotencyKey: `posing-booking-${booking.id}`,
    })
    await sendBookingNotify({
      from,
      profileName,
      userEmail: user.email,
      packageName,
      sessionTime,
      bookingId: booking.id,
      status: 'pending_payment',
      locale,
    })

    await supabase
      .from('posing_bookings')
      .update({ payment_email_sent_at: new Date().toISOString() })
      .eq('id', booking.id)
  } catch (error) {
    console.error('posing booking email error:', error)
  }

  return json(res, 201, {
    ok: true,
    booking_id: booking.id,
    booking_type: 'new_package',
    status: 'pending_payment',
    message:
      locale === 'el'
        ? 'Η κράτηση καταχωρήθηκε. Έλεγξε το email σου για πληρωμή.'
        : 'Booking reserved. Check your email to complete payment.',
  })
}
