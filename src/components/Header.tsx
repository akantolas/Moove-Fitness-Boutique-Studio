import { NavLink } from 'react-router-dom'
import { useState } from 'react'
import { site } from '../site'
import { ButtonLink, PrimaryLink } from './Links'

const nav = [
  { to: '/', label: 'Αρχική' },
  { to: '/mathimata', label: 'Μαθήματα' },
  { to: '/programma', label: 'Πρόγραμμα' },
  { to: '/times', label: 'Τιμές' },
  { to: '/sxetika', label: 'Σχετικά' },
  { to: '/epikoinonia', label: 'Επικοινωνία' },
] as const

function navClass(isActive: boolean) {
  return `rounded-md px-3 py-2 text-sm font-medium transition ${
    isActive
      ? 'text-moove-lime'
      : 'text-moove-muted hover:text-moove-silver'
  }`
}

export function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 border-b border-moove-border/90 bg-moove-surface/88 backdrop-blur-md backdrop-saturate-150">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6 sm:py-4">
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-3"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo.png"
            alt={`${site.name} ${site.tagline}`}
            className="h-14 w-auto sm:h-16 lg:h-[4.25rem]"
            width={240}
            height={64}
          />
        </NavLink>

        <nav
          className="hidden items-center gap-1 lg:flex"
          aria-label="Κύρια πλοήγηση"
        >
          {nav.map(({ to, label }) => (
            <NavLink key={to} to={to} className={({ isActive }) => navClass(isActive)} end={to === '/'}>
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <ButtonLink href={site.bookingUrl} variant="ghost" external={site.bookingUrl.startsWith('http')}>
            Ο λογαριασμός μου
          </ButtonLink>
          <PrimaryLink to="/programma">Κράτηση</PrimaryLink>
        </div>

        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-moove-border text-moove-silver lg:hidden"
          aria-expanded={open}
          aria-controls="mobile-nav"
          aria-label={open ? 'Κλείσιμο μενού' : 'Άνοιγμα μενού'}
          onClick={() => setOpen((v) => !v)}
        >
          <span className="sr-only">Μενού</span>
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open ? (
        <div
          id="mobile-nav"
          className="border-t border-moove-border bg-moove-surface px-4 py-4 lg:hidden"
        >
          <nav className="flex flex-col gap-1" aria-label="Κινητή πλοήγηση">
            {nav.map(({ to, label }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-3 text-base ${navClass(isActive)}`
                }
                onClick={() => setOpen(false)}
              >
                {label}
              </NavLink>
            ))}
            <div className="mt-3 flex flex-col gap-2 border-t border-moove-border pt-4">
              <a
                href={site.bookingUrl}
                className="rounded-lg border border-moove-silver/40 px-4 py-3 text-center text-sm text-moove-silver"
                {...(site.bookingUrl.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : undefined)}
              >
                Ο λογαριασμός μου
              </a>
              <NavLink
                to="/programma"
                className="rounded-full bg-moove-lime py-3 text-center text-sm font-semibold text-moove-ink"
                onClick={() => setOpen(false)}
              >
                Κράτηση
              </NavLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
