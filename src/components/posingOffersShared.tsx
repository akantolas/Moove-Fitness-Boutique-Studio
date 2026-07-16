import { useTranslation } from '../i18n/useTranslation'
import type { PosingOfferPlanKey } from '../site'

const OFFER_ACCENT: Record<
  PosingOfferPlanKey,
  {
    ring: string
    glow: string
    badge: string
    cta: string
    watermark: string
    sparkle: string
  }
> = {
  ruby_july8: {
    ring: 'ring-rose-400/50',
    glow: 'rgba(251,113,133,0.5)',
    badge: 'from-rose-500 via-pink-400 to-rose-300',
    cta: 'from-rose-500 via-pink-400 to-rose-200 shadow-[0_16px_40px_-12px_rgba(244,63,94,0.75)]',
    watermark: 'text-rose-400/12',
    sparkle: 'bg-rose-300',
  },
  diamond_july8: {
    ring: 'ring-amber-200/55',
    glow: 'rgba(251,191,36,0.45)',
    badge: 'from-amber-100 via-cyan-100 to-amber-200',
    cta: 'from-amber-100 via-cyan-200 to-sky-100 shadow-[0_16px_40px_-12px_rgba(251,191,36,0.65)]',
    watermark: 'text-amber-200/14',
    sparkle: 'bg-amber-100',
  },
}

type OfferCardProps = {
  planKey: PosingOfferPlanKey
  backgroundImage: string
  onSelect: (planKey: PosingOfferPlanKey) => void
  compact?: boolean
  staggerIndex?: number
}

