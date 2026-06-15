/** Προσαρμόστε πριν το launch: στοιχεία, links κρατήσεων, social. */
export const site = {
  name: 'Moove',
  tagline: 'Fitness Boutique Studio',
  /**
   * Gym Booking — https://members.moovefitness.gr/
   */
  bookingUrl: 'https://members.moovefitness.gr/',
  /** null = χρησιμοποιεί το bookingUrl ως iframe στο /programma */
  bookingEmbedUrl: null as string | null,
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
} as const
