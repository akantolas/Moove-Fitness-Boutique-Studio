import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { createPosingBooking, fetchPosingSlots } from '../lib/posingApi'
import { isSupabaseConfigured } from '../lib/supabase'
import type { PosingPackageKey } from '../site'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

type PoseBookingCalendarProps = {
  selectedPackageKey: PosingPackageKey
  selectedPackageName: string
  locale: Locale
}

function startOfWeek(date: Date) {
  const d = new Date(date)
  const day = d.getDay()
  const diff = day === 0 ? -6 : 1 - day
  d.setDate(d.getDate() + diff)
  d.setHours(0, 0, 0, 0)
  return d
}

function addDays(date: Date, days: number) {
  const d = new Date(date)
  d.setDate(d.getDate() + days)
  return d
}

function formatDayLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: 'Europe/Athens',
  }).format(date)
}

function formatTime(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(startAt))
}

export function PoseBookingCalendar({
  selectedPackageKey,
  selectedPackageName,
  locale,
}: PoseBookingCalendarProps) {
  const { t } = useTranslation()
  const { configured, loading: authLoading, user, accessToken } = usePosingAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<Array<{ id: string; start_at: string; end_at: string }>>([])
  const [selectedSlotId, setSelectedSlotId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [booking, setBooking] = useState(false)

  const range = useMemo(() => {
    const from = weekStart.toISOString()
    const to = addDays(weekStart, 14).toISOString()
    return { from, to }
  }, [weekStart])

  const loadSlots = useCallback(async () => {
    if (!isSupabaseConfigured) {
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const data = await fetchPosingSlots(range.from, range.to)
      setSlots(data.filter((s) => new Date(s.start_at) > new Date()))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'slots_failed')
      setSlots([])
    } finally {
      setLoading(false)
    }
  }, [range.from, range.to])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async slot fetch
    void loadSlots()
  }, [loadSlots])

  const days = useMemo(() => {
    return Array.from({ length: 14 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const slotsByDay = useMemo(() => {
    const map = new Map<string, typeof slots>()
    for (const day of days) {
      const key = day.toISOString().slice(0, 10)
      map.set(key, [])
    }
    for (const slot of slots) {
      const athensDate = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Europe/Athens',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(new Date(slot.start_at))
      const list = map.get(athensDate)
      if (list) list.push(slot)
    }
    return map
  }, [days, slots])

  async function handleBook() {
    if (!selectedSlotId || !accessToken) return
    setBooking(true)
    setError('')
    setSuccess('')
    try {
      const result = await createPosingBooking(accessToken, {
        slot_id: selectedSlotId,
        plan_key: selectedPackageKey,
        locale,
      })
      setSuccess(typeof result.message === 'string' ? result.message : t('posing.calendar.success'))
      setSelectedSlotId(null)
      await loadSlots()
    } catch (err) {
      const code = err instanceof Error ? err.message : ''
      if (code === 'slot_taken') {
        setError(t('posing.calendar.slotTaken'))
      } else if (code === 'unauthorized') {
        setError(t('posing.calendar.loginRequired'))
      } else {
        setError(t('posing.calendar.error'))
      }
    } finally {
      setBooking(false)
    }
  }

  if (!configured) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-6 text-center text-sm text-white/70">
        {t('posing.auth.notConfigured')}
      </div>
    )
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-black/25 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-200/80">
          {t('posing.calendar.title')}
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, -7))}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setWeekStart((d) => addDays(d, 7))}
            className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
          >
            →
          </button>
        </div>
      </div>

      {!user && !authLoading ? (
        <div className="mb-6 rounded-xl border border-fuchsia-200/20 bg-fuchsia-500/10 px-4 py-4 text-sm text-fuchsia-100">
          {t('posing.calendar.loginPrompt')}{' '}
          <Link
            to={`/posing/login?redirect=${encodeURIComponent('/posing#booking')}`}
            className="font-semibold underline underline-offset-2"
          >
            {t('posing.auth.login')}
          </Link>
          {' · '}
          <Link
            to={`/posing/signup?redirect=${encodeURIComponent('/posing#booking')}`}
            className="font-semibold underline underline-offset-2"
          >
            {t('posing.auth.signup')}
          </Link>
        </div>
      ) : null}

      {loading ? (
        <p className="py-8 text-center text-sm text-white/50">{t('posing.calendar.loading')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {days.map((day) => {
            const key = new Intl.DateTimeFormat('en-CA', {
              timeZone: 'Europe/Athens',
              year: 'numeric',
              month: '2-digit',
              day: '2-digit',
            }).format(day)
            const daySlots = slotsByDay.get(key) ?? []
            return (
              <div
                key={key}
                className="rounded-xl border border-white/10 bg-white/[0.03] p-3"
              >
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                  {formatDayLabel(day, locale)}
                </p>
                {daySlots.length === 0 ? (
                  <p className="mt-3 text-xs text-white/35">{t('posing.calendar.noSlots')}</p>
                ) : (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {daySlots.map((slot) => {
                      const selected = selectedSlotId === slot.id
                      return (
                        <button
                          key={slot.id}
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className={`rounded-full px-3 py-1.5 text-xs font-medium transition ${
                            selected
                              ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black'
                              : 'border border-white/15 bg-black/30 text-white/80 hover:border-fuchsia-200/40'
                          }`}
                        >
                          {formatTime(slot.start_at, locale)}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {selectedSlotId ? (
        <div className="mt-6 rounded-xl border border-fuchsia-200/25 bg-fuchsia-500/10 px-4 py-4">
          <p className="text-sm text-white">
            {t('posing.booking.selectedLabel')}: <strong>{selectedPackageName}</strong>
          </p>
          <button
            type="button"
            disabled={!user || booking}
            onClick={handleBook}
            className="mt-4 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black disabled:cursor-not-allowed disabled:opacity-50"
          >
            {booking ? t('posing.calendar.booking') : t('posing.calendar.confirm')}
          </button>
        </div>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      {success ? (
        <p className="mt-4 rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {success}
        </p>
      ) : null}
    </div>
  )
}
