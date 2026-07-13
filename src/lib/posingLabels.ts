import { site, type PosingPackageKey } from '../site'

export function planKeyLabel(
  planKey: string,
  getPackageName: (index: number) => string | undefined,
) {
  const idx = site.posing.packageKeys.indexOf(planKey as PosingPackageKey)
  if (idx >= 0) return getPackageName(idx) ?? planKey
  return planKey
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
