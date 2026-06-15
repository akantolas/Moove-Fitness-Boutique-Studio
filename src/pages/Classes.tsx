import { ButtonLink } from '../components/Links'
import { PageHeader } from '../components/PageHeader'
import { WeekScheduleCarousel } from '../components/WeekScheduleCarousel'
import { site } from '../site'

const classTypes = [
  {
    title: 'Reformer',
    level: 'Όλα τα επίπεδα',
    duration: '50 λεπτά',
    desc: 'Εργασία στο μηχάνημα Reformer — κορμός, σταθερότητα, ελεγχόμενη ένταση. Σε μικρό γκρουπ, με άμεση διόρθωση.',
  },
  {
    title: 'Pilates Mat',
    level: 'Αρχάριοι – μεσαίοι',
    duration: '45–50 λεπτά',
    desc: 'Κλασικό Pilates χωρίς μηχάνημα. Καλό για να χτίσεις βάση ή να συμπληρώσεις τα Reformer μαθήματά σου.',
  },
  {
    title: 'TRX & Functional',
    level: 'Μεσαίοι – προχωρημένοι',
    duration: '45–50 λεπτά',
    desc: 'Λειτουργική προπόνηση με TRX — δύναμη, αντοχή, κινητικότητα. Πάντα με έλεγχο, όχι τυφλή ένταση.',
  },
  {
    title: "Magda's Bootycamp",
    level: 'Όλα τα επίπεδα',
    duration: '40 λεπτά',
    desc: 'Στοχευμένη προπόνηση γλουτών και κορμού — υπογγραφή προγράμματος του studio. Έντονη, αποτελεσματική, με έλεγχο τεχνικής.',
  },
] as const

export function ClassesPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow="Μαθήματα"
        title="Πρόγραμμα & τύποι"
        description="Εβδομαδιαίο group πρόγραμμα. Για κράτηση, χρησιμοποιήστε το online σύστημα."
      />

      <section className="mt-14" aria-labelledby="week-plan-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="week-plan-heading"
              className="font-display text-2xl font-semibold text-moove-silver sm:text-3xl"
            >
              Εβδομαδιαίο πρόγραμμα
            </h2>
            <p className="mt-2 text-sm text-moove-muted">
              Δευτέρα – Σάββατο
            </p>
          </div>
          <ButtonLink
            href={site.bookingUrl}
            external={site.bookingUrl.startsWith('http')}
            className="shrink-0 self-start sm:self-auto"
          >
            Κράτηση μαθήματος
          </ButtonLink>
        </div>

        <WeekScheduleCarousel />
      </section>

      <section className="mt-20" aria-labelledby="class-types-heading">
        <p className="moove-eyebrow">Λεπτομέρειες</p>
        <h2
          id="class-types-heading"
          className="font-display mt-3 text-2xl font-semibold text-moove-silver sm:text-3xl"
        >
          Τύποι μαθημάτων
        </h2>
        <div className="moove-rule mt-5" aria-hidden />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {classTypes.map((c, i) => (
            <article
              key={c.title}
              className="group moove-card flex flex-col p-8 transition hover:-translate-y-0.5 hover:shadow-moove-soft"
            >
              <span className="font-display text-sm font-semibold text-moove-lime/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-2 text-xl font-semibold text-moove-silver">
                {c.title}
              </h3>
              <dl className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    Επίπεδο
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">{c.level}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    Διάρκεια
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">{c.duration}</dd>
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
