/** Προσαρμόστε πριν το launch: στοιχεία, links κρατήσεων, social. */
export const site = {
  name: 'Moove',
  tagline: 'Fitness Boutique Studio',
  /** Compact mark για bubbles / dark surfaces */
  logoMark: '/pose1-transparent.png',
  /** Ιδιοκτήτρια & μοναδική γυμνάστρια */
  ownerName: 'Μαγδα Σαμαρά',
  ownerNameEn: 'Magda Samara',
  ownerFirstName: 'Μαγδα',
  /**
   * Gym Booking — https://members.moovefitness.gr/
   */
  bookingUrl: 'https://members.moovefitness.gr/',
  phone: '+30 2421 070 751',
  email: 'info@moovefitness.gr',
  addressLine: 'Κοραή 137 - Δ. Γεωργιάδου 106Γ, Βόλος 383 33',
  mapsUrl: 'https://maps.app.goo.gl/qbPoUKU4BxiLjdpj6',
  /** Σύνδεσμος προς κριτικές Google Maps (προφίλ επιχείρησης). */
  googleReviewsUrl: 'https://maps.app.goo.gl/qbPoUKU4BxiLjdpj6',
  social: {
    instagram: 'https://www.instagram.com/moove_fitness_boutique_studio/',
    facebook: 'https://www.facebook.com/profile.php?id=100086176767067',
  },
  hours: 'Δευ–Παρ: 07:00–21:00 · Σαβ: 09:00–15:00',

  /**
   * Move & Pose — online bodybuilding posing coaching (ξεχωριστό από το studio).
   * Booking: Supabase auth + custom calendar (VITE_SUPABASE_* env).
   */
  posing: {
    brandName: 'Move & Pose',
    brandSubtitle: 'The Posing Academy',
    logo: '/pose1-transparent.png',
    /** Hero image (αριστερά) στη σελίδα posing — ξεχωριστό από το logo mark. */
    heroImage: '/pose2.png',
    instagram: 'https://www.instagram.com/theposingacademygr/',
    coachName: 'Μαγδα Σαμαρά',
    coachNameEn: 'Magda Samara',
    /** Stable keys for package → Stripe price mapping */
    packageKeys: ['single', 'sapphire', 'ruby', 'diamond'] as const,
    /** July promo plans (not in carousel) */
    offerPlanKeys: ['ruby_july8', 'diamond_july8'] as const,
    /** All bookable plan keys */
    planKeys: [
      'single',
      'sapphire',
      'ruby',
      'diamond',
      'ruby_july8',
      'diamond_july8',
    ] as const,
    paypalUrl: 'https://www.paypal.me/magdalinisamara',
    revolutUrl: 'https://revolut.me/magdaqsn9',
  },
} as const

export type PosingPackageKey = (typeof site.posing.packageKeys)[number]
export type PosingOfferPlanKey = (typeof site.posing.offerPlanKeys)[number]
export type PosingPlanKey = (typeof site.posing.planKeys)[number]
