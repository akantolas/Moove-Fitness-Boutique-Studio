import {
  buildAdminBookingNotifyEmail,
  buildConfirmationEmail,
  buildPaymentEmail,
} from '../../../lib/email/templates.js'
import { buildCalendarForBooking } from '../../../lib/email/sendSessionCalendar.js'
import {
  fetchBookingCancellationSnapshot,
  packageNameForLocale,
  sendCancellationEmails,
  sessionTimeForLocale,
} from '../../../lib/email/sendCancellationEmails.js'
import {
  cancelPosingBooking,
  cors,
  createStripeCheckoutUrl,
  formatSessionTimeWithZone,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  normalizeBookingLocale,
  PACKAGE_KEYS,
  readJsonBody,
  sendPosingEmailReliable,
} from '../_lib.js'
import { runPosingTransaction } from '../_transactions.js'
import {
  formatPriceEUR,
  getPayPalUrl,
  getRevolutUrl,
  resolvePlanPrice,
} from '../_pricing.js'

async function sendBookingNotify({
  from,
  profileName,
  userEmail,
  phone,
  division,
  notes,
  packageName,
  sessionTime,
  bookingId,
  status,
  stripeLink,
  paypalLink,
  revolutLink,
  amountEur,
  priceSource,
  locale,
  calendarAttachment,
}) {
  const notifyEmail = process.env.POSE_NOTIFY_EMAIL
  if (!notifyEmail) return

  const { subject, html, text } = buildAdminBookingNotifyEmail({
    profileName,
    userEmail,
    phone,
    division,
    notes,
    packageName,
    sessionTime,
    bookingId,
    status,
    stripeLink,
    paypalLink,
    revolutLink,
    amountEur,
    priceSource,
    locale,
  })

  await sendPosingEmailReliable({
    from,
    to: [notifyEmail],
    replyTo: userEmail,
    subject,
    html,
    text,
    idempotencyKey: `posing-notify-${bookingId}`,
    ...(status === 'confirmed' && calendarAttachment
      ? { attachments: [calendarAttachment] }
      : {}),
  })
}

