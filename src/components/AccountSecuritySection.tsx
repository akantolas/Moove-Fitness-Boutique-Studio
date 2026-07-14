import { useEffect, useState } from 'react'
import { PasswordInput } from './PasswordInput'
import { useTranslation } from '../i18n/useTranslation'

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6'

const profilePanelClass =
  'space-y-4 rounded-xl border border-white/8 bg-black/20 p-4 sm:p-5'

const outlineButtonClass =
  'rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5'

type AccountSecuritySectionProps = {
  idPrefix: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
  onCurrentPasswordChange: (value: string) => void
  onNewPasswordChange: (value: string) => void
  onConfirmPasswordChange: (value: string) => void
  onSave: (event: React.FormEvent) => Promise<boolean>
  onClearMessage?: () => void
  saving: boolean
  error: string
  message: string
  className?: string
}

export function AccountSecuritySection({
  idPrefix,
  currentPassword,
  newPassword,
  confirmPassword,
  onCurrentPasswordChange,
  onNewPasswordChange,
  onConfirmPasswordChange,
  onSave,
  onClearMessage,
  saving,
  error,
  message,
  className = '',
}: AccountSecuritySectionProps) {
  const { t } = useTranslation()
  const [editing, setEditing] = useState(false)
  const [messageVisible, setMessageVisible] = useState(false)

  useEffect(() => {
    if (!message) {
      setMessageVisible(false)
      return
    }

    setMessageVisible(true)
    const fadeId = window.setTimeout(() => setMessageVisible(false), 3700)
    const clearId = window.setTimeout(() => onClearMessage?.(), 4000)

    return () => {
      window.clearTimeout(fadeId)
      window.clearTimeout(clearId)
    }
  }, [message, onClearMessage])

  function clearPasswordFields() {
    onCurrentPasswordChange('')
    onNewPasswordChange('')
    onConfirmPasswordChange('')
  }

  function handleCancel() {
    clearPasswordFields()
    setEditing(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const saved = await onSave(event)
    if (saved) {
      clearPasswordFields()
      setEditing(false)
    }
  }

  return (
    <section className={`${cardClass} ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{t('posing.account.securityTitle')}</h2>
        {editing ? (
          <button type="button" onClick={handleCancel} disabled={saving} className={outlineButtonClass}>
            {t('posing.account.cancelEdit')}
          </button>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className={outlineButtonClass}>
            {t('posing.account.passwordTitle')}
          </button>
        )}
      </div>

      {editing ? (
        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <p className="text-sm text-white/55">{t('posing.account.passwordBody')}</p>
          <div className={profilePanelClass}>
            <PasswordInput
              id={`${idPrefix}-current-password`}
              label={t('posing.account.currentPassword')}
              value={currentPassword}
              onChange={onCurrentPasswordChange}
              autoComplete="current-password"
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <PasswordInput
                id={`${idPrefix}-new-password`}
                label={t('posing.account.newPassword')}
                value={newPassword}
                onChange={onNewPasswordChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
              <PasswordInput
                id={`${idPrefix}-confirm-password`}
                label={t('posing.account.confirmPassword')}
                value={confirmPassword}
                onChange={onConfirmPasswordChange}
                autoComplete="new-password"
                minLength={8}
                required
              />
            </div>
          </div>
          {error ? (
            <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
          <div className="flex justify-stretch sm:justify-end">
            <button
              type="submit"
              disabled={saving}
              className="w-full rounded-full border border-fuchsia-200/35 bg-fuchsia-500/10 px-6 py-2.5 text-sm font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/20 disabled:opacity-50 sm:w-auto"
            >
              {saving ? t('posing.account.changingPassword') : t('posing.account.changePassword')}
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-6 space-y-4">
          {error ? (
            <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
              {error}
            </p>
          ) : null}
          {message ? (
            <p
              className={`rounded-xl border border-emerald-300/25 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100 transition-opacity duration-300 ${
                messageVisible ? 'opacity-100' : 'opacity-0'
              }`}
            >
              {message}
            </p>
          ) : null}
          <div className={profilePanelClass}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.account.password')}
              </p>
              <p className="mt-2 text-sm font-medium tracking-widest text-white/35">••••••••</p>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
