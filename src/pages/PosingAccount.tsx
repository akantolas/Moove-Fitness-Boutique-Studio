import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import {
  changePosingPassword,
  deletePosingAccount,
  fetchPosingAccountData,
  updatePosingProfile,
  type PosingProfile,
} from '../lib/posingAccount'
import type { PosingBooking, UserPackage } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20'

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

export function PosingAccountPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const { configured, loading, user, accessToken, signOut } = usePosingAuth()
  const [packages, setPackages] = useState<UserPackage[]>([])
  const [bookings, setBookings] = useState<PosingBooking[]>([])
  const [isAdmin, setIsAdmin] = useState(false)
  const [fetchError, setFetchError] = useState('')
  const [dataLoading, setDataLoading] = useState(false)
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [division, setDivision] = useState('')
  const [notes, setNotes] = useState('')
  const [profileSaving, setProfileSaving] = useState(false)
  const [profileMessage, setProfileMessage] = useState('')
  const [profileError, setProfileError] = useState('')
  const [deletePassword, setDeletePassword] = useState('')
  const [deleteBusy, setDeleteBusy] = useState(false)
  const [deleteError, setDeleteError] = useState('')
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
        setPackages(data.packages)
        setBookings(data.bookings)
        setIsAdmin(data.isAdmin)
        const form = profileToForm(data.profile)
        setFullName(form.fullName)
        setPhone(form.phone)
        setDivision(form.division)
        setNotes(form.notes)
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

  async function handleSaveProfile(event: React.FormEvent) {
    event.preventDefault()
    if (!user?.id || !user.email) return
    setProfileSaving(true)
    setProfileError('')
    setProfileMessage('')
    try {
      await updatePosingProfile(user.id, user.email, {
        full_name: fullName,
        phone,
        division,
        notes,
      })
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

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
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

      <section className="mt-10 rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
        <h2 className="text-lg font-semibold text-white">{t('posing.account.passwordTitle')}</h2>
        <p className="mt-2 text-sm text-white/55">{t('posing.account.passwordBody')}</p>
        <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
          <div>
            <label htmlFor="current-password" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
              {t('posing.account.currentPassword')}
            </label>
            <input
              id="current-password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className={inputClass}
              autoComplete="current-password"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="new-password" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.newPassword')}
              </label>
              <input
                id="new-password"
                type="password"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
            <div>
              <label htmlFor="confirm-password" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.confirmPassword')}
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className={inputClass}
                autoComplete="new-password"
              />
            </div>
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

      {!isAdmin ? (
        <section className="mt-12 rounded-2xl border border-rose-300/20 bg-rose-400/5 p-5 sm:p-6">
          <h2 className="text-lg font-semibold text-rose-100">{t('posing.account.deleteTitle')}</h2>
          <p className="mt-2 text-sm text-white/55">{t('posing.account.deleteBody')}</p>
          <form className="mt-5 space-y-4" onSubmit={handleDeleteAccount}>
            <div>
              <label htmlFor="delete-password" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.deletePassword')}
              </label>
              <input
                id="delete-password"
                type="password"
                required
                value={deletePassword}
                onChange={(e) => setDeletePassword(e.target.value)}
                className={inputClass}
                autoComplete="current-password"
              />
            </div>
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
        </section>
      ) : null}
    </div>
  )
}
