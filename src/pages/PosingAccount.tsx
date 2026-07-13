import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingAccountData } from '../lib/posingAccount'
import type { PosingBooking, UserPackage } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

function formatSlotTime(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(startAt))
}

function statusLabel(status: string, t: (key: string) => string) {
  const key = `posing.account.status.${status}` as const
  const translated = t(key)
  return translated === key ? status : translated
}

export function PosingAccountPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const { configured, loading, user, signOut } = usePosingAuth()
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [bookings, setBookings] = useState<PosingBooking[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const lastFetchedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/posing/login?redirect=/posing/account', { replace: true })
    }
  }, [loading, navigate, user])

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      lastFetchedUserId.current = null
      return
    }
    if (lastFetchedUserId.current === userId) return

    let cancelled = false
    // eslint-disable-next-line react-hooks/set-state-in-effect -- async account fetch
    setDataLoading(true)

    fetchPosingAccountData(userId)
      .then((data) => {
        if (cancelled) return
        setPackages(data.packages)
        setBookings(data.bookings)
        setIsAdmin(data.isAdmin)
        setFetchError('')
      })
      .catch((err) => {
        if (cancelled) return
        setFetchError(err instanceof Error ? err.message : 'fetch_failed')
      })
      .finally(() => {
        if (cancelled) return
        lastFetchedUserId.current = userId
        setDataLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [user?.id])

  const activePackages = useMemo(
    () => packages.filter((p) => p.status === 'active'),
    [packages],
  )

  const upcomingBookings = useMemo(
    () =>
      bookings.filter((b) => b.status === 'confirmed' || b.status === 'pending_payment'),
    [bookings],
  )

  const pastBookings = useMemo(
    () => bookings.filter((b) => b.status === 'completed' || b.status === 'cancelled'),
    [bookings],
  )

  const awaitingData = Boolean(user?.id) && lastFetchedUserId.current !== user?.id
  const pageReady = !loading && Boolean(user) && !awaitingData && !dataLoading

  if (!configured) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-white/70">
        {t('posing.auth.notConfigured')}
      </div>
    )
  }

  if (!pageReady) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center text-white/60">
        {t('posing.account.loading')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:py-20">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
            Move & Pose
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold text-white">
            {t('posing.account.title')}
          </h1>
          <p className="mt-2 text-sm text-white/55">{user!.email}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isAdmin ? (
            <Link
              to="/posing/admin"
              className="rounded-full border border-fuchsia-200/35 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/15"
            >
              {t('posing.admin.title')}
            </Link>
          ) : null}
          <button
            type="button"
            onClick={() => signOut()}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5"
          >
            {t('posing.auth.logout')}
          </button>
        </div>
      </div>

      {fetchError ? (
        <p className="mt-6 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {fetchError}
        </p>
      ) : null}

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-white">{t('posing.account.activePackages')}</h2>
        {activePackages.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{t('posing.account.noPackages')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {activePackages.map((pkg) => (
              <li
                key={pkg.id}
                className="rounded-2xl border border-fuchsia-200/20 bg-white/[0.04] px-5 py-4"
              >
                <p className="font-medium text-white">{pkg.plan_key}</p>
                <p className="mt-1 text-sm text-fuchsia-200/80">
                  {t('posing.account.remaining', {
                    remaining: pkg.sessions_remaining,
                    total: pkg.sessions_total,
                  })}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-semibold text-white">{t('posing.account.upcoming')}</h2>
          <a
            href="/posing#booking"
            className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200 hover:underline"
          >
            {t('posing.account.bookNew')}
          </a>
        </div>
        {upcomingBookings.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">{t('posing.account.noBookings')}</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {upcomingBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-5 py-4"
              >
                <p className="text-sm text-white">
                  {booking.slot
                    ? formatSlotTime(booking.slot.start_at, locale)
                    : '—'}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {booking.plan_key} · {statusLabel(booking.status, t)}
                </p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {pastBookings.length > 0 ? (
        <section className="mt-10">
          <h2 className="text-lg font-semibold text-white">{t('posing.account.history')}</h2>
          <ul className="mt-4 space-y-3">
            {pastBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] px-5 py-4 opacity-80"
              >
                <p className="text-sm text-white">
                  {booking.slot
                    ? formatSlotTime(booking.slot.start_at, locale)
                    : '—'}
                </p>
                <p className="mt-1 text-xs text-white/50">
                  {booking.plan_key} · {statusLabel(booking.status, t)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  )
}
