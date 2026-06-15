import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'

const nav = [
  { to: '/', label: 'Αρχική' },
  { to: '/mathimata', label: 'Μαθήματα' },
  { to: '/sxetika', label: 'Σχετικά' },
  { to: '/epikoinonia', label: 'Επικοινωνία' },
] as const

function navClass(isActive: boolean) {
  return `relative rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:px-3.5 sm:text-sm ${
    isActive
      ? 'text-moove-ink'
      : 'text-moove-muted hover:text-moove-silver'
  }`
}

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-moove-border/70 bg-moove-surface/75 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-14 max-w-6xl items-center px-4 sm:px-6 lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-6">
        {/* Mobile: centered logo between spacer + menu */}
        <div className="flex min-w-0 flex-1 items-center lg:hidden">
          <div className="w-10 shrink-0" aria-hidden />
          <div className="flex flex-1 justify-center">
            <NavLink to="/" onClick={() => setOpen(false)}>
              <img
                src="/logo-header.png"
                alt={`${site.name} ${site.tagline}`}
                className="h-10 w-auto shrink-0"
                width={180}
                height={48}
              />
            </NavLink>
          </div>
          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-moove-border/80 bg-moove-surface/80 text-moove-silver"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? '✕' : '☰'}
          </button>
        </div>

        {/* Desktop logo — contained inside header */}
        <NavLink
          to="/"
          className="hidden shrink-0 items-center lg:flex"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-header.png"
            alt={`${site.name} ${site.tagline}`}
            className="h-12 w-auto shrink-0"
            width={240}
            height={48}
          />
        </NavLink>

        <nav
          className="hidden items-center justify-center gap-0.5 self-center rounded-full border border-moove-border/80 bg-moove-elevated/50 p-0.5 lg:flex"
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
                      className="absolute inset-0 rounded-full bg-moove-lime/90 shadow-sm"
                      aria-hidden
                    />
                  ) : null}
                  <span className="relative z-10">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-end lg:flex">
          <ButtonLink
            href={site.bookingUrl}
            external={site.bookingUrl.startsWith('http')}
            className="!px-4 !py-2 text-xs sm:text-sm"
          >
            Κράτηση
          </ButtonLink>
        </div>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-moove-border/80 bg-moove-surface/95 px-4 py-4 backdrop-blur-xl lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Κινητή πλοήγηση">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-xl px-4 py-2.5 text-sm font-medium ${
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
            <div className="mt-3 border-t border-moove-border pt-4">
              <ButtonLink
                href={site.bookingUrl}
                external={site.bookingUrl.startsWith('http')}
                className="w-full"
              >
                Κράτηση
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
