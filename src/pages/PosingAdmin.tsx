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

function formatSlot(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
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
  const [slotDate, setSlotDate] = useState('')
  const [slotTime, setSlotTime] = useState('10:00')
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const range = useMemo(() => {
    const from = weekStart.toISOString()
    const to = addDays(weekStart, 14).toISOString()
    return { from, to }
  }, [weekStart])

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

  async function handleAddSlot(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken || !slotDate) return
    const startLocal = new Date(`${slotDate}T${slotTime}:00`)
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
    <div className="mx-auto max-w-4xl px-4 py-16 sm:py-20">
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

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
        <h2 className="text-lg font-semibold text-white">{t('posing.admin.addSlot')}</h2>
        <form className="mt-4 grid gap-4 sm:grid-cols-4" onSubmit={handleAddSlot}>
          <div>
            <label className="text-xs text-white/50">{t('posing.admin.date')}</label>
            <input
              type="date"
              required
              value={slotDate}
              onChange={(e) => setSlotDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">{t('posing.admin.time')}</label>
            <input
              type="time"
              required
              value={slotTime}
              onChange={(e) => setSlotTime(e.target.value)}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            />
          </div>
          <div>
            <label className="text-xs text-white/50">{t('posing.admin.duration')}</label>
            <select
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              className="mt-1 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white"
            >
              <option value={30}>30 min</option>
              <option value={40}>40 min</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              type="submit"
              disabled={busy}
              className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-sm font-semibold text-black disabled:opacity-50"
            >
              {t('posing.admin.add')}
            </button>
          </div>
        </form>
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{t('posing.admin.slots')}</h2>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setWeekStart((d) => addDays(d, -7))}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70"
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => setWeekStart((d) => addDays(d, 7))}
              className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/70"
            >
              →
            </button>
          </div>
        </div>
        {busy && slots.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{t('posing.account.loading')}</p>
        ) : slots.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{t('posing.admin.noSlots')}</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {slots.map((slot) => (
              <li
                key={slot.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3"
              >
                <div>
                  <p className="text-sm text-white">{formatSlot(slot.start_at, locale)}</p>
                  {slot.booking ? (
                    <p className="mt-1 text-xs text-fuchsia-200/70">
                      {slot.booking.profiles?.full_name ?? slot.booking.profiles?.email} ·{' '}
                      {slot.booking.status}
                    </p>
                  ) : (
                    <p className="mt-1 text-xs text-emerald-300/70">{t('posing.admin.free')}</p>
                  )}
                </div>
                {!slot.booking ? (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => handleDeleteSlot(slot.id)}
                    className="rounded-full border border-rose-300/30 px-3 py-1 text-xs text-rose-200 hover:bg-rose-400/10"
                  >
                    {t('posing.admin.delete')}
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">{t('posing.admin.bookings')}</h2>
        <ul className="mt-4 space-y-2">
          {bookings.map((booking) => (
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
      </section>
    </div>
  )
}
