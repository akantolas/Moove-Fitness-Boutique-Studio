import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AccountProfileHero } from '../components/AccountProfileHero'
import { PasswordInput } from '../components/PasswordInput'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import {
  changePosingPassword,
  fetchPosingAccountData,
  removePosingAvatar,
  updatePosingProfile,
  uploadPosingAvatar,
  type PosingProfile,
} from '../lib/posingAccount'
import { useTranslation } from '../i18n/useTranslation'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20'

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6'

function profileToForm(profile: PosingProfile | null) {
  return {
    fullName: profile?.full_name ?? '',
    phone: profile?.phone ?? '',
    division: profile?.division ?? '',
    notes: profile?.notes ?? '',
  }
}

function avatarWithCache(url: string | null, cacheBust: number) {
  if (!url) return null
  return `${url}${url.includes('?') ? '&' : '?'}v=${cacheBust}`
}

function translateAccountError(code: string, t: (key: string) => string) {
  const key = `posing.account.errors.${code}`
  const translated = t(key)
  return translated === key ? code : translated
}

export function PosingAccountSettingsPage() {
  const { t, locale } = useTranslation()
  const navigate = useNavigate()
  const { configured, loading, user, signOut } = usePosingAuth()
  const [profile, setProfile] = useState<PosingProfile | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
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
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [passwordSaving, setPasswordSaving] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const lastFetchedUserId = useRef<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      navigate('/posing/login?redirect=/posing/account/settings', { replace: true })
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
    setDataLoading(true)

    fetchPosingAccountData(userId)
      .then((data) => {
        if (cancelled) return
        setProfile(data.profile)
        setIsAdmin(data.isAdmin)
        const form = profileToForm(data.profile)
        setFullName(form.fullName)
        setPhone(form.phone)
        setDivision(form.division)
        setNotes(form.notes)
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
    <div className="mx-auto max-w-3xl px-4 py-12 sm:py-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/45">
          {t('posing.admin.accountSettings')}
        </p>
        {isAdmin ? (
          <Link
            to="/posing/admin"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-200 hover:underline"
          >
            ← {t('posing.admin.title')}
          </Link>
        ) : (
          <Link
            to="/posing/account"
            className="text-xs font-semibold uppercase tracking-[0.14em] text-fuchsia-200 hover:underline"
          >
            ← {t('posing.account.title')}
          </Link>
        )}
      </div>

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

      <section className={`mt-6 ${cardClass}`}>
        <h2 className="text-lg font-semibold text-white">{t('posing.account.profileTitle')}</h2>
        <form className="mt-6 space-y-4" onSubmit={handleSaveProfile}>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="settings-name" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.fullName')}
              </label>
              <input
                id="settings-name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className={inputClass}
                autoComplete="name"
              />
            </div>
            <div>
              <label htmlFor="settings-phone" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.phone')}
              </label>
              <input
                id="settings-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={inputClass}
                autoComplete="tel"
              />
            </div>
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

      <section className={`mt-6 ${cardClass}`}>
        <h2 className="text-lg font-semibold text-white">{t('posing.account.securityTitle')}</h2>
        <form className="mt-6 space-y-4" onSubmit={handleChangePassword}>
          <PasswordInput
            id="settings-current-password"
            label={t('posing.account.currentPassword')}
            value={currentPassword}
            onChange={setCurrentPassword}
            autoComplete="current-password"
            required
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <PasswordInput
              id="settings-new-password"
              label={t('posing.account.newPassword')}
              value={newPassword}
              onChange={setNewPassword}
              autoComplete="new-password"
              minLength={8}
              required
            />
            <PasswordInput
              id="settings-confirm-password"
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
    </div>
  )
}
