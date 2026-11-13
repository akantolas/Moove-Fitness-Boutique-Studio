import type { ScheduleDay } from '../data/weekSchedule'

/** Opening hours per weekday (0 = Sunday), as "HH:MM" pairs. Matches contact.hoursValue. */
const openingHours: Record<number, readonly [string, string] | null> = {
  0: null,
  1: ['07:00', '21:00'],
  2: ['07:00', '21:00'],
  3: ['07:00', '21:00'],
  4: ['07:00', '21:00'],
  5: ['07:00', '21:00'],
  6: ['09:00', '15:00'],
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

function toMinutes(time: string) {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

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
  const today = openingHours[weekday]
  if (today && minutes >= toMinutes(today[0]) && minutes < toMinutes(today[1])) {
    return { open: true, closes: today[1] }
  }
  for (let daysAhead = 0; daysAhead < 7; daysAhead += 1) {
    const day = (weekday + daysAhead) % 7
    const hours = openingHours[day]
    const dayKey = dayKeys[day]
    if (!hours || !dayKey) continue
    if (daysAhead === 0 && minutes >= toMinutes(hours[0])) continue
    return { open: false, daysAhead, dayKey, opens: hours[0] }
  }
  return null
}
