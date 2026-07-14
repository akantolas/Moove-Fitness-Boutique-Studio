import { useEffect, useState } from 'react'
import { useTranslation } from '../i18n/useTranslation'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20'

const cardClass = 'rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6'

const profilePanelClass =
  'space-y-4 rounded-xl border border-white/8 bg-black/20 p-4 sm:p-5'

const outlineButtonClass =
  'rounded-full border border-white/15 px-4 py-2 text-xs font-semibold text-white/70 transition hover:bg-white/5'

export type AccountProfileFields = {
  fullName: string
  phone: string
  division: string
  notes: string
}

type AccountProfileSectionProps = {
  idPrefix: string
  variant: 'full' | 'basic'
  values: AccountProfileFields
  savedValues: AccountProfileFields
  onChange: (patch: Partial<AccountProfileFields>) => void
  onSave: (event: React.FormEvent) => Promise<boolean>
  onClearMessage?: () => void
  saving: boolean
  error: string
  message: string
  className?: string
}

function displayValue(value: string) {
  return value.trim() || '—'
}

function ViewField({ label, value }: { label: string; value: string }) {
  const empty = !value.trim()
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">{label}</p>
      <p
        className={`mt-2 text-sm font-medium ${empty ? 'text-white/35' : 'text-white'}`}
      >
        {displayValue(value)}
      </p>
    </div>
  )
}

export function AccountProfileSection({
  idPrefix,
  variant,
  values,
  savedValues,
  onChange,
  onSave,
  onClearMessage,
  saving,
  error,
  message,
  className = '',
}: AccountProfileSectionProps) {
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

  function handleCancel() {
    onChange(savedValues)
    setEditing(false)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    const saved = await onSave(event)
    if (saved) setEditing(false)
  }

  return (
    <section className={`${cardClass} ${className}`.trim()}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h2 className="text-lg font-semibold text-white">{t('posing.account.profileTitle')}</h2>
        {editing ? (
          <button type="button" onClick={handleCancel} disabled={saving} className={outlineButtonClass}>
            {t('posing.account.cancelEdit')}
          </button>
        ) : (
          <button type="button" onClick={() => setEditing(true)} className={outlineButtonClass}>
            {t('posing.account.editProfile')}
          </button>
        )}
      </div>

      {editing ? (
        <form className="mt-6 space-y-4" onSubmit={(event) => void handleSubmit(event)}>
          <div className={profilePanelClass}>
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor={`${idPrefix}-name`}
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55"
                >
                  {t('posing.account.fullName')}
                </label>
                <input
                  id={`${idPrefix}-name`}
                  required
                  value={values.fullName}
                  onChange={(e) => onChange({ fullName: e.target.value })}
                  className={inputClass}
                  autoComplete="name"
                />
              </div>
              <div>
                <label
                  htmlFor={`${idPrefix}-phone`}
                  className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55"
                >
                  {t('posing.account.phone')}
                </label>
                <input
                  id={`${idPrefix}-phone`}
                  type="tel"
                  value={values.phone}
                  onChange={(e) => onChange({ phone: e.target.value })}
                  className={inputClass}
                  autoComplete="tel"
                />
              </div>
            </div>
            {variant === 'full' ? (
              <>
                <div>
                  <label
                    htmlFor={`${idPrefix}-division`}
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55"
                  >
                    {t('posing.account.division')}
                  </label>
                  <input
                    id={`${idPrefix}-division`}
                    value={values.division}
                    onChange={(e) => onChange({ division: e.target.value })}
                    placeholder={t('posing.account.divisionPlaceholder')}
                    className={inputClass}
                  />
                </div>
                <div>
                  <label
                    htmlFor={`${idPrefix}-notes`}
                    className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55"
                  >
                    {t('posing.account.notes')}
                  </label>
                  <textarea
                    id={`${idPrefix}-notes`}
                    rows={3}
                    value={values.notes}
                    onChange={(e) => onChange({ notes: e.target.value })}
                    placeholder={t('posing.account.notesPlaceholder')}
                    className={`${inputClass} resize-y`}
                  />
                </div>
              </>
            ) : null}
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
              className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50 sm:w-auto"
            >
              {saving ? t('posing.account.savingProfile') : t('posing.account.saveProfile')}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <ViewField label={t('posing.account.fullName')} value={values.fullName} />
              <ViewField label={t('posing.account.phone')} value={values.phone} />
            </div>
            {variant === 'full' ? (
              <>
                <ViewField label={t('posing.account.division')} value={values.division} />
                <ViewField label={t('posing.account.notes')} value={values.notes} />
              </>
            ) : null}
          </div>
        </div>
      )}
    </section>
  )
}
