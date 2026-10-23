import {
  buildAdminLatePaymentNotifyEmail,
  buildLatePaymentCreditEmail,
} from './templates.js'
import {
  formatSessionTimeWithZone,
  getSupabaseAdmin,
  normalizeBookingLocale,
  sendPosingEmailReliable,
} from '../../api/posing/_lib.js'

/** Tells the member and admin that a late payment became package credit. */
export async function sendLatePaymentEmails(bookingId, { locale: localeOverride } = {}) {
  const supabase = getSupabaseAdmin()
  const { data: booking, error } = await supabase
    .from('posing_bookings')
    .select(
      'id, user_id, plan_key, locale, user_package:user_packages(sessions_total, period_end, payment_method), plan:package_plans(name_en, name_el)',
    )
    .eq('id', bookingId)
    .maybeSingle()
  if (error || !booking) {
    console.error('late payment email: booking not found', bookingId)
    return { ok: false, error: 'booking_not_found' }
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email')
    .eq('id', booking.user_id)
    .maybeSingle()
  const userEmail = profile?.email
  if (!userEmail) {
    console.error('late payment email: missing user email', bookingId)
    return { ok: false, error: 'missing_email' }
  }

  const locale = normalizeBookingLocale(localeOverride ?? booking.locale)
  const userPackage = Array.isArray(booking.user_package)
    ? booking.user_package[0]
    : booking.user_package
  const plan = Array.isArray(booking.plan) ? booking.plan[0] : booking.plan
  const packageName =
    (locale === 'el' ? plan?.name_el : plan?.name_en) ?? booking.plan_key
  const attendeeName = profile?.full_name ?? userEmail.split('@')[0]
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'

  const member = buildLatePaymentCreditEmail({
    attendeeName,
    packageName,
    planKey: booking.plan_key,
    sessionsTotal: userPackage?.sessions_total ?? '—',
    validUntil: userPackage?.period_end
      ? formatSessionTimeWithZone(userPackage.period_end, locale)
      : '—',
    locale,
  })
  try {
    await sendPosingEmailReliable({
      from,
      to: [userEmail],
      subject: member.subject,
      html: member.html,
      text: member.text,
      idempotencyKey: `posing-late-payment-${bookingId}`,
    })
  } catch (err) {
    console.error('late payment email send error:', { bookingId, error: err })
    return { ok: false, error: 'send_failed' }
  }

  const notifyEmail = process.env.POSE_NOTIFY_EMAIL
  if (notifyEmail) {
    try {
      const admin = buildAdminLatePaymentNotifyEmail({
        profileName: attendeeName,
        userEmail,
        packageName,
        bookingId,
        paymentMethod: userPackage?.payment_method ?? '—',
        locale: 'el',
      })
      await sendPosingEmailReliable({
        from,
        to: [notifyEmail],
        replyTo: userEmail,
        subject: admin.subject,
        html: admin.html,
        text: admin.text,
        idempotencyKey: `posing-late-payment-notify-${bookingId}`,
      })
    } catch (err) {
      console.error('late payment admin email error:', { bookingId, error: err })
    }
  }

  return { ok: true }
}
