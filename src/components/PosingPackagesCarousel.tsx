import { useCallback, useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from 'react'
import type { PosingPackageKey } from '../site'
import { useTranslation } from '../i18n/useTranslation'

export type PosingPackage = {
  label: string
  name: string
  cta: string
  backgroundImage: string
  features: readonly string[]
}

type PosingPackagesCarouselProps = {
  packages: readonly PosingPackage[]
  packageKeys: readonly PosingPackageKey[]
  activeIndex: number
  onSelect: (index: number) => void
}

const CARD_TRANSITION = 'transform 700ms cubic-bezier(0.22, 1, 0.36, 1), opacity 700ms cubic-bezier(0.22, 1, 0.36, 1), filter 700ms cubic-bezier(0.22, 1, 0.36, 1)'

const TIER_ACCENT: Record<
  PosingPackageKey,
  { ring: string; dot: string; dotGlow: string; bar: string; glow: string }
> = {
  single: {
    ring: 'ring-fuchsia-400/45',
    dot: 'bg-fuchsia-400',
    dotGlow: 'shadow-[0_0_14px_rgba(192,38,211,0.85)]',
    bar: 'border-fuchsia-300/55',
    glow: 'rgba(192,38,211,0.55)',
  },
  sapphire: {
    ring: 'ring-cyan-400/45',
    dot: 'bg-cyan-400',
    dotGlow: 'shadow-[0_0_14px_rgba(34,211,238,0.85)]',
    bar: 'border-cyan-300/55',
    glow: 'rgba(34,211,238,0.5)',
  },
  ruby: {
    ring: 'ring-rose-400/45',
    dot: 'bg-rose-400',
    dotGlow: 'shadow-[0_0_14px_rgba(251,113,133,0.85)]',
    bar: 'border-rose-300/55',
    glow: 'rgba(251,113,133,0.5)',
  },
  diamond: {
    ring: 'ring-amber-200/55',
    dot: 'bg-amber-100',
    dotGlow: 'shadow-[0_0_16px_rgba(251,191,36,0.9)]',
    bar: 'border-amber-200/60',
    glow: 'rgba(251,191,36,0.45)',
  },
}

function wrapIndex(index: number, total: number) {
  return ((index % total) + total) % total
}

function getCircularOffset(index: number, active: number, total: number) {
  let diff = index - active
  if (diff > total / 2) diff -= total
  if (diff < -total / 2) diff += total
  return diff
}

function getCardStyle(offset: number, cardStep: number, isMobile: boolean): CSSProperties {
  if (isMobile && Math.abs(offset) > 1) {
    return {
      transform: 'translate(-50%, -50%) scale(0.8)',
      opacity: 0,
      zIndex: 0,
      pointerEvents: 'none',
      transition: CARD_TRANSITION,
    }
  }

  const abs = Math.abs(offset)
  const scale = offset === 0 ? 1 : isMobile ? 0.88 : abs === 1 ? 0.9 : 0.82
  const opacity = offset === 0 ? 1 : isMobile ? 0.4 : abs === 1 ? 0.55 : 0.25
  const rotateY = isMobile ? 0 : offset * -14
  const translateX = offset * cardStep
  const blur = isMobile ? 0 : abs === 0 ? 0 : abs === 1 ? 0.5 : 2

  return {
    transform: `translate(-50%, -50%) translateX(${translateX}px) scale(${scale}) rotateY(${rotateY}deg)`,
    opacity,
    zIndex: 30 - abs * 10,
    filter: blur > 0 ? `blur(${blur}px)` : undefined,
    transition: CARD_TRANSITION,
  }
}

function ChevronLeft({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m15 18-6-6 6-6" />
    </svg>
  )
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="m9 18 6-6-6-6" />
    </svg>
  )
}

