import { Link } from 'react-router-dom'
import { useCookieConsent } from '../cookies/CookieConsentProvider'
import { useIsPosingRoute } from '../hooks/useIsPosingRoute'
import { useTranslation } from '../i18n/useTranslation'

export function CookieBanner() {
  const posing = useIsPosingRoute()
  const { t } = useTranslation()
  const { showBanner, showPreferences, acceptAll, rejectOptional, openPreferences } =
    useCookieConsent()

  if (!showBanner || showPreferences) return null

  const panelClass = posing
    ? 'border-fuchsia-500/25 bg-[#12121a]/95 text-white ring-white/10'
    : 'border-moove-border/50 bg-moove-surface/95 text-moove-silver ring-white/60'

  const bodyClass = posing ? 'text-white/65' : 'text-moove-muted'
  const ghostBtn = posing
    ? 'border-white/15 bg-white/5 text-white/85 hover:bg-white/10'
    : 'border-moove-espresso/15 bg-moove-surface/80 text-moove-silver hover:bg-moove-elevated/60'
  const primaryBtn = posing
    ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black hover:brightness-110'
    : 'bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep text-moove-ink hover:brightness-105'

  return (
    <div
      className="pointer-events-none fixed inset-x-0 z-[60] bottom-[calc(5.75rem+env(safe-area-inset-bottom,0px))] lg:bottom-4"
      role="region"
      aria-label={t('cookies.banner.ariaLabel')}
    >
      <div className="pointer-events-auto px-4 sm:px-6">
        <div
          className={`mx-auto max-w-4xl rounded-2xl border p-5 shadow-moove-soft backdrop-blur-xl backdrop-saturate-150 ring-1 sm:p-6 ${panelClass}`}
        >
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
            <div className="min-w-0 flex-1">
              <p className="font-display text-base font-semibold tracking-tight sm:text-lg">
                {t('cookies.banner.title')}
              </p>
              <p className={`mt-2 text-sm leading-relaxed ${bodyClass}`}>
                {t('cookies.banner.bodyBefore')}{' '}
                <Link
                  to="/cookies"
                  className={
                    posing
                      ? 'font-medium text-cyan-300 underline-offset-2 hover:underline'
                      : 'font-medium text-moove-accent underline-offset-2 hover:underline'
                  }
                >
                  {t('cookies.banner.policyLink')}
                </Link>{' '}
                {t('cookies.banner.bodyMiddle')}{' '}
                <Link
                  to="/privacy"
                  className={
                    posing
                      ? 'font-medium text-cyan-300 underline-offset-2 hover:underline'
                      : 'font-medium text-moove-accent underline-offset-2 hover:underline'
                  }
                >
                  {t('cookies.banner.privacyLink')}
                </Link>
                {t('cookies.banner.bodyAfter')}
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:shrink-0 lg:justify-end">
              <button
                type="button"
                onClick={openPreferences}
                className={`inline-flex min-h-11 items-center justify-center rounded-full border px-4 py-2.5 text-sm font-medium transition ${ghostBtn}`}
              >
                {t('cookies.banner.customize')}
              </button>
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
                className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold transition active:scale-[0.98] ${primaryBtn}`}
              >
                {t('cookies.banner.acceptAll')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
