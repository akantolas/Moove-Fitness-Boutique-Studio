/** Προσαρμόστε πριν το launch: στοιχεία, links κρατήσεων, social. */
export const site = {
  name: 'Moove',
  tagline: 'Fitness Boutique Studio',
  /** Compact mark για bubbles / dark surfaces */
  logoMark: '/logo-mark.png',
  /** Ιδιοκτήτρια & μοναδική γυμνάστρια */
  ownerName: 'Μαγδα Σαμαρά',
  ownerFirstName: 'Μαγδα',
  /**
   * Gym Booking — https://members.moovefitness.gr/
   */
  bookingUrl: 'https://members.moovefitness.gr/',
  phone: '+30 2421 070 751',
  email: 'hello@moovestudio.gr',
  addressLine: 'Δημάρχου Γεωργιάδου, Κοραή 106Γ, Βόλος 383 33',
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
   * Cal.com: βάλε το calLink όταν είναι έτοιμο (π.χ. "magda-samara/posing-60min").
   */
  posing: {
    brandName: 'Move & Pose',
    brandSubtitle: 'The Posing Academy',
    logo: '/pose1.png',
    /** Cal.com inline embed path — username ή username/event-slug */
    calLink: '',
    coachName: 'Μαγδα Σαμαρά',
  },
} as const
