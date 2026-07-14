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

const ATHENS_WEEKDAY_LONG_MAP: Record<string, WeekdayKey> = {
  Monday: '1',
  Tuesday: '2',
  Wednesday: '3',
  Thursday: '4',
  Friday: '5',
  Saturday: '6',
  Sunday: '7',
}

/** ISO weekday (Mon=1 … Sun=7) from an Athens calendar date string. */
function isoWeekdayFromDayKey(dayKey: string): WeekdayKey {
  const [year, month, day] = dayKey.split('-').map(Number)
  const y = month < 3 ? year - 1 : year
  const m = month < 3 ? month + 12 : month
  const k = y % 100
  const j = Math.floor(y / 100)
  const h =
    (day +
      Math.floor((13 * (m + 1)) / 5) +
      k +
      Math.floor(k / 4) +
      Math.floor(j / 4) +
      5 * j) %
    7
  const zellerToIso: WeekdayKey[] = ['6', '7', '1', '2', '3', '4', '5']
  return zellerToIso[h] ?? '1'
}

export function getAthensWeekday(dayKey: string): WeekdayKey {
  const utc = athensWallTimeToUtc(dayKey, '12:00')
  const longName = new Intl.DateTimeFormat('en-US', {
    timeZone: POSE_TIMEZONE,
    weekday: 'long',
  }).format(utc)
  const mapped = ATHENS_WEEKDAY_LONG_MAP[longName]
  if (mapped) return mapped

  if (import.meta.env.DEV) {
    console.warn(`getAthensWeekday: unmapped weekday "${longName}" for ${dayKey}, using ISO fallback`)
  }
  return isoWeekdayFromDayKey(dayKey)
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

function normalizeWeekdayTemplateEntry(
  raw: unknown,
  key: WeekdayKey,
  gridStart: number,
  gridEnd: number,
  defaults: WeekdayTemplates,
): WeekdayTemplate {
  const def = defaults[key]
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return def

  const entry = raw as Record<string, unknown>
  const times = Array.isArray(entry.times)
    ? sortTimeStrings(
        entry.times
          .filter((t): t is string => typeof t === 'string')
          .map((t) => normalizeTimeInput(t))
          .filter((t): t is string => t !== null),
      )
    : [...def.times]

  let start_hour = Number(entry.start_hour)
  let end_hour = Number(entry.end_hour)
  if (!Number.isInteger(start_hour) || start_hour < gridStart || start_hour > 23) {
    start_hour = def.start_hour
  }
  if (!Number.isInteger(end_hour) || end_hour <= start_hour || end_hour > gridEnd) {
    end_hour = def.end_hour
  }
  start_hour = Math.max(gridStart, Math.min(start_hour, end_hour - 1))
  end_hour = Math.min(gridEnd, Math.max(end_hour, start_hour + 1))

  return { times, start_hour, end_hour }
}

export function normalizeCalendarSettings(raw: unknown): CalendarSettings {
  const obj =
    raw && typeof raw === 'object' && !Array.isArray(raw)
      ? (raw as Record<string, unknown>)
      : {}

  const grid_start_hour =
    Number.isInteger(Number(obj.grid_start_hour)) && Number(obj.grid_start_hour) >= 0
      ? Number(obj.grid_start_hour)
      : POSE_GRID_START_HOUR
  const grid_end_hour =
    Number.isInteger(Number(obj.grid_end_hour)) && Number(obj.grid_end_hour) > grid_start_hour
      ? Number(obj.grid_end_hour)
      : POSE_GRID_END_HOUR
  const grid_step_minutes = [15, 30, 60].includes(Number(obj.grid_step_minutes))
    ? Number(obj.grid_step_minutes)
    : POSE_GRID_STEP_MINUTES
  const default_duration_minutes =
    Number.isInteger(Number(obj.default_duration_minutes)) &&
    Number(obj.default_duration_minutes) >= 15
      ? Number(obj.default_duration_minutes)
      : 30

  const defaults = createDefaultWeekdayTemplates(grid_start_hour, grid_end_hour)
  const rawTemplates =
    obj.weekday_templates &&
    typeof obj.weekday_templates === 'object' &&
    !Array.isArray(obj.weekday_templates)
      ? (obj.weekday_templates as Record<string, unknown>)
      : {}

  const coerced: Record<string, unknown> = {}
  for (const [k, v] of Object.entries(rawTemplates)) {
    const key = String(k)
    if (WEEKDAY_KEYS.includes(key as WeekdayKey)) {
      coerced[key] = v
    }
  }

  const weekday_templates = Object.fromEntries(
    WEEKDAY_KEYS.map((key) => [
      key,
      normalizeWeekdayTemplateEntry(coerced[key], key, grid_start_hour, grid_end_hour, defaults),
    ]),
  ) as WeekdayTemplates

  return {
    grid_start_hour,
    grid_end_hour,
    grid_step_minutes,
    default_duration_minutes,
    weekday_templates,
    updated_at:
      typeof obj.updated_at === 'string' || obj.updated_at === null
        ? (obj.updated_at as string | null)
        : undefined,
  }
}

export function formatActiveHoursRange(startHour: number, endHour: number): string {
  const pad = (h: number) => `${String(h).padStart(2, '0')}:00`
  return `${pad(startHour)}–${pad(endHour)}`
}

export function buildAdminGridTimes(
  settings: CalendarSettings,
  slots: { start_at: string }[],
  weekDayKeys?: string[],
): string[] {
  const base = generateGridTimes(settings)
  const fromSlots = slots.map((slot) => athensTimeKey(slot.start_at))
  const merged = mergeGridTimes(base, fromSlots)

  if (!weekDayKeys?.length) return merged

  const slotSet = new Set(fromSlots)
  return merged.filter(
    (time) =>
      weekDayKeys.some((dayKey) => isActiveCell(dayKey, time, settings)) || slotSet.has(time),
  )
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
