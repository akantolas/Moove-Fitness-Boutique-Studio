import {
  formatSessionTime,
  sendPosingEmailReliable,
} from '../posing/_lib.js'
import {
  buildAdminCancellationNotifyEmail,
  buildCancellationEmail,
} from './templates.js'

export async function sendCancellationEmails({
  bookingId,
  locale = 'el',
  previousStatus,
  attendeeName,
  userEmail,
  phone,
  division,
  notes,
  packageName,
  sessionTime,
}) {
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'
  const notifyEmail = process.env.POSE_NOTIFY_EMAIL

  const customerEmail = buildCancellationEmail({
    attendeeName,
    packageName,
    sessionTime,
    previousStatus,
    locale,
  })

  try {
    await sendPosingEmailReliable({
      from,
      to: [userEmail],
      subject: customerEmail.subject,
      html: customerEmail.html,
      text: customerEmail.text,
      idempotencyKey: `posing-cancel-customer-${bookingId}`,
    })
  } catch (err) {
    console.error('cancellation customer email error:', err)
    return { ok: false, error: 'customer_send_failed' }
  }

  if (!notifyEmail) return { ok: true }

  const adminEmail = buildAdminCancellationNotifyEmail({
    profileName: attendeeName,
    userEmail,
    phone,
    division,
    notes,
    packageName,
    sessionTime,
    bookingId,
    previousStatus,
    locale,
  })

  try {
    await sendPosingEmailReliable({
      from,
      to: [notifyEmail],
      subject: adminEmail.subject,
      html: adminEmail.html,
      text: adminEmail.text,
      idempotencyKey: `posing-cancel-notify-${bookingId}`,
    })
  } catch (err) {
    console.error('cancellation admin notify error:', err)
    return { ok: false, error: 'admin_send_failed' }
  }

  return { ok: true }
}

export async function fetchBookingCancellationSnapshot(supabase, bookingId) {
  const { data: booking, error } = await supabase
    .from('posing_bookings')
    .select('id, plan_key, status, user_id, slot:availability_slots(start_at)')
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !booking) return null

  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
  if (!slot?.start_at) return null

  const [{ data: plan }, { data: profile }, { data: authUser }] = await Promise.all([
    supabase
      .from('package_plans')
      .select('name_en, name_el')
      .eq('key', booking.plan_key)
      .maybeSingle(),
    supabase
      .from('profiles')
      .select('full_name, email, phone, division, notes')
      .eq('id', booking.user_id)
      .maybeSingle(),
    supabase.auth.admin.getUserById(booking.user_id),
  ])

  const userEmail = profile?.email ?? authUser?.user?.email
  if (!userEmail) return null

  const attendeeName =
    profile?.full_name ??
    authUser?.user?.user_metadata?.full_name ??
    userEmail.split('@')[0] ??
    'there'

  return {
    bookingId: booking.id,
    previousStatus: booking.status,
    attendeeName,
    userEmail,
    phone: profile?.phone ?? null,
    division: profile?.division ?? null,
    notes: profile?.notes ?? null,
    packageNameEl: plan?.name_el ?? booking.plan_key,
    packageNameEn: plan?.name_en ?? booking.plan_key,
    sessionStartAt: slot.start_at,
  }
}

export function packageNameForLocale(snapshot, locale) {
  return locale === 'el' ? snapshot.packageNameEl : snapshot.packageNameEn
}

export function sessionTimeForLocale(snapshot, locale) {
  return formatSessionTime(snapshot.sessionStartAt, locale)
}
