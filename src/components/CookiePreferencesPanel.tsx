import { useEffect, useId, useState } from 'react'
import { useCookieConsent } from '../cookies/CookieConsentProvider'
import { useIsPosingRoute } from '../hooks/useIsPosingRoute'
import { useTranslation } from '../i18n/useTranslation'

function Toggle({
  checked,
  disabled,
  onChange,
  labelId,
}: {
  checked: boolean
  disabled?: boolean
  onChange: (next: boolean) => void
  labelId: string
}) {
  const posing = useIsPosingRoute()

  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={labelId}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition disabled:cursor-not-allowed disabled:opacity-60 ${
        checked
          ? posing
            ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400'
            : 'bg-moove-lime-deep'
          : posing
            ? 'bg-white/15'
            : 'bg-moove-espresso/15'
      }`}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
          checked ? 'translate-x-5' : 'translate-x-0'
        }`}
      />
    </button>
  )
}

export function CookiePreferencesPanel() {
  const posing = useIsPosingRoute()
  const { t } = useTranslation()
  const {
    consent,
    showPreferences,
    acceptAll,
    rejectOptional,
    savePreferences,
    closePreferences,
  } = useCookieConsent()
  const [analytics, setAnalytics] = useState(consent?.analytics ?? false)
  const titleId = useId()

  useEffect(() => {
    if (showPreferences) {
      setAnalytics(consent?.analytics ?? false)
    }
  }, [showPreferences, consent?.analytics])

  useEffect(() => {
    if (!showPreferences) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closePreferences()
    }

    document.addEventListener('keydown', onKeyDown)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = prevOverflow
    }
  }, [showPreferences, closePreferences])

  if (!showPreferences) return null

  const panelClass = posing
    ? 'border-fuchsia-500/25 bg-[#12121a] text-white ring-white/10'
    : 'border-moove-border/50 bg-moove-surface text-moove-silver ring-white/60'
  const mutedClass = posing ? 'text-white/60' : 'text-moove-muted'
  const cardClass = posing ? 'border-white/10 bg-white/[0.03]' : 'border-moove-border/70 bg-moove-bg/40'
  const ghostBtn = posing
    ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
    : 'border-moove-espresso/15 bg-moove-surface/80 text-moove-silver hover:bg-moove-elevated/60'
  const primaryBtn = posing
    ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black hover:brightness-110'
    : 'bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep text-moove-ink hover:brightness-105'

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-4 sm:items-center sm:p-6">
      <button
        type="button"
        className="absolute inset-0 bg-black/45 backdrop-blur-[2px]"
        aria-label={t('common.close')}
        onClick={closePreferences}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={`relative z-10 max-h-[min(90svh,720px)] w-full max-w-xl overflow-y-auto rounded-2xl border p-6 shadow-moove-soft ring-1 sm:p-8 ${panelClass}`}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id={titleId} className="font-display text-2xl font-semibold tracking-tight">
              {t('cookies.preferences.title')}
            </h2>
            <p className={`mt-2 text-sm leading-relaxed ${mutedClass}`}>
              {t('cookies.preferences.description')}
            </p>
          </div>
          <button
            type="button"
            onClick={closePreferences}
            className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border text-lg leading-none transition ${ghostBtn}`}
            aria-label={t('common.close')}
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <article className={`rounded-xl border p-4 ${cardClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-sm font-semibold">{t('cookies.preferences.essential.title')}</h3>
                <p className={`mt-1 text-sm leading-relaxed ${mutedClass}`}>
                  {t('cookies.preferences.essential.description')}
                </p>
              </div>
              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.14em] ${
                  posing ? 'bg-white/10 text-white/70' : 'bg-moove-elevated text-moove-muted'
                }`}
              >
                {t('cookies.preferences.essential.alwaysOn')}
              </span>
            </div>
          </article>

          <article className={`rounded-xl border p-4 ${cardClass}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h3
                  id={`${titleId}-analytics`}
                  className="text-sm font-semibold"
                >
                  {t('cookies.preferences.analytics.title')}
                </h3>
                <p className={`mt-1 text-sm leading-relaxed ${mutedClass}`}>
                  {t('cookies.preferences.analytics.description')}
                </p>
              </div>
              <Toggle
                checked={analytics}
                onChange={setAnalytics}
                labelId={`${titleId}-analytics`}
              />
            </div>
          </article>
        </div>

        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:justify-end">
          <button
            type="button"
            onClick={rejectOptional}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition ${ghostBtn}`}
          >
            {t('cookies.banner.rejectOptional')}
          </button>
          <button
            type="button"
            onClick={acceptAll}
            className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition ${ghostBtn}`}
          >
            {t('cookies.banner.acceptAll')}
          </button>
          <button
            type="button"
            onClick={() => savePreferences(analytics)}
            className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${primaryBtn}`}
          >
            {t('cookies.preferences.save')}
          </button>
        </div>
      </div>
    </div>
  )
}
