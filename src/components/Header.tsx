import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'
import {
  posingBookingHref,
  posingPackagesHref,
  useIsPosingRoute,
} from '../hooks/useIsPosingRoute'
import { PosePromoBubble } from './PosePromoBubble'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from '../i18n/useTranslation'

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

export function Header() {
  const [open, setOpen] = useState(false)
  const posing = useIsPosingRoute()
  const { posing: posingBrand } = site
  const { t } = useTranslation()
  const navItems = posing ? posingNav : studioNav

  function navClass(isActive: boolean) {
    if (posing) {
      return `relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
        isActive ? 'text-white' : 'text-white/58 hover:text-white'
      }`
    }
    return `relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
      isActive ? 'text-moove-ink' : 'text-moove-muted hover:text-moove-silver'
    }`
  }

  const logoLink = posing ? '/posing' : '/'
  const logoSrc = posing ? posingBrand.logo : '/logo-header.png'
  const logoAlt = posing
    ? `${posingBrand.brandName} — ${posingBrand.brandSubtitle}`
    : `${site.name} ${site.tagline}`

  return (
    <header
      className={
        posing
          ? 'sticky top-0 z-50 border-b border-fuchsia-200/18 bg-[#07070b]/88 shadow-[0_16px_54px_-32px_rgba(244,114,182,0.9)] backdrop-blur-2xl backdrop-saturate-150'
          : 'sticky top-0 z-50 border-b border-moove-border/70 bg-moove-surface/75 backdrop-blur-xl backdrop-saturate-150'
      }
    >
      <div className={`mx-auto flex items-center px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] ${posing ? 'h-16 max-w-7xl lg:gap-8' : 'h-14 max-w-6xl lg:gap-6'}`}>
        <div className="flex min-w-0 flex-1 items-center lg:hidden">
          <div className="w-10 shrink-0" aria-hidden />
          <div className="flex flex-1 justify-center">
            <NavLink to={logoLink} onClick={() => setOpen(false)}>
              <img
                src={logoSrc}
                alt={logoAlt}
                className={`w-auto shrink-0 ${posing ? 'h-12' : 'h-10'}`}
                width={posing ? 120 : 180}
                height={posing ? 48 : 48}
              />
            </NavLink>
          </div>
          <button
            type="button"
            className={
              posing
                ? 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-white/5 text-white'
                : 'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-moove-border/80 bg-moove-surface/80 text-moove-silver'
            }
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        <NavLink
          to={logoLink}
          className="hidden shrink-0 items-center lg:flex"
          onClick={() => setOpen(false)}
        >
          <img
            src={logoSrc}
            alt={logoAlt}
            className={`w-auto shrink-0 ${posing ? 'h-14' : 'h-12'}`}
            width={posing ? 180 : 240}
            height={posing ? 64 : 48}
          />
        </NavLink>

        <nav
          className={
            posing
              ? 'hidden items-center justify-center gap-0.5 self-center rounded-full border border-fuchsia-200/18 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(244,114,182,0.08),rgba(0,0,0,0.18))] p-1 shadow-[0_12px_38px_-28px_rgba(244,114,182,0.95),inset_0_1px_0_rgba(255,255,255,0.10)] backdrop-blur-md lg:flex'
              : 'hidden items-center justify-center gap-0.5 self-center rounded-full border border-moove-border/80 bg-moove-elevated/50 p-0.5 lg:flex'
          }
          aria-label={t('nav.main')}
        >
          {navItems.map((item) =>
            'href' in item ? (
              <a key={item.href} href={item.href} className={navClass(false)}>
                <span className="relative z-10">{t(item.labelKey)}</span>
              </a>
            ) : (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) => navClass(isActive)}
              >
                {({ isActive }) => (
                  <>
                    {isActive ? (
                      <span
                        className={
                          posing
                            ? 'absolute inset-0 rounded-full border border-fuchsia-100/35 bg-gradient-to-r from-fuchsia-500/65 via-pink-300/50 to-rose-200/42 shadow-[0_0_28px_-8px_rgba(244,114,182,0.95)]'
                            : 'absolute inset-0 rounded-full bg-moove-lime/90 shadow-sm'
                        }
                        aria-hidden
                      />
                    ) : null}
                    <span className="relative z-10">{t(item.labelKey)}</span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <LanguageSwitcher compact />
          {posing ? (
            <PosePromoBubble variant="studio-back" />
          ) : (
            <PosePromoBubble variant="header" />
          )}
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

      {open ? (
        <div
          id="mobile-nav"
          className={
            posing
              ? 'border-t border-fuchsia-200/18 bg-[#09090f]/98 px-4 py-4 shadow-[0_18px_58px_-34px_rgba(244,114,182,0.85)] backdrop-blur-xl lg:hidden'
              : 'border-t border-moove-border/80 bg-moove-surface/95 px-4 py-4 backdrop-blur-xl lg:hidden'
          }
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
                  className={
                    posing
                      ? 'rounded-xl px-4 py-2.5 text-sm font-medium text-white/65'
                      : 'rounded-xl px-4 py-2.5 text-sm font-medium text-moove-muted'
                  }
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
                    posing
                      ? `rounded-xl px-4 py-2.5 text-sm font-medium ${
                          isActive
                            ? 'border border-fuchsia-100/30 bg-gradient-to-r from-fuchsia-500/30 to-rose-200/18 text-white'
                            : 'text-white/65'
                        }`
                      : `rounded-xl px-4 py-2.5 text-sm font-medium ${
                          isActive
                            ? 'bg-moove-lime/20 text-moove-ink'
                            : 'text-moove-muted'
                        }`
                  }
                  onClick={() => setOpen(false)}
                >
                  {t(item.labelKey)}
                </NavLink>
              ),
            )}
            {!posing ? (
              <div className="mt-2">
                <PosePromoBubble variant="menu" onNavigate={() => setOpen(false)} />
              </div>
            ) : (
              <div className="mt-2">
                <PosePromoBubble variant="studio-back" onNavigate={() => setOpen(false)} />
              </div>
            )}
            <div
              className={`mt-3 border-t pt-4 ${posing ? 'border-white/10' : 'border-moove-border'}`}
            >
              {posing ? (
                <a href={posingBookingHref} className={`w-full ${posingCtaClass} !py-3`}>
                  {t('common.bookPosingSession')}
                </a>
              ) : (
                <ButtonLink
                  href={site.bookingUrl}
                  external={site.bookingUrl.startsWith('http')}
                  className="w-full"
                >
                  {t('common.book')}
                </ButtonLink>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
