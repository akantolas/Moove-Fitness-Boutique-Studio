export type ScheduleSlot = {
  time: string
  name: string
}

export type ScheduleDay = {
  key: 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'
  slots: ScheduleSlot[]
}

/** Καλοκαιρινό εβδομαδιαίο group πρόγραμμα — ενημερώνεται από το studio. */
export const weekSchedule: ScheduleDay[] = [
  {
    key: 'mon',
    slots: [
      { time: '8:00', name: 'Reformer' },
      { time: '9:00', name: 'Reformer' },
      { time: '10:00', name: 'Functional' },
      { time: '11:00', name: 'Reformer' },
      { time: '15:00', name: 'Reformer' },
      { time: '16:00', name: 'Reformer' },
      { time: '17:00', name: 'Reformer' },
      { time: '18:00', name: "30' Glutes & Abs" },
      { time: '18:30', name: 'Pilates Mat' },
      { time: '19:30', name: 'Reformer' },
    ],
  },
  {
    key: 'tue',
    slots: [
      { time: '8:30', name: 'Pilates Mat' },
      { time: '9:30', name: 'TRX' },
      { time: '11:20', name: 'Reformer' },
      { time: '16:30', name: 'Reformer' },
      { time: '17:30', name: "30' Glutes & Abs" },
      { time: '18:00', name: 'TRX' },
      { time: '19:00', name: 'Reformer' },
    ],
  },
  {
    key: 'wed',
    slots: [
      { time: '8:00', name: 'Reformer' },
      { time: '9:00', name: 'Reformer' },
      { time: '10:00', name: "40' Magda's Bootycamp" },
      { time: '10:45', name: 'Reformer' },
      { time: '15:00', name: 'Reformer' },
      { time: '16:00', name: 'Reformer' },
      { time: '17:00', name: "40' Magda's Bootycamp" },
      { time: '17:45', name: 'Reformer' },
      { time: '18:45', name: 'Pilates Mat' },
      { time: '19:45', name: 'Reformer' },
    ],
  },
  {
    key: 'thu',
    slots: [
      { time: '8:30', name: 'Pilates Mat' },
      { time: '9:30', name: 'Functional' },
      { time: '11:20', name: 'Reformer' },
      { time: '16:30', name: 'Reformer' },
      { time: '17:30', name: "30' Glutes & Abs" },
      { time: '18:00', name: 'Functional' },
      { time: '19:00', name: 'Reformer' },
      { time: '20:00', name: 'Pilates Mat' },
    ],
  },
  {
    key: 'fri',
    slots: [
      { time: '8:00', name: 'Reformer' },
      { time: '9:00', name: 'Reformer' },
      { time: '10:00', name: "40' Magda's Bootycamp" },
      { time: '10:45', name: 'Reformer' },
      { time: '15:30', name: 'Reformer' },
      { time: '16:30', name: 'Reformer' },
      { time: '17:30', name: 'Reformer' },
      { time: '18:30', name: "40' Magda's Bootycamp" },
      { time: '19:15', name: 'Pilates Mat' },
      { time: '20:10', name: 'Reformer' },
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