function NavButton({
  label,
  onClick,
  children,
}: {
  label: string
  onClick: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/12 bg-white/[0.05] text-white/80 shadow-[0_8px_32px_-12px_rgba(0,0,0,0.8)] backdrop-blur-md transition hover:border-fuchsia-200/35 hover:bg-white/[0.09] hover:text-white"
    >
      {children}
    </button>
  )
}

export function PosingPackagesCarousel({
  packages,
  packageKeys,
  activeIndex,
  onSelect,
}: PosingPackagesCarouselProps) {
  const { t } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const measureRef = useRef<HTMLDivElement>(null)
  const touchStartX = useRef<number | null>(null)
  const [slideWidth, setSlideWidth] = useState(0)
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 640,
  )

  const total = packages.length
  const activePackage = packages[activeIndex]
  const activeKey = packageKeys[activeIndex] ?? packageKeys[0]
  const activeAccent = TIER_ACCENT[activeKey]

  const wrap = useCallback((index: number) => wrapIndex(index, total), [total])

  const goTo = useCallback(
    (index: number) => {
      const next = wrap(index)
      if (next === activeIndex) return
      onSelect(next)
    },
    [activeIndex, onSelect, wrap],
  )

  const goNext = useCallback(() => goTo(activeIndex + 1), [activeIndex, goTo])
  const goPrev = useCallback(() => goTo(activeIndex - 1), [activeIndex, goTo])

  const measure = useCallback(() => {
    if (measureRef.current) setSlideWidth(measureRef.current.offsetWidth)
  }, [])

  useEffect(() => {
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const update = () => setIsMobile(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [])

  const cardStep = slideWidth > 0 ? slideWidth * (isMobile ? 0.94 : 0.78) : 0

  const onTouchStart = (clientX: number) => {
    touchStartX.current = clientX
  }

  const onTouchEnd = (clientX: number) => {
    if (touchStartX.current === null) return
    const delta = touchStartX.current - clientX
    if (Math.abs(delta) > 48) {
      if (delta > 0) goNext()
      else goPrev()
    }
    touchStartX.current = null
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      goPrev()
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()
      goNext()
    }
  }

  return (
    <div className="relative mt-10">
      <div
        className="pointer-events-none absolute -inset-x-4 -top-8 -bottom-4 rounded-[2rem] opacity-90 sm:-inset-x-8"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 65% 55% at 50% 0%, rgba(192, 38, 211, 0.14) 0%, transparent 58%), radial-gradient(circle at 85% 90%, rgba(244, 114, 182, 0.08) 0%, transparent 42%)',
        }}
        aria-hidden
      />

      <div
        ref={containerRef}
        role="region"
        aria-roledescription="carousel"
        aria-label={t('posing.pricing.packagesAria')}
        tabIndex={0}
        className="relative overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c]"
        onKeyDown={onKeyDown}
        onTouchStart={(e) => onTouchStart(e.touches[0].clientX)}
        onTouchEnd={(e) => onTouchEnd(e.changedTouches[0].clientX)}
      >
        <p className="sr-only" aria-live="polite">
          {activePackage?.name}
        </p>

        {/* hidden sizer for card width */}
        <div
          ref={measureRef}
          className="pointer-events-none absolute w-[76vw] max-w-[18rem] opacity-0 sm:w-[22rem] lg:w-[24rem]"
          aria-hidden
        >
          <div className="min-h-[22rem] sm:min-h-[28rem]" />
        </div>

        <div
          className="relative h-[26rem] overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)] [perspective:1200px] sm:h-[30rem]"
          style={{ WebkitMaskImage: 'linear-gradient(to right, transparent, black 10%, black 90%, transparent)' }}
        >
          <div
            className="animate-pose-glow-breathe pointer-events-none absolute left-1/2 top-[58%] h-40 w-[min(72vw,18rem)] -translate-x-1/2 rounded-full blur-3xl sm:w-80"
            style={{ backgroundColor: activeAccent.glow }}
            aria-hidden
          />

          {packages.map((pack, index) => {
            const offset = getCircularOffset(index, activeIndex, total)
            const isActive = offset === 0
            const tierKey = packageKeys[index] ?? packageKeys[0]
            const accent = TIER_ACCENT[tierKey]

            return (
              <article
                key={pack.name}
                aria-hidden={!isActive}
                className={`absolute left-1/2 top-1/2 flex min-h-[22rem] w-[76vw] max-w-[18rem] overflow-hidden rounded-[1.75rem] border bg-black shadow-[0_28px_80px_-36px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.12)] sm:min-h-[28rem] sm:w-[22rem] lg:w-[24rem] ${
                  isActive
                    ? `border-white/20 ring-2 ${accent.ring}`
                    : 'border-white/8'
                } ${isActive ? '' : 'pointer-events-none'}`}
                style={{
                  ...getCardStyle(offset, cardStep, isMobile),
                  transformStyle: 'preserve-3d',
                }}
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-90"
                  style={{ backgroundImage: `url('${pack.backgroundImage}')` }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,12,0.32),rgba(6,6,12,0.55)_45%,rgba(6,6,12,0.88)),radial-gradient(circle_at_28%_12%,rgba(244,114,182,0.14),transparent_38%)]"
                  aria-hidden
                />
                <div className="relative flex min-h-full w-full flex-col p-4 sm:p-6">
                  <div className="rounded-2xl border border-white/8 bg-black/30 p-4 backdrop-blur-md sm:p-5">
                    <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-white/55">
                      {pack.label}
                    </p>
                    <h3 className="font-display mt-2 text-2xl font-semibold leading-tight text-white">
                      {pack.name}
                    </h3>
                    <ul className="mt-5 space-y-2.5 text-sm leading-relaxed text-white/72">
                      {pack.features.map((feature) => (
                        <li
                          key={feature}
                          className={`border-l-2 pl-3 ${accent.bar}`}
                        >
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {isActive ? (
                    <a
                      href="#booking"
                      onClick={() => onSelect(index)}
                      className="mt-5 inline-flex justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-300 to-rose-200 px-5 py-3 text-sm font-semibold text-[#160714] shadow-[0_16px_40px_-14px_rgba(244,114,182,0.85)] transition hover:brightness-110"
                    >
                      {pack.cta}
                    </a>
                  ) : (
                    <span className="mt-5 inline-flex justify-center rounded-full border border-white/10 px-5 py-3 text-sm font-medium text-white/35">
                      {pack.cta}
                    </span>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <div className="relative mt-6 flex items-center justify-center gap-5 sm:mt-8">
        <NavButton label={t('posing.pricing.prevPackage')} onClick={goPrev}>
          <ChevronLeft />
        </NavButton>

        <div
          className="flex items-center gap-2"
          role="tablist"
          aria-label={t('posing.pricing.packagesAria')}
        >
          {packages.map((pack, index) => {
            const isActive = index === activeIndex
            const tierKey = packageKeys[index] ?? packageKeys[0]
            const accent = TIER_ACCENT[tierKey]
            return (
              <button
                key={pack.name}
                type="button"
                role="tab"
                aria-selected={isActive}
                aria-label={pack.name}
                onClick={() => goTo(index)}
                className={`rounded-full transition-all duration-500 ${
                  isActive
                    ? `h-1.5 w-8 ${accent.dot} ${accent.dotGlow}`
                    : `h-1.5 w-1.5 ${accent.dot} opacity-35 hover:opacity-70`
                }`}
              />
            )
          })}
        </div>

        <NavButton label={t('posing.pricing.nextPackage')} onClick={goNext}>
          <ChevronRight />
        </NavButton>
      </div>

      <p className="relative mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-white/40">
        <span className="sm:hidden">{t('posing.pricing.swipeHint')}</span>
        {String(activeIndex + 1).padStart(2, '0')}
        <span className="mx-1.5 text-white/25">/</span>
        {String(total).padStart(2, '0')}
      </p>
    </div>
  )
}
