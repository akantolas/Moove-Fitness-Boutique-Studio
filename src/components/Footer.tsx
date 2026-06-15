import { Link } from 'react-router-dom'
import { site } from '../site'

export function Footer() {
  return (
    <footer className="border-t border-moove-border/80 bg-gradient-to-b from-moove-elevated/60 to-moove-glow/25 pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <p className="font-display text-lg font-semibold tracking-wide text-moove-silver">
            {site.name}
          </p>
          <p className="mt-1 text-xs uppercase tracking-[0.22em] text-moove-muted">
            {site.tagline}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted">
            Boutique Pilates με έμφαση στην ακρίβεια, την ασφάλεια και την
            προσωπική καθοδήγηση σε μικρά γκρουπ.
          </p>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-moove-silver">
            Πλοήγηση
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <Link
                to="/mathimata"
                className="text-moove-muted transition hover:text-moove-lime"
              >
                Μαθήματα
              </Link>
            </li>
            <li>
              <Link
                to="/programma"
                className="text-moove-muted transition hover:text-moove-lime"
              >
                Πρόγραμμα
              </Link>
            </li>
            <li>
              <Link
                to="/times"
                className="text-moove-muted transition hover:text-moove-lime"
              >
                Τιμές
              </Link>
            </li>
            <li>
              <Link
                to="/epikoinonia"
                className="text-moove-muted transition hover:text-moove-lime"
              >
                Επικοινωνία
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-moove-silver">
            Στοιχεία
          </h2>
          <ul className="mt-4 space-y-3 text-sm text-moove-muted">
            <li>
              <a
                className="transition hover:text-moove-lime"
                href={`tel:${site.phone.replace(/\s/g, '')}`}
              >
                {site.phone}
              </a>
            </li>
            <li>
              <a
                className="transition hover:text-moove-lime"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </li>
            <li>{site.addressLine}</li>
            <li>{site.hours}</li>
          </ul>
        </div>
        <div>
          <h2 className="font-display text-sm font-semibold uppercase tracking-widest text-moove-silver">
            Social
          </h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={site.social.instagram}
                className="text-moove-muted transition hover:text-moove-lime"
                target="_blank"
                rel="noreferrer noopener"
              >
                Instagram
              </a>
            </li>
            <li>
              <a
                href={site.social.facebook}
                className="text-moove-muted transition hover:text-moove-lime"
                target="_blank"
                rel="noreferrer noopener"
              >
                Facebook
              </a>
            </li>
            <li>
              <a
                href={site.mapsUrl}
                className="text-moove-muted transition hover:text-moove-lime"
                target="_blank"
                rel="noreferrer noopener"
              >
                Google Maps
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-moove-border py-6">
        <p className="text-center text-xs text-moove-muted">
          © {new Date().getFullYear()} {site.name}. Με επιφύλαξη παντός δικαιώματος.
        </p>
        <p className="mt-4 flex flex-col items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.18em] text-moove-muted sm:flex-row sm:gap-3">
          <span className="font-medium">Powered by</span>
          <a
            href="https://akantronics.gr/"
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center opacity-90 transition hover:opacity-100 focus-visible:opacity-100"
            aria-label="Akantronics — Electronics Engineer & Developer"
          >
            <img
              src="/akantronics-wordmark.png"
              alt="Akantronics"
              className="h-9 w-auto sm:h-10 md:h-11"
              width={220}
              height={44}
            />
          </a>
        </p>
      </div>
    </footer>
  )
}
