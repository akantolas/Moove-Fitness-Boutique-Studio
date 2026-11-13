import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import { LOCALES, type Locale } from '../i18n/types'

/* Flags are drawn as SVG: Windows does not render flag emoji, it shows the letters "GR". */
function GreekFlag() {
  return (
    <svg viewBox="0 0 27 18" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <rect width="27" height="18" fill="#0D5EAF" />
      <path d="M0 3h27M0 7h27M0 11h27M0 15h27" stroke="#fff" strokeWidth="2" />
      <rect width="10" height="10" fill="#0D5EAF" />
      <path d="M0 5h10M5 0v10" stroke="#fff" strokeWidth="2" />
    </svg>
  )
}

function BritishFlag() {
  const clipId = useId()
  return (
    <svg viewBox="0 0 60 30" preserveAspectRatio="xMidYMid slice" className="h-full w-full" aria-hidden>
      <clipPath id={clipId}>
        <path d="M30 15h30v15zv15H0zH0V0zV0h30z" />
      </clipPath>
      <rect width="60" height="30" fill="#012169" />
      <path d="M0 0l60 30M60 0L0 30" stroke="#fff" strokeWidth="6" />
      <path d="M0 0l60 30M60 0L0 30" clipPath={`url(#${clipId})`} stroke="#C8102E" strokeWidth="4" />
      <path d="M30 0v30M0 15h60" stroke="#fff" strokeWidth="10" />
      <path d="M30 0v30M0 15h60" stroke="#C8102E" strokeWidth="6" />
    </svg>
  )
}

function Flag({ code }: { code: Locale }) {
  return (
    <span className="inline-flex h-[1.125rem] w-[1.125rem] shrink-0 overflow-hidden rounded-full ring-1 ring-black/10">
      {code === 'el' ? <GreekFlag /> : <BritishFlag />}
    </span>
  )
}

function ChevronDown({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-4 w-4 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
      aria-hidden
    >
      <path d="m6 9 6 6 6-6" />
    </svg>
  )
}

function Check() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

type LanguageSwitcherProps = {
  /** Which edge of the button the menu lines up with. */
  align?: 'start' | 'end'
}

/** A pill button showing the current language, opening a listbox of the others. */
export function LanguageSwitcher({ align = 'end' }: LanguageSwitcherProps) {
  const { locale, setLocale, t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(() => LOCALES.indexOf(locale))
  const containerRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const listId = useId()
  const optionId = (code: Locale) => `${listId}-${code}`

  function openMenu(index = LOCALES.indexOf(locale)) {
    setActiveIndex(index)
    setOpen(true)
  }

  function closeMenu({ refocus }: { refocus: boolean }) {
    setOpen(false)
    if (refocus) buttonRef.current?.focus()
  }

  function choose(code: Locale) {
    setLocale(code)
    closeMenu({ refocus: true })
  }

  // The listbox takes focus while open, so arrow keys move through it.
  useEffect(() => {
    if (open) listRef.current?.focus()
  }, [open])

  // A click or tap anywhere outside closes the menu.
  useEffect(() => {
    if (!open) return
    const onPointerDown = (event: PointerEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [open])

  function onButtonKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault()
      openMenu(event.key === 'ArrowUp' ? LOCALES.length - 1 : LOCALES.indexOf(locale))
    }
  }

  function onListKeyDown(event: KeyboardEvent<HTMLUListElement>) {
    const last = LOCALES.length - 1
    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        setActiveIndex((i) => (i >= last ? 0 : i + 1))
        break
      case 'ArrowUp':
        event.preventDefault()
        setActiveIndex((i) => (i <= 0 ? last : i - 1))
        break
      case 'Home':
        event.preventDefault()
        setActiveIndex(0)
        break
      case 'End':
        event.preventDefault()
        setActiveIndex(last)
        break
      case 'Enter':
      case ' ':
        event.preventDefault()
        choose(LOCALES[activeIndex])
        break
      case 'Escape':
        event.preventDefault()
        closeMenu({ refocus: true })
        break
      case 'Tab':
        closeMenu({ refocus: false })
        break
    }
  }

  return (
    <div ref={containerRef} className="relative inline-block">
      <button
        ref={buttonRef}
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        aria-label={`${t('lang.switch')}: ${t(`lang.${locale}`)}`}
        onClick={() => (open ? closeMenu({ refocus: false }) : openMenu())}
        onKeyDown={onButtonKeyDown}
        className={`inline-flex min-h-10 items-center gap-2 rounded-full border border-moove-border bg-moove-bg/70 px-3 py-1.5 text-sm font-semibold text-moove-ink shadow-sm backdrop-blur-md transition-colors hover:bg-moove-surface ${
          open ? 'bg-moove-surface' : ''
        }`}
      >
        <Flag code={locale} />
        <span>{t(`lang.${locale}`)}</span>
        <ChevronDown open={open} />
      </button>

      {open ? (
        <ul
          ref={listRef}
          id={listId}
          role="listbox"
          tabIndex={-1}
          aria-label={t('lang.switch')}
          aria-activedescendant={optionId(LOCALES[activeIndex])}
          onKeyDown={onListKeyDown}
          className={`lang-menu absolute top-full z-50 mt-2 min-w-[11rem] rounded-2xl border border-moove-border bg-moove-bg p-1 shadow-moove-lift outline-none ${
            align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {LOCALES.map((code, index) => {
            const selected = code === locale
            return (
              <li
                key={code}
                id={optionId(code)}
                role="option"
                aria-selected={selected}
                onPointerEnter={() => setActiveIndex(index)}
                onClick={() => choose(code)}
                className={`flex min-h-11 cursor-pointer items-center gap-2.5 rounded-xl px-3 text-sm text-moove-ink transition-colors ${
                  index === activeIndex ? 'bg-moove-surface' : ''
                } ${selected ? 'font-semibold' : ''}`}
              >
                <Flag code={code} />
                <span className="flex-1">{t(`lang.${code}`)}</span>
                {selected ? (
                  <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-moove-lime">
                    <Check />
                  </span>
                ) : null}
              </li>
            )
          })}
        </ul>
      ) : null}
    </div>
  )
}
