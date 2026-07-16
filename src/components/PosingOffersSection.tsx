import { useTranslation } from '../i18n/useTranslation'
import { isJulyOfferActive } from '../lib/posingOffers'
import type { PosingOfferPlanKey } from '../site'

type PosingOffersSectionProps = {
  onSelectOffer: (planKey: PosingOfferPlanKey) => void
}

const OFFER_ACCENT: Record<
  PosingOfferPlanKey,
  { ring: string; glow: string; badge: string }
> = {
  ruby_july8: {
    ring: 'ring-rose-400/45',
    glow: 'rgba(251,113,133,0.45)',
    badge: 'from-rose-500/90 to-pink-400/80',
  },
  diamond_july8: {
    ring: 'ring-amber-200/55',
    glow: 'rgba(251,191,36,0.4)',
    badge: 'from-amber-200/90 to-cyan-200/70',
  },
}

function OfferCard({
  planKey,
  backgroundImage,
  onSelect,
}: {
  planKey: PosingOfferPlanKey
  backgroundImage: string
  onSelect: (planKey: PosingOfferPlanKey) => void
}) {
  const { t } = useTranslation()
  const accent = OFFER_ACCENT[planKey]
  const isRuby = planKey === 'ruby_july8'

  return (
    <article
      className={`relative overflow-hidden rounded-[1.75rem] border border-white/15 bg-black shadow-[0_28px_80px_-36px_rgba(0,0,0,0.9)] ring-1 ${accent.ring}`}
    >
      <div
        className="absolute inset-0 bg-cover bg-center opacity-90"
        style={{ backgroundImage: `url('${backgroundImage}')` }}
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,12,0.35),rgba(6,6,12,0.88))]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -inset-4 rounded-[2rem] blur-3xl opacity-60"
        style={{ backgroundColor: accent.glow }}
        aria-hidden
      />
      <div className="relative flex min-h-[20rem] flex-col justify-between p-6 sm:min-h-[22rem] sm:p-8">
        <div>
          <span
            className={`inline-flex rounded-full bg-gradient-to-r ${accent.badge} px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-[#160714]`}
          >
            {t('posing.offers.badge')}
          </span>
          <h3 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
            {isRuby ? t('posing.offers.rubyTitle') : t('posing.offers.diamondTitle')}
          </h3>
          <p className="mt-2 text-sm font-medium uppercase tracking-[0.18em] text-fuchsia-200/75">
            {t('posing.offers.sessionsLabel')}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-white/65">
            {t('posing.offers.onlyJuly')}
          </p>
        </div>
        <div>
          <p className="text-xs text-white/45">{t('posing.offers.priceInEmail')}</p>
          <button
            type="button"
            onClick={() => onSelect(planKey)}
            className="mt-4 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-300 to-rose-200 px-6 py-3 text-sm font-semibold text-[#160714] shadow-[0_16px_40px_-14px_rgba(244,114,182,0.85)] transition hover:brightness-110"
          >
            {isRuby ? t('posing.offers.ctaRuby') : t('posing.offers.ctaDiamond')}
          </button>
        </div>
      </div>
    </article>
  )
}

export function PosingOffersSection({ onSelectOffer }: PosingOffersSectionProps) {
  const { t } = useTranslation()

  if (!isJulyOfferActive()) return null

  function handleSelect(planKey: PosingOfferPlanKey) {
    onSelectOffer(planKey)
    const el = document.getElementById('booking')
    el?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section id="offers" className="scroll-mt-20 border-b border-white/10 bg-black/25 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
            {t('posing.offers.eyebrow')}
          </p>
          <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
            {t('posing.offers.title')}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
            {t('posing.offers.subtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          <OfferCard
            planKey="ruby_july8"
            backgroundImage="/posing-bg-ruby.webp"
            onSelect={handleSelect}
          />
          <OfferCard
            planKey="diamond_july8"
            backgroundImage="/posing-bg-diamond.webp"
            onSelect={handleSelect}
          />
        </div>
      </div>
    </section>
  )
}
