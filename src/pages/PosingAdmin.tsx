import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AdminBookingsPanel } from '../components/AdminBookingsPanel'
import { AdminMembersList } from '../components/AdminMembersList'
import { AdminPaymentsQueue } from '../components/AdminPaymentsQueue'
import { AdminNutritionQueue } from '../components/AdminNutritionQueue'
import { AdminProgramPaymentsQueue } from '../components/AdminProgramPaymentsQueue'
import {
  AdminShell,
  AdminPanelSkeleton,
  AdminStatCard,
  AdminStatsSkeleton,
} from '../components/AdminShell'
import { AdminWeekCalendar } from '../components/AdminWeekCalendar'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingIsAdmin } from '../lib/posingAccount'
import {
  addDays,
  athensDateKey,
  buildSlotIso,
  POSE_WEEK_DAYS,
  startOfWeek,
} from '../lib/posingDates'
import { useTranslation } from '../i18n/useTranslation'
import {
  isAdminTab,
  usePosingAdminPanel,
  type AdminTab,
} from '../hooks/usePosingAdminPanel'

function dateBoundary(value: string | null, exclusiveEnd = false) {
  if (!value) return undefined
  const date = new Date(`${value}T12:00:00Z`)
  if (
    !Number.isFinite(date.getTime()) ||
    date.toISOString().slice(0, 10) !== value
  )
    return value
  if (exclusiveEnd) date.setUTCDate(date.getUTCDate() + 1)
  return buildSlotIso(date.toISOString().slice(0, 10), '00:00')
}

