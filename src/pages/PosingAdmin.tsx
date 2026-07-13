import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingIsAdmin } from '../lib/posingAccount'
import { adminCreateSlot, adminDeleteSlot } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

type AdminSlot = {
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

const TIMEZONE = 'Europe/Athens'
const WEEK_DAYS = 7

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

function athensDateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

function formatDayLabel(date: Date, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    timeZone: TIMEZONE,
  }).format(date)
}

function formatWeekRange(weekStart: Date, locale: Locale) {
  const weekEnd = addDays(weekStart, WEEK_DAYS - 1)
  const fmt = new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: TIMEZONE,
  })
  return `${fmt.format(weekStart)} – ${fmt.format(weekEnd)}`
}

function formatTime(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  }).format(new Date(startAt))
}

function formatSlot(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: TIMEZONE,
  }).format(new Date(startAt))
}

export function PosingAdminPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const { loading, user, accessToken } = usePosingAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<AdminSlot[]>([])
  const [bookings, setBookings] = useState<
    Array<{
      id: string
      plan_key: string
      status: string
      profiles?: { full_name: string | null; email: string } | null
      slot?: { start_at: string; end_at: string } | null
    }>
  >([])
  const [dayTimes, setDayTimes] = useState<Record<string, string>>({})
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const range = useMemo(() => {
    const from = weekStart.toISOString()
    const to = addDays(weekStart, WEEK_DAYS).toISOString()
    return { from, to }
  }, [weekStart])

  const days = useMemo(
    () => Array.from({ length: WEEK_DAYS }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const slotsByDay = useMemo(() => {
    const map = new Map<string, AdminSlot[]>()
    for (const day of days) {
      map.set(athensDateKey(day), [])
    }
    for (const slot of slots) {
      const key = athensDateKey(new Date(slot.start_at))
      const list = map.get(key)
      if (list) list.push(slot)
    }
    for (const list of map.values()) {
      list.sort((a, b) => a.start_at.localeCompare(b.start_at))
    }
    return map
  }, [days, slots])

  const weekBookings = useMemo(() => {
    const weekKeys = new Set(days.map(athensDateKey))
    return bookings.filter((booking) => {
      if (!booking.slot?.start_at) return false
      return weekKeys.has(athensDateKey(new Date(booking.slot.start_at)))
    })
  }, [bookings, days])

  useEffect(() => {
    if (!loading && !user) {
      navigate('/posing/login?redirect=/posing/admin', { replace: true })
    }
  }, [loading, navigate, user])

  useEffect(() => {
    const userId = user?.id
    if (!userId) return
    fetchPosingIsAdmin(userId)
      .then((isAdmin) => setAuthorized(isAdmin))
      .catch(() => setAuthorized(false))
  }, [user?.id])

  async function loadData() {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      const [slotsRes, bookingsRes] = await Promise.all([
        fetch(`/api/posing/admin/slots?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((r) => r.json()),
        fetch('/api/posing/admin/bookings', {
          headers: { Authorization: `Bearer ${accessToken}` },
        }).then((r) => r.json()),
      ])
      if (!slotsRes.ok) throw new Error(slotsRes.error ?? 'slots_failed')
      if (!bookingsRes.ok) throw new Error(bookingsRes.error ?? 'bookings_failed')
      setSlots(slotsRes.slots ?? [])
      setBookings(bookingsRes.bookings ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setBusy(false)
    }
  }

  useEffect(() => {
    if (!authorized) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin data load
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, range.from, range.to, accessToken])

  function getDayTime(dayKey: string) {
    return dayTimes[dayKey] ?? '10:00'
  }

  async function handleAddSlot(dayKey: string) {
    if (!accessToken) return
    const time = getDayTime(dayKey)
    const startLocal = new Date(`${dayKey}T${time}:00`)
    const endLocal = new Date(startLocal.getTime() + duration * 60_000)
    setBusy(true)
    setError('')
    try {
      await adminCreateSlot(accessToken, startLocal.toISOString(), endLocal.toISOString())
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'create_failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteSlot(id: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      await adminDeleteSlot(accessToken, id)
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'delete_failed')
    } finally {
      setBusy(false)
    }
  }

  if (loading || authorized === null) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 text-center text-white/60">
        {t('posing.account.loading')}
      </div>
    )
  }

  if (!authorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">{t('posing.admin.forbidden')}</h1>
        <Link to="/posing/account" className="mt-6 inline-block text-fuchsia-200 hover:underline">
          {t('posing.account.title')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">Admin</p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-white">{t('posing.admin.title')}</h1>
        </div>
        <Link to="/posing/account" className="text-sm text-fuchsia-200 hover:underline">
          {t('posing.account.title')}
        </Link>
      </div>

      {error ? (
        <p className="mt-6 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <section className="mt-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-white">{t('posing.admin.weekTitle')}</h2>
            <p className="mt-1 text-sm text-white/55">{formatWeekRange(weekStart, locale)}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setWeekStart(startOfWeek(new Date()))}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
            >
              {t('posing.admin.thisWeek')}
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              aria-label={t('posing.admin.previousWeek')}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/5"
              aria-label={t('posing.admin.nextWeek')}
            >
              →
            </button>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-xs text-white"
              aria-label={t('posing.admin.duration')}
            >
              <option value={30}>30 min</option>
              <option value={40}>40 min</option>
            </select>
          </div>
        </div>

        {busy && slots.length === 0 ? (
          <p className="mt-8 text-center text-sm text-white/50">{t('posing.account.loading')}</p>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-7">
            {days.map((day) => {
              const dayKey = athensDateKey(day)
              const daySlots = slotsByDay.get(dayKey) ?? []
              const isToday = dayKey === athensDateKey(new Date())

              return (
                <div
                  key={dayKey}
                  className={`flex min-h-[220px] flex-col rounded-2xl border bg-white/[0.03] p-3 ${
                    isToday ? 'border-fuchsia-300/35 ring-1 ring-fuchsia-300/15' : 'border-white/10'
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
                    {formatDayLabel(day, locale)}
                  </p>

                  <div className="mt-3 flex-1 space-y-2">
                    {daySlots.length === 0 ? (
                      <p className="text-xs text-white/35">{t('posing.admin.noDaySlots')}</p>
                    ) : (
                      daySlots.map((slot) => (
                        <div
                          key={slot.id}
                          className="flex items-start justify-between gap-2 rounded-lg border border-white/10 bg-black/25 px-2.5 py-2"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-white">
                              {formatTime(slot.start_at, locale)}
                            </p>
                            {slot.booking ? (
                              <p className="mt-0.5 truncate text-[11px] text-fuchsia-200/75">
                                {slot.booking.profiles?.full_name ?? slot.booking.profiles?.email} ·{' '}
                                {slot.booking.status}
                              </p>
                            ) : (
                              <p className="mt-0.5 text-[11px] text-emerald-300/70">
                                {t('posing.admin.free')}
                              </p>
                            )}
                          </div>
                          {!slot.booking ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() => handleDeleteSlot(slot.id)}
                              className="shrink-0 rounded-full border border-rose-300/30 px-2 py-0.5 text-[10px] text-rose-200 hover:bg-rose-400/10"
                            >
                              {t('posing.admin.delete')}
                            </button>
                          ) : null}
                        </div>
                      ))
                    )}
                  </div>

                  <form
                    className="mt-3 flex gap-2 border-t border-white/10 pt-3"
                    onSubmit={(event) => {
                      event.preventDefault()
                      void handleAddSlot(dayKey)
                    }}
                  >
                    <input
                      type="time"
                      required
                      value={getDayTime(dayKey)}
                      onChange={(e) =>
                        setDayTimes((prev) => ({ ...prev, [dayKey]: e.target.value }))
                      }
                      className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/30 px-2 py-1.5 text-xs text-white"
                    />
                    <button
                      type="submit"
                      disabled={busy}
                      className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-3 py-1.5 text-xs font-semibold text-black disabled:opacity-50"
                    >
                      {t('posing.admin.add')}
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">{t('posing.admin.bookings')}</h2>
        <p className="mt-1 text-sm text-white/50">{formatWeekRange(weekStart, locale)}</p>
        {weekBookings.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{t('posing.admin.noWeekBookings')}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {weekBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 text-sm text-white/80"
              >
                <span className="text-white">
                  {booking.profiles?.full_name ?? booking.profiles?.email ?? '—'}
                </span>
                {' · '}
                {booking.slot ? formatSlot(booking.slot.start_at, locale) : '—'}
                {' · '}
                {booking.plan_key} · {booking.status}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
