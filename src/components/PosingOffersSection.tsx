import { isSeptemberOfferActive, scrollToPosingPackages } from '../lib/posingOffers'
import { OffersSectionHeader, SeptemberOfferFlyer } from './posingOffersShared'

export function PosingOffersSection() {
  if (!isSeptemberOfferActive()) return null

  return (
    <section id="offers" className="scroll-mt-20 border-b border-white/10 bg-black/25 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <OffersSectionHeader className="mb-10" />
        <SeptemberOfferFlyer onCta={scrollToPosingPackages} />
      </div>
    </section>
  )
}
