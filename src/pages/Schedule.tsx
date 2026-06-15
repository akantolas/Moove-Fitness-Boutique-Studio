import { ButtonLink } from '../components/Links'
import { site } from '../site'

const GYM_BOOKING_GENERIC = 'https://booking.gymbooking.gr'

const embedUrl =
  site.bookingEmbedUrl ??
  (site.bookingUrl.startsWith('http') &&
  !site.bookingUrl.startsWith(GYM_BOOKING_GENERIC)
    ? site.bookingUrl
    : null)

export function SchedulePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <header className="max-w-3xl">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-moove-muted">
          Κράτηση
        </p>
        <h1 className="font-display mt-3 text-4xl font-semibold text-moove-silver sm:text-5xl">
          Πρόγραμμα & κρατήσεις
        </h1>
        <p className="mt-4 text-moove-muted leading-relaxed">
          Κάντε κράτηση ή συνδεθείτε στον λογαριασμό σας μέσω{' '}
          <a
            href="https://gymbooking.gr/"
            className="text-moove-accent underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer noopener"
          >
            Gym Booking
          </a>
          . Νέοι χρήστες μπορούν να δημιουργήσουν λογαριασμό απευθείας από εδώ.
        </p>
      </header>

      <div className="mt-10 rounded-2xl border border-moove-border bg-moove-surface/50 p-6 sm:p-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-moove-silver">
              Γρήγορη πρόσβαση στο σύστημα
            </p>
            <p className="mt-1 text-sm text-moove-muted">
              Σύνδεση μελών, νέες κρατήσεις και διαχείριση συνδρομής.
            </p>
          </div>
          <ButtonLink
            href={site.bookingUrl}
            external={site.bookingUrl.startsWith('http')}
          >
            Άνοιγμα κρατήσεων
          </ButtonLink>
        </div>

        <div className="mt-8 overflow-hidden rounded-xl border border-moove-border bg-moove-bg/60">
          {embedUrl ? (
            <iframe
              title="Κρατήσεις Moove — Gym Booking"
              src={embedUrl}
              className="h-[min(720px,80svh)] w-full border-0"
              loading="lazy"
              allow="clipboard-write"
            />
          ) : (
            <div className="flex aspect-[16/9] min-h-[280px] flex-col items-center justify-center gap-3 px-6 text-center sm:min-h-[360px]">
              <p className="text-sm text-moove-muted">
                Περιοχή embed Gym Booking
              </p>
              <p className="max-w-md text-xs leading-relaxed text-moove-muted/80">
                Ορίστε το studio URL στο{' '}
                <code className="rounded bg-moove-elevated px-1 text-moove-silver/90">
                  bookingUrl
                </code>{' '}
                στο αρχείο src/site.ts (π.χ. https://booking.moovestudio.gr/).
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
