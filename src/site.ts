/** Προσαρμόστε πριν το launch: στοιχεία, links κρατήσεων, social. */
export const site = {
  name: 'Moove',
  /** Canonical origin, matches sitemap.xml and robots.txt. */
  url: 'https://www.moovefitness.gr',
  tagline: 'Fitness Boutique Studio',
  /** Ιδιοκτήτρια & μοναδική γυμνάστρια */
  ownerName: 'Μάγδα Σαμαρά',
  ownerNameEn: 'Magda Samara',
  ownerFirstName: 'Μάγδα',
  /**
   * Gym Booking — https://members.moovefitness.gr/
   */
  bookingUrl: 'https://members.moovefitness.gr/',
  phone: '+30 2421 070 751',
  email: 'info@moovefitness.gr',
  addressLine: 'Κοραή 137 - Δ. Γεωργιάδου 106Γ, Βόλος 383 33',
  addressLineEn: 'Korai 137 - D. Georgiadou 106G, Volos 383 33, Greece',
  mapsUrl: 'https://maps.app.goo.gl/qbPoUKU4BxiLjdpj6',
  /** Σύνδεσμος προς κριτικές Google Maps (προφίλ επιχείρησης). */
  googleReviewsUrl: 'https://maps.app.goo.gl/qbPoUKU4BxiLjdpj6',
  social: {
    instagram: 'https://www.instagram.com/moove_fitness_boutique_studio/',
    facebook: 'https://www.facebook.com/profile.php?id=100086176767067',
  },
  hours: 'Δευ–Παρ: 08:00–12:10 & 14:30–21:25 · Σαβ: 09:30–11:20',
} as const
