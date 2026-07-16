import { packageNameFromContext } from './calendar.js'
import { buildPaidConfirmationEmail } from './templates.js'
import {
  buildCalendarForBooking,
  sendAdminSessionConfirmedNotify,
  sessionTimeForCalendarContext,
} from './sendSessionCalendar.js'
import {
  getSupabaseAdmin,
  normalizeBookingLocale,
  sendPosingEmailReliable,
} from '../../api/posing/_lib.js'

export async function sendPaidConfirmationEmail(bookingId, { locale: localeOverride } = {}) {
  const supabase = getSupabaseAdmin()
  const preflight = await buildCalendarForBooking(supabase, bookingId, 'el')
  const locale = normalizeBookingLocale(localeOverride ?? preflight?.context?.locale)
  const calendarBundle = await buildCalendarForBooking(supabase, bookingId, locale)
  const context = calendarBundle?.context
  if (!context) {
    console.error('paid confirmation email: booking not found', bookingId)
    return { ok: false, error: 'booking_not_found' }
  }

  const userEmail = context.userEmail
  if (!userEmail) {
    console.error('paid confirmation email: missing user email', bookingId)
    return { ok: false, error: 'missing_email' }
  }

  const packageName = packageNameFromContext(context, locale)
  const sessionTime = sessionTimeForCalendarContext(context, locale)
  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'
  const calendar = calendarBundle.calendar

  const { subject, html, text } = buildPaidConfirmationEmail({
    attendeeName: context.attendeeName,
    packageName,
    sessionTime,
    bookingId: context.bookingId,
    durationMinutes: context.durationMinutes,
    googleCalendarUrl: calendar.googleCalendarUrl,
    locale,
  })

  try {
    await sendPosingEmailReliable({
      from,
      to: [userEmail],
      subject,
      html,
      text,
      attachments: [calendar.attachment],
      idempotencyKey: `posing-paid-confirm-${bookingId}`,
    })
  } catch (err) {
    console.error('paid confirmation email send error:', { bookingId, error: err })
    return { ok: false, error: 'send_failed' }
  }

  const notifyEmail = process.env.POSE_NOTIFY_EMAIL
  if (notifyEmail) {
    try {
      await sendAdminSessionConfirmedNotify({
        from,
        notifyEmail,
        userEmail,
        profileName: context.attendeeName,
        phone: context.phone,
        packageName,
        sessionTime,
        bookingId: context.bookingId,
        calendar,
        locale,
      })
    } catch (err) {
      console.error('paid confirmation admin calendar email error:', { bookingId, error: err })
    }
  }

  return { ok: true }
}
