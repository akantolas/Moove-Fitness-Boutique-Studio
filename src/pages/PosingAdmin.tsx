import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AdminBookingsPanel } from '../components/AdminBookingsPanel'
import { AdminMembersList } from '../components/AdminMembersList'
import { AdminPaymentsQueue } from '../components/AdminPaymentsQueue'
import { AdminShell, AdminStatCard } from '../components/AdminShell'
import { AdminWeekCalendar } from '../components/AdminWeekCalendar'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingIsAdmin } from '../lib/posingAccount'
import {
  adminConfirmPayment,
  adminCreateSlot,
  adminDeleteMember,
  adminDeleteSlot,
  fetchAdminBookings,
  fetchAdminMembers,
  fetchAdminOverview,
  fetchAdminPayments,
  type AdminBookingRow,
  type AdminMember,
  type AdminOverviewStats,
  type AdminPayment,
} from '../lib/posingApi'
import {
  addDays,
  athensDateKey,
  athensTimeKey,
  buildSlotEndIso,
  buildSlotIso,
  cellKey,
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

const ADMIN_TABS = ['overview', 'calendar', 'members', 'payments', 'bookings'] as const
type AdminTab = (typeof ADMIN_TABS)[number]

function isAdminTab(value: string | null): value is AdminTab {
  return ADMIN_TABS.includes(value as AdminTab)
}

export function PosingAdminPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: AdminTab = isAdminTab(tabParam) ? tabParam : 'overview'

  const { loading, user, accessToken } = usePosingAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const [slots, setSlots] = useState<AdminSlot[]>([])
  const [members, setMembers] = useState<AdminMember[]>([])
  const [payments, setPayments] = useState<AdminPayment[]>([])
  const [bookings, setBookings] = useState<AdminBookingRow[]>([])
  const [stats, setStats] = useState<AdminOverviewStats | null>(null)
  const [bookingStatusFilter, setBookingStatusFilter] = useState('')
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

  const slotByCell = useMemo(() => {
    const map = new Map<string, AdminSlot>()
    for (const slot of slots) {
      const dayKey = athensDateKey(new Date(slot.start_at))
      const time = athensTimeKey(slot.start_at)
      map.set(cellKey(dayKey, time), slot)
    }
    return map
  }, [slots])

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

  async function loadCalendarData() {
    if (!accessToken) return
    const slotsRes = await fetch(
      `/api/posing/admin/slots?from=${encodeURIComponent(range.from)}&to=${encodeURIComponent(range.to)}`,
      { headers: { Authorization: `Bearer ${accessToken}` } },
    ).then((r) => r.json())
    if (!slotsRes.ok) throw new Error(slotsRes.error ?? 'slots_failed')
    setSlots(slotsRes.slots ?? [])
  }

  async function loadMembers() {
    if (!accessToken) return
    setMembers(await fetchAdminMembers(accessToken))
  }

  async function loadPayments() {
    if (!accessToken) return
    setPayments(await fetchAdminPayments(accessToken))
  }

  async function loadBookings(status?: string) {
    if (!accessToken) return
    setBookings(await fetchAdminBookings(accessToken, status || undefined))
  }

  async function loadOverview() {
    if (!accessToken) return
    setStats(await fetchAdminOverview(accessToken))
  }

  async function loadTabData(tab: AdminTab) {
    if (!accessToken) return
    setDataLoading(true)
    setError('')
    try {
      if (tab === 'overview') {
        await Promise.all([loadOverview(), loadPayments(), loadMembers()])
      } else if (tab === 'calendar') {
        await loadCalendarData()
      } else if (tab === 'members') {
        await loadMembers()
      } else if (tab === 'payments') {
        await loadPayments()
      } else if (tab === 'bookings') {
        await loadBookings(bookingStatusFilter)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'load_failed')
    } finally {
      setDataLoading(false)
    }
  }

  useEffect(() => {
    if (!authorized) return
    void loadTabData(activeTab)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authorized, activeTab, range.from, range.to, accessToken])

  useEffect(() => {
    if (!authorized || activeTab !== 'bookings') return
    void loadBookings(bookingStatusFilter)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingStatusFilter])

  function setActiveTab(tab: AdminTab) {
    setSearchParams({ tab })
  }

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
      await loadCalendarData()
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
      await loadCalendarData()
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
      await loadCalendarData()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'clear_failed')
    } finally {
      setBusy(false)
    }
  }

  async function handleDeleteMember(memberId: string) {
    if (!accessToken) return
    setBusy(true)
    try {
      await adminDeleteMember(accessToken, memberId)
      await loadMembers()
      if (activeTab === 'overview') await loadOverview()
    } finally {
      setBusy(false)
    }
  }

  async function handleConfirmPayment(bookingId: string) {
    if (!accessToken) return
    setBusy(true)
    try {
      await adminConfirmPayment(accessToken, bookingId)
      await Promise.all([loadPayments(), loadOverview()])
      if (activeTab === 'bookings') await loadBookings(bookingStatusFilter)
    } finally {
      setBusy(false)
    }
  }

  const tabs = [
    { id: 'overview', label: t('posing.admin.tabOverview') },
    { id: 'calendar', label: t('posing.admin.tabCalendar') },
    { id: 'members', label: t('posing.admin.tabMembers') },
    { id: 'payments', label: t('posing.admin.tabPayments') },
    { id: 'bookings', label: t('posing.admin.tabBookings') },
  ]

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
        <Link to="/posing" className="mt-6 inline-block text-fuchsia-200 hover:underline">
          {t('nav.home')}
        </Link>
      </div>
    )
  }

  return (
    <AdminShell
      title={t('posing.admin.title')}
      subtitle={t('posing.admin.subtitle')}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as AdminTab)}
      tabs={tabs}
      actions={
        <Link
          to="/posing/account/settings"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/5"
        >
          {t('posing.admin.accountSettings')}
        </Link>
      }
    >
      {error ? (
        <p className="mb-6 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <AdminStatCard label={t('posing.admin.statMembers')} value={stats?.members ?? '—'} />
            <AdminStatCard
              label={t('posing.admin.statPendingPayments')}
              value={stats?.pendingPayments ?? '—'}
              accent="amber"
            />
            <AdminStatCard
              label={t('posing.admin.statActivePackages')}
              value={stats?.activePackages ?? '—'}
              accent="emerald"
            />
            <AdminStatCard
              label={t('posing.admin.statWeekBookings')}
              value={stats?.weekBookings ?? '—'}
              accent="cyan"
            />
          </div>
          {payments.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">{t('posing.admin.pendingPaymentsTitle')}</h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-200 hover:underline"
                >
                  {t('posing.admin.viewAll')}
                </button>
              </div>
              <AdminPaymentsQueue
                payments={payments.slice(0, 3)}
                locale={locale}
                busy={busy || dataLoading}
                onConfirm={handleConfirmPayment}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'calendar' ? (
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
      ) : null}

      {activeTab === 'members' && user ? (
        <AdminMembersList
          members={members}
          locale={locale}
          currentUserId={user.id}
          busy={busy || dataLoading}
          onDeleteMember={handleDeleteMember}
        />
      ) : null}

      {activeTab === 'payments' ? (
        <AdminPaymentsQueue
          payments={payments}
          locale={locale}
          busy={busy || dataLoading}
          onConfirm={handleConfirmPayment}
        />
      ) : null}

      {activeTab === 'bookings' ? (
        <AdminBookingsPanel
          bookings={bookings}
          locale={locale}
          statusFilter={bookingStatusFilter}
          onStatusFilterChange={setBookingStatusFilter}
          loading={dataLoading}
        />
      ) : null}
    </AdminShell>
  )
}