export function OfferCard({
  planKey,
  backgroundImage,
  onSelect,
  compact = false,
  staggerIndex = 0,
}: OfferCardProps) {
  const { t } = useTranslation()
  const accent = OFFER_ACCENT[planKey]
  const isRuby = planKey === 'ruby_july8'

  return (
    <article
      className={`group relative overflow-hidden rounded-[1.85rem] border border-white/12 bg-[#06060a] shadow-[0_32px_90px_-40px_rgba(0,0,0,0.95)] ring-1 transition duration-500 hover:-translate-y-1 hover:shadow-[0_40px_100px_-36px_rgba(244,114,182,0.35)] ${accent.ring} animate-pose-offers-card-in`}
      style={{ animationDelay: `${120 + staggerIndex * 100}ms` }}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-95 transition duration-700 group-hover:scale-105"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(165deg,rgba(8,8,14,0.25)_0%,rgba(8,8,14,0.72)_48%,rgba(6,6,10,0.94)_100%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-10 font-display text-[8rem] font-semibold leading-none sm:text-[9rem]"
        aria-hidden
      >
        <span className={accent.watermark}>×8</span>
      </div>
      <div
        className="animate-pose-glow-breathe pointer-events-none absolute -inset-6 rounded-[2rem] blur-3xl opacity-50 transition duration-500 group-hover:opacity-75"
        style={{ backgroundColor: accent.glow }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/35 to-transparent"
        aria-hidden
      />

      <div
        className={`relative flex flex-col justify-between p-5 sm:p-7 ${
          compact ? 'min-h-[19rem]' : 'min-h-[21rem] sm:min-h-[24rem]'
        }`}
      >
        <div className="rounded-2xl border border-white/10 bg-black/35 p-4 backdrop-blur-md sm:p-5">
          <div className="flex items-start justify-between gap-3">
            <span
              className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${accent.badge} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.22em] text-[#160714] shadow-sm`}
            >
              <span
                className={`inline-block h-1.5 w-1.5 rounded-full ${accent.sparkle} animate-pose-sparkle`}
                aria-hidden
              />
              {t('posing.offers.badge')}
            </span>
            <span
              className="font-display text-lg font-semibold tracking-tight text-white/90 sm:text-xl"
              aria-hidden
            >
              ×8
            </span>
          </div>
          <h3
            className={`font-display mt-4 font-semibold leading-tight text-white ${
              compact ? 'text-2xl sm:text-[1.75rem]' : 'text-3xl sm:text-4xl'
            }`}
          >
            {isRuby ? t('posing.offers.rubyTitle') : t('posing.offers.diamondTitle')}
          </h3>
          <p className="mt-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-fuchsia-200/80">
            {t('posing.offers.sessionsLabel')}
          </p>
          <div className="mt-4 h-px w-12 bg-gradient-to-r from-fuchsia-300/70 to-transparent" aria-hidden />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            {t('posing.offers.onlyJuly')}
          </p>
        </div>

        <div className="mt-4 px-1">
          <p className="text-center text-[11px] uppercase tracking-[0.16em] text-white/40">
            {t('posing.offers.priceInEmail')}
          </p>
          <button
            type="button"
            onClick={() => onSelect(planKey)}
            className={`mt-3 inline-flex w-full justify-center rounded-full bg-gradient-to-r px-6 py-3.5 text-sm font-semibold text-[#160714] transition duration-300 hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] ${accent.cta}`}
          >
            {isRuby ? t('posing.offers.ctaRuby') : t('posing.offers.ctaDiamond')}
          </button>
        </div>
      </div>
    </article>
  )
}

type PosingOfferCardsProps = {
  onSelect: (planKey: PosingOfferPlanKey) => void
  compact?: boolean
  className?: string
}

export function PosingOfferCards({ onSelect, compact = false, className = '' }: PosingOfferCardsProps) {
  return (
    <div className={`grid gap-5 sm:gap-6 md:grid-cols-2 ${className}`.trim()}>
      <OfferCard
        planKey="ruby_july8"
        backgroundImage="/posing-bg-ruby.webp"
        onSelect={onSelect}
        compact={compact}
        staggerIndex={0}
      />
      <OfferCard
        planKey="diamond_july8"
        backgroundImage="/posing-bg-diamond.webp"
        onSelect={onSelect}
        compact={compact}
        staggerIndex={1}
      />
    </div>
  )
}

type OffersSectionHeaderProps = {
  titleId?: string
  className?: string
  variant?: 'section' | 'modal'
  showLogo?: boolean
}

export function OffersSectionHeader({
  titleId,
  className = '',
  variant = 'section',
  showLogo = false,
}: OffersSectionHeaderProps) {
  const { t } = useTranslation()
  const isModal = variant === 'modal'

  return (
    <div className={`mx-auto max-w-2xl text-center ${className}`.trim()}>
      {showLogo ? (
        <img
          src="/pose1-transparent.png"
          alt=""
          className="mx-auto h-14 w-auto opacity-95 sm:h-16"
          width={128}
          height={64}
        />
      ) : null}
      <p
        className={`font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90 ${
          showLogo ? 'mt-4' : ''
        } text-xs`}
      >
        {t('posing.offers.eyebrow')}
      </p>
      <h2
        id={titleId}
        className={`mt-3 font-semibold leading-tight ${
          isModal
            ? 'font-display text-4xl italic sm:text-5xl text-gradient-pose-script'
            : 'font-display text-3xl text-white sm:text-4xl'
        }`}
      >
        {t('posing.offers.title')}
      </h2>
      <p
        className={`mx-auto mt-4 max-w-xl leading-relaxed text-white/60 ${
          isModal ? 'text-sm sm:text-base' : 'text-sm'
        }`}
      >
        {t('posing.offers.subtitle')}
      </p>
      {isModal ? (
        <p className="mt-3 text-xs font-medium uppercase tracking-[0.24em] text-fuchsia-200/50">
          {t('posing.offers.sessionsLabel')}
        </p>
      ) : null}
    </div>
  )
}

function OfferSparkle({ className }: { className: string }) {
  return (
    <span
      className={`pointer-events-none absolute h-1 w-1 rounded-full bg-fuchsia-200/80 animate-pose-sparkle ${className}`}
      aria-hidden
    />
  )
}

export function OffersModalBackdrop() {
  return (
    <>
      <div
        className="pointer-events-none absolute inset-0 opacity-90"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 55% 45% at 20% 15%, rgba(192, 38, 211, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 75%, rgba(251, 191, 36, 0.12) 0%, transparent 42%), radial-gradient(circle at 50% 50%, rgba(244, 114, 182, 0.08) 0%, transparent 50%)',
        }}
        aria-hidden
      />
      <OfferSparkle className="left-[12%] top-[18%] [animation-delay:0ms]" />
      <OfferSparkle className="right-[15%] top-[22%] h-1.5 w-1.5 bg-amber-100/90 [animation-delay:800ms]" />
      <OfferSparkle className="bottom-[28%] left-[20%] [animation-delay:1.4s]" />
      <OfferSparkle className="bottom-[20%] right-[18%] h-1.5 w-1.5 [animation-delay:2.1s]" />
    </>
  )
}
