import { slotLength, weekSchedule, type ScheduleDay } from '../data/weekSchedule'

/** Classes this close together count as one stretch; a longer gap (the midday break) is closed. */
const MAX_GAP_MINUTES = 60

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function toTime(minutes: number) {
  return `${String(Math.floor(minutes / 60)).padStart(2, '0')}:${String(minutes % 60).padStart(2, '0')}`
}

const weekdayOf: Record<ScheduleDay['key'], number> = { mon: 1, tue: 2, wed: 3, thu: 4, fri: 5, sat: 6 }

type Period = { start: number; end: number }

/** The stretches of a day when classes run, as minutes past midnight. */
function periodsFor(day: ScheduleDay): Period[] {
  const classes = day.slots
    .map((slot) => ({ start: toMinutes(slot.time), end: toMinutes(slot.time) + slotLength(slot) }))
    .sort((a, b) => a.start - b.start)
  const periods: Period[] = []
  for (const c of classes) {
    const last = periods[periods.length - 1]
    if (last && c.start - last.end <= MAX_GAP_MINUTES) last.end = Math.max(last.end, c.end)
    else periods.push({ ...c })
  }
  return periods
}

/** Open periods per weekday (0 = Sunday), taken from the timetable. Days without classes are closed. */
const openingPeriods: Record<number, Period[]> = Object.fromEntries(
  [0, 1, 2, 3, 4, 5, 6].map((weekday) => {
    const day = weekSchedule.find((d) => weekdayOf[d.key] === weekday)
    return [weekday, day ? periodsFor(day) : []]
  }),
)

/** Open periods per day key as "HH:MM" pairs, for the hours shown on the site. */
export function openingPeriodsByDay(): Record<ScheduleDay['key'], [string, string][]> {
  return Object.fromEntries(
    weekSchedule.map((day) => [day.key, periodsFor(day).map((p) => [toTime(p.start), toTime(p.end)])]),
  ) as Record<ScheduleDay['key'], [string, string][]>
}

const dayKeys: Record<number, ScheduleDay['key'] | undefined> = {
  1: 'mon',
  2: 'tue',
  3: 'wed',
  4: 'thu',
  5: 'fri',
  6: 'sat',
}

const weekdayIndex: Record<string, number> = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 }

/** The weekday and minutes past midnight in Volos, wherever the visitor is. */
function athensNow(now: number) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Europe/Athens',
    weekday: 'short',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(new Date(now))
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? ''
  return {
    weekday: weekdayIndex[get('weekday')] ?? new Date(now).getDay(),
    minutes: Number(get('hour')) * 60 + Number(get('minute')),
  }
}

export type StudioStatus =
  | { open: true; closes: string }
  | { open: false; daysAhead: number; dayKey: ScheduleDay['key']; opens: string }

/** Whether the studio is open right now, and if not, when it next opens. */
export function studioStatus(now: number): StudioStatus | null {
  const { weekday, minutes } = athensNow(now)
  const current = openingPeriods[weekday].find((p) => minutes >= p.start && minutes < p.end)
  if (current) return { open: true, closes: toTime(current.end) }

  for (let daysAhead = 0; daysAhead < 7; daysAhead += 1) {
    const day = (weekday + daysAhead) % 7
    const dayKey = dayKeys[day]
    if (!dayKey) continue
    const next = openingPeriods[day].find((p) => daysAhead > 0 || p.start > minutes)
    if (next) return { open: false, daysAhead, dayKey, opens: toTime(next.start) }
  }
  return null
}
