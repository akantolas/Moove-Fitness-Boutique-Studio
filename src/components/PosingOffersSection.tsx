import { isSeptemberOfferActive, scrollToPosingPackages } from '../lib/posingOffers'
import { OffersSectionHeader, SeptemberOfferFlyer } from './posingOffersShared'
import { SiteContainer } from './SiteContainer'

export function PosingOffersSection() {
  if (!isSeptemberOfferActive()) return null

  return (
    <section id="offers" className="scroll-mt-20 border-b border-white/10 bg-black/25 py-16 sm:py-20">
      <SiteContainer>
        <OffersSectionHeader className="mb-10" />
        <SeptemberOfferFlyer onCta={scrollToPosingPackages} />
      </SiteContainer>
    </section>
  )
}
