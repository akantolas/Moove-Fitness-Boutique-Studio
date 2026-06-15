import { PrimaryLink } from '../components/Links'

const plans = [
  {
    name: 'Drop-in',
    price: '€__',
    note: 'Μονή επίσκεψη — ιδανικό για δοκιμή.',
    perks: ['Πρόσβαση σε επιλεγμένα group', 'Χωρίς δέσμευση'],
    featured: false,
  },
  {
    name: 'Boutique 8',
    price: '€__',
    note: 'Δημοφιλές πακέτο για σταθερή συχνότητα.',
    perks: [
      '8 μαθήματα / μήνα',
      'Flex ακυρώσεις εντός πλαισίου πολιτικής',
      'Προτεραιότητα σε αιχμηρές ώρες όπου εφαρμόζεται',
    ],
    featured: true,
  },
  {
    name: 'Unlimited',
    price: '€__',
    note: 'Για advanced ασκούμενους με υψηλή συχνότητα.',
    perks: ['Απεριόριστα group εντός λειτουργίας', 'Member events όπου υπάρχουν'],
    featured: false,
  },
] as const

export function PricingPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-moove-muted">
          Συνδρομές
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-moove-silver sm:text-5xl">
          Τιμές
        </h1>
        <p className="mt-4 text-moove-muted leading-relaxed">
          Συμπληρώστε τα ποσά, τους κανόνες ανανέωσης και την πολιτική ακυρώσεων. Η
          διαφάνεια μειώνει τα μηνύματα «πόσο κοστίζει;» πριν την κράτηση.
        </p>
      </header>

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        {plans.map((plan) => (
          <article
            key={plan.name}
            className={`relative flex flex-col rounded-2xl border p-8 ${
              plan.featured
                ? 'border-moove-lime/50 bg-moove-elevated/90 shadow-[0_0_0_1px_rgba(196,240,49,0.15)]'
                : 'border-moove-border bg-moove-surface/40'
            }`}
          >
            {plan.featured ? (
              <p className="absolute right-6 top-6 rounded-full bg-moove-lime/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-moove-lime">
                Δημοφιλές
              </p>
            ) : null}
            <h2 className="font-display text-xl font-semibold text-moove-silver">
              {plan.name}
            </h2>
            <p className="mt-2 font-display text-3xl font-semibold text-moove-silver">
              {plan.price}
            </p>
            <p className="mt-2 text-sm text-moove-muted">{plan.note}</p>
            <ul className="mt-6 flex-1 space-y-3 text-sm text-moove-muted">
              {plan.perks.map((perk) => (
                <li key={perk} className="flex gap-2">
                  <span className="text-moove-lime" aria-hidden>
                    ·
                  </span>
                  {perk}
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <PrimaryLink to="/programma">Κράτηση</PrimaryLink>
            </div>
          </article>
        ))}
      </div>

      <section className="mt-16 rounded-2xl border border-moove-border bg-moove-surface/30 p-8 sm:p-10">
        <h2 className="font-display text-lg font-semibold text-moove-silver">
          Πολιτική ακυρώσεων (πρότυπο)
        </h2>
        <p className="mt-3 text-sm leading-relaxed text-moove-muted">
          Καταχωρίστε εδώ τους κανόνες σας: deadline ακύρωσης, late cancel, no-show,
          freezing συνδρομής. Οι σαφείς κανόνες προστατεύουν και το studio και τους
          ασκούμενους.
        </p>
      </section>
    </div>
  )
}
