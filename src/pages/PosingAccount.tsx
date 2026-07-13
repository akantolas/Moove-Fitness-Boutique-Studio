import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import {
  changePosingPassword,
  deletePosingAccount,
  fetchPosingAccountData,
  removePosingAvatar,
  updatePosingProfile,
  uploadPosingAvatar,
  type PosingProfile,
} from '../lib/posingAccount'
import type { PosingBooking, UserPackage } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { AccountProfileHero } from '../components/AccountProfileHero'
import { AccountQuickStats } from '../components/AccountQuickStats'
import { PasswordInput } from '../components/PasswordInput'
import {
  bookingStatusChipClass,
  bookingStatusLabel,
  planKeyLabel,
} from '../lib/posingLabels'
import { sumActiveSessionsRemaining } from '../lib/posingPackages'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20'

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6'

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

function profileToForm(profile: PosingProfile | null) {
  return {
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    division: profile?.division ?? '',
    notes: profile?.notes ?? '',
  }
}

function translateAccountError(code: string, t: (key: string) => string) {
  const key = `posing.account.errors.${code}`
  const translated = t(key)
  return translated === key ? code : translated
}

function avatarWithCache(url: string | null, cacheBust: number) {
  if (!url) return null
  return `${url}${url.includes('?') ? '&' : '?'}v=${cacheBust}`
}

