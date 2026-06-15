import { useState } from 'react'
import type { FormEvent } from 'react'
import { site } from '../site'

export function ContactPage() {
  const [sent, setSent] = useState(false)

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-moove-muted">
          Επικοινωνία
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-moove-silver sm:text-5xl">
          Μιλήστε μαζί μας
        </h1>
        <p className="mt-4 text-moove-muted leading-relaxed">
          Για production συνδέστε τη φόρμα με υπηρεσία (Formspree, Netlify Forms, κ.λπ.).
          Προς το παρόν η υποβολή είναι client-only για να δείτε το UX.
        </p>
      </header>

      <div className="mt-12 grid gap-10 lg:grid-cols-2">
        <section className="rounded-2xl border border-moove-border bg-moove-surface/40 p-8 sm:p-10">
          <h2 className="font-display text-lg font-semibold text-moove-silver">
            Στοιχεία studio
          </h2>
          <ul className="mt-6 space-y-4 text-sm text-moove-muted">
            <li>
              <span className="block text-xs uppercase tracking-wider text-moove-muted/70">
                Διεύθυνση
              </span>
              <span className="mt-1 block text-moove-silver/95">{site.addressLine}</span>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-moove-muted/70">
                Τηλέφωνο
              </span>
              <a
                className="mt-1 inline-block text-moove-lime hover:underline"
                href={`tel:${site.phone.replace(/\s/g, '')}`}
              >
                {site.phone}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-moove-muted/70">
                Email
              </span>
              <a
                className="mt-1 inline-block text-moove-lime hover:underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </li>
            <li>
              <span className="block text-xs uppercase tracking-wider text-moove-muted/70">
                Ώρες
              </span>
              <span className="mt-1 block text-moove-silver/95">{site.hours}</span>
            </li>
          </ul>
          <div className="mt-8">
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex rounded-full border border-moove-silver/40 px-4 py-2 text-sm text-moove-silver transition hover:border-moove-lime hover:text-moove-lime"
            >
              Άνοιγμα στο χάρτη
            </a>
          </div>
        </section>

        <section className="rounded-2xl border border-moove-border bg-moove-bg/60 p-8 sm:p-10">
          <h2 className="font-display text-lg font-semibold text-moove-silver">
            Φόρμα
          </h2>
          {sent ? (
            <p className="mt-6 text-sm text-moove-muted">
              Η φόρμα εμφανίζει μόνο επιβεβαίωση τοπικά. Συνδέστε backend ή third-party
              για πραγματική αποστολή.
            </p>
          ) : (
            <form className="mt-6 space-y-4" onSubmit={handleSubmit} noValidate>
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-moove-muted">
                  Ονοματεπώνυμο
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-lg border border-moove-border bg-moove-surface px-4 py-3 text-sm text-moove-silver placeholder:text-moove-muted/60 focus:border-moove-lime/60 focus:outline-none"
                  placeholder="Π.χ. Αγγελική Δ."
                />
              </div>
              <div>
                <label htmlFor="email" className="block text-xs font-medium text-moove-muted">
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-lg border border-moove-border bg-moove-surface px-4 py-3 text-sm text-moove-silver placeholder:text-moove-muted/60 focus:border-moove-lime/60 focus:outline-none"
                  placeholder="you@example.com"
                />
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-medium text-moove-muted">
                  Μήνυμα
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  className="mt-2 w-full resize-y rounded-lg border border-moove-border bg-moove-surface px-4 py-3 text-sm text-moove-silver placeholder:text-moove-muted/60 focus:border-moove-lime/60 focus:outline-none"
                  placeholder="Ρωτήστε για intro μάθημα, διαθέσιμες ώρες κ.λπ."
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-full bg-moove-lime py-3 text-sm font-semibold text-moove-ink transition hover:bg-moove-lime-hover sm:w-auto sm:px-8"
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
