import { site, type PosingPackageKey, type PosingPlanKey } from '../site'
import { isBookingSlotUpcoming } from './posingDates'

type BookingWithSlot = {
  status: string
  slot: { start_at: string; end_at?: string } | null
}

const OFFER_LABEL_KEYS: Record<string, string> = {
  ruby_july8: 'posing.offers.rubyTitle',
  diamond_july8: 'posing.offers.diamondTitle',
}

export function planKeyLabel(
  planKey: string,
  getPackageName: (index: number) => string | undefined,
  t?: (key: string) => string,
) {
  const offerKey = OFFER_LABEL_KEYS[planKey]
  if (offerKey && t) {
    const translated = t(offerKey)
    if (translated !== offerKey) return translated
  }
  const idx = site.posing.packageKeys.indexOf(planKey as PosingPackageKey)
  if (idx >= 0) return getPackageName(idx) ?? planKey
  return planKey
}

export function isPosingPlanKey(value: string): value is PosingPlanKey {
  return (site.posing.planKeys as readonly string[]).includes(value)
}

export function bookingDisplayStatus(booking: BookingWithSlot, now = Date.now()) {
  if (booking.status === 'confirmed' && !isBookingSlotUpcoming(booking.slot, now)) {
    return 'completed'
  }
  return booking.status
}

export function bookingStatusLabel(status: string, t: (key: string) => string) {
  const key = `posing.account.status.${status}`
  const translated = t(key)
  return translated === key ? status : translated
}

export function bookingStatusChipClass(status: string) {
  switch (status) {
    case 'confirmed':
      return 'border-emerald-300/35 bg-emerald-400/15 text-emerald-100'
    case 'pending_payment':
      return 'border-amber-300/35 bg-amber-400/15 text-amber-100'
    case 'cancelled':
      return 'border-white/20 bg-white/5 text-white/50'
    case 'completed':
      return 'border-cyan-300/35 bg-cyan-400/10 text-cyan-100'
    default:
      return 'border-white/20 bg-white/5 text-white/60'
  }
}
