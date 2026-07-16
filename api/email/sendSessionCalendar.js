import {
  buildBookingCalendarArtifacts,
  fetchBookingCalendarContext,
  packageNameFromContext,
} from './calendar.js'
import { buildAdminSessionConfirmedEmail } from './templates.js'
import { formatSessionTimeWithZone, sendPosingEmailReliable } from '../posing/_lib.js'

export async function sendAdminSessionConfirmedNotify({
  from,
  notifyEmail,
  userEmail,
  profileName,
  phone,
  packageName,
  sessionTime,
  bookingId,
  calendar,
  locale,
}) {
  if (!notifyEmail) return { ok: true, skipped: true }

  const email = buildAdminSessionConfirmedEmail({
    profileName,
    userEmail,
    phone,
    packageName,
    sessionTime,
    bookingId,
    googleCalendarUrl: calendar.googleCalendarUrl,
    locale,
  })

  await sendPosingEmailReliable({
    from,
    to: [notifyEmail],
    replyTo: userEmail,
    subject: email.subject,
    html: email.html,
    text: email.text,
    attachments: [calendar.attachment],
    idempotencyKey: `posing-admin-confirmed-${bookingId}`,
  })

  return { ok: true }
}

export async function buildCalendarForBooking(supabase, bookingId, locale, { status = 'confirmed' } = {}) {
  const context = await fetchBookingCalendarContext(supabase, bookingId)
  if (!context?.startAt) return null

  return {
    context,
    calendar: buildBookingCalendarArtifacts({
      bookingId: context.bookingId,
      startAt: context.startAt,
      durationMinutes: context.durationMinutes,
      packageName: packageNameFromContext(context, locale),
      attendeeName: context.attendeeName,
      locale,
      status,
    }),
  }
}

export function sessionTimeForCalendarContext(context, locale) {
  return formatSessionTimeWithZone(context.startAt, locale)
}
