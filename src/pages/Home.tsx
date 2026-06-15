import { GhostLink, ButtonLink } from '../components/Links'
import { GoogleReviews } from '../components/GoogleReviews'
import { site } from '../site'

const usp = [
  {
    num: '01',
    title: 'Μικρά γκρουπ',
    body: 'Λίγοι ασκούμενοι ανά μάθημα, ώστε η καθοδήγηση να είναι πραγματικά προσωπική — με διόρθωση και σαφείς οδηγίες.',
  },
  {
    num: '02',
    title: 'Ήρεμος χώρος',
    body: 'Καθαρό studio, σύγχρονος εξοπλισμός και ήσυχη ατμόσφαιρα — μακριά από τον θόρυβο των μεγάλων χώρων.',
  },
  {
    num: '03',
    title: 'Σταδιακή πρόοδος',
    body: 'Δύναμη, ευελιξία και σταθερότητα χτίζονται με μέθοδο και συνέπεια, όχι με βιασύνη.',
  },
] as const

const stats = [
  { value: 'Reformer', label: 'Σύγχρονος εξοπλισμός' },
  { value: 'Μικρά γκρουπ', label: 'Προσωπική καθοδήγηση' },
  { value: 'Βόλος', label: 'Κοραή 106Γ' },
] as const

