import { Outlet, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { CookieBanner } from './CookieBanner'
import { CookiePreferencesPanel } from './CookiePreferencesPanel'
import { Header } from './Header'
import { Footer } from './Footer'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

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

type PageKey =
  | 'home'
  | 'classes'
  | 'about'
  | 'contact'
  | 'programs'
  | 'programAccess'
  | 'privacy'
  | 'cookies'
  | 'terms'
  | 'serviceTerms'

const pageByPath: Record<string, PageKey> = {
  '/': 'home',
  '/mathimata': 'classes',
  '/sxetika': 'about',
  '/epikoinonia': 'contact',
  '/programmata': 'programs',
  '/privacy': 'privacy',
  '/cookies': 'cookies',
  '/terms': 'terms',
  '/service-terms': 'serviceTerms',
}

/** Finds or creates a <meta>/<link> in <head> and sets one attribute on it. */
function setHeadTag(selector: string, create: () => HTMLElement, attr: string, value: string) {
  let el = document.head.querySelector<HTMLElement>(selector)
  if (!el) {
    el = create()
    document.head.appendChild(el)
  }
  el.setAttribute(attr, value)
}

function metaTag(key: 'name' | 'property', name: string) {
  return () => {
    const el = document.createElement('meta')
    el.setAttribute(key, name)
    return el
  }
}

/** Per-page title, description, canonical URL and social tags. */
function usePageMeta(pathname: string) {
  const { dictionary } = useTranslation()
  const isProgramAccess = pathname.startsWith('/programmata/access/')
  const key: PageKey = isProgramAccess ? 'programAccess' : (pageByPath[pathname] ?? 'home')

  useEffect(() => {
    const pages = dictionary.meta.pages
    const page = pages[key]
    const description = page.description || pages.home.description
    const url = `${site.url}${pathname === '/' ? '/' : pathname}`

    document.title = page.title
    setHeadTag('meta[name="description"]', metaTag('name', 'description'), 'content', description)
    setHeadTag('meta[property="og:title"]', metaTag('property', 'og:title'), 'content', page.title)
    setHeadTag('meta[property="og:description"]', metaTag('property', 'og:description'), 'content', description)
    setHeadTag('meta[property="og:url"]', metaTag('property', 'og:url'), 'content', url)
    setHeadTag(
      'link[rel="canonical"]',
      () => {
        const el = document.createElement('link')
        el.setAttribute('rel', 'canonical')
        return el
      },
      'href',
      url,
    )
    // Private program links must never be indexed.
    setHeadTag('meta[name="robots"]', metaTag('name', 'robots'), 'content', isProgramAccess ? 'noindex, nofollow' : 'index, follow')
  }, [dictionary, key, pathname, isProgramAccess])
}

export function Layout() {
  const { pathname } = useLocation()
  const isProgramAccess = pathname.startsWith('/programmata/access/')
  const { t } = useTranslation()

  usePageMeta(pathname)

  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1 pb-24 lg:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CookieBanner />
      <CookiePreferencesPanel />
      {isProgramAccess ? null : (
        <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 lg:hidden">
          <div className="pointer-events-auto px-4 pb-[calc(0.65rem+env(safe-area-inset-bottom,0px))] pt-3">
            <div className="mx-auto max-w-lg rounded-full">
              <a
                href={site.bookingUrl}
                className="flex min-h-[3.35rem] items-center gap-2 rounded-full bg-moove-ink px-2 py-2 text-white no-underline transition active:scale-[0.98] sm:px-3"
                {...(site.bookingUrl.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : undefined)}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-moove-lime text-moove-ink">
                  <CalendarGlyph className="h-[1.15rem] w-[1.15rem]" />
                </span>
                <span className="min-w-0 flex-1 text-center text-sm font-semibold leading-tight tracking-wide">
                  {t('common.bookClass')}
                </span>
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/80">
                  <ChevronGlyph className="h-4 w-4" />
                </span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
