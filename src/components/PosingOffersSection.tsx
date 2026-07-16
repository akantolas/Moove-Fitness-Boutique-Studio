import { isJulyOfferActive, scrollToPosingBooking } from '../lib/posingOffers'
import type { PosingOfferPlanKey } from '../site'
import { OffersSectionHeader, PosingOfferCards } from './posingOffersShared'

type PosingOffersSectionProps = {
  onSelectOffer: (planKey: PosingOfferPlanKey) => void
}

export function PosingOffersSection({ onSelectOffer }: PosingOffersSectionProps) {
  if (!isJulyOfferActive()) return null

  function handleSelect(planKey: PosingOfferPlanKey) {
    onSelectOffer(planKey)
    scrollToPosingBooking()
  }

  return (
    <section id="offers" className="scroll-mt-20 border-b border-white/10 bg-black/25 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <OffersSectionHeader className="mb-10" />
        <PosingOfferCards onSelect={handleSelect} />
      </div>
    </section>
  )
}
