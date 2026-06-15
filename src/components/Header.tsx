import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'
import { useIsPosingRoute } from '../hooks/useIsPosingRoute'
import { PosePromoBubble } from './PosePromoBubble'

const nav = [
  { to: '/', label: 'Αρχική' },
  { to: '/mathimata', label: 'Μαθήματα' },
  { to: '/sxetika', label: 'Σχετικά' },
  { to: '/epikoinonia', label: 'Επικοινωνία' },
] as const

const posingCtaClass =
  'inline-flex items-center justify-center rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-black shadow-[0_6px_24px_-6px_rgba(192,38,211,0.5)] transition hover:brightness-110 sm:px-5 sm:text-sm'

export function Header() {
  const [open, setOpen] = useState(false)
  const posing = useIsPosingRoute()
  const { posing: posingBrand } = site

  function navClass(isActive: boolean) {
    if (posing) {
      return `relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
        isActive ? 'text-black' : 'text-white/65 hover:text-white'
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
          ? 'sticky top-0 z-50 border-b border-white/10 bg-[#08080c]/90 backdrop-blur-xl backdrop-saturate-150'
          : 'sticky top-0 z-50 border-b border-moove-border/70 bg-moove-surface/75 backdrop-blur-xl backdrop-saturate-150'
      }
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center lg:hidden">
          <div className="w-10 shrink-0" aria-hidden />
          <div className="flex flex-1 justify-center">
            <NavLink to={logoLink} onClick={() => setOpen(false)}>
              <img
                src={logoSrc}
                alt={logoAlt}
                className={`w-auto shrink-0 ${posing ? 'h-11' : 'h-10'}`}
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
            aria-label={open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
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
            className={`w-auto shrink-0 ${posing ? 'h-12' : 'h-12'}`}
            width={posing ? 140 : 240}
            height={48}
          />
        </NavLink>

        <nav
          className={
            posing
              ? 'hidden items-center justify-center gap-0.5 self-center rounded-full border border-white/10 bg-white/[0.04] p-0.5 lg:flex'
              : 'hidden items-center justify-center gap-0.5 self-center rounded-full border border-moove-border/80 bg-moove-elevated/50 p-0.5 lg:flex'
          }
          aria-label="Κύρια πλοήγηση"
        >
          {nav.map(({ to, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) => navClass(isActive)}
            >
              {({ isActive }) => (
                <>
                  {isActive ? (
                    <span
                      className={
                        posing
                          ? 'absolute inset-0 rounded-full bg-gradient-to-r from-fuchsia-400 to-cyan-300 shadow-sm'
                          : 'absolute inset-0 rounded-full bg-moove-lime/90 shadow-sm'
                      }
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          {posing ? (
            <PosePromoBubble variant="studio-back" />
          ) : (
            <PosePromoBubble variant="header" />
          )}
          {posing ? (
            <a href="#booking" className={posingCtaClass}>
              Κράτηση
            </a>
          ) : (
            <ButtonLink
              href={site.bookingUrl}
              external={site.bookingUrl.startsWith('http')}
              className="!px-4 !py-2 text-xs sm:text-sm"
            >
              Κράτηση
            </ButtonLink>
          )}
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className={
            posing
              ? 'border-t border-white/10 bg-[#0c0c12]/98 px-4 py-4 backdrop-blur-xl lg:hidden'
              : 'border-t border-moove-border/80 bg-moove-surface/95 px-4 py-4 backdrop-blur-xl lg:hidden'
          }
        >
          <nav className="flex flex-col gap-1" aria-label="Κινητή πλοήγηση">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  posing
                    ? `rounded-xl px-4 py-2.5 text-sm font-medium ${
                        isActive
                          ? 'bg-gradient-to-r from-fuchsia-500/25 to-cyan-400/20 text-white'
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
                {label}
              </NavLink>
            ))}
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
                <a href="#booking" className={`w-full ${posingCtaClass} !py-3`}>
                  Κράτηση συνεδρίας
                </a>
              ) : (
                <ButtonLink
                  href={site.bookingUrl}
                  external={site.bookingUrl.startsWith('http')}
                  className="w-full"
                >
                  Κράτηση
                </ButtonLink>
              )}
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
