import { useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

/** A pointer that can hover; touch screens pick a class by tapping instead. */
const canHover = () => typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches

/**
 * A title split into letters, each with a faint copy that slides up and away while a solid
 * copy rises into its place. Words stay unbroken so long Greek titles still wrap.
 * Screen readers get the plain title instead of single letters.
 */
function SplitTitle({ text }: { text: string }) {
  let index = 0
  return (
    <>
      <span className="sr-only">{text}</span>
      <span aria-hidden>
        {text.split(' ').map((word, w, words) => (
          <span key={`${word}-${w}`} className="inline-block whitespace-nowrap">
            {[...word].map((letter) => {
              const i = index++
              return (
                <span key={i} className="slides-letter" style={{ '--i': i } as CSSProperties}>
                  <span className="slides-letter__ghost">{letter}</span>
                  <span className="slides-letter__solid">{letter}</span>
                </span>
              )
            })}
            {w < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </>
  )
}

/** Class titles on one side, a photograph wiping in on the other, as a set of tabs. */
export function ClassSlideshow() {
  const { t, dictionary } = useTranslation()
  const rows = dictionary.home.classes.rows
  const [active, setActive] = useState(0)
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([])
  const baseId = useId()
  const tabId = (i: number) => `${baseId}-tab-${i}`
  const panelId = `${baseId}-panel`
  const current = rows[active]

  function select(i: number, { focus = false } = {}) {
    setActive(i)
    if (focus) tabRefs.current[i]?.focus()
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const last = rows.length - 1
    const moves: Record<string, number> = {
      ArrowDown: active >= last ? 0 : active + 1,
      ArrowRight: active >= last ? 0 : active + 1,
      ArrowUp: active <= 0 ? last : active - 1,
      ArrowLeft: active <= 0 ? last : active - 1,
      Home: 0,
      End: last,
    }
    if (event.key in moves) {
      event.preventDefault()
      select(moves[event.key], { focus: true })
    }
  }

  return (
    <div className="studio-grid mt-14 gap-y-10 md:mt-20 md:items-start">
      {/* The class titles: hover, focus or tap to choose */}
      <div
        role="tablist"
        aria-orientation="vertical"
        aria-label={t('home.classes.title')}
        className="col-span-12 flex flex-col items-start gap-3 md:col-span-5 md:gap-5"
      >
        {rows.map((row, i) => (
          <button
            key={row.title}
            ref={(el) => {
              tabRefs.current[i] = el
            }}
            id={tabId(i)}
            type="button"
            role="tab"
            aria-selected={i === active}
            aria-controls={panelId}
            tabIndex={i === active ? 0 : -1}
            data-active={i === active ? 'true' : 'false'}
            onClick={() => select(i)}
            onPointerEnter={() => {
              if (canHover()) select(i)
            }}
            onKeyDown={onKeyDown}
            className="slides-title text-left text-[clamp(1.5rem,1rem+2.2vw,3.25rem)] font-extrabold leading-[1.02] tracking-[-0.04em]"
          >
            <SplitTitle text={row.title} />
          </button>
        ))}
      </div>

      {/* The photographs, stacked; the chosen one wipes in from the top */}
      <div
        id={panelId}
        role="tabpanel"
        aria-labelledby={tabId(active)}
        className="col-span-12 md:sticky md:top-24 md:col-span-7"
      >
        <div className="grid overflow-hidden bg-moove-elevated [&>*]:col-start-1 [&>*]:row-start-1">
          {rows.map((row, i) => (
            <div
              key={row.title}
              className="slides-photo aspect-[4/3]"
              data-active={i === active ? 'true' : 'false'}
              aria-hidden={i !== active}
            >
              {row.image ? (
                <img
                  src={row.image}
                  alt={i === active ? row.alt : ''}
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-end bg-moove-lime p-[clamp(1.25rem,3vw,2.5rem)]">
                  <p className="studio-display text-[clamp(3rem,1rem+6vw,7rem)]">{row.title}</p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* What the chosen class is, fading in with each change */}
        <div key={active} className="slides-detail mt-6 md:max-w-[44ch]">
          <p className="leading-[1.5]">{current.body}</p>
          <p className="studio-small mt-3 text-moove-muted">{current.meta}</p>
          <a
            href={site.bookingUrl}
            {...bookingProps}
            className="studio-link mt-5 inline-block text-[length:var(--step-small)]"
          >
            {t('common.bookSpot')}
            <span className="sr-only">: {current.title}</span>
          </a>
        </div>
      </div>
    </div>
  )
}
