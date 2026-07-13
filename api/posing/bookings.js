import {
  buildPaymentEmail,
  cors,
  createStripeCheckoutUrl,
  formatSessionTime,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  PACKAGE_KEYS,
  readJsonBody,
  sendResendEmail,
} from './_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
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

  const profileName =
    user.user_metadata?.full_name ??
    user.email?.split('@')[0] ??
    'there'
  const packageName = locale === 'el' ? plan.name_el : plan.name_en
  const sessionTime = formatSessionTime(slot.start_at, locale)
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <onboarding@resend.dev>'

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
    await sendResendEmail({
      from,
      to: [user.email],
      subject:
        locale === 'el'
          ? 'Move & Pose — επιβεβαίωση κράτησης & πληρωμή'
          : 'Move & Pose — booking confirmation & payment',
      html: buildPaymentEmail({
        attendeeName: profileName,
        packageName,
        sessionTime,
        stripeLink,
        locale,
      }),
      idempotencyKey: `posing-booking-${booking.id}`,
    })

    const notifyEmail = process.env.POSE_NOTIFY_EMAIL
    if (notifyEmail) {
      await sendResendEmail({
        from,
        to: [notifyEmail],
        subject: `New Move & Pose booking — ${profileName}`,
        html: `<p>New booking: ${profileName} (${user.email})<br/>${packageName}<br/>${sessionTime}</p>`,
        idempotencyKey: `posing-notify-${booking.id}`,
      })
    }

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
    status: 'pending_payment',
    message:
      locale === 'el'
        ? 'Η κράτηση καταχωρήθηκε. Έλεγξε το email σου για πληρωμή.'
        : 'Booking reserved. Check your email to complete payment.',
  })
}
