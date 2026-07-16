import { useState } from 'react'
import { ProfileAvatar } from './ProfileAvatar'
import { MemberCustomPrices } from './MemberCustomPrices'
import type { AdminMember } from '../lib/posingApi'
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

export function AdminMembersList({
  members,
  locale,
  currentUserId,
  busy,
  onDeleteMember,
  onSaveMemberPrice,
  onRemoveMemberPrice,
}: AdminMembersListProps) {
  const { t, dictionary } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [deleteError, setDeleteError] = useState('')
  const [deletingId, setDeletingId] = useState<string | null>(null)

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
                                <li key={booking.id} className="text-sm text-white/70">
                                  {booking.slot?.start_at
                                    ? formatSlot(booking.slot.start_at, locale)
                                    : '—'}{' '}
                                  · {bookingStatusLabel(booking.status, t)}
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
    </section>
  )
}