export async function handleBookings(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  if (req.method === 'GET') {
    const user = await getUserFromRequest(req)
    if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

    const bookingId = req.query?.id
    const format = req.query?.format
    if (!bookingId || typeof bookingId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }
    if (format !== 'ics') {
      return json(res, 400, { ok: false, error: 'invalid_format' })
    }

    try {
      const supabase = getSupabaseAdmin()
      const { data: booking, error } = await supabase
        .from('posing_bookings')
        .select('id, user_id, status')
        .eq('id', bookingId)
        .maybeSingle()

      if (error || !booking) {
        return json(res, 404, { ok: false, error: 'booking_not_found' })
      }
      if (booking.user_id !== user.id) {
        return json(res, 403, { ok: false, error: 'forbidden' })
      }
      if (booking.status !== 'confirmed') {
        return json(res, 409, { ok: false, error: 'not_confirmed' })
      }

      const locale = normalizeBookingLocale(req.query?.locale)
      const calendarBundle = await buildCalendarForBooking(
        supabase,
        bookingId,
        locale,
      )
      if (!calendarBundle) {
        return json(res, 404, { ok: false, error: 'calendar_unavailable' })
      }

      res.setHeader('Content-Type', 'text/calendar; charset=utf-8')
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="move-pose-${bookingId.slice(0, 8)}.ics"`,
      )
      return res.status(200).send(calendarBundle.calendar.ics)
    } catch (error) {
      console.error('booking calendar download error:', error)
      return json(res, 500, { ok: false, error: 'calendar_failed' })
    }
  }

  if (req.method === 'DELETE') {
    const user = await getUserFromRequest(req)
    if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

    const bookingId = req.query?.id
    if (!bookingId || typeof bookingId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }

    const locale = normalizeBookingLocale(req.query?.locale)

    try {
      const supabase = getSupabaseAdmin()
      const snapshot = await fetchBookingCancellationSnapshot(
        supabase,
        bookingId,
      )

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
          console.error('posing cancellation email failed:', {
            bookingId: snapshot.bookingId,
            error: emailResult.error,
          })
        }
      }

      return json(res, 200, { ok: true, already: result.already ?? false })
    } catch (error) {
      const message = error instanceof Error ? error.message : 'server_error'
      return json(res, 500, { ok: false, error: message })
    }
  }

  if (req.method !== 'POST')
    return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })

  let body
  try {
    body = await readJsonBody(req)
  } catch {
    return json(res, 400, { ok: false, error: 'invalid_json' })
  }

  const { slot_id: slotId, plan_key: planKey } = body
  const bookingLocale = normalizeBookingLocale(body.locale)

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
    .select(
      'key, name_en, name_el, sessions_total, period_days, duration_minutes',
    )
    .eq('key', planKey)
    .single()

  if (!plan) return json(res, 400, { ok: false, error: 'invalid_plan' })

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, phone, division, notes')
    .eq('id', user.id)
    .maybeSingle()

  const profileName =
    profile?.full_name ??
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there'
  const userEmail = profile?.email ?? user.email
  const profilePhone = profile?.phone ?? null
  const profileDivision = profile?.division ?? null
  const profileNotes = profile?.notes ?? null
  const packageName = bookingLocale === 'el' ? plan.name_el : plan.name_en
  const sessionTime = formatSessionTimeWithZone(slot.start_at, bookingLocale)
  const durationMinutes = plan.duration_minutes
  const from =
    process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'

  let priceInfo
  try {
    priceInfo = await resolvePlanPrice(supabase, planKey, user.id)
  } catch {
    return json(res, 503, { ok: false, error: 'price_check_failed' })
  }
  const amountEur = priceInfo.amountEur
  const reserved = await runPosingTransaction(
    supabase,
    'posing_reserve_booking',
    {
      p_user_id: user.id,
      p_slot_id: slotId,
      p_plan_key: planKey,
      p_locale: bookingLocale,
      p_amount_eur: amountEur,
    },
  )
  if (!reserved?.ok) {
    return json(res, reserved?.error === 'migration_required' ? 503 : 409, {
      ok: false,
      error: reserved?.error ?? 'booking_create_failed',
    })
  }
  const { booking, userPackage } = reserved

  if (reserved.booking_type === 'included_session') {
    try {
      const calendarBundle = await buildCalendarForBooking(
        supabase,
        booking.id,
        bookingLocale,
      )
      const calendar = calendarBundle?.calendar ?? null

      const confirmation = buildConfirmationEmail({
        attendeeName: profileName,
        packageName,
        sessionTime,
        bookingId: booking.id,
        durationMinutes,
        googleCalendarUrl: calendar?.googleCalendarUrl ?? null,
        locale: bookingLocale,
      })

      await sendPosingEmailReliable({
        from,
        to: [userEmail],
        subject: confirmation.subject,
        html: confirmation.html,
        text: confirmation.text,
        idempotencyKey: `posing-booking-confirm-${booking.id}`,
        ...(calendar ? { attachments: [calendar.attachment] } : {}),
      })
      await sendBookingNotify({
        from,
        profileName,
        userEmail,
        phone: profilePhone,
        division: profileDivision,
        notes: profileNotes,
        packageName,
        sessionTime,
        bookingId: booking.id,
        status: 'confirmed',
        locale: bookingLocale,
        calendarAttachment: calendar?.attachment ?? null,
      })
    } catch (error) {
      console.error('posing included session email error:', {
        bookingId: booking.id,
        error,
      })
    }

    return json(res, 201, {
      ok: true,
      booking_id: booking.id,
      booking_type: 'included_session',
      status: 'confirmed',
      sessions_remaining: reserved.sessions_remaining,
      message:
        bookingLocale === 'el'
          ? 'Η συνεδρία επιβεβαιώθηκε.'
          : 'Your session is confirmed.',
    })
  }

  const paypalLink = amountEur ? getPayPalUrl(amountEur) : ''
  const revolutLink = amountEur ? getRevolutUrl(amountEur) : ''
  const useDynamicStripe = priceInfo.source === 'override'

  let stripeLink = ''
  try {
    const checkout = await createStripeCheckoutUrl({
      planKey,
      bookingId: booking.id,
      userPackageId: userPackage.id,
      customerEmail: userEmail,
      locale: bookingLocale,
      amountEur,
      packageName,
      useDynamicPrice: useDynamicStripe,
    })
    stripeLink = checkout.url
    if (checkout.sessionId) {
      await supabase
        .from('posing_bookings')
        .update({ stripe_session_id: checkout.sessionId })
        .eq('id', booking.id)
    }
  } catch (error) {
    console.error('stripe checkout error:', { bookingId: booking.id, error })
  }

  try {
    const payment = buildPaymentEmail({
      attendeeName: profileName,
      packageName,
      sessionTime,
      stripeLink,
      paypalLink,
      revolutLink,
      amountEur,
      amountLabel: amountEur ? formatPriceEUR(amountEur, bookingLocale) : null,
      bookingId: booking.id,
      durationMinutes,
      locale: bookingLocale,
    })

    await sendPosingEmailReliable({
      from,
      to: [userEmail],
      subject: payment.subject,
      html: payment.html,
      text: payment.text,
      idempotencyKey: `posing-booking-${booking.id}`,
    })
    await sendBookingNotify({
      from,
      profileName,
      userEmail,
      phone: profilePhone,
      division: profileDivision,
      notes: profileNotes,
      packageName,
      sessionTime,
      bookingId: booking.id,
      status: 'pending_payment',
      stripeLink,
      paypalLink,
      revolutLink,
      amountEur,
      priceSource: priceInfo.source,
      locale: bookingLocale,
    })

    await supabase
      .from('posing_bookings')
      .update({ payment_email_sent_at: new Date().toISOString() })
      .eq('id', booking.id)
  } catch (error) {
    console.error('posing booking email error:', {
      bookingId: booking.id,
      error,
    })
  }

  return json(res, 201, {
    ok: true,
    booking_id: booking.id,
    booking_type: 'new_package',
    status: 'pending_payment',
    message:
      bookingLocale === 'el'
        ? 'Η κράτηση καταχωρήθηκε. Έλεγξε το email σου για πληρωμή.'
        : 'Booking reserved. Check your email to complete payment.',
  })
}
