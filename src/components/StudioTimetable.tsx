import { useState } from 'react'
import { weekSchedule, type ScheduleDay } from '../data/weekSchedule'
import type { NextClass } from '../lib/nextClass'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

/** Day picker and the chosen day's classes, with the next class marked in lime. */
export function StudioTimetable({ next }: { next: NextClass | null }) {
  const { t, dictionary } = useTranslation()
  const [dayKey, setDayKey] = useState<ScheduleDay['key']>(() => next?.day.key ?? 'mon')
  const shownDay = weekSchedule.find((d) => d.key === dayKey) ?? weekSchedule[0]
  const days = dictionary.schedule.days

  return (
    <>
      <div className="-mx-1 flex flex-wrap gap-1" role="group" aria-label={dictionary.schedule.daysAria}>
        {weekSchedule.map((day) => (
          <button
            key={day.key}
            type="button"
            className="studio-day"
            aria-pressed={day.key === shownDay.key}
            onClick={() => setDayKey(day.key)}
          >
            <span aria-hidden>{days[day.key].label.slice(0, 3)}</span>
            <span className="sr-only">{days[day.key].label}</span>
          </button>
        ))}
      </div>

      <table className="mt-8 w-full border-collapse text-left">
        <caption className="studio-lead pb-4 text-left font-semibold">{days[shownDay.key].label}</caption>
        <thead className="sr-only">
          <tr>
            <th scope="col">{t('home.schedule.hours')}</th>
            <th scope="col">{dictionary.schedule.lesson}</th>
            <th scope="col">{t('home.schedule.book')}</th>
          </tr>
        </thead>
        <tbody>
          {shownDay.slots.map((slot, i) => {
            const isNext = next?.day.key === shownDay.key && next.slot === slot
            return (
              <tr
                key={`${slot.time}-${slot.name}`}
                className={isNext ? 'bg-moove-lime' : i % 2 === 0 ? 'bg-moove-bg' : undefined}
              >
                <td className="w-[22%] py-3.5 pl-4 align-baseline tabular-nums text-moove-muted">
                  <span className={isNext ? 'font-semibold text-moove-ink' : undefined}>{slot.time}</span>
                </td>
                <td className="py-3.5 align-baseline font-semibold">
                  {slot.name}
                  {isNext ? <span className="ml-2 font-normal">· {t('home.schedule.next')}</span> : null}
                </td>
                <td className="py-3.5 pr-4 text-right align-baseline">
                  <a
                    href={site.bookingUrl}
                    {...bookingProps}
                    className="studio-small inline-flex min-h-11 items-center gap-1 underline-offset-4 hover:underline"
                  >
                    {t('home.schedule.book')}
                    <span aria-hidden>→</span>
                  </a>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </>
  )
}
