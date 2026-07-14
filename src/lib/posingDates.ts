import type { Locale } from '../i18n/types'

export const POSE_TIMEZONE = 'Europe/Athens'
export const POSE_WEEK_DAYS = 7
export const POSE_GRID_START_HOUR = 9
export const POSE_GRID_END_HOUR = 21
export const POSE_GRID_STEP_MINUTES = 30
export const POSE_DAY_PRESET_TIMES = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

export function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

export function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

export function athensDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: POSE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function athensTimeKey(iso: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: POSE_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const hour = parts.find((p) => p.type === 'hour')?.value ?? '00'
  const minute = parts.find((p) => p.type === 'minute')?.value ?? '00'
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

export function cellKey(dayKey: string, time: string) {
  return `${dayKey}:${time}`
}

export function formatDayLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: POSE_TIMEZONE,
  }).format(date)
}

export function formatWeekdayShort(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    timeZone: POSE_TIMEZONE,
  }).format(date)
}

export function formatWeekRange(weekStart: Date, locale: Locale) {
  const weekEnd = addDays(weekStart, POSE_WEEK_DAYS - 1)
  const fmt = new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: POSE_TIMEZONE,
  })
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`
}

export function formatTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: POSE_TIMEZONE,
  }).format(new Date(iso))
}

export function formatSlot(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: POSE_TIMEZONE,
  }).format(new Date(iso))
}

export function generateGridTimes() {
  const times: string[] = []
  for (let hour = POSE_GRID_START_HOUR; hour < POSE_GRID_END_HOUR; hour++) {
    times.push(`${String(hour).padStart(2, '0')}:00`)
    times.push(`${String(hour).padStart(2, '0')}:30`)
  }
  return times
}

export function athensWallTimeToUtc(dayKey: string, time: string): Date {
  const [year, month, day] = dayKey.split('-').map(Number)
  const [hour, minute] = time.split(':').map(Number)

  let utcMs = Date.UTC(year, month - 1, day, hour - 2, minute, 0)

  const formatter = new Intl.DateTimeFormat('en-GB', {
    timeZone: POSE_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  })

  for (let i = 0; i < 5; i++) {
    const parts = formatter.formatToParts(new Date(utcMs))
    const val = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
    const ay = Number(val('year'))
    const am = Number(val('month'))
    const ad = Number(val('day'))
    const ah = Number(val('hour'))
    const amin = Number(val('minute'))

    if (ay === year && am === month && ad === day && ah === hour && amin === minute) {
      return new Date(utcMs)
    }

    utcMs -= ((ah - hour) * 60 + (amin - minute)) * 60_000
    utcMs -= (ad - day) * 24 * 60 * 60_000
  }

  return new Date(utcMs)
}

export function buildSlotIso(dayKey: string, time: string) {
  return athensWallTimeToUtc(dayKey, time).toISOString()
}

export function buildSlotEndIso(dayKey: string, time: string, durationMinutes: number) {
  const start = athensWallTimeToUtc(dayKey, time)
  return new Date(start.getTime() + durationMinutes * 60_000).toISOString()
}

export function isPastCell(dayKey: string, gridTime: string) {
  return athensWallTimeToUtc(dayKey, gridTime).getTime() < Date.now()
}

export function isBookingSlotUpcoming(
  slot: { start_at: string; end_at?: string } | null | undefined,
  now = Date.now(),
) {
  if (!slot?.start_at) return false
  return new Date(slot.start_at).getTime() > now
}

export function slotDurationMinutes(startAt: string, endAt: string) {
  return Math.round((new Date(endAt).getTime() - new Date(startAt).getTime()) / 60_000)
}

export function slotSpansRows(durationMinutes: number) {
  return Math.max(1, Math.ceil(durationMinutes / POSE_GRID_STEP_MINUTES))
}
