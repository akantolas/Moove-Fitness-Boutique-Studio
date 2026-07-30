import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react'
import {
  formatProgramPrice,
  type MooveProgramCatalogItem,
  type MooveProgramKey,
} from '../data/moovePrograms'
import { useTranslation } from '../i18n/useTranslation'

type ProgramCopy = Record<MooveProgramKey, { title: string; desc: string }>

type ProgramShowcaseProps = {
  programs: MooveProgramCatalogItem[]
  copy: ProgramCopy
  onPurchase: (program: MooveProgramCatalogItem) => void
}

const SWIPE_THRESHOLD_PX = 48

export function ProgramShowcase({ programs, copy, onPurchase }: ProgramShowcaseProps) {
  const { t, locale } = useTranslation()
  const featuredIndex = Math.max(0, programs.findIndex((program) => program.featured))
  const [activeIndex, setActiveIndex] = useState(featuredIndex)
  const touchStartX = useRef<number | null>(null)

  const activeProgram = programs[activeIndex] ?? programs[0]
  if (!activeProgram) return null

  const activeCopy = copy[activeProgram.key]
  const activeTitle = activeCopy?.title ?? activeProgram.key

  function selectRelative(step: number) {
    setActiveIndex((current) => (current + step + programs.length) % programs.length)
  }

  function handleKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      selectRelative(-1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      selectRelative(1)
    }
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current == null) return
    const endX = event.changedTouches[0]?.clientX ?? touchStartX.current
    const distance = endX - touchStartX.current
    touchStartX.current = null
    if (Math.abs(distance) < SWIPE_THRESHOLD_PX) return
    selectRelative(distance > 0 ? -1 : 1)
  }

  return (
    <div
      className="mt-8"
      role="region"
      aria-roledescription="carousel"
      aria-label={t('programs.catalog.title')}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <p className="sr-only" aria-live="polite">
        {activeTitle}
      </p>

      <div className="mb-5 rounded-[1.5rem] border border-moove-border/80 bg-moove-elevated/40 p-4 sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-moove-silver">{t('programs.catalog.selectorLabel')}</p>
            <p className="mt-1 text-xs text-moove-muted">{t('programs.catalog.selectorHint')}</p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => selectRelative(-1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-moove-border bg-white/70 text-lg text-moove-silver transition hover:border-moove-lime-deep/40 hover:bg-moove-lime/10"
              aria-label={t('posing.pricing.prevPackage')}
            >
              ←
            </button>
            <button
              type="button"
              onClick={() => selectRelative(1)}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-moove-border bg-white/70 text-lg text-moove-silver transition hover:border-moove-lime-deep/40 hover:bg-moove-lime/10"
              aria-label={t('posing.pricing.nextPackage')}
            >
              →
            </button>
          </div>
        </div>

        <div
          className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4"
          role="tablist"
          aria-label={t('programs.catalog.selectorLabel')}
        >
          {programs.map((program, index) => {
            const title = copy[program.key]?.title ?? program.key
            const active = index === activeIndex
            return (
              <button
                key={program.key}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setActiveIndex(index)}
                className={`flex min-w-0 items-center gap-2.5 rounded-xl border p-2 text-left transition sm:p-2.5 ${
                  active
                    ? 'border-moove-lime-deep/60 bg-moove-lime/15 shadow-sm ring-1 ring-moove-lime-deep/15'
                    : 'border-moove-border/80 bg-moove-surface/85 hover:border-moove-accent/35'
                }`}
              >
                <img
                  src={program.imagePath}
                  alt=""
                  className="h-14 w-10 shrink-0 rounded-md object-cover"
                  style={{ objectPosition: program.imagePosition ?? 'center' }}
                />
                <span className="min-w-0">
                  <span className="block truncate text-xs font-semibold text-moove-silver sm:text-sm">{title}</span>
                  <span className="mt-0.5 block text-[11px] font-medium text-moove-muted">
                    {formatProgramPrice(program.priceCents, locale)}
                  </span>
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <article className="relative overflow-hidden rounded-[2rem] border border-moove-border/80 bg-moove-surface shadow-moove-soft">
        <div className="programs-hero-grid pointer-events-none absolute inset-0 opacity-45" aria-hidden />
        <div className="relative grid lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
          <div className="flex items-center justify-center bg-gradient-to-br from-moove-elevated/60 via-moove-bg to-moove-glow/35 p-4 sm:p-7 lg:p-10">
            <div className="relative aspect-[2/3] w-full max-w-[28rem] overflow-hidden rounded-[1.5rem] border border-white/60 bg-moove-elevated shadow-moove-lift">
              <img
                key={activeProgram.key}
                src={activeProgram.imagePath}
                alt={activeTitle}
                className="h-full w-full animate-fade-up object-contain"
              />
              {activeProgram.featured ? (
                <span className="absolute left-4 top-4 rounded-full bg-moove-lime px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-moove-espresso shadow-sm">
                  {t('programs.featured')}
                </span>
              ) : null}
            </div>
          </div>

          <div className="relative flex flex-col justify-center p-6 sm:p-9 lg:p-12 xl:p-14">
            <div className="flex items-center justify-between gap-4">
              <p className="moove-eyebrow">{t(`programs.benefits.${activeProgram.benefitKey}`)}</p>
              <span className="text-xs font-semibold tabular-nums text-moove-muted">
                {String(activeIndex + 1).padStart(2, '0')} / {String(programs.length).padStart(2, '0')}
              </span>
            </div>

            <h3 className="font-display mt-4 text-3xl font-semibold leading-tight text-moove-silver sm:text-4xl xl:text-5xl">
              {activeTitle}
            </h3>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-moove-muted sm:text-base">
              {activeCopy?.desc ?? t(`programs.outcomes.${activeProgram.outcomeKey}`)}
            </p>

            <div className="mt-8 flex flex-wrap gap-2">
              <span className="rounded-full border border-moove-border/80 bg-white/55 px-3.5 py-2 text-xs font-medium text-moove-silver">
                {activeProgram.workoutCount} {t('programs.workoutsLabel')}
              </span>
              <span className="rounded-full border border-moove-border/80 bg-white/55 px-3.5 py-2 text-xs font-medium text-moove-silver">
                {t(`programs.levels.${activeProgram.levelKey}`)}
              </span>
              <span className="rounded-full border border-moove-border/80 bg-white/55 px-3.5 py-2 text-xs font-medium text-moove-silver">
                {t(`programs.durations.${activeProgram.durationKey}`)}
              </span>
            </div>

            <div className="mt-9 flex flex-wrap items-end justify-between gap-5 border-t border-moove-border/80 pt-7">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-moove-muted/70">
                  {t('programs.priceLabel')}
                </p>
                <p className="font-display mt-1 text-3xl font-semibold text-moove-silver">
                  {formatProgramPrice(activeProgram.priceCents, locale)}
                </p>
                <p className="mt-1 text-[10px] text-moove-muted">{t('programs.vatIncluded')}</p>
              </div>
              <button
                type="button"
                onClick={() => onPurchase(activeProgram)}
                className="rounded-full bg-moove-espresso px-6 py-3 text-sm font-semibold text-moove-lime shadow-moove-lift transition hover:-translate-y-0.5 hover:brightness-110"
              >
                {t('programs.order.cta')}
              </button>
            </div>

          </div>
        </div>
      </article>
    </div>
  )
}
