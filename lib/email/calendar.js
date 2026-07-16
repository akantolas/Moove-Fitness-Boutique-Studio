import { posingBrand } from './brand.js'

const ATHENS_TZ = 'Europe/Athens'
const CALENDAR_DOMAIN = 'moovefitness.gr'
const DEFAULT_DURATION_MINUTES = 30

function escapeIcsText(value) {
  return String(value ?? '')
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n')
}

function foldIcsLine(line) {
  const max = 75
  if (line.length <= max) return [line]
  const chunks = []
  let rest = line
  chunks.push(rest.slice(0, max))
  rest = rest.slice(max)
  while (rest.length > 0) {
    chunks.push(` ${rest.slice(0, max - 1)}`)
    rest = rest.slice(max - 1)
  }
  return chunks
}

function formatIcsStamp(date = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: 'UTC',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}Z`
}

function formatIcsLocalAthens(date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: ATHENS_TZ,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    })
      .formatToParts(date)
      .map((part) => [part.type, part.value]),
  )
  return `${parts.year}${parts.month}${parts.day}T${parts.hour}${parts.minute}${parts.second}`
}

function formatGoogleUtc(date) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
}

export function bookingCalendarUid(bookingId) {
  return `posing-booking-${bookingId}@${CALENDAR_DOMAIN}`
}

export function buildSessionCalendarDescription({
  packageName,
  bookingId,
  attendeeName,
  locale = 'el',
}) {
  const isEl = locale === 'el'
  const lines = [
    isEl ? `Πακέτο: ${packageName}` : `Package: ${packageName}`,
    `Booking ID: ${bookingId}`,
    attendeeName ? (isEl ? `Πελάτης: ${attendeeName}` : `Client: ${attendeeName}`) : null,
    isEl
      ? 'Online συνεδρία μέσω WhatsApp. Να είσαι διαθέσιμος/η 15 λεπτά πριν.'
      : 'Online session via WhatsApp. Please be available 15 minutes early.',
    posingBrand.whatsapp,
  ].filter(Boolean)
  return lines.join('\n')
}

export function buildSessionCalendarSummary({ packageName, locale = 'el' }) {
  const prefix = locale === 'el' ? 'Move & Pose' : 'Move & Pose'
  return `${prefix} — ${packageName}`
}

export function buildIcsEvent({
  bookingId,
  startAt,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  summary,
  description,
  status = 'confirmed',
  sequence = 0,
}) {
  const start = new Date(startAt)
  if (Number.isNaN(start.getTime())) {
    throw new Error('invalid_start_at')
  }

  const duration = Math.max(1, Math.round(Number(durationMinutes) || DEFAULT_DURATION_MINUTES))
  const end = new Date(start.getTime() + duration * 60 * 1000)
  const isCancelled = status === 'cancelled'
  const method = isCancelled ? 'CANCEL' : 'PUBLISH'
  const eventStatus = isCancelled ? 'CANCELLED' : 'CONFIRMED'
  const location = 'Online (WhatsApp)'
  const uid = bookingCalendarUid(bookingId)
  const dtStamp = formatIcsStamp()
  const dtStart = formatIcsLocalAthens(start)
  const dtEnd = formatIcsLocalAthens(end)

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Moove Fitness//Move & Pose//EN',
    'CALSCALE:GREGORIAN',
    `METHOD:${method}`,
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `SEQUENCE:${Math.max(0, Math.round(Number(sequence) || 0))}`,
    `DTSTART;TZID=${ATHENS_TZ}:${dtStart}`,
    `DTEND;TZID=${ATHENS_TZ}:${dtEnd}`,
    `SUMMARY:${escapeIcsText(summary)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
    `LOCATION:${escapeIcsText(location)}`,
    `URL:${posingBrand.whatsappUrl()}`,
    `STATUS:${eventStatus}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ]

  return lines.flatMap((line) => foldIcsLine(line)).join('\r\n')
}

export function buildGoogleCalendarUrl({
  startAt,
  durationMinutes = DEFAULT_DURATION_MINUTES,
  summary,
  description,
}) {
  const start = new Date(startAt)
  if (Number.isNaN(start.getTime())) {
    throw new Error('invalid_start_at')
  }

  const duration = Math.max(1, Math.round(Number(durationMinutes) || DEFAULT_DURATION_MINUTES))
  const end = new Date(start.getTime() + duration * 60 * 1000)
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: summary,
    dates: `${formatGoogleUtc(start)}/${formatGoogleUtc(end)}`,
    details: description,
    location: 'Online (WhatsApp)',
  })
  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

export function buildCalendarAttachment(icsString) {
  return {
    filename: 'move-pose-session.ics',
    content: icsString,
    contentType: 'text/calendar',
  }
}

export function buildBookingCalendarArtifacts({
  bookingId,
  startAt,
  durationMinutes,
  packageName,
  attendeeName,
  locale = 'el',
  status = 'confirmed',
  sequence = 0,
}) {
  const summary = buildSessionCalendarSummary({ packageName, locale })
  const description = buildSessionCalendarDescription({
    packageName,
    bookingId,
    attendeeName,
    locale,
  })
  const ics = buildIcsEvent({
    bookingId,
    startAt,
    durationMinutes,
    summary,
    description,
    status,
    sequence,
  })
  const googleCalendarUrl =
    status === 'cancelled'
      ? null
      : buildGoogleCalendarUrl({
          startAt,
          durationMinutes,
          summary,
          description,
        })

  return {
    ics,
    googleCalendarUrl,
    attachment: buildCalendarAttachment(ics),
  }
}

export async function fetchBookingCalendarContext(supabase, bookingId) {
  const { data: booking, error } = await supabase
    .from('posing_bookings')
    .select('id, plan_key, status, locale, user_id, slot:availability_slots(start_at)')
    .eq('id', bookingId)
    .maybeSingle()

  if (error || !booking) return null

  const slot = Array.isArray(booking.slot) ? booking.slot[0] : booking.slot
  if (!slot?.start_at) return null

  const [{ data: plan }, { data: profile }, { data: authUser }] = await Promise.all([
    supabase
      .from('package_plans')
      .select('name_en, name_el, duration_minutes')
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
  const attendeeName =
    profile?.full_name ??
    authUser?.user?.user_metadata?.full_name ??
    userEmail?.split('@')[0] ??
    'there'

  return {
    bookingId: booking.id,
    status: booking.status,
    locale: booking.locale,
    startAt: slot.start_at,
    durationMinutes: plan?.duration_minutes ?? DEFAULT_DURATION_MINUTES,
    packageNameEl: plan?.name_el ?? booking.plan_key,
    packageNameEn: plan?.name_en ?? booking.plan_key,
    attendeeName,
    userEmail,
    phone: profile?.phone ?? null,
    division: profile?.division ?? null,
    notes: profile?.notes ?? null,
  }
}

export function packageNameFromContext(context, locale) {
  return locale === 'el' ? context.packageNameEl : context.packageNameEn
}
