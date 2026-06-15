import { CalPosingEmbed } from '../components/CalPosingEmbed'
import { site } from '../site'

const highlights = [
  {
    title: 'Online 1-on-1',
    body: 'Ζωντανή συνεδρία μέσω video — όπου κι αν βρίσκεστε, πριν από τον διαγωνισμό σας.',
  },
  {
    title: 'Posing & presentation',
    body: 'Στάσεις, transitions, stage presence και χορογραφία που αναδεικνύουν τη φυσική σας.',
  },
  {
    title: 'Προσωπικό πλάνο',
    body: 'Προσαρμογή στο division, το music και το level σας — από πρώτη φορά μέχρι πλάτφορμα.',
  },
] as const

const steps = [
  { num: '01', title: 'Κράτηση', body: 'Επιλέγετε ώρα και πληρώνετε online μέσω Cal.com.' },
  { num: '02', title: 'Προετοιμασία', body: 'Λαμβάνετε οδηγίες για camera, φωτισμό και τι να έχετε έτοιμο.' },
  { num: '03', title: 'Συνεδρία', body: 'Δουλεύετε live με τη Μαγδα — διόρθωση, repetition, recording tips.' },
] as const

const faq = [
  {
    q: 'Έχει σχέση με τα μαθήματα του studio;',
    a: 'Όχι. Το Move & Pose είναι ξεχωριστή υπηρεσία online coaching για bodybuilding shows. Το πρόγραμμα του γυμναστηρίου κλείνεται ξεχωριστά.',
  },
  {
    q: 'Τι χρειάζομαι;',
    a: 'Σταθερό internet, κάμερα (κινητό ή laptop), χώρο να κινηθείτε και optional posing trunks / competition wear.',
  },
  {
    q: 'Σε ποια divisions;',
    a: "Bikini, Wellness, Figure, Women's Physique και σχετικές κατηγορίες — ρωτήστε αν δεν είστε σίγουροι.",
  },
  {
    q: 'Γλώσσα;',
    a: 'Ελληνικά και αγγλικά.',
  },
] as const

export function PosingPage() {
  const { posing } = site
  const calUrl = posing.calLink ? `https://cal.com/${posing.calLink}` : null

  return (
    <div className="pose-page bg-[#08080c] text-white">
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(192, 38, 211, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <img
              src={posing.logo}
              alt={`${posing.brandName} — ${posing.brandSubtitle}`}
              className="h-auto w-full max-w-[17rem] sm:max-w-xs"
              width={400}
              height={520}
            />
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
              by {posing.coachName}
            </p>
            <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.35rem]">
              Online posing coaching για bodybuilding shows
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
              Διδακτικές συνεδρίες one-on-one για στάσεις, stage presence και confidence στην
              πλάτφορμα — εντελώς ξεχωριστά από το Pilates studio.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <a
                href="#booking"
                className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_32px_-8px_rgba(192,38,211,0.55)] transition hover:brightness-110"
              >
                Κλείσε συνεδρία
              </a>
              {calUrl ? (
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  Άνοιγμα Cal.com
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-2 shadow-[0_24px_64px_-24px_rgba(192,38,211,0.35)]">
              <img
                src={posing.logo}
                alt=""
                className="w-full rounded-[1.35rem] object-cover"
                width={600}
                height={780}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              Η υπηρεσία
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Τι καλύπτει
            </h2>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm"
              >
                <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-center text-3xl font-semibold text-white sm:text-4xl">
            Πώς λειτουργεί
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step) => (
              <div key={step.num} className="text-center md:text-left">
                <span className="font-display text-3xl font-semibold text-fuchsia-400/40">
                  {step.num}
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Booking + Cal.com */}
      <section id="booking" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
              Κράτηση & πληρωμή
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              Κλείσε τη συνεδρία σου
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
              Επιλέξτε διαθέσιμη ώρα και ολοκληρώστε την πληρωμή online. Το ημερολόγιο είναι
              ξεχωριστό από τις κρατήσεις του γυμναστηρίου.
            </p>
          </div>
          <div className="mt-10">
            <CalPosingEmbed calLink={posing.calLink} />
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="border-t border-white/10 bg-black/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-center text-2xl font-semibold text-white sm:text-3xl">
            Συχνές ερωτήσεις
          </h2>
          <dl className="mt-10 space-y-6">
            {faq.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5"
              >
                <dt className="font-medium text-white">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/60">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