export function PosingAccountPage() {
  const { t, locale, dictionary } = useTranslation()
  const navigate = useNavigate()
  const { configured, loading, user, accessToken, signOut } = usePosingAuth()
  const [profile, setProfile] = useState<PosingProfile | null>(null)
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [bookings, setBookings] = useState<PosingBooking[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [profileWarning, setProfileWarning] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [division, setDivision] = useState('')
  const [notes, setNotes] = useState('')
  const [avatarCacheBust, setAvatarCacheBust] = useState(0)
  const [avatarBusy, setAvatarBusy] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
  const [dangerOpen, setDangerOpen] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
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
        setProfile(data.profile)
        setPackages(data.packages)
        setBookings(data.bookings)
        setIsAdmin(data.isAdmin)
        const form = profileToForm(data.profile)
        setFullName(form.fullName)
        setPhone(form.phone)
        setDivision(form.division)
        setNotes(form.notes)
        setFetchError('')
        setProfileWarning(
          data.profileError ? translateAccountError(data.profileError, t) : '',
        )
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

  const sessionsRemaining = useMemo(
    () => sumActiveSessionsRemaining(packages),
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
  const displayEmail = profile?.email ?? user?.email ?? ''
  const avatarUrl = avatarWithCache(profile?.avatar_url ?? null, avatarCacheBust)

  async function handleAvatarUpload(file: File) {
    if (!user?.id) return
    setAvatarBusy(true)
    try {
      const url = await uploadPosingAvatar(user.id, file)
      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : prev))
      setAvatarCacheBust(Date.now())
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleAvatarRemove() {
    if (!user?.id) return
    setAvatarBusy(true)
    try {
      await removePosingAvatar(user.id)
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : prev))
    } finally {
      setAvatarBusy(false)
    }
  }

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (!user?.id || !user.email) return
    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')
    try {
      const updated = await updatePosingProfile(user.id, user.email, {
        full_name: fullName,
        phone,
        division,
        notes,
      })
      setProfile((prev) => (prev ? { ...prev, ...updated } : updated))
      setProfileMessage(t('posing.account.profileSaved'))
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'profile_save_failed')
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()
    if (!user?.email) return
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError(t('posing.account.passwordMismatch'))
      setPasswordSaving(false)
      return
    }

    try {
      await changePosingPassword(user.email, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage(t('posing.account.passwordChanged'))
    } catch (err) {
      const code = err instanceof Error ? err.message : 'password_change_failed'
      setPasswordError(translateAccountError(code, t))
    } finally {
      setPasswordSaving(false)
    }
  }

  async function handleDeleteAccount(event: React.FormEvent) {
    event.preventDefault()
    if (!accessToken) return
    setDeleteBusy(true)
    setDeleteError('')
    try {
      await deletePosingAccount(accessToken, deletePassword)
      await signOut()
      navigate('/posing', { replace: true, state: { accountDeleted: true } })
    } catch (err) {
      const code = err instanceof Error ? err.message : 'delete_failed'
      setDeleteError(translateAccountError(code, t))
    } finally {
      setDeleteBusy(false)
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white/70">
        {t('posing.auth.notConfigured')}
      </div>
    )
  }

  if (!pageReady) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-16 text-center text-white/60">
        {t('posing.account.loading')}
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:py-16">
      <AccountProfileHero
        fullName={profile?.full_name ?? fullName}
        email={displayEmail}
        avatarUrl={avatarUrl}
        isAdmin={isAdmin}
        memberSince={profile?.created_at ?? null}
        locale={locale}
        avatarBusy={avatarBusy}
        onAvatarUpload={handleAvatarUpload}
        onAvatarRemove={handleAvatarRemove}
        onSignOut={() => signOut()}
      />

      <AccountQuickStats
        sessionsRemaining={sessionsRemaining}
        upcomingBookings={upcomingBookings.length}
        division={division}
      />

      {fetchError ? (
        <p className="mt-6 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {fetchError}
        </p>
      ) : null}

      {profileWarning ? (
        <p className="mt-6 rounded-xl border border-amber-300/25 bg-amber-400/10 px-4 py-3 text-sm text-amber-100">
          {profileWarning}
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <section className={cardClass}>
          <h2 className="text-lg font-semibold text-white">{t('posing.account.profileTitle')}</h2>
          <p className="mt-2 text-sm text-white/55">{t('posing.account.profileBody')}</p>
          <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="profile-name" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('posing.account.fullName')}
                </label>
                <input
                  id="profile-name"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>
              <div>
                <label htmlFor="profile-phone" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('posing.account.phone')}
                </label>
                <input
                  id="profile-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={inputClass}
                  autoComplete="tel"
                />
              </div>
            </div>
            <div>
              <label htmlFor="profile-division" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.division')}
              </label>
              <input
                id="profile-division"
                value={division}
                onChange={(e) => setDivision(e.target.value)}
                placeholder={t('posing.account.divisionPlaceholder')}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="profile-notes" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.notes')}
              </label>
              <textarea
                id="profile-notes"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t('posing.account.notesPlaceholder')}
                className={`${inputClass} resize-y`}
              />
            </div>
            {profileError ? (
              <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                {profileError}
              </p>
            ) : null}
            {profileMessage ? (
              <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
                {profileMessage}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={profileSaving}
              className="rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              {profileSaving ? t('posing.account.savingProfile') : t('posing.account.saveProfile')}
            </button>
          </form>
        </section>

        <div className="space-y-6">
          <section className={cardClass}>
            <h2 className="text-lg font-semibold text-white">{t('posing.account.activePackages')}</h2>
            {activePackages.length === 0 ? (
              <div className="mt-6 text-center">
                <p className="text-sm text-white/50">{t('posing.account.noPackages')}</p>
                <a
                  href="/posing#booking"
                  className="mt-4 inline-block text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-200 hover:underline"
                >
                  {t('posing.account.bookNew')}
                </a>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {activePackages.map((pkg) => (
                  <li
                    key={pkg.id}
                    className="rounded-xl border border-fuchsia-200/20 bg-white/[0.04] px-4 py-3"
                  >
                    <p className="font-medium text-white">
                      {planKeyLabel(pkg.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                    </p>
                    <p className="mt-1 text-sm text-fuchsia-200/80">
                      {t('posing.account.remaining', {
                        remaining: pkg.sessions_remaining,
                        total: pkg.sessions_total,
                      })}
                    </p>
                    {pkg.sessions_remaining > 0 ? (
                      <Link
                        to={`/posing?package=${encodeURIComponent(pkg.plan_key)}#booking`}
                        className="mt-3 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-fuchsia-200 hover:underline"
                      >
                        {t('posing.booking.bookWithPackage')}
                      </Link>
                    ) : null}
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section className={cardClass}>
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
              <div className="mt-6 text-center">
                <p className="text-sm text-white/50">{t('posing.account.noBookings')}</p>
                <Link
                  to="/posing#booking"
                  className="mt-4 inline-block rounded-full border border-fuchsia-200/35 px-4 py-2 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/15"
                >
                  {t('posing.account.bookNew')}
                </Link>
              </div>
            ) : (
              <ul className="mt-4 space-y-3">
                {upcomingBookings.map((booking) => (
                  <li
                    key={booking.id}
                    className="rounded-xl border border-white/10 bg-black/20 px-4 py-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <p className="text-sm text-white">
                        {booking.slot ? formatSlotTime(booking.slot.start_at, locale) : '—'}
                      </p>
                      <span
                        className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(booking.status)}`}
                      >
                        {bookingStatusLabel(booking.status, t)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-white/50">
                      {planKeyLabel(booking.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>

      {pastBookings.length > 0 ? (
        <section className={`mt-6 ${cardClass}`}>
          <h2 className="text-lg font-semibold text-white">{t('posing.account.history')}</h2>
          <ul className="mt-4 space-y-3">
            {pastBookings.map((booking) => (
              <li
                key={booking.id}
                className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-80"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p className="text-sm text-white">
                    {booking.slot ? formatSlotTime(booking.slot.start_at, locale) : '—'}
                  </p>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(booking.status)}`}
                  >
                    {bookingStatusLabel(booking.status, t)}
                  </span>
                </div>
                <p className="mt-1 text-xs text-white/50">
                  {planKeyLabel(booking.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className={`mt-6 ${cardClass}`}>
        <h2 className="text-lg font-semibold text-white">{t('posing.account.securityTitle')}</h2>
        <p className="mt-2 text-sm text-white/55">{t('posing.account.passwordBody')}</p>
        <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
          <PasswordInput
            id="current-password"
            label={t('posing.account.currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              id="new-password"
              label={t('posing.account.newPassword')}
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <PasswordInput
              id="confirm-password"
              label={t('posing.account.confirmPassword')}
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
              minLength={8}
              required
            />
          </div>
          {passwordError ? (
            <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {passwordError}
            </p>
          ) : null}
          {passwordMessage ? (
            <p className="rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
              {passwordMessage}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={passwordSaving}
            className="rounded-full border border-fuchsia-200/35 bg-fuchsia-500/10 px-6 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-50"
          >
            {passwordSaving ? t('posing.account.changingPassword') : t('posing.account.changePassword')}
          </button>
        </form>
      </section>

      {!isAdmin ? (
        <section className="mt-6 overflow-hidden rounded-2xl border border-rose-300/15 bg-rose-400/[0.03]">
          <button
            type="button"
            onClick={() => setDangerOpen((open) => !open)}
            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left sm:px-6"
          >
            <div>
              <h2 className="text-sm font-semibold text-rose-100">{t('posing.account.dangerZoneTitle')}</h2>
              <p className="mt-1 text-xs text-white/45">{t('posing.account.deleteBody')}</p>
            </div>
            <span className="shrink-0 text-xs text-white/50">
              {dangerOpen ? '−' : t('posing.account.dangerZoneExpand')}
            </span>
          </button>
          {dangerOpen ? (
            <form className="space-y-4 border-t border-rose-300/15 px-5 py-5 sm:px-6" onSubmit={handleDeleteAccount}>
              <PasswordInput
                id="delete-password"
                label={t('posing.account.deletePassword')}
                value={deletePassword}
                onChange={setDeletePassword}
                autoComplete="current-password"
                required
              />
              {deleteError ? (
                <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
                  {deleteError}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={deleteBusy}
                className="rounded-full border border-rose-300/40 bg-rose-500/15 px-6 py-2.5 text-sm font-semibold text-rose-100 transition hover:bg-rose-500/25 disabled:opacity-50"
              >
                {deleteBusy ? t('posing.account.deleting') : t('posing.account.deleteConfirm')}
              </button>
            </form>
          ) : null}
        </section>
      ) : null}
    </div>
  )
}
