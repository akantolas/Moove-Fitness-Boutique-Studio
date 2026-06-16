export type ScheduleSlot = {
  time: string
  name: string
}

export type ScheduleDay = {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  slots: ScheduleSlot[]
}

/** Εβδομαδιαίο group πρόγραμμα — ενημερώνεται από το studio. */
export const weekSchedule: ScheduleDay[] = [
  {
    key: 'mon',
    slots: [
      { time: '8:00–9:00', name: 'Reformer' },
      { time: '10:00', name: 'Functional / Cross Training' },
      { time: '11:00', name: 'Reformer' },
      { time: '14:30–17:30', name: 'Reformer' },
      { time: '18:30', name: 'Pilates Mat Group 1' },
      { time: '19:30', name: 'Pilates Mat Group 2' },
      { time: '20:30', name: 'Reformer' },
    ],
  },
  {
    key: 'tue',
    slots: [
      { time: '8:30', name: 'Pilates Mat' },
      { time: '9:30', name: 'TRX' },
      { time: '10:30', name: 'Ladies Reformer' },
      { time: '11:20', name: 'Reformer' },
      { time: '15:30', name: "30' Glutes & Abs" },
      { time: '16:00–17:00', name: 'Reformer' },
      { time: '18:00', name: 'TRX' },
      { time: '19:00–20:00', name: 'Reformer' },
    ],
  },
  {
    key: 'wed',
    slots: [
      { time: '8:00–9:00', name: 'Reformer' },
      { time: '10:00', name: "40' Magda's Bootycamp" },
      { time: '10:45', name: 'Reformer' },
      { time: '14:30–15:30', name: 'Reformer' },
      { time: '16:30', name: "40' Magda's Bootycamp" },
      { time: '17:15', name: 'Reformer' },
      { time: '18:15', name: 'Pilates Mat Group 1' },
      { time: '19:15', name: 'Pilates Mat Group 2' },
      { time: '20:15', name: 'Reformer' },
    ],
  },
  {
    key: 'thu',
    slots: [
      { time: '8:30', name: 'Pilates Mat' },
      { time: '9:30', name: 'Functional / Cross Training' },
      { time: '10:30', name: 'Ladies Reformer' },
      { time: '11:20', name: 'Reformer' },
      { time: '15:00', name: "30' Glutes & Abs" },
      { time: '15:30–16:30', name: 'Reformer' },
      { time: '17:30', name: 'Functional / Cross Training' },
      { time: '18:30–19:30', name: 'Reformer' },
      { time: '20:30', name: "30' Glutes & Abs" },
      { time: '21:10', name: 'Pilates Mat' },
    ],
  },
  {
    key: 'fri',
    slots: [
      { time: '8:00–9:00', name: 'Reformer' },
      { time: '10:00', name: "40' Magda's Bootycamp" },
      { time: '10:45', name: 'Reformer' },
      { time: '15:00–17:00', name: 'Reformer' },
      { time: '18:00', name: "40' Magda's Bootycamp" },
      { time: '18:45', name: 'Pilates Mat' },
      { time: '19:45–20:45', name: 'Reformer' },
    ],
  },
  {
    key: 'sat',
    slots: [
      { time: '9:30', name: 'Pilates Mat' },
      { time: '10:30', name: 'Reformer' },
    ],
  },
]
