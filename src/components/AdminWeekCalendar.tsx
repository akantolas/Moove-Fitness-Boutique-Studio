import { useMemo, useState } from 'react'
import {
  addDays,
  athensDateKey,
  cellKey,
  athensTimeKey,
  formatDayLabel,
  formatWeekRange,
  formatWeekdayShort,
  generateGridTimes,
  isPastCell,
  POSE_WEEK_DAYS,
  slotDurationMinutes,
  slotSpansRows,
  startOfWeek,
} from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

export type AdminCalendarSlot = {
  id: string
  start_at: string
  end_at: string
  is_blocked: boolean
  booking?: {
    id: string
    status: string
    plan_key: string
    profiles?: { full_name: string | null; email: string } | null
  } | null
}

type CellState = 'empty' | 'open' | 'booked' | 'past' | 'continuation'

type CellInfo = {
  state: CellState
  slot?: AdminCalendarSlot
  rowSpan: number
  isStart: boolean
}

type AdminWeekCalendarProps = {
  slots: AdminCalendarSlot[]
  weekStart: Date
  duration: number
  locale: Locale
  busy: boolean
  loading: boolean
  onWeekStartChange: (date: Date) => void
  onDurationChange: (minutes: number) => void
  onToggleSlot: (dayKey: string, time: string) => void
  onOpenDayPreset: (dayKey: string) => void
  onClearDay: (dayKey: string) => void
}

