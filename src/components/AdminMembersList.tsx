import { useState } from 'react'
import { ProfileAvatar } from './ProfileAvatar'
import type { AdminMember } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

type AdminMembersListProps = {
  members: AdminMember[]
  locale: Locale
  currentUserId: string
  busy: boolean
  onDeleteMember: (memberId: string) => Promise<void>
}

function formatMemberDate(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

function translateMemberError(code: string, t: (key: string) => string) {
  const key = `posing.admin.memberErrors.${code}`
  const translated = t(key)
  return translated === key ? code : translated
}

export function AdminMembersList({
  members,
  locale,
  currentUserId,
  busy,
  onDeleteMember,
}: AdminMembersListProps) {
  const { t } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
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
      setDeleteError(translateMemberError(code, t))
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <section className="mt-10">
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
        <p className="mt-4 text-sm text-white/50">{t('posing.admin.noMembers')}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.14em] text-white/45">
                  <th className="px-4 py-3 font-semibold">{t('posing.account.fullName')}</th>
                  <th className="px-4 py-3 font-semibold">Email</th>
                  <th className="px-4 py-3 font-semibold">{t('posing.account.phone')}</th>
                  <th className="px-4 py-3 font-semibold">{t('posing.account.division')}</th>
                  <th className="px-4 py-3 font-semibold">{t('posing.admin.memberSince')}</th>
                  <th className="px-4 py-3 font-semibold" />
                </tr>
              </thead>
              <tbody>
                {members.map((member) => {
                  const isSelf = member.id === currentUserId
                  const isAdmin = member.role === 'admin'
                  const canDelete = !isSelf && !isAdmin
                  const isConfirming = confirmId === member.id
                  const isDeleting = deletingId === member.id

                  return (
                    <tr key={member.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-white">
                        <div className="flex items-center gap-3">
                          <ProfileAvatar
                            fullName={member.full_name}
                            email={member.email}
                            avatarUrl={member.avatar_url}
                            size="sm"
                          />
                          <div>
                            {member.full_name ?? '—'}
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
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-white/75">{member.email}</td>
                      <td className="px-4 py-3 text-white/60">{member.phone ?? '—'}</td>
                      <td className="px-4 py-3 text-white/60">{member.division ?? '—'}</td>
                      <td className="px-4 py-3 text-white/50">
                        {formatMemberDate(member.created_at, locale)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        {!canDelete ? null : isConfirming ? (
                          <div className="flex flex-wrap justify-end gap-2">
                            <button
                              type="button"
                              disabled={busy || isDeleting}
                              onClick={() => void handleDelete(member.id)}
                              className="rounded-full border border-rose-300/40 bg-rose-500/15 px-3 py-1 text-xs font-semibold text-rose-100 hover:bg-rose-500/25 disabled:opacity-50"
                            >
                              {isDeleting
                                ? t('posing.admin.deletingMember')
                                : t('posing.admin.confirmDeleteMember')}
                            </button>
                            <button
                              type="button"
                              disabled={isDeleting}
                              onClick={() => setConfirmId(null)}
                              className="rounded-full border border-white/15 px-3 py-1 text-xs text-white/70 hover:bg-white/5"
                            >
                              {t('posing.admin.cancelDeleteMember')}
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            disabled={busy || isDeleting}
                            onClick={() => {
                              setDeleteError('')
                              setConfirmId(member.id)
                            }}
                            className="rounded-full border border-rose-300/30 px-3 py-1 text-xs text-rose-200 hover:bg-rose-400/10 disabled:opacity-50"
                          >
                            {t('posing.admin.deleteMember')}
                          </button>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
