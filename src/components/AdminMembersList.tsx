import { useState } from 'react'
import { ProfileAvatar } from './ProfileAvatar'
import { MemberCustomPrices } from './MemberCustomPrices'
import type { AdminMember, AdminMemberBooking } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { bookingStatusLabel, planKeyLabel } from '../lib/posingLabels'
import { translateAdminError } from '../hooks/usePosingAdminPanel'
import { ConfirmDialog } from './ConfirmDialog'
import type { PosingPlanKey } from '../site'

type AdminMembersListProps = {
  members: AdminMember[]
  locale: Locale
  currentUserId: string
  busy: boolean
  onDeleteMember: (memberId: string) => Promise<void>
  onSaveMemberPrice: (userId: string, planKey: PosingPlanKey, priceEur: number) => Promise<void>
  onRemoveMemberPrice: (userId: string, planKey: PosingPlanKey) => Promise<void>
  onCancelPackage?: (packageId: string) => Promise<void>
  onCancelBooking?: (bookingId: string) => Promise<void>
}

function formatMemberDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

function formatSlot(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

function packageStatusLabel(status: string, t: (key: string) => string) {
  const key = `posing.admin.packageStatus.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

function canCancelPackage(status: string) {
  return status === 'pending_payment' || status === 'active'
}

function canCancelMemberBooking(booking: AdminMemberBooking) {
  if (booking.status === 'pending_payment') return true
  if (booking.status !== 'confirmed') return false
  if (!booking.slot?.start_at) return false
  return new Date(booking.slot.start_at) > new Date()
}

export function AdminMembersList({
  members,
  locale,
  currentUserId,
  busy,
  onDeleteMember,
  onSaveMemberPrice,
  onRemoveMemberPrice,
  onCancelPackage,
  onCancelBooking,
}: AdminMembersListProps) {
  const { t, dictionary } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [cancelPackageId, setCancelPackageId] = useState<string | null>(null)
  const [cancelBookingId, setCancelBookingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [actionError, setActionError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [cancellingPackageId, setCancellingPackageId] = useState<string | null>(null)
  const [cancellingBookingId, setCancellingBookingId] = useState<string | null>(null)

  async function handleDelete(memberId: string) {
    setDeleteError('')
    setDeletingId(memberId)
    try {
      await onDeleteMember(memberId)
      setConfirmId(null)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'delete_member_failed'
      setDeleteError(translateAdminError(code, t))
    } finally {
      setDeletingId(null)
    }
  }

  async function handleCancelPackage(packageId: string) {
    if (!onCancelPackage) return
    setActionError('')
    setCancellingPackageId(packageId)
    try {
      await onCancelPackage(packageId)
      setCancelPackageId(null)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'package_cancel_failed'
      setActionError(translateAdminError(code, t))
    } finally {
      setCancellingPackageId(null)
    }
  }

  async function handleCancelBooking(bookingId: string) {
    if (!onCancelBooking) return
    setActionError('')
    setCancellingBookingId(bookingId)
    try {
      await onCancelBooking(bookingId)
      setCancelBookingId(null)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'booking_cancel_failed'
      setActionError(translateAdminError(code, t))
    } finally {
      setCancellingBookingId(null)
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{t('posing.admin.membersTitle')}</h2>
          <p className="mt-1 text-sm text-white/50">{t('posing.admin.membersBody')}</p>
        </div>
        <p className="text-xs text-white/40">
          {t('posing.admin.membersCount', { count: members.length })}
        </p>
      </div>

      {deleteError ? (
        <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {deleteError}
        </p>
      ) : null}

      {actionError ? (
        <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {actionError}
        </p>
      ) : null}

      {members.length === 0 ? (
        <p className="mt-4 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
          {t('posing.admin.noMembers')}
        </p>
      ) : (
        <div className="mt-4 space-y-3">
          {members.map((member) => {
            const isSelf = member.id === currentUserId
            const isAdmin = member.role === 'admin'
            const canDelete = !isSelf && !isAdmin
            const isExpanded = expandedId === member.id
            const activePackages = (member.user_packages ?? []).filter((p) => p.status === 'active')
            const pendingPackages = (member.user_packages ?? []).filter(
              (p) => p.status === 'pending_payment',
            )

            return (
              <div
                key={member.id}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]"
              >
                <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <button
                    type="button"
                    className="flex min-w-0 flex-1 items-center gap-3 text-left"
                    onClick={() => setExpandedId(isExpanded ? null : member.id)}
                  >
                    <ProfileAvatar
                      fullName={member.full_name}
                      email={member.email}
                      avatarUrl={member.avatar_url}
                      size="sm"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-white">
                        {member.full_name ?? member.email}
                        {isSelf ? (
                          <span className="ml-2 text-[10px] uppercase text-fuchsia-200/70">
                            ({t('posing.admin.you')})
                          </span>
                        ) : null}
                        {isAdmin ? (
                          <span className="ml-2 rounded-full border border-fuchsia-300/30 px-1.5 py-0.5 text-[10px] uppercase text-fuchsia-200/80">
                            Admin
                          </span>
                        ) : null}
                      </p>
                      <p className="truncate text-sm text-white/55">{member.email}</p>
                      <p className="mt-1 text-xs text-white/40">
                        {activePackages.length > 0
                          ? t('posing.admin.memberActivePackages', { count: activePackages.length })
                          : pendingPackages.length > 0
                            ? t('posing.admin.memberPendingPackages', { count: pendingPackages.length })
                            : t('posing.admin.memberNoPackages')}
                      </p>
                    </div>
                  </button>
                  <div className="flex shrink-0 flex-wrap items-center gap-2">
                    {canDelete ? (
                      <button
                        type="button"
                        disabled={busy || deletingId === member.id}
                        onClick={() => {
                          setDeleteError('')
                          setConfirmId(member.id)
                        }}
                        className="rounded-full border border-rose-300/30 px-3 py-1 text-xs text-rose-200 hover:bg-rose-400/10 disabled:opacity-50"
                      >
                        {t('posing.admin.deleteMember')}
                      </button>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => setExpandedId(isExpanded ? null : member.id)}
                      className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/60 hover:bg-white/5"
                    >
                      {isExpanded ? '−' : '+'}
                    </button>
                  </div>
                </div>

                {isExpanded ? (
                  <div className="border-t border-white/10 bg-black/20 px-4 py-4 sm:px-5">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                          {t('posing.account.phone')}
                        </p>
                        <p className="mt-1 text-sm text-white/70">{member.phone ?? '—'}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                          {t('posing.account.division')}
                        </p>
                        <p className="mt-1 text-sm text-white/70">{member.division ?? '—'}</p>
                        <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                          {t('posing.admin.memberSince')}
                        </p>
                        <p className="mt-1 text-sm text-white/70">
                          {formatMemberDate(member.created_at, locale)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                          {t('posing.account.activePackages')}
                        </p>
                        {(member.user_packages ?? []).length === 0 ? (
                          <p className="mt-2 text-sm text-white/50">{t('posing.admin.memberNoPackages')}</p>
                        ) : (
                          <ul className="mt-2 space-y-2">
                            {(member.user_packages ?? []).map((pkg) => (
                              <li
                                key={pkg.id}
                                className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm"
                              >
                                <div className="flex items-start justify-between gap-3">
                                  <div>
                                    <p className="text-white">
                                      {planKeyLabel(
                                        pkg.plan_key,
                                        (i) => dictionary.posing.pricing.packages[i]?.name,
                                        t,
                                      )}
                                    </p>
                                    <p className="mt-0.5 text-xs text-white/50">
                                      {packageStatusLabel(pkg.status, t)} ·{' '}
                                      {t('posing.account.remaining', {
                                        remaining: Math.max(0, pkg.sessions_total - pkg.sessions_used),
                                        total: pkg.sessions_total,
                                      })}
                                    </p>
                                  </div>
                                  {canCancelPackage(pkg.status) && onCancelPackage ? (
                                    <button
                                      type="button"
                                      disabled={busy || cancellingPackageId === pkg.id}
                                      onClick={() => setCancelPackageId(pkg.id)}
                                      className="shrink-0 rounded-full border border-rose-300/30 bg-rose-400/10 px-3 py-1 text-[11px] font-semibold text-rose-100 transition hover:bg-rose-400/15 disabled:opacity-50"
                                    >
                                      {cancellingPackageId === pkg.id
                                        ? t('posing.admin.cancellingPackage')
                                        : t('posing.admin.cancelPackage')}
                                    </button>
                                  ) : null}
                                </div>
                              </li>
                            ))}
                          </ul>
                        )}
                        {(member.recent_bookings ?? []).length > 0 ? (
                          <>
                            <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-white/45">
                              {t('posing.admin.recentBookings')}
                            </p>
                            <ul className="mt-2 space-y-2">
                              {(member.recent_bookings ?? []).map((booking) => (
                                <li
                                  key={booking.id}
                                  className="flex items-start justify-between gap-3 text-sm text-white/70"
                                >
                                  <span>
                                    {booking.slot?.start_at
                                      ? formatSlot(booking.slot.start_at, locale)
                                      : '—'}{' '}
                                    · {bookingStatusLabel(booking.status, t)}
                                  </span>
                                  {canCancelMemberBooking(booking) && onCancelBooking ? (
                                    <button
                                      type="button"
                                      disabled={busy || cancellingBookingId === booking.id}
                                      onClick={() => setCancelBookingId(booking.id)}
                                      className="shrink-0 rounded-full border border-rose-300/30 bg-rose-400/10 px-2.5 py-0.5 text-[10px] font-semibold text-rose-100 transition hover:bg-rose-400/15 disabled:opacity-50"
                                    >
                                      {cancellingBookingId === booking.id
                                        ? t('posing.admin.cancellingBooking')
                                        : t('posing.admin.cancelBooking')}
                                    </button>
                                  ) : null}
                                </li>
                              ))}
                            </ul>
                          </>
                        ) : null}
                      </div>
                    </div>
                    <MemberCustomPrices
                      memberId={member.id}
                      planPrices={member.plan_prices ?? []}
                      busy={busy}
                      onSave={(planKey, priceEur) => onSaveMemberPrice(member.id, planKey, priceEur)}
                      onRemove={(planKey) => onRemoveMemberPrice(member.id, planKey)}
                    />
                  </div>
                ) : null}
              </div>
            )
          })}
        </div>
      )}

      <ConfirmDialog
        open={confirmId !== null}
        title={t('posing.admin.confirmDeleteMemberTitle')}
        body={t('posing.admin.confirmDeleteMemberBody')}
        confirmLabel={
          deletingId ? t('posing.admin.deletingMember') : t('posing.admin.confirmDeleteMember')
        }
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={deletingId !== null}
        destructive
        onConfirm={() => {
          if (confirmId) void handleDelete(confirmId)
        }}
        onCancel={() => setConfirmId(null)}
      />

      <ConfirmDialog
        open={cancelPackageId !== null}
        title={t('posing.admin.confirmCancelPackageTitle')}
        body={t('posing.admin.confirmCancelPackageBody')}
        confirmLabel={t('posing.admin.cancelPackage')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={cancellingPackageId !== null}
        destructive
        onConfirm={() => {
          if (cancelPackageId) void handleCancelPackage(cancelPackageId)
        }}
        onCancel={() => setCancelPackageId(null)}
      />

      <ConfirmDialog
        open={cancelBookingId !== null}
        title={t('posing.admin.confirmCancelBookingTitle')}
        body={t('posing.admin.confirmCancelBookingBody')}
        confirmLabel={t('posing.admin.cancelBooking')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={cancellingBookingId !== null}
        destructive
        onConfirm={() => {
          if (cancelBookingId) void handleCancelBooking(cancelBookingId)
        }}
        onCancel={() => setCancelBookingId(null)}
      />
    </section>
  )
}
