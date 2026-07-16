import {
  formatSessionTimeWithZone,
  getSupabaseAdmin,
  normalizeBookingLocale,
  sendPosingEmailReliable,
} from '../posing/_lib.js'
import { buildPaidConfirmationEmail } from './templates.js'

export async function sendPaidConfirmationEmail(bookingId, { locale: localeOverride } = {}) {
  const supabase = getSupabaseAdmin()

  const { data: booking, error } = await supabase
    .from('posing_bookings')
    .select(
      'id, plan_key, locale, user_id, slot:availability_slots(start_at)',
    )
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !booking) {
    console.error('paid confirmation email: booking not found', bookingId, error?.message)
    return { ok: false, error: 'booking_not_found' }
  }

  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
  if (!slot?.start_at) {
    console.error('paid confirmation email: missing slot', bookingId)
    return { ok: false, error: 'missing_slot' }
  }

  const locale = normalizeBookingLocale(booking.locale ?? localeOverride)

  const [{ data: plan }, { data: profile }, { data: authUser }] = await Promise.all([
    supabase
      .from('package_plans')
      .select('name_en, name_el, duration_minutes')
      .eq('key', booking.plan_key)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', booking.user_id)
      .maybeSingle(),
    supabase.auth.admin.getUserById(booking.user_id),
  ])

  const userEmail = profile?.email ?? authUser?.user?.email
  if (!userEmail) {
    console.error('paid confirmation email: missing user email', bookingId)
    return { ok: false, error: 'missing_email' }
  }

  const attendeeName =
    profile?.full_name ??
    authUser?.user?.user_metadata?.full_name ??
    userEmail.split('@')[0] ??
    'there'

  const packageName = locale === 'el' ? plan?.name_el : plan?.name_en
  const sessionTime = formatSessionTimeWithZone(slot.start_at, locale)
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'

  const { subject, html, text } = buildPaidConfirmationEmail({
    attendeeName,
    packageName: packageName ?? booking.plan_key,
    sessionTime,
    bookingId: booking.id,
    durationMinutes: plan?.duration_minutes,
    locale,
  })

  try {
    await sendPosingEmailReliable({
      from,
      to: [userEmail],
      subject,
      html,
      text,
      idempotencyKey: `posing-paid-confirm-${bookingId}`,
    })
    return { ok: true }
  } catch (err) {
    console.error('paid confirmation email send error:', { bookingId, error: err })
    return { ok: false, error: 'send_failed' }
  }
}
