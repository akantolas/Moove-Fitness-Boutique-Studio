import { PrimaryLink } from '../components/Links'
import { WeekScheduleCarousel } from '../components/WeekScheduleCarousel'

const classTypes = [
  {
    title: 'Reformer',
    level: 'Όλα τα επίπεδα',
    duration: '50 λεπτά',
    desc: 'Κλασική ροή στο Reformer για κορμό, σταθερότητα και ελεγχόμενη ένταση. Μικρά γκρουπ για ξεκάθαρη διόρθωση.',
  },
  {
    title: 'Pilates Mat',
    level: 'Αρχάριοι – μεσαίοι',
    duration: '45–50 λεπτά',
    desc: 'Χωρίς μηχανήματα, με ασκήσεις που χτίζουν έλεγχο και αντοχή. Ιδανικό για βάσεις ή συμπλήρωμα Reformer.',
  },
  {
    title: 'TRX & Functional',
    level: 'Μεσαίοι – προχωρημένοι',
    duration: '45–50 λεπτά',
    desc: 'Λειτουργική προπόνηση και TRX για δύναμη, αντοχή και κινητικότητα με έλεγχο και ασφάλεια.',
  },
  {
    title: "Magda's Bootycamp",
    level: 'Όλα τα επίπεδα',
    duration: '40 λεπτά',
    desc: 'Στοχευμένη προπόνηση γλουτών και κορμού — έντονη, αποτελεσματική, σε μικρό χρονικό διάστημα.',
  },
] as const

export function ClassesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-moove-muted">
          Υπηρεσίες
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-moove-silver sm:text-5xl">
          Μαθήματα
        </h1>
        <p className="mt-4 text-moove-muted leading-relaxed">
          Εβδομαδιαίο group πρόγραμμα. Για κράτηση θέσης, συνδεθείτε στο σύστημα κρατήσεων.
        </p>
      </header>

      <section className="mt-12" aria-labelledby="week-plan-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="week-plan-heading"
              className="font-display text-2xl font-semibold text-moove-silver sm:text-3xl"
            >
              Εβδομαδιαίο πρόγραμμα
            </h2>
            <p className="mt-2 text-sm text-moove-muted">
              Δευτέρα – Σάββατο · ώρα Ελλάδας
            </p>
          </div>
          <PrimaryLink to="/programma" className="shrink-0 self-start sm:self-auto">
            Κράτηση μαθήματος
          </PrimaryLink>
        </div>

        <WeekScheduleCarousel />
      </section>

      <section className="mt-16" aria-labelledby="class-types-heading">
        <h2
          id="class-types-heading"
          className="font-display text-2xl font-semibold text-moove-silver"
        >
          Τύποι μαθημάτων
        </h2>
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {classTypes.map((c) => (
            <article
              key={c.title}
              className="flex flex-col rounded-2xl border border-moove-border bg-moove-surface/40 p-8"
            >
              <h3 className="font-display text-xl font-semibold text-moove-silver">
                {c.title}
              </h3>
              <dl className="mt-4 flex flex-wrap gap-4 text-sm text-moove-muted">
                <div>
                  <dt className="text-moove-muted/70">Επίπεδο</dt>
                  <dd className="mt-1 text-moove-silver/90">{c.level}</dd>
                </div>
                <div>
                  <dt className="text-moove-muted/70">Διάρκεια</dt>
                  <dd className="mt-1 text-moove-silver/90">{c.duration}</dd>
                </div>
              </dl>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-moove-muted">
                {c.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
