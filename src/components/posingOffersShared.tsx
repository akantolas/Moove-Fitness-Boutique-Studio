import { useTranslation } from '../i18n/useTranslation'

export const SEPTEMBER_OFFER_FLYER_SRC = '/posing-offer-september-2026.jpg'

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
          {t('posing.offers.onlySeptember')}
        </p>
      ) : null}
    </div>
  )
}

type SeptemberOfferFlyerProps = {
  onCta?: () => void
  onDismiss?: () => void
  variant?: 'section' | 'modal'
  compact?: boolean
  className?: string
}

export function SeptemberOfferFlyer({
  onCta,
  onDismiss,
  variant = 'section',
  compact = false,
  className = '',
}: SeptemberOfferFlyerProps) {
  const { t } = useTranslation()
  const isModal = variant === 'modal'

  return (
    <div className={`mx-auto ${isModal ? 'w-full max-w-sm' : 'max-w-md'} ${className}`.trim()}>
      <div className="overflow-hidden rounded-[1.5rem] border border-white/12 shadow-[0_32px_90px_-40px_rgba(244,114,182,0.45)] ring-1 ring-fuchsia-400/25">
        <img
          src={SEPTEMBER_OFFER_FLYER_SRC}
          alt={t('posing.offers.flyerAlt')}
          className={
            isModal
              ? 'mx-auto block max-h-[min(58vh,520px)] w-auto object-contain'
              : 'block w-full object-cover'
          }
          width={1080}
          height={1350}
        />
      </div>
      {isModal && onDismiss ? (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row">
          <button
            type="button"
            onClick={onCta}
            className="inline-flex flex-1 justify-center rounded-full bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-pink-300 px-6 py-3 text-sm font-semibold text-[#160714] shadow-[0_16px_40px_-12px_rgba(244,114,182,0.75)] transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.99]"
          >
            {t('posing.offers.ctaBook')}
          </button>
          <button
            type="button"
            onClick={onDismiss}
            className="inline-flex flex-1 justify-center rounded-full border border-white/12 bg-white/[0.03] px-6 py-3 text-sm font-semibold text-white/55 backdrop-blur-sm transition hover:border-white/22 hover:bg-white/[0.06] hover:text-white/85"
          >
            {t('posing.offers.modalDismiss')}
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={onCta}
            className={`mt-5 inline-flex w-full justify-center rounded-full bg-gradient-to-r from-fuchsia-600 via-fuchsia-400 to-pink-300 px-8 font-semibold text-[#160714] shadow-[0_16px_40px_-12px_rgba(244,114,182,0.75)] transition hover:brightness-110 hover:scale-[1.02] active:scale-[0.99] ${
              compact ? 'py-3 text-sm' : 'py-3.5 text-sm sm:text-base'
            }`}
          >
            {t('posing.offers.ctaBook')}
          </button>
          <p className="mt-3 text-center text-[11px] uppercase tracking-[0.16em] text-white/40">
            {t('posing.offers.onlySeptember')}
          </p>
        </>
      )}
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