function TimeGrid({
  days,
  gridTimes,
  cellMap,
  locale,
  busy,
  onToggleSlot,
  onOpenDayPreset,
  onClearDay,
  t,
}: {
  days: Date[]
  gridTimes: string[]
  cellMap: Map<string, CellInfo>
  locale: Locale
  busy: boolean
  onToggleSlot: (dayKey: string, time: string) => void
  onOpenDayPreset: (dayKey: string) => void
  onClearDay: (dayKey: string) => void
  t: (key: string) => string
}) {
  const todayKey = athensDateKey(new Date())

  return (
    <div className="overflow-x-auto">
      <div
        className="min-w-[640px] grid"
        style={{
          gridTemplateColumns: `3.5rem repeat(${days.length}, minmax(0, 1fr))`,
          gridTemplateRows: `auto repeat(${gridTimes.length}, minmax(2.25rem, auto))`,
        }}
      >
        <div className="sticky left-0 z-20 border-b border-white/10 bg-[#0c0c10]" />
        {days.map((day) => {
          const dayKey = athensDateKey(day)
          const isToday = dayKey === todayKey
          return (
            <div
              key={dayKey}
              className={`border-b border-l border-white/10 px-2 py-3 text-center ${
                isToday ? 'bg-fuchsia-500/10' : 'bg-[#0c0c10]'
              }`}
            >
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-white/50">
                {formatWeekdayShort(day, locale)}
              </p>
              <p className="mt-0.5 text-xs font-medium text-white">{formatDayLabel(day, locale)}</p>
              <div className="mt-2 flex justify-center gap-1">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onOpenDayPreset(dayKey)}
                  className="rounded-md border border-emerald-300/25 px-1.5 py-0.5 text-[10px] text-emerald-200/90 hover:bg-emerald-400/10 disabled:opacity-40"
                  title={t('posing.admin.openDay')}
                >
                  {t('posing.admin.openDay')}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => onClearDay(dayKey)}
                  className="rounded-md border border-rose-300/25 px-1.5 py-0.5 text-[10px] text-rose-200/90 hover:bg-rose-400/10 disabled:opacity-40"
                  title={t('posing.admin.clearDay')}
                >
                  {t('posing.admin.clearDay')}
                </button>
              </div>
            </div>
          )
        })}

        {gridTimes.map((gridTime, rowIndex) => {
          const gridRow = rowIndex + 2
          return (
            <div key={gridTime} className="contents">
              <div
                style={{ gridRow, gridColumn: 1 }}
                className="sticky left-0 z-10 flex items-start border-b border-white/5 bg-[#0c0c10] px-2 py-2 text-[11px] text-white/40"
              >
                {gridTime}
              </div>
              {days.map((day, dayIndex) => {
                const dayKey = athensDateKey(day)
                const key = cellKey(dayKey, gridTime)
                const info = cellMap.get(key)

                if (info?.state === 'continuation') return null

                const past = isPastCell(dayKey, gridTime)
                const state: CellState = past
                  ? info?.state === 'booked'
                    ? 'booked'
                    : 'past'
                  : (info?.state ?? 'empty')

                const rowSpan = info?.rowSpan ?? 1
                const slot = info?.slot
                const clientName =
                  slot?.booking?.profiles?.full_name ?? slot?.booking?.profiles?.email

                let cellClass =
                  'border-b border-l border-white/5 p-1 transition min-h-[2.25rem] '
                if (state === 'empty' && !past) {
                  cellClass += 'bg-white/[0.02] hover:bg-emerald-400/10 cursor-pointer'
                } else if (state === 'open') {
                  cellClass +=
                    'bg-emerald-400/15 border-emerald-300/25 hover:bg-emerald-400/25 cursor-pointer'
                } else if (state === 'booked') {
                  cellClass += 'bg-fuchsia-500/20 border-fuchsia-300/30 cursor-not-allowed'
                } else if (state === 'past') {
                  cellClass += 'bg-white/[0.01] opacity-40 cursor-not-allowed'
                }

                const canToggle = !busy && (state === 'empty' || state === 'open')

                return (
                  <button
                    key={key}
                    type="button"
                    disabled={!canToggle}
                    style={{
                      gridRow: `${gridRow} / span ${rowSpan}`,
                      gridColumn: dayIndex + 2,
                    }}
                    onClick={() => canToggle && onToggleSlot(dayKey, gridTime)}
                    className={`${cellClass} text-left`}
                    title={
                      state === 'booked' && clientName
                        ? `${t('posing.admin.slotBooked')}: ${clientName}`
                        : undefined
                    }
                  >
                    {state === 'open' ? (
                      <span className="block px-1 text-[10px] font-medium text-emerald-200/90">
                        {t('posing.admin.legendOpen')}
                        {rowSpan > 1 ? ` · ${rowSpan * 30}'` : ''}
                      </span>
                    ) : null}
                    {state === 'booked' ? (
                      <span className="block truncate px-1 text-[10px] font-medium text-fuchsia-100/90">
                        {clientName ?? t('posing.admin.slotBooked')}
                      </span>
                    ) : null}
                  </button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-white/55">
      <span className={`h-2.5 w-2.5 rounded-sm ${color}`} aria-hidden />
      {label}
    </span>
  )
}

function buildCellMap(slots: AdminCalendarSlot[], gridTimes: string[]) {
  const map = new Map<string, CellInfo>()

  for (const slot of slots) {
    const dayKey = athensDateKey(new Date(slot.start_at))
    const startTime = athensTimeKey(slot.start_at)
    const duration = slotDurationMinutes(slot.start_at, slot.end_at)
    const rows = slotSpansRows(duration)
    const startIdx = gridTimes.indexOf(startTime)
    if (startIdx === -1) continue

    const booked = Boolean(slot.booking)
    const state: CellState = booked ? 'booked' : 'open'

    map.set(cellKey(dayKey, startTime), {
      state,
      slot,
      rowSpan: rows,
      isStart: true,
    })

    for (let i = 1; i < rows; i++) {
      const contTime = gridTimes[startIdx + i]
      if (!contTime) break
      map.set(cellKey(dayKey, contTime), {
        state: 'continuation',
        slot,
        rowSpan: 1,
        isStart: false,
      })
    }
  }

  return map
}

export function AdminWeekCalendar({
  slots,
  weekStart,
  duration,
  locale,
  busy,
  loading,
  onWeekStartChange,
  onDurationChange,
  onToggleSlot,
  onOpenDayPreset,
  onClearDay,
}: AdminWeekCalendarProps) {
  const { t } = useTranslation()
  const [mobileDayIndex, setMobileDayIndex] = useState(() => {
    const today = new Date()
    const weekStartToday = startOfWeek(today)
    const diff = Math.floor(
      (today.getTime() - weekStartToday.getTime()) / (24 * 60 * 60_000),
    )
    return Math.min(Math.max(diff, 0), POSE_WEEK_DAYS - 1)
  })

  const gridTimes = useMemo(() => generateGridTimes(), [])

  const days = useMemo(
    () => Array.from({ length: POSE_WEEK_DAYS }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const cellMap = useMemo(() => buildCellMap(slots, gridTimes), [slots, gridTimes])

  const mobileDay = days[mobileDayIndex] ?? days[0]

  return (
    <section className="relative mt-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{t('posing.admin.weekTitle')}</h2>
          <p className="mt-1 text-sm text-white/55">{formatWeekRange(weekStart, locale)}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onWeekStartChange(startOfWeek(new Date()))}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
          >
            {t('posing.admin.thisWeek')}
          </button>
          <button
            type="button"
            onClick={() => onWeekStartChange(addDays(weekStart, -7))}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            aria-label={t('posing.admin.previousWeek')}
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => onWeekStartChange(addDays(weekStart, 7))}
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            aria-label={t('posing.admin.nextWeek')}
          >
            →
          </button>
          <select
            value={duration}
            onChange={(e) => onDurationChange(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
            aria-label={t('posing.admin.duration')}
          >
            <option value={30}>30 min</option>
            <option value={40}>40 min</option>
          </select>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <LegendItem color="bg-white/10" label={t('posing.admin.legendEmpty')} />
        <LegendItem color="bg-emerald-400/40" label={t('posing.admin.legendOpen')} />
        <LegendItem color="bg-fuchsia-400/50" label={t('posing.admin.legendBooked')} />
      </div>

      <div className="relative mt-6 overflow-hidden rounded-2xl border border-white/10 bg-black/25">
        {busy ? (
          <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-[1px]">
            <p className="rounded-full border border-white/10 bg-black/60 px-4 py-2 text-xs text-white/70">
              {loading ? t('posing.account.loading') : t('posing.admin.opening')}
            </p>
          </div>
        ) : null}

        <div className="hidden lg:block">
          <TimeGrid
            days={days}
            gridTimes={gridTimes}
            cellMap={cellMap}
            locale={locale}
            busy={busy}
            onToggleSlot={onToggleSlot}
            onOpenDayPreset={onOpenDayPreset}
            onClearDay={onClearDay}
            t={t}
          />
        </div>

        <div className="lg:hidden">
          <div className="flex gap-1 overflow-x-auto border-b border-white/10 p-2">
            {days.map((day, index) => {
              const dayKey = athensDateKey(day)
              const isToday = dayKey === athensDateKey(new Date())
              const active = index === mobileDayIndex
              return (
                <button
                  key={dayKey}
                  type="button"
                  onClick={() => setMobileDayIndex(index)}
                  className={`shrink-0 rounded-lg px-3 py-2 text-xs font-medium transition ${
                    active
                      ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black'
                      : isToday
                        ? 'border border-fuchsia-300/35 text-fuchsia-100'
                        : 'border border-white/10 text-white/70'
                  }`}
                >
                  {formatWeekdayShort(day, locale)}
                </button>
              )
            })}
          </div>
          <TimeGrid
            days={[mobileDay]}
            gridTimes={gridTimes}
            cellMap={cellMap}
            locale={locale}
            busy={busy}
            onToggleSlot={onToggleSlot}
            onOpenDayPreset={onOpenDayPreset}
            onClearDay={onClearDay}
            t={t}
          />
        </div>
      </div>
    </section>
  )
}
