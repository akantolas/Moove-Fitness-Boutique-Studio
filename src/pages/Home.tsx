import { GhostLink, PrimaryLink, ButtonLink } from '../components/Links'
import { GoogleReviews } from '../components/GoogleReviews'
import { site } from '../site'

const usp = [
  {
    title: 'Μικρά γκρουπ',
    body: 'Περισσότερη προσοχή από τον instructor και ασφαλέστερη εκτέλεση ασκήσεων.',
  },
  {
    title: 'Boutique εμπειρία',
    body: 'Καθαρός χώρος, premium εξοπλισμός και ατμόσφαιρα που σέβεται την ενέργειά σας.',
  },
  {
    title: 'Σαφής πρόοδος',
    body: 'Προγράμματα που χτίζουν δύναμη, ευελιξία και σταθερότητα με μέτρο.',
  },
] as const

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-moove-border">
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 85% 70% at 12% 15%, rgba(196, 240, 49, 0.2) 0%, transparent 52%), radial-gradient(circle at 92% 8%, rgba(232, 213, 196, 0.55) 0%, transparent 38%), radial-gradient(circle at 70% 85%, rgba(180, 101, 72, 0.06) 0%, transparent 45%)',
          }}
        />
        <div className="relative mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:flex-row lg:items-center lg:gap-16">
          <div className="flex flex-1 flex-col items-center lg:items-start">
            <p className="text-center text-xs font-medium uppercase tracking-[0.28em] text-moove-accent/90 lg:text-left">
              {site.tagline}
            </p>
            <h1 className="font-display mt-4 text-center text-4xl font-semibold leading-[1.12] tracking-tight text-moove-silver sm:text-5xl lg:text-left lg:text-6xl">
              Κίνηση με ροή.
              <span className="mt-2 block text-moove-lime">Αποτέλεσμα με μέτρο.</span>
            </h1>
            <p className="mt-6 max-w-xl text-center text-base leading-relaxed text-moove-muted lg:text-left">
              Στο {site.name} συνδυάζουμε κλασική προσέγγιση Pilates με σύγχρονο boutique
              χώρο — για σώμα που νιώθει δυνατό, σταθερό και ελεύθερο στην καθημερινότητα.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <PrimaryLink to="/programma">Κλείσε θέση</PrimaryLink>
              <GhostLink to="/mathimata">Δες μαθήματα</GhostLink>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <div className="relative w-full max-w-md rounded-3xl border border-moove-border/80 bg-moove-surface/95 p-8 shadow-moove-soft ring-1 ring-moove-glow/40 backdrop-blur-[2px]">
              <div className="flex justify-center">
                <img
                  src="/logo.png"
                  alt=""
                  className="h-auto w-full max-w-[280px]"
                  width={320}
                  height={120}
                />
              </div>
              <ul className="mt-8 space-y-3 text-sm text-moove-muted">
                <li className="flex gap-2">
                  <span className="text-moove-lime" aria-hidden>
                    ✓
                  </span>
                  Reformer & εξατομικευμένα προγράμματα
                </li>
                <li className="flex gap-2">
                  <span className="text-moove-lime" aria-hidden>
                    ✓
                  </span>
                  Κατάλληλο για αρχάριους και προχωρημένους
                </li>
                <li className="flex gap-2">
                  <span className="text-moove-lime" aria-hidden>
                    ✓
                  </span>
                  Ρυθμός που σέβεται το σώμα σας
                </li>
              </ul>
              <div className="mt-8 flex flex-col gap-2">
                <ButtonLink
                  href={site.bookingUrl}
                  external={site.bookingUrl.startsWith('http')}
                >
                  Άνοιγμα συστήματος κρατήσεων
                </ButtonLink>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-moove-border bg-gradient-to-b from-moove-glow/35 via-moove-surface/50 to-moove-bg/80">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <h2 className="font-display text-center text-2xl font-semibold text-moove-silver sm:text-3xl">
            Γιατί boutique;
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-moove-muted">
            Λιγότερος θόρυβος, πιο ουσιαστική καθοδήγηση.
          </p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {usp.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-moove-border/90 bg-moove-surface/90 p-6 shadow-moove-lift transition duration-300 ease-out hover:-translate-y-1 hover:border-moove-lime/35 hover:shadow-moove-soft"
              >
                <h3 className="font-display text-lg font-semibold text-moove-silver">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-moove-muted">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-moove-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:flex-row lg:items-center">
          <div className="flex-1">
            <h2 className="font-display text-2xl font-semibold text-moove-silver sm:text-3xl">
              Μαθήματα για κάθε στάδιο
            </h2>
            <p className="mt-4 text-moove-muted leading-relaxed">
              Από εισαγωγή στο Reformer μέχρι δυναμικές συνεδρίες που ενδυναμώνουν τον
              κορμό. Διαλέξτε το είδος που σας ταιριάζει — εμείς σας καθοδηγούμε με ασφάλεια.
            </p>
            <div className="mt-8">
              <GhostLink to="/mathimata">Όλα τα μαθήματα</GhostLink>
            </div>
          </div>
          <div className="flex-1">
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                'Reformer Group',
                'Mat Pilates',
                'Private / Duet',
                'Intro πρώτο μάθημα',
              ].map((title) => (
                <div
                  key={title}
                  className="rounded-2xl border border-moove-border/60 bg-moove-surface/90 px-4 py-5 text-center text-sm font-medium text-moove-silver shadow-moove-lift transition duration-300 hover:border-moove-accent/25"
                >
                  {title}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews />

      <section>
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="flex flex-col items-center rounded-3xl border border-moove-lime/20 bg-gradient-to-br from-moove-glow/50 via-moove-surface to-[#eef5e0] px-6 py-12 text-center shadow-moove-soft sm:px-12">
            <h2 className="font-display text-2xl font-semibold text-moove-silver sm:text-3xl">
              Έτοιμοι να κινηθείτε;
            </h2>
            <p className="mt-3 max-w-xl text-moove-muted">
              Κλείστε θέση στο πρόγραμμα ή επικοινωνήστε για ερωτήσεις πριν την πρώτη σας επίσκεψη.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <PrimaryLink to="/programma">Κράτηση</PrimaryLink>
              <GhostLink to="/epikoinonia">Επικοινωνία</GhostLink>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
