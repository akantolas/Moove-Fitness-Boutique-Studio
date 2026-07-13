import { Link } from 'react-router-dom'
import { ProfileAvatar } from './ProfileAvatar'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

type AccountProfileHeroProps = {
  fullName: string | null
  email: string
  avatarUrl: string | null
  isAdmin: boolean
  memberSince: string | null
  locale: Locale
  avatarBusy: boolean
  onAvatarUpload: (file: File) => Promise<void>
  onAvatarRemove: () => Promise<void>
  onSignOut: () => void
}

function formatMemberSince(iso: string | null, locale: Locale) {
  if (!iso) return '—'
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    month: 'long',
    year: 'numeric',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

export function AccountProfileHero({
  fullName,
  email,
  avatarUrl,
  isAdmin,
  memberSince,
  locale,
  avatarBusy,
  onAvatarUpload,
  onAvatarRemove,
  onSignOut,
}: AccountProfileHeroProps) {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-8">
      <div
        className="pointer-events-none absolute inset-0 opacity-70"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 70% 80% at 10% 0%, rgba(192, 38, 211, 0.18) 0%, transparent 55%), radial-gradient(circle at 90% 20%, rgba(34, 211, 238, 0.12) 0%, transparent 45%)',
        }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center">
          <ProfileAvatar
            fullName={fullName}
            email={email}
            avatarUrl={avatarUrl}
            editable
            busy={avatarBusy}
            onUpload={onAvatarUpload}
            onRemove={onAvatarRemove}
          />
          <div className="text-center sm:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              Move & Pose
            </p>
            <h1 className="font-display mt-1 text-2xl font-semibold text-white sm:text-3xl">
              {fullName?.trim() || t('posing.account.title')}
            </h1>
            <p className="mt-1 text-sm text-white/60">{email}</p>
            <p className="mt-2 text-xs text-white/45">
              {t('posing.account.memberSince', {
                date: formatMemberSince(memberSince, locale),
              })}
            </p>
            {isAdmin ? (
              <span className="mt-2 inline-block rounded-full border border-fuchsia-300/35 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-fuchsia-200">
                Admin
              </span>
            ) : null}
          </div>
        </div>
        <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
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
            onClick={onSignOut}
            className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5"
          >
            {t('posing.auth.logout')}
          </button>
        </div>
      </div>
    </section>
  )
}
