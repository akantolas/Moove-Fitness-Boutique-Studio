import type { Locale } from '../i18n/types'

export const POSE_TIMEZONE = 'Europe/Athens'
export const POSE_WEEK_DAYS = 7
export const POSE_GRID_START_HOUR = 9
export const POSE_GRID_END_HOUR = 21
export const POSE_GRID_STEP_MINUTES = 30
export const POSE_DAY_PRESET_TIMES = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

export type CalendarGridConfig = {
  grid_start_hour: number
  grid_end_hour: number
  grid_step_minutes: number
}

export type WeekdayKey = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export const WEEKDAY_KEYS: WeekdayKey[] = ['1', '2', '3', '4', '5', '6', '7']

export type WeekdayTemplate = {
  times: string[]
  start_hour: number
  end_hour: number
}

export type WeekdayTemplates = Record<WeekdayKey, WeekdayTemplate>

export type CalendarSettings = CalendarGridConfig & {
  weekday_templates: WeekdayTemplates
  default_duration_minutes: number
  updated_at?: string | null
}

export function createDefaultWeekdayTemplates(
  gridStart = POSE_GRID_START_HOUR,
  gridEnd = POSE_GRID_END_HOUR,
): WeekdayTemplates {
  const entry: WeekdayTemplate = {
    times: [...POSE_DAY_PRESET_TIMES],
    start_hour: gridStart,
    end_hour: gridEnd,
  }
  return Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [key, { ...entry, times: [...entry.times] }]),
  ) as WeekdayTemplates
}

export const DEFAULT_CALENDAR_SETTINGS: CalendarSettings = {
  weekday_templates: createDefaultWeekdayTemplates(),
  default_duration_minutes: 30,
  grid_start_hour: POSE_GRID_START_HOUR,
  grid_end_hour: POSE_GRID_END_HOUR,
  grid_step_minutes: POSE_GRID_STEP_MINUTES,
}

const TIME_INPUT_RE = /^([01]?\d|2[0-3]):([0-5]\d)$/

export function normalizeTimeInput(value: string): string | null {
  const trimmed = value.trim()
  if (!TIME_INPUT_RE.test(trimmed)) return null
  const [hour, minute] = trimmed.split(':')
  return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}`
}

export function sortTimeStrings(times: string[]): string[] {
  return [...times].sort((a, b) => {
    const [ah, am] = a.split(':').map(Number)
    const [bh, bm] = b.split(':').map(Number)
    return ah * 60 + am - (bh * 60 + bm)
  })
}

export function mergeGridTimes(baseTimes: string[], extraTimes: string[]): string[] {
  const merged = new Set(baseTimes)
  for (const time of extraTimes) {
    const normalized = normalizeTimeInput(time)
    if (normalized) merged.add(normalized)
  }
  return sortTimeStrings([...merged])
}

export function timeToMinutes(time: string): number {
  const [hour, minute] = time.split(':').map(Number)
  return hour * 60 + minute
}

const ATHENS_WEEKDAY_MAP: Record<string, WeekdayKey> = {
  Mon: '1',
  Tue: '2',
  Wed: '3',
  Thu: '4',
  Fri: '5',
  Sat: '6',
  Sun: '7',
}

export function getAthensWeekday(dayKey: string): WeekdayKey {
  const utc = athensWallTimeToUtc(dayKey, '12:00')
  const short = new Intl.DateTimeFormat('en-US', {
    timeZone: POSE_TIMEZONE,
    weekday: 'short',
  }).format(utc)
  return ATHENS_WEEKDAY_MAP[short] ?? '1'
}

export function getWeekdayTemplate(settings: CalendarSettings, weekday: WeekdayKey): WeekdayTemplate {
  const fallback = createDefaultWeekdayTemplates(settings.grid_start_hour, settings.grid_end_hour)[weekday]
  return settings.weekday_templates[weekday] ?? fallback
}

export function getWeekdayTemplateForDay(dayKey: string, settings: CalendarSettings): WeekdayTemplate {
  return getWeekdayTemplate(settings, getAthensWeekday(dayKey))
}

export function isActiveCell(dayKey: string, time: string, settings: CalendarSettings): boolean {
  const { start_hour, end_hour } = getWeekdayTemplateForDay(dayKey, settings)
  const minutes = timeToMinutes(time)
  return minutes >= start_hour * 60 && minutes < end_hour * 60
}

export function buildAdminGridTimes(
  settings: CalendarSettings,
  slots: { start_at: string }[],
): string[] {
  const base = generateGridTimes(settings)
  const fromSlots = slots.map((slot) => athensTimeKey(slot.start_at))
  return mergeGridTimes(base, fromSlots)
}

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

export function generateGridTimes(config: Partial<CalendarGridConfig> = {}) {
  const startHour = config.grid_start_hour ?? POSE_GRID_START_HOUR
  const endHour = config.grid_end_hour ?? POSE_GRID_END_HOUR
  const stepMinutes = config.grid_step_minutes ?? POSE_GRID_STEP_MINUTES
  const times: string[] = []

  for (let totalMinutes = startHour * 60; totalMinutes < endHour * 60; totalMinutes += stepMinutes) {
    const hour = Math.floor(totalMinutes / 60)
    const minute = totalMinutes % 60
    times.push(`${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`)
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

export function slotSpansRows(durationMinutes: number, stepMinutes = POSE_GRID_STEP_MINUTES) {
  return Math.max(1, Math.ceil(durationMinutes / stepMinutes))
}
