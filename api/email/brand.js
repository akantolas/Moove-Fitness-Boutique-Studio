/** Brand tokens and site URLs for transactional emails. */

export function getSiteUrl() {
  const fromEnv = process.env.SITE_URL?.trim()
  if (fromEnv) return fromEnv.replace(/\/$/, '')

  const success = process.env.POSE_SUCCESS_URL?.trim()
  if (success) {
    try {
      return new URL(success).origin
    } catch {
      // fall through
    }
  }

  return 'https://moovefitness.gr'
}

export const posingBrand = {
  id: 'posing',
  name: 'Move & Pose',
  subtitle: 'The Posing Academy',
  email: 'info@moovefitness.gr',
  phone: '+30 2421 070 751',
  instagram: 'https://www.instagram.com/theposingacademygr/',
  accountUrl: () => `${getSiteUrl()}/posing/account`,
  logoUrl: () => `${getSiteUrl()}/pose1-transparent.png`,
  colors: {
    outerBg: '#08080c',
    cardBg: '#12121a',
    cardBorder: 'rgba(255,255,255,0.08)',
    text: '#f4f4f5',
    muted: '#a1a1aa',
    accent: '#c026d3',
    accentHover: '#a21caf',
    ctaText: '#ffffff',
    badgePending: '#713f12',
    badgePendingText: '#fef08a',
    badgeConfirmed: '#14532d',
    badgeConfirmedText: '#bbf7d0',
  },
}

export const mooveBrand = {
  id: 'moove',
  name: 'Moove',
  subtitle: 'Fitness Boutique Studio',
  email: 'info@moovefitness.gr',
  phone: '+30 2421 070 751',
  address: 'Κοραή 137 - Δ. Γεωργιάδου 106Γ, Βόλος 383 33',
  instagram: 'https://www.instagram.com/moove_fitness_boutique_studio/',
  siteUrl: () => getSiteUrl(),
  colors: {
    outerBg: '#f8f4ec',
    cardBg: '#fffdf9',
    cardBorder: 'rgba(105,72,48,0.12)',
    text: '#1c1917',
    muted: '#6b6560',
    accent: '#b46548',
    ctaBg: '#1c1917',
    ctaText: '#c4f031',
    divider: 'rgba(105,72,48,0.15)',
  },
}

export function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}