export function PosingAdminPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab')
  const activeTab: AdminTab = isAdminTab(tabParam) ? tabParam : 'overview'

  const { loading, user, accessToken } = usePosingAuth()
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date()))
  const bookingStatusFilter = searchParams.get('status') ?? ''
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const [durationChoice, setDurationChoice] = useState<number | null>(null)
  const [authorized, setAuthorized] = useState<boolean | null>(null)

  const range = useMemo(() => {
    const from = weekStart.toISOString()
    const to = addDays(weekStart, POSE_WEEK_DAYS).toISOString()
    return { from, to }
  }, [weekStart])

  const bookingFilters = useMemo(
    () => ({
      status: searchParams.get('status') ?? '',
      member: searchParams.get('member') ?? undefined,
      booking: searchParams.get('booking') ?? undefined,
      search: searchParams.get('search') ?? '',
      from: dateBoundary(searchParams.get('from')),
      to: dateBoundary(searchParams.get('to'), true),
      page: Math.max(1, Number(searchParams.get('page')) || 1),
      pageSize: 20,
    }),
    [searchParams],
  )

  const admin = usePosingAdminPanel({
    activeTab,
    accessToken,
    authorized: authorized === true,
    locale,
    range,
    bookingFilters,
    paidPage: page,
    duration: durationChoice,
    translate: t,
  })

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

  function setActiveTab(tab: AdminTab, filters: Record<string, string> = {}) {
    setSearchParams({ tab, ...filters })
  }
  function updateBookingFilters(filters: Record<string, string>) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('tab', 'bookings')
      next.delete('page')
      for (const [key, value] of Object.entries(filters)) {
        if (value) next.set(key, value)
        else next.delete(key)
      }
      return next
    })
  }
  function showWeekBookings() {
    const monday = startOfWeek(new Date())
    setActiveTab('bookings', {
      status: 'non_cancelled',
      from: athensDateKey(monday),
      to: athensDateKey(addDays(monday, 6)),
    })
  }
  function changePage(nextPage: number) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous)
      next.set('page', String(nextPage))
      return next
    })
  }

  const duration =
    durationChoice ?? admin.calendarSettings.default_duration_minutes
  const pendingBadge = admin.stats?.pendingPayments ?? admin.payments.length
  const programPendingBadge =
    admin.stats?.programPending ?? admin.programPayments.length
  const nutritionPendingBadge =
    admin.stats?.nutritionPending ?? admin.nutritionPayments.length

  const tabs = [
    {
      id: 'overview',
      label: t('posing.admin.tabOverview'),
      badge: pendingBadge > 0 ? pendingBadge : undefined,
    },
    { id: 'calendar', label: t('posing.admin.tabCalendar') },
    { id: 'members', label: t('posing.admin.tabMembers') },
    {
      id: 'payments',
      label: t('posing.admin.tabPayments'),
      badge: pendingBadge > 0 ? pendingBadge : undefined,
    },
    {
      id: 'programs',
      label: t('posing.admin.tabPrograms'),
      badge: programPendingBadge > 0 ? programPendingBadge : undefined,
    },
    {
      id: 'nutrition',
      label: t('posing.admin.tabNutrition'),
      badge: nutritionPendingBadge > 0 ? nutritionPendingBadge : undefined,
    },
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
        <h1 className="font-display text-2xl font-semibold text-white">
          {t('posing.admin.forbidden')}
        </h1>
        <Link
          to="/posing"
          className="mt-6 inline-block text-fuchsia-200 hover:underline"
        >
          {t('nav.home')}
        </Link>
      </div>
    )
  }

  const isBusy = admin.busy || admin.loading

  return (
    <AdminShell
      title={t('posing.admin.title')}
      subtitle={t('posing.admin.subtitle')}
      activeTab={activeTab}
      onTabChange={(tab) => setActiveTab(tab as AdminTab)}
      tabs={tabs}
      onRefresh={() => void admin.refresh()}
      refreshDisabled={isBusy}
      actions={
        <Link
          to="/posing/account/settings"
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/75 transition hover:bg-white/5"
        >
          {t('posing.admin.accountSettings')}
        </Link>
      }
    >
      {admin.error ? (
        <p className="mb-6 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {admin.error}
        </p>
      ) : null}

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          {admin.loading ? (
            <AdminStatsSkeleton />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <AdminStatCard
                label={t('posing.admin.statMembers')}
                value={admin.stats?.members ?? '—'}
                onClick={() => setActiveTab('members', { role: 'client' })}
              />
              <AdminStatCard
                label={t('posing.admin.statPendingPayments')}
                value={admin.stats?.pendingPayments ?? '—'}
                accent="amber"
                onClick={() => setActiveTab('payments')}
              />
              <AdminStatCard
                label={t('posing.admin.statActivePackages')}
                value={admin.stats?.activePackages ?? '—'}
                accent="emerald"
                onClick={() => setActiveTab('members', { packages: 'active' })}
              />
              <AdminStatCard
                label={t('posing.admin.statWeekBookings')}
                value={admin.stats?.weekBookings ?? '—'}
                accent="cyan"
                onClick={showWeekBookings}
              />
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('calendar')}
              className="rounded-full border border-white/14 bg-white/[0.035] px-4 py-2 text-xs font-semibold text-white/78 transition hover:border-fuchsia-100/28 hover:bg-white/[0.06] hover:text-white"
            >
              {t('posing.admin.openCalendar')}
            </button>
            {(admin.stats?.pendingPayments ?? 0) > 0 ? (
              <button
                type="button"
                onClick={() => setActiveTab('payments')}
                className="rounded-full border border-amber-300/30 bg-amber-500/10 px-4 py-2 text-xs font-semibold text-amber-100 transition hover:bg-amber-500/15"
              >
                {t('posing.admin.reviewPayments')}
              </button>
            ) : null}
          </div>

          {admin.loading ? (
            <AdminPanelSkeleton rows={2} />
          ) : admin.payments.length > 0 ? (
            <div>
              <div className="mb-4 flex items-center justify-between gap-4">
                <h2 className="text-lg font-semibold text-white">
                  {t('posing.admin.pendingPaymentsTitle')}
                </h2>
                <button
                  type="button"
                  onClick={() => setActiveTab('payments')}
                  className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-200 hover:underline"
                >
                  {t('posing.admin.viewAll')}
                </button>
              </div>
              <AdminPaymentsQueue
                payments={admin.payments.slice(0, 3)}
                locale={locale}
                busy={isBusy}
                onConfirm={admin.confirmPayment}
                onCancel={admin.cancelBooking}
              />
            </div>
          ) : null}
        </div>
      ) : null}

      {activeTab === 'calendar' ? (
        <AdminWeekCalendar
          slots={admin.slots}
          weekStart={weekStart}
          duration={duration}
          calendarSettings={admin.calendarSettings}
          locale={locale}
          busy={isBusy}
          loading={admin.loading}
          feedback={admin.calendarFeedback}
          onWeekStartChange={setWeekStart}
          onDurationChange={setDurationChoice}
          onSetCellState={admin.setCellState}
          onAddSlotTime={admin.addSlotAtTime}
          onOpenDayPreset={admin.openDayPreset}
          onClearDay={admin.clearDay}
          onSaveCalendarSettings={async (payload) => {
            const result = await admin.saveCalendarSettings(payload)
            setDurationChoice(null)
            return result
          }}
          onViewBooking={(booking) => setActiveTab('bookings', { booking })}
        />
      ) : null}

      {activeTab === 'members' && user ? (
        admin.loading ? (
          <AdminPanelSkeleton rows={4} />
        ) : (
          <AdminMembersList
            members={admin.members}
            locale={locale}
            currentUserId={user.id}
            busy={isBusy}
            onDeleteMember={admin.deleteMember}
            onSaveMemberPrice={admin.saveMemberPrice}
            onRemoveMemberPrice={admin.removeMemberPrice}
            onCancelPackage={admin.cancelPackage}
            onCancelBooking={admin.cancelBooking}
            onAdjustSessions={admin.adjustSessions}
            onlyActivePackages={searchParams.get('packages') === 'active'}
            clientsOnly={searchParams.get('role') === 'client'}
            onClearFilter={() => setActiveTab('members')}
            onViewBookings={(member) => setActiveTab('bookings', { member })}
          />
        )
      ) : null}

      {activeTab === 'payments' ? (
        admin.loading ? (
          <AdminPanelSkeleton rows={3} />
        ) : (
          <AdminPaymentsQueue
            payments={admin.payments}
            locale={locale}
            busy={isBusy}
            onConfirm={admin.confirmPayment}
            onCancel={admin.cancelBooking}
          />
        )
      ) : null}

      {activeTab === 'programs' ? (
        admin.loading ? (
          <AdminPanelSkeleton rows={3} />
        ) : (
          <AdminProgramPaymentsQueue
            payments={admin.programPayments}
            paidPurchases={admin.programPurchases}
            locale={locale}
            busy={isBusy}
            onConfirm={admin.confirmProgramPayment}
            onResendAccess={admin.resendProgramAccess}
            page={page}
            total={admin.programTotal}
            onPageChange={changePage}
          />
        )
      ) : null}

      {activeTab === 'nutrition' ? (
        admin.loading ? (
          <AdminPanelSkeleton rows={3} />
        ) : (
          <AdminNutritionQueue
            payments={admin.nutritionPayments}
            paidOrders={admin.nutritionOrders}
            locale={locale}
            busy={isBusy}
            onConfirm={admin.confirmNutritionPayment}
            onResend={admin.resendNutritionPlan}
            onPreview={admin.previewNutritionPdf}
            page={page}
            total={admin.nutritionTotal}
            onPageChange={changePage}
          />
        )
      ) : null}

      {activeTab === 'bookings' ? (
        <AdminBookingsPanel
          bookings={admin.bookings}
          locale={locale}
          statusFilter={bookingStatusFilter}
          onStatusFilterChange={(status) => updateBookingFilters({ status })}
          search={searchParams.get('search') ?? ''}
          from={searchParams.get('from') ?? ''}
          to={searchParams.get('to') ?? ''}
          memberFiltered={Boolean(
            searchParams.get('member') || searchParams.get('booking'),
          )}
          onFilterChange={updateBookingFilters}
          onClearFilters={() => setActiveTab('bookings')}
          page={page}
          total={admin.bookingTotal}
          onPageChange={changePage}
          loading={admin.loading}
          busy={isBusy}
          onConfirmPayment={admin.confirmPayment}
          onCancelBooking={admin.cancelBooking}
          onCompleteBooking={admin.completeBooking}
        />
      ) : null}
    </AdminShell>
  )
}
