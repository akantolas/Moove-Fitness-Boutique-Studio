import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AdminWeekCalendar } from '../components/AdminWeekCalendar'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingIsAdmin } from '../lib/posingAccount'
import { adminCreateSlot, adminDeleteSlot } from '../lib/posingApi'
import {
  addDays,
  athensDateKey,
  athensTimeKey,
  buildSlotEndIso,
  buildSlotIso,
  cellKey,
  formatSlot,
  formatWeekRange,
  isPastCell,
  POSE_DAY_PRESET_TIMES,
  POSE_WEEK_DAYS,
  startOfWeek,
} from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'

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
  const [duration, setDuration] = useState(30)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [dataLoading, setDataLoading] = useState(false)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const range = useMemo(() => {
    const from = weekStart.toISOString()
    const to = addDays(weekStart, POSE_WEEK_DAYS).toISOString()
    return { from, to }
  }, [weekStart])

  const days = useMemo(
    () => Array.from({ length: POSE_WEEK_DAYS }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  )

  const slotByCell = useMemo(() => {
    const map = new Map<string, AdminSlot>()
    for (const slot of slots) {
      const dayKey = athensDateKey(new Date(slot.start_at))
      const time = athensTimeKey(slot.start_at)
      map.set(cellKey(dayKey, time), slot)
    }
    return map
  }, [slots])

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
    setDataLoading(true)
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
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (!authorized) return
    // eslint-disable-next-line react-hooks/set-state-in-effect -- admin data load
    void loadData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, range.from, range.to, accessToken])

  async function handleToggleSlot(dayKey: string, time: string) {
    if (!accessToken || isPastCell(dayKey, time)) return

    const existing = slotByCell.get(cellKey(dayKey, time))
    if (existing?.booking) return

    setBusy(true)
    setError('')
    try {
      if (existing) {
        await adminDeleteSlot(accessToken, existing.id)
      } else {
        const start_at = buildSlotIso(dayKey, time)
        const end_at = buildSlotEndIso(dayKey, time, duration)
        await adminCreateSlot(accessToken, start_at, end_at)
      }
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'toggle_failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleOpenDayPreset(dayKey: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      const toCreate = POSE_DAY_PRESET_TIMES.filter((time) => {
        if (isPastCell(dayKey, time)) return false
        return !slotByCell.has(cellKey(dayKey, time))
      })

      await Promise.all(
        toCreate.map((time) =>
          adminCreateSlot(
            accessToken,
            buildSlotIso(dayKey, time),
            buildSlotEndIso(dayKey, time, duration),
          ),
        ),
      )
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'preset_failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleClearDay(dayKey: string) {
    if (!accessToken) return
    setBusy(true)
    setError('')
    try {
      const toDelete = slots.filter((slot) => {
        if (athensDateKey(new Date(slot.start_at)) !== dayKey) return false
        return !slot.booking
      })

      await Promise.all(toDelete.map((slot) => adminDeleteSlot(accessToken, slot.id)))
      await loadData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'clear_failed')
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
    <div className="mx-auto max-w-7xl px-4 py-16 sm:py-20">
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

      <AdminWeekCalendar
        slots={slots}
        weekStart={weekStart}
        duration={duration}
        locale={locale}
        busy={busy || dataLoading}
        loading={dataLoading}
        onWeekStartChange={setWeekStart}
        onDurationChange={setDuration}
        onToggleSlot={handleToggleSlot}
        onOpenDayPreset={handleOpenDayPreset}
        onClearDay={handleClearDay}
      />

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
