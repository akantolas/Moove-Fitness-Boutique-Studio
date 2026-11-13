import { NavLink } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { site } from '../site'
import { ButtonLink } from './Links'
import { LanguageSwitcher } from './LanguageSwitcher'
import { useTranslation } from '../i18n/useTranslation'

const studioNav = [
  { to: '/', labelKey: 'nav.home', end: true },
  { to: '/mathimata', labelKey: 'nav.classes' },
  { to: '/sxetika', labelKey: 'nav.about' },
  { to: '/epikoinonia', labelKey: 'nav.contact' },
] as const

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

export function Header() {
  const [open, setOpen] = useState(false)
  const { t } = useTranslation()

  useEffect(() => {
    if (!open) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  function navClass(isActive: boolean) {
    return `px-3 py-2 text-[0.9375rem] font-semibold transition-colors ${
      isActive
        ? 'text-moove-ink underline decoration-2 underline-offset-[0.4em]'
        : 'text-moove-muted hover:text-moove-ink'
    }`
  }

  const logoAlt = `${site.name} ${site.tagline}`
  const bookingExternal = site.bookingUrl.startsWith('http')

  return (
    <header className="sticky top-0 z-50 bg-moove-bg">
      <div className="studio-frame relative flex h-16 items-center lg:grid lg:grid-cols-[auto_1fr_auto] lg:gap-6">
        <div className="flex min-w-0 flex-1 items-center justify-between lg:hidden">
          <NavLink to="/" onClick={() => setOpen(false)}>
            <img
              src="/logo-header.png"
              alt={logoAlt}
              className="h-10 w-auto shrink-0"
              width={180}
              height={48}
            />
          </NavLink>
          <button
            type="button"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-moove-surface text-moove-ink transition-colors hover:bg-moove-elevated"
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            onClick={() => setOpen((v) => !v)}
          >
            <MenuToggleIcon open={open} />
          </button>
        </div>

        <NavLink
          to="/"
          className="hidden shrink-0 items-center lg:flex"
          onClick={() => setOpen(false)}
        >
          <img
            src="/logo-header.png"
            alt={logoAlt}
            className="h-12 w-auto shrink-0"
            width={240}
            height={48}
          />
        </NavLink>

        <nav
          className="hidden items-center justify-center gap-1 self-center lg:flex"
          aria-label={t('nav.main')}
        >
          {studioNav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) => navClass(isActive)}
            >
              {t(item.labelKey)}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center justify-end gap-2 lg:flex">
          <LanguageSwitcher />
          <ButtonLink
            href={site.bookingUrl}
            external={bookingExternal}
            className="!px-5 text-[0.9375rem]"
          >
            {t('common.book')}
          </ButtonLink>
        </div>
      </div>

      {open ? (
        <div id="mobile-nav" className="studio-frame bg-moove-bg pb-8 pt-2 lg:hidden">
          <div className="mb-4 flex">
            <LanguageSwitcher align="start" />
          </div>
          <nav className="flex flex-col gap-1" aria-label={t('nav.mobile')}>
            {studioNav.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  `py-2 text-3xl font-extrabold tracking-[-0.04em] ${
                    isActive ? 'text-moove-ink' : 'text-moove-muted hover:text-moove-ink'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {t(item.labelKey)}
              </NavLink>
            ))}
            <div className="mt-6">
              <ButtonLink href={site.bookingUrl} external={bookingExternal} className="w-full">
                {t('common.book')}
              </ButtonLink>
            </div>
          </nav>
        </div>
      ) : null}
    </header>
  )
}
