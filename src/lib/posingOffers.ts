/** July promotional offers — visible until end of July 2026 (Athens). */
const JULY_OFFER_END = new Date('2026-08-01T00:00:00+03:00')

export function isJulyOfferActive(now = new Date()) {
  return now < JULY_OFFER_END
}
