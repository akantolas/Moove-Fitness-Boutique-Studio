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
  'relative px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors'
const posingDesktopNavIdle = 'text-white/45 hover:text-white/75'
const posingDesktopNavActive =
  'text-white after:absolute after:inset-x-3 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-fuchsia-400/80 after:via-pink-300/50 after:to-transparent'

const posingAuthLinkClass =
  'text-[11px] font-semibold uppercase tracking-[0.16em] text-white/50 transition hover:text-white'

const posingMobileNavIdle =
  'border-b border-white/6 py-4 font-display text-2xl font-medium text-white/55 transition hover:text-white/90'
const posingMobileNavActive =
  'border-b border-white/6 py-4 font-display text-2xl font-medium text-white'

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
    return isActive ? posingMobileNavActive : posingMobileNavIdle
  }

  const logoLink = posing ? '/posing' : '/'
  const logoSrc = posing ? posingBrand.logo : '/logo-header.png'
  const logoAlt = posing
    ? `${posingBrand.brandName} — ${t('footer.posingSubtitle')}`
    : `${site.name} ${site.tagline}`

  return (
    <header
      className={
        posing
          ? `sticky top-0 border-b border-white/8 bg-[#08080c]/72 backdrop-blur-xl ${open ? 'z-[90]' : 'z-50'}`
          : 'sticky top-0 z-50 border-b border-moove-border/70 bg-moove-surface/75 backdrop-blur-xl backdrop-saturate-150'
      }
    >
      <div
        className={`mx-auto flex items-center px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] ${posing ? 'h-[4.75rem] max-w-7xl lg:h-14 lg:gap-8' : 'h-14 max-w-6xl lg:gap-6'}`}
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
                className="h-[4.75rem] w-auto shrink-0 drop-shadow-[0_0_18px_rgba(244,114,182,0.35)]"
                width={190}
                height={76}
              />
            </NavLink>
            <button
              type="button"
              className="absolute right-0 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-white/12 bg-white/[0.03] text-white/85 transition-colors hover:bg-white/[0.06]"
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
            className={`w-auto shrink-0 ${posing ? 'h-14' : 'h-12'}`}
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
              <NavLink to={accountHref} className={posingAuthLinkClass}>
                {accountLabel}
              </NavLink>
            ) : (
              <NavLink to="/posing/login" className={posingAuthLinkClass}>
                {t('posing.auth.login')}
              </NavLink>
            )
          ) : null}
          {!posing ? <PosePromoBubble variant="header" /> : null}
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
                  {navItems.map((item) =>
                    'href' in item ? (
                      <a
                        key={item.href}
                        href={item.href}
                        className={posingMobileNavClass(false)}
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
                        onClick={() => setOpen(false)}
                      >
                        {t(item.labelKey)}
                      </NavLink>
                    ),
                  )}
                </nav>

                <div className="relative mt-6">
                  {user ? (
                    <NavLink
                      to={accountHref}
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      <AccountMenuIcon />
                      {accountLabel}
                    </NavLink>
                  ) : (
                    <NavLink
                      to="/posing/login"
                      className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.14em] text-white/55 transition hover:text-white"
                      onClick={() => setOpen(false)}
                    >
                      <AccountMenuIcon />
                      {t('posing.auth.login')}
                    </NavLink>
                  )}
                </div>

                <div className="flex-1" aria-hidden />

                <div className="relative space-y-4">
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