export function HomePage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-moove-border/80">
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 55% at 8% 20%, rgba(196, 240, 49, 0.18) 0%, transparent 50%), radial-gradient(circle at 95% 10%, rgba(232, 213, 196, 0.55) 0%, transparent 35%)',
          }}
          aria-hidden
        />

        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <div className="animate-fade-up flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="moove-eyebrow">{site.tagline}</p>
            <h1 className="font-display mt-5 text-4xl font-semibold leading-[1.08] tracking-tight text-moove-silver sm:text-5xl lg:text-[3.35rem]">
              Pilates & Reformer στον Βόλο.
              <span className="mt-2 block text-gradient-lime">Μικρά γκρουπ, προσωπική καθοδήγηση.</span>
            </h1>
            <p className="mt-6 max-w-lg text-base leading-relaxed text-moove-muted sm:text-lg">
              Το {site.name} είναι studio της {site.ownerName} στην Κοραή. Όλα τα μαθήματα
              διδάσκονται από αυτή, σε μικρά γκρουπ, με έμφαση στην ασφάλεια και τη σωστή
              τεχνική.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
              <ButtonLink href={site.bookingUrl} external={site.bookingUrl.startsWith('http')}>
                Κλείσε θέση
              </ButtonLink>
              <GhostLink to="/mathimata">Δες μαθήματα</GhostLink>
            </div>

            <dl className="mt-12 grid w-full max-w-md grid-cols-3 gap-4 border-t border-moove-border/70 pt-8 lg:max-w-none">
              {stats.map((s) => (
                <div key={s.label}>
                  <dt className="font-display text-sm font-semibold text-moove-silver sm:text-base">
                    {s.value}
                  </dt>
                  <dd className="mt-1 text-[11px] leading-snug text-moove-muted sm:text-xs">
                    {s.label}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          <div className="animate-fade-up relative mx-auto w-full max-w-md lg:max-w-none [animation-delay:120ms]">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-moove-soft ring-1 ring-moove-border/40">
              <img
                src="/image03.jpeg"
                alt="Μάθημα Pilates στο Moove"
                className="h-full w-full object-cover"
                width={1440}
                height={1800}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-moove-espresso/55 via-moove-espresso/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-moove-lime">
                  {site.name}
                </p>
                <p className="font-display mt-2 text-xl font-semibold text-white sm:text-2xl">
                  Κοραή 106Γ · Βόλος
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-moove-border/80 bg-moove-espresso/[0.03] moove-section-pad">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="moove-eyebrow">Η προσέγγιση</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-moove-silver sm:text-4xl">
              Προσωπική καθοδήγηση
            </h2>
            <p className="mt-4 text-moove-muted">
              Σε μικρό studio δεν χάνεσαι στο πλήθος. Κάθε μάθημα σχεδιάζεται με προσοχή στη
              τεχνική, στη διόρθωση και στις ανάγκες του κάθε ασκούμενου.
            </p>
            <div className="moove-rule mx-auto mt-6" aria-hidden />
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-3">
            {usp.map((item) => (
              <article
                key={item.title}
                className="group moove-card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-moove-soft"
              >
                <span className="font-display text-3xl font-semibold text-moove-lime/50 transition group-hover:text-moove-lime/80">
                  {item.num}
                </span>
                <h3 className="font-display mt-4 text-xl font-semibold text-moove-silver">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-moove-muted">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-moove-border/80 moove-section-pad">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:items-center">
          <div className="relative order-2 lg:order-1">
            <div className="grid grid-cols-2 gap-3">
              <img
                src="/image3.jpeg"
                alt="Pilates στο Moove"
                className="aspect-[3/4] rounded-2xl object-cover shadow-moove-lift"
                width={400}
                height={533}
              />
              <img
                src="/image5.jpeg"
                alt="Pilates στο Moove"
                className="mt-8 aspect-[3/4] rounded-2xl object-cover shadow-moove-lift"
                width={1440}
                height={1792}
              />
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <p className="moove-eyebrow">Μαθήματα</p>
            <h2 className="font-display mt-4 text-3xl font-semibold text-moove-silver sm:text-4xl">
              Τα μαθήματα
            </h2>
            <p className="mt-4 leading-relaxed text-moove-muted">
              Από εισαγωγή στο Reformer μέχρι πιο απαιτητικές συνεδρίες. Επιλέξτε το πρόγραμμα που
              σας ταιριάζει — η καθοδήγηση προσαρμόζεται στο επίπεδό σας.
            </p>
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              {['Reformer', 'Pilates Mat', 'TRX & Functional', "Magda's Bootycamp"].map(
                (title) => (
                  <li
                    key={title}
                    className="flex items-center gap-3 rounded-xl border border-moove-border/70 bg-moove-surface/80 px-4 py-3.5 text-sm font-medium text-moove-silver shadow-sm"
                  >
                    <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-moove-lime" />
                    {title}
                  </li>
                ),
              )}
            </ul>
            <div className="mt-8">
              <GhostLink to="/mathimata">Δες το πρόγραμμα</GhostLink>
            </div>
          </div>
        </div>
      </section>

      <GoogleReviews />

      <section className="moove-section-pad">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="relative overflow-hidden rounded-[2rem] border border-moove-lime/25 bg-gradient-to-br from-moove-espresso via-[#3a322c] to-moove-espresso px-6 py-14 text-center shadow-moove-soft sm:px-12 sm:py-16">
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  'radial-gradient(circle at 20% 0%, rgba(196, 240, 49, 0.25) 0%, transparent 45%)',
              }}
              aria-hidden
            />
            <div className="relative">
              <p className="moove-eyebrow !text-moove-lime/90">Έλα να δοκιμάσεις</p>
              <h2 className="font-display mt-4 text-3xl font-semibold text-white sm:text-4xl">
                Θέλεις να κλείσεις θέση;
              </h2>
              <p className="mx-auto mt-4 max-w-lg text-moove-glow/90">
                Κλείστε θέση online ή επικοινωνήστε μαζί μας για οποιαδήποτε απορία πριν την
                πρώτη σας επίσκεψη.
              </p>
              <div className="mt-9 flex flex-wrap justify-center gap-3">
                <ButtonLink href={site.bookingUrl} external={site.bookingUrl.startsWith('http')}>
                  Κράτηση
                </ButtonLink>
                <GhostLink to="/epikoinonia" className="!border-white/20 !bg-white/10 !text-white hover:!border-white/40 hover:!text-white">
                  Επικοινωνία
                </GhostLink>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
