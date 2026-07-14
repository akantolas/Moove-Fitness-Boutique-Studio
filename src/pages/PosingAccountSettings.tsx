import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AccountProfileHero } from '../components/AccountProfileHero'
import { AccountProfileSection } from '../components/AccountProfileSection'
import { AccountSecuritySection } from '../components/AccountSecuritySection'
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
    if (!user?.id || !user.email) return false
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
      return true
    } catch (err) {
      setProfileError(err instanceof Error ? err.message : 'profile_save_failed')
      return false
    } finally {
      setProfileSaving(false)
    }
  }

  async function handleChangePassword(event: React.FormEvent) {
    event.preventDefault()
    if (!user?.email) return false
    setPasswordSaving(true)
    setPasswordError('')
    setPasswordMessage('')

    if (newPassword !== confirmPassword) {
      setPasswordError(t('posing.account.passwordMismatch'))
      setPasswordSaving(false)
      return false
    }

    try {
      await changePosingPassword(user.email, currentPassword, newPassword)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setPasswordMessage(t('posing.account.passwordChanged'))
      return true
    } catch (err) {
      const code = err instanceof Error ? err.message : 'password_change_failed'
      setPasswordError(translateAccountError(code, t))
      return false
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

      <AccountProfileSection
        idPrefix="settings"
        variant="basic"
        values={{ fullName, phone, division, notes }}
        savedValues={profileToForm(profile)}
        onChange={(patch) => {
          if (patch.fullName !== undefined) setFullName(patch.fullName)
          if (patch.phone !== undefined) setPhone(patch.phone)
          if (patch.division !== undefined) setDivision(patch.division)
          if (patch.notes !== undefined) setNotes(patch.notes)
        }}
        onSave={handleSaveProfile}
        onClearMessage={() => setProfileMessage('')}
        saving={profileSaving}
        error={profileError}
        message={profileMessage}
        className="mt-6"
      />

      <AccountSecuritySection
        idPrefix="settings-security"
        currentPassword={currentPassword}
        newPassword={newPassword}
        confirmPassword={confirmPassword}
        onCurrentPasswordChange={setCurrentPassword}
        onNewPasswordChange={setNewPassword}
        onConfirmPasswordChange={setConfirmPassword}
        onSave={handleChangePassword}
        onClearMessage={() => setPasswordMessage('')}
        saving={passwordSaving}
        error={passwordError}
        message={passwordMessage}
        className="mt-6"
      />
    </div>
  )
}
