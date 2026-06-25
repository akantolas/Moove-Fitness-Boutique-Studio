import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CookieBanner } from './CookieBanner'
import { CookiePreferencesPanel } from './CookiePreferencesPanel'
import { Header } from './Header'
import { Footer } from './Footer'
import { site } from '../site'
import { useIsPosingRoute, posingBookingHref } from '../hooks/useIsPosingRoute'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

function CalendarGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={20}
      height={20}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <rect x={3} y={4} width={18} height={18} rx={2} ry={2} />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function ChevronGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.25}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

export function Layout() {
  const isPosing = useIsPosingRoute()
  const { pathname } = useLocation()
  const isPosingAbout = pathname === '/posing/about'
  const { t, locale } = useTranslation()
  const vars = useSiteVars()

  useEffect(() => {
    document.body.classList.toggle('pose-shell', isPosing)
    return () => {
      document.body.classList.remove('pose-shell')
    }
  }, [isPosing])

  useEffect(() => {
    const prevTitle = document.title
    document.title = isPosingAbout
      ? t('meta.posingAboutTitle', vars)
      : isPosing
        ? t('meta.posingTitle', vars)
        : t('meta.studioTitle', vars)

    let themeMeta = document.querySelector('meta[name="theme-color"]')
    const created = !themeMeta
    if (!themeMeta) {
      themeMeta = document.createElement('meta')
      themeMeta.setAttribute('name', 'theme-color')
      document.head.appendChild(themeMeta)
    }
    const prevTheme = themeMeta.getAttribute('content')
    themeMeta.setAttribute('content', isPosing ? '#08080c' : '#f8f4ec')

    return () => {
      document.title = prevTitle
      if (created) {
        themeMeta?.remove()
      } else if (prevTheme) {
        themeMeta?.setAttribute('content', prevTheme)
      }
    }
  }, [isPosing, isPosingAbout, t, locale, vars])

  return (
    <div
      className={`flex min-h-svh flex-col ${isPosing ? 'bg-[#08080c] text-white' : ''}`}
    >
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <CookiePreferencesPanel />
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
        <div className="pointer-events-auto px-4 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] pt-3">
          <div
            className={`mx-auto max-w-lg rounded-2xl border p-1.5 shadow-moove-soft backdrop-blur-xl backdrop-saturate-150 ring-1 ${
              isPosing
                ? 'border-fuchsia-500/30 bg-[#12121a]/90 ring-white/10'
                : 'border-moove-border/40 bg-moove-surface/80 ring-white/60'
            }`}
          >
            <a
              href={isPosing ? posingBookingHref : site.bookingUrl}
              className={`flex min-h-[3.35rem] items-center gap-2 rounded-[0.85rem] px-2 py-2 no-underline transition active:scale-[0.98] sm:px-3 ${
                isPosing
                  ? 'bg-gradient-to-r from-fuchsia-500 to-cyan-400 text-black shadow-[0_8px_28px_-6px_rgba(192,38,211,0.45)] active:brightness-[0.97]'
                  : 'bg-gradient-to-b from-moove-lime via-moove-lime to-[#b8cf2e] text-moove-ink shadow-[0_8px_28px_-6px_rgba(120,100,40,0.35),inset_0_1px_0_0_rgba(255,255,255,0.35)] active:brightness-[0.97]'
              }`}
              {...(!isPosing && site.bookingUrl.startsWith('http')
                ? { target: '_blank', rel: 'noreferrer noopener' }
                : undefined)}
            >
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
                  isPosing ? 'bg-black/15' : 'bg-moove-ink/[0.12] text-moove-ink'
                }`}
              >
                <CalendarGlyph className="h-[1.15rem] w-[1.15rem]" />
              </span>
              <span className="min-w-0 flex-1 text-center text-sm font-semibold leading-tight tracking-wide">
                {isPosing ? t('common.bookPosing') : t('common.bookClass')}
              </span>
              <span
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                  isPosing ? 'bg-black/12 text-black/80' : 'bg-moove-ink/[0.12] text-moove-ink/85'
                }`}
              >
                <ChevronGlyph className="h-4 w-4" />
              </span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
