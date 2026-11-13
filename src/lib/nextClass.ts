import { weekSchedule, type ScheduleDay, type ScheduleSlot } from '../data/weekSchedule'

/** Weekday index (0 = Sunday) for each day in the studio timetable. */
const dayIndex: Record<ScheduleDay['key'], number> = {
  mon: 1,
  tue: 2,
  wed: 3,
  thu: 4,
  fri: 5,
  sat: 6,
}

function slotMinutes(slot: ScheduleSlot) {
  const [h, m] = slot.time.split(':').map(Number)
  return h * 60 + m
}

export type NextClass = { day: ScheduleDay; slot: ScheduleSlot; daysAhead: number }

/** The first class in the weekly timetable that has not started yet. */
export function findNextClass(now: number): NextClass | null {
  const date = new Date(now)
  const today = date.getDay()
  const minutes = date.getHours() * 60 + date.getMinutes()
  for (let daysAhead = 0; daysAhead < 7; daysAhead += 1) {
    const weekday = (today + daysAhead) % 7
    const day = weekSchedule.find((d) => dayIndex[d.key] === weekday)
    if (!day) continue
    const slot = day.slots.find((s) => daysAhead > 0 || slotMinutes(s) > minutes)
    if (slot) return { day, slot, daysAhead }
  }
  return null
}
