import { Link, NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { site } from '../site'
import { ButtonLink } from './Links'
import {
  posingBookingHref,
  posingPackagesHref,
  useIsPosingRoute,
} from '../hooks/useIsPosingRoute'
import { PosePromoBubble } from './PosePromoBubble'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation, useSiteVars } from '../i18n/useTranslation'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { fetchPosingIsAdmin } from '../lib/posingAccount'

const studioNav = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/mathimata', labelKey: 'nav.classes' },
  { to: '/sxetika', labelKey: 'nav.about' },
  { to: '/epikoinonia', labelKey: 'nav.contact' },
] as const

const posingNav = [
  { to: '/posing', labelKey: 'nav.home', end: true },
  { to: '/posing/about', labelKey: 'nav.about' },
  { href: posingPackagesHref, labelKey: 'nav.packages' },
] as const

const posingCtaClass =
  'inline-flex items-center justify-center rounded-full border border-fuchsia-200/45 bg-gradient-to-r from-fuchsia-500/88 via-pink-300/88 to-rose-200/88 px-4 py-2 text-xs font-bold text-[#160714] shadow-[0_10px_34px_-12px_rgba(244,114,182,0.9),0_0_0_1px_rgba(255,255,255,0.08)_inset] transition hover:brightness-110 sm:px-5 sm:text-sm'

const posingDesktopNavBase =
  'relative rounded-full border border-transparent px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-all duration-200'
const posingDesktopNavIdle = 'text-white/45 hover:text-white/85'
const posingDesktopNavActive =
  'border-fuchsia-100/12 bg-white/[0.04] text-white after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-fuchsia-400/80 after:via-pink-300/50 after:to-transparent'

const posingAuthPillClass =
  'inline-flex items-center gap-2 rounded-full border border-white/14 bg-white/[0.035] px-3.5 py-2 text-xs font-semibold text-white/78 shadow-[0_10px_30px_-24px_rgba(244,114,182,0.55)] backdrop-blur-md transition-all duration-200 hover:border-fuchsia-100/28 hover:bg-white/[0.06] hover:text-white'
const posingAuthPillMobileClass = `${posingAuthPillClass} w-full justify-center !py-3.5`

const posingMobileNavBase =
  'animate-pose-nav-stagger border-b border-white/6 py-4 pl-4 font-display text-2xl font-medium transition-colors duration-200'
const posingMobileNavIdle =
  'border-l-2 border-transparent text-white/55 hover:text-white/90'
const posingMobileNavActive =
  'border-l-2 border-fuchsia-300/70 text-white'

const posingHamburgerClass =
  'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-fuchsia-100/18 bg-white/[0.04] text-white/85 shadow-[0_10px_30px_-24px_rgba(244,114,182,0.85)] backdrop-blur-md transition-all duration-200 hover:bg-white/[0.07]'
const posingHamburgerOpenClass = 'ring-1 ring-fuchsia-300/25'

function MenuToggleIcon({ open }: { open: boolean }) {
  return (
    <span className="relative block h-4 w-5" aria-hidden>
      <span
        className={`absolute left-0 h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'top-1/2 -translate-y-1/2 rotate-45' : 'top-0.5'
        }`}
      />
      <span
        className={`absolute left-0 top-1/2 h-[1.5px] -translate-y-1/2 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'w-0 opacity-0' : 'w-3 opacity-100'
        }`}
      />
      <span
        className={`absolute left-0 h-[1.5px] w-5 rounded-full bg-current transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
          open ? 'top-1/2 -translate-y-1/2 -rotate-45' : 'bottom-0.5'
        }`}
      />
    </span>
  )
}

function AccountMenuIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0 text-fuchsia-200/70"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5.5 19.5c0-3.2 2.9-5.5 6.5-5.5s6.5 2.3 6.5 5.5" strokeLinecap="round" />
    </svg>
  )
}

