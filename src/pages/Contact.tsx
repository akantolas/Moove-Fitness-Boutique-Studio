import { useState } from 'react'
import type { FormEvent } from 'react'
import { PageHeader } from '../components/PageHeader'
import { site } from '../site'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow="Επικοινωνία"
        title="Πού βρισκόμαστε"
        description="Για κράτηση πήγαινε online. Για οτιδήποτε άλλο, γράψε ή πάρε τηλέφωνο."
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            Στοιχεία επικοινωνίας
          </h2>
          <ul className="mt-8 space-y-6 text-sm">
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">Διεύθυνση</span>
              <span className="mt-2 block text-base text-moove-silver">{site.addressLine}</span>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">Τηλέφωνο</span>
              <a
                className="mt-2 inline-block font-medium text-moove-accent hover:underline"
                href={`tel:${site.phone.replace(/\s/g, '')}`}
              >
                {site.phone}
              </a>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">Email</span>
              <a
                className="mt-2 inline-block font-medium text-moove-accent hover:underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">Ώρες</span>
              <span className="mt-2 block text-moove-silver">{site.hours}</span>
            </li>
          </ul>
          <div className="mt-10">
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex rounded-full border border-moove-espresso/15 bg-moove-elevated/50 px-5 py-2.5 text-sm font-medium text-moove-silver transition hover:border-moove-lime/50 hover:text-moove-ink"
            >
              Άνοιγμα στο Google Maps →
            </a>
          </div>
        </section>

        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            Στείλε μήνυμα
          </h2>
          {sent ? (
            <p className="mt-6 rounded-xl border border-moove-lime/30 bg-moove-lime/10 px-4 py-4 text-sm text-moove-silver">
              Το πήραμε! Θα σ&apos; απαντήσουμε το συντομότερο δυνατό.
            </p>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="name" className="moove-eyebrow !text-[0.6rem]">
                  Ονοματεπώνυμο
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20"
                  placeholder="π.χ. Μαρία Παπαδοπούλου"
                />
              </div>
              <div>
                <label htmlFor="email" className="moove-eyebrow !text-[0.6rem]">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20"
                  placeholder="το email σου"
                />
              </div>
              <div>
                <label htmlFor="message" className="moove-eyebrow !text-[0.6rem]">
                  Μήνυμα
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="mt-2 w-full resize-y rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20"
                  placeholder="Γράψε εδώ ό,τι θες να ρωτήσεις..."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-gradient-to-b from-moove-lime to-moove-lime-deep py-3.5 text-sm font-semibold text-moove-ink shadow-moove-glow transition hover:brightness-105 sm:w-auto sm:px-10"
              >
                Αποστολή
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