export function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const posing = useIsPosingRoute()
  const { posing: posingBrand } = site
  const { t } = useTranslation()
  const vars = useSiteVars()
  const { user } = usePosingAuth()
  const [isAdmin, setIsAdmin] = useState(false)
  const navItems = posing ? posingNav : studioNav

  useEffect(() => {
    const userId = user?.id
    if (!userId || !posing) {
      setIsAdmin(false)
      return
    }
    fetchPosingIsAdmin(userId)
      .then(setIsAdmin)
      .catch(() => setIsAdmin(false))
  }, [user?.id, posing])

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prevOverflow
    }
  }, [open])

  useEffect(() => {
    if (!posing) return
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [posing])

  useEffect(() => {
    if (!open || !posing) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, posing])

  const accountHref = isAdmin ? '/posing/admin' : '/posing/account'
  const accountLabel = isAdmin ? t('posing.admin.title') : t('posing.auth.myAccount')

  function navClass(isActive: boolean) {
    if (posing) {
      return `${posingDesktopNavBase} ${isActive ? posingDesktopNavActive : posingDesktopNavIdle}`
    }
    return `relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
      isActive ? 'text-moove-ink' : 'text-moove-muted hover:text-moove-silver'
    }`
  }

  function posingMobileNavClass(isActive: boolean) {
    return `${posingMobileNavBase} ${isActive ? posingMobileNavActive : posingMobileNavIdle}`
  }

  function posingMobileNavStyle(index: number) {
    return { animationDelay: `${0.06 + index * 0.06}s` }
  }

  const posingHeaderScrolled = scrolled || open
  const logoLink = posing ? '/posing' : '/'
  const logoSrc = posing ? posingBrand.logo : '/logo-header.png'
  const logoAlt = posing
    ? `${posingBrand.brandName} — ${t('footer.posingSubtitle')}`
    : `${site.name} ${site.tagline}`

  return (
    <header
      className={
        posing
          ? `relative sticky top-0 backdrop-blur-xl transition-[background-color,border-color] duration-300 ${
              posingHeaderScrolled
                ? 'border-b border-white/12 bg-[#08080c]/88'
                : 'border-b border-white/8 bg-[#08080c]/72'
            } ${open ? 'z-[90]' : 'z-50'}`
          : 'sticky top-0 z-50 border-b border-moove-border/70 bg-moove-surface/75 backdrop-blur-xl backdrop-saturate-150'
      }
    >
      {posing ? (
        <>
          <div
            className="pointer-events-none absolute inset-0 opacity-40"
            style={{
              backgroundImage:
                'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(192, 38, 211, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 45%)',
            }}
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-fuchsia-400/25 via-pink-300/15 to-transparent"
            aria-hidden
          />
        </>
      ) : null}
      <div
        className={`relative mx-auto flex items-center px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] ${posing ? 'h-[4.75rem] max-w-7xl lg:h-14 lg:gap-8' : 'h-14 max-w-6xl lg:gap-6'}`}
      >
        {posing ? (
          <div className="relative flex min-w-0 flex-1 items-center justify-center lg:hidden">
            <NavLink
              to={logoLink}
              className="absolute left-1/2 -translate-x-1/2"
              onClick={() => setOpen(false)}
            >
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-[4.75rem] w-auto shrink-0 drop-shadow-[0_0_14px_rgba(244,114,182,0.28)]"
                width={190}
                height={76}
              />
            </NavLink>
            <button
              type="button"
              className={`absolute right-0 ${posingHamburgerClass} ${open ? posingHamburgerOpenClass : ''}`}
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuToggleIcon open={open} />
            </button>
          </div>
        ) : (
          <div className="flex min-w-0 flex-1 items-center justify-between lg:hidden">
            <NavLink to={logoLink} onClick={() => setOpen(false)}>
              <img
                src={logoSrc}
                alt={logoAlt}
                className="h-10 w-auto shrink-0"
                width={180}
                height={48}
              />
            </NavLink>
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-moove-border/80 bg-moove-surface/80 text-moove-silver transition-colors"
              aria-expanded={open}
              aria-controls="mobile-nav"
              aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
              onClick={() => setOpen((v) => !v)}
            >
              <MenuToggleIcon open={open} />
            </button>
          </div>
        )}

        <NavLink
          to={logoLink}
          className="hidden shrink-0 items-center lg:flex"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoSrc}
            alt={logoAlt}
            className={`w-auto shrink-0 transition-all duration-300 ${
              posing ? (posingHeaderScrolled ? 'h-12' : 'h-14') : 'h-12'
            }`}
            width={posing ? 200 : 240}
            height={posing ? 56 : 48}
          />
        </NavLink>

        <nav
          className={
            posing
              ? 'hidden items-center justify-center gap-1 self-center lg:flex'
              : 'hidden items-center justify-center gap-0.5 self-center rounded-full border border-moove-border/80 bg-moove-elevated/50 p-0.5 lg:flex'
          }
          aria-label={t('nav.main')}
        >
          {navItems.map((item) =>
            'href' in item ? (
              <a key={item.href} href={item.href} className={navClass(false)}>
                {t(item.labelKey)}
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => navClass(isActive)}
              >
                {({ isActive }) =>
                  posing ? (
                    t(item.labelKey)
                  ) : (
                    <>
                      {isActive ? (
                        <span
                          className="absolute inset-0 rounded-full bg-moove-lime/90 shadow-sm"
                          aria-hidden
                        />
                      ) : null}
                      <span className="relative z-10">{t(item.labelKey)}</span>
                    </>
                  )
                }
              </NavLink>
            ),
          )}
        </nav>

        <div className={`hidden items-center justify-end lg:flex ${posing ? 'gap-4' : 'gap-2'}`}>
          <LanguageSwitcher compact />
          {posing ? (
            user ? (
              <NavLink to={accountHref} className={posingAuthPillClass}>
                <AccountMenuIcon />
                {accountLabel}
              </NavLink>
            ) : (
              <NavLink to="/posing/login" className={posingAuthPillClass}>
                <AccountMenuIcon />
                {t('posing.auth.login')}
              </NavLink>
            )
          ) : null}
          {!posing ? <PosePromoBubble variant="header" /> : null}
          {posing ? (
            <span className="h-4 w-px bg-white/10" aria-hidden />
          ) : null}
          {posing ? (
            <a href={posingBookingHref} className={posingCtaClass}>
              {t('header.bookPosingShort')}
            </a>
          ) : (
            <ButtonLink
              href={site.bookingUrl}
              external={site.bookingUrl.startsWith('http')}
              className="!px-4 !py-2 text-xs sm:text-sm"
            >
              {t('common.book')}
            </ButtonLink>
          )}
        </div>
      </div>

      {open && posing
        ? createPortal(
            <div
              id="mobile-nav"
              className="animate-pose-overlay-fade fixed inset-0 z-[80] bg-[#08080c] lg:hidden"
              onClick={() => setOpen(false)}
            >
              <div
                className="animate-pose-menu-reveal relative flex min-h-svh flex-col px-6 pt-20 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
                onClick={(e) => e.stopPropagation()}
              >
                <div
                  className="pointer-events-none absolute inset-0 opacity-70"
                  style={{
                    backgroundImage:
                      'radial-gradient(ellipse 80% 50% at 20% 0%, rgba(192, 38, 211, 0.14) 0%, transparent 55%)',
                  }}
                  aria-hidden
                />

                <div className="relative mb-8 flex justify-end">
                  <LanguageSwitcher />
                </div>

                <nav className="relative flex flex-col" aria-label={t('nav.mobile')}>
                  {navItems.map((item, index) =>
                    'href' in item ? (
                      <a
                        key={item.href}
                        href={item.href}
                        className={posingMobileNavClass(false)}
                        style={posingMobileNavStyle(index)}
                        onClick={() => setOpen(false)}
                      >
                        {t(item.labelKey)}
                      </a>
                    ) : (
                      <NavLink
                        key={item.to}
                        to={item.to}
                        end={'end' in item ? item.end : false}
                        className={({ isActive }) => posingMobileNavClass(isActive)}
                        style={posingMobileNavStyle(index)}
                        onClick={() => setOpen(false)}
                      >
                        {t(item.labelKey)}
                      </NavLink>
                    ),
                  )}
                </nav>

                <div
                  className="relative mt-6 animate-pose-nav-stagger"
                  style={posingMobileNavStyle(navItems.length)}
                >
                  {user ? (
                    <NavLink
                      to={accountHref}
                      className={posingAuthPillMobileClass}
                      onClick={() => setOpen(false)}
                    >
                      <AccountMenuIcon />
                      {accountLabel}
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/posing/login"
                      className={posingAuthPillMobileClass}
                      onClick={() => setOpen(false)}
                    >
                      <AccountMenuIcon />
                      {t('posing.auth.login')}
                    </NavLink>
                  )}
                </div>

                <div className="flex-1" aria-hidden />

                <div
                  className="relative space-y-4 animate-pose-nav-stagger"
                  style={posingMobileNavStyle(navItems.length + 1)}
                >
                  <div
                    className="h-px bg-gradient-to-r from-transparent via-fuchsia-300/25 to-transparent"
                    aria-hidden
                  />
                  <a href={posingBookingHref} className={`w-full ${posingCtaClass} !py-3.5`}>
                    {t('common.bookPosingSession')}
                  </a>
                  <Link
                    to="/"
                    className="block text-center text-xs uppercase tracking-[0.16em] text-white/40 transition hover:text-white/65"
                    onClick={() => setOpen(false)}
                  >
                    {t('footer.backToStudio', vars)}
                  </Link>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}

      {open && !posing ? (
        <div
          id="mobile-nav"
          className="border-t border-moove-border/80 bg-moove-surface/95 px-4 py-4 backdrop-blur-xl lg:hidden"
        >
          <div className="mb-3 flex justify-center">
            <LanguageSwitcher />
          </div>
          <nav className="flex flex-col gap-1" aria-label={t('nav.mobile')}>
            {navItems.map((item) =>
              'href' in item ? (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-xl px-4 py-2.5 text-sm font-medium text-moove-muted"
                  onClick={() => setOpen(false)}
                >
                  {t(item.labelKey)}
                </a>
              ) : (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={'end' in item ? item.end : false}
                  className={({ isActive }) =>
                    `rounded-xl px-4 py-2.5 text-sm font-medium ${
                      isActive ? 'bg-moove-lime/20 text-moove-ink' : 'text-moove-muted'
                    }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {t(item.labelKey)}
                </NavLink>
              ),
            )}
            <div className="mt-2">
              <PosePromoBubble variant="menu" onNavigate={() => setOpen(false)} />
            </div>
            <div className="mt-3 border-t border-moove-border pt-4">
              <ButtonLink
                href={site.bookingUrl}
                external={site.bookingUrl.startsWith('http')}
                className="w-full"
              >
                {t('common.book')}
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
