import { Link } from 'react-router-dom'
import { site } from '../site'
import { useIsPosingRoute } from '../hooks/useIsPosingRoute'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function Footer() {
  const posing = useIsPosingRoute()
  const { posing: posingBrand } = site
  const { t } = useTranslation()
  const vars = useSiteVars()

  const linkClass = posing
    ? 'text-white/55 transition hover:text-cyan-300'
    : 'text-moove-muted transition hover:text-moove-lime'

  const headingClass = posing
    ? 'font-display text-sm font-semibold uppercase tracking-widest text-white'
    : 'font-display text-sm font-semibold uppercase tracking-widest text-moove-silver'

  return (
    <footer
      className={
        posing
          ? 'border-t border-white/10 bg-[#06060a] pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
          : 'border-t border-moove-border/80 bg-moove-espresso/[0.04] pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
      }
    >
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-2 lg:grid-cols-4">
        <div>
          {posing ? (
            <>
              <Link to="/posing">
                <img
                  src={posingBrand.logo}
                  alt={posingBrand.brandName}
                  className="h-16 w-auto"
                  width={160}
                  height={80}
                />
              </Link>
              <p className="mt-3 text-xs uppercase tracking-[0.22em] text-cyan-300/80">
                {posingBrand.brandSubtitle}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-white/55">
                {t('footer.posingBlurb', vars)}
              </p>
              <Link to="/" className={`mt-4 inline-block text-xs ${linkClass}`}>
                {t('footer.backToStudio', vars)}
              </Link>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-semibold tracking-wide text-moove-silver">
                {site.name}
              </p>
              <p className="mt-1 text-xs uppercase tracking-[0.22em] text-moove-muted">
                {site.tagline}
              </p>
              <p className="mt-4 text-sm leading-relaxed text-moove-muted">
                {t('footer.studioBlurb', vars)}
              </p>
            </>
          )}
        </div>
        <div>
          <h2 className={headingClass}>{t('footer.nav')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {!posing ? (
              <li>
                <Link to="/mathimata" className={linkClass}>
                  {t('nav.classes')}
                </Link>
              </li>
            ) : null}
            <li>
              <Link to="/posing" className={linkClass}>
                {t('footer.moveAndPose')}
              </Link>
            </li>
            {posing ? (
              <li>
                <a href="#booking" className={linkClass}>
                  {t('common.bookPosingSession')}
                </a>
              </li>
            ) : null}
            <li>
              <Link to="/epikoinonia" className={linkClass}>
                {t('nav.contact')}
              </Link>
            </li>
            {posing ? (
              <li>
                <Link to="/mathimata" className={linkClass}>
                  {t('footer.studioClasses')}
                </Link>
              </li>
            ) : null}
          </ul>
        </div>
        <div>
          <h2 className={headingClass}>{t('footer.details')}</h2>
          <ul className={`mt-4 space-y-3 text-sm ${posing ? 'text-white/55' : 'text-moove-muted'}`}>
            <li>
              <a className={linkClass} href={`tel:${site.phone.replace(/\s/g, '')}`}>
                {site.phone}
              </a>
            </li>
            <li>
              <a className={linkClass} href={`mailto:${site.email}`}>
                {site.email}
              </a>
            </li>
            {!posing ? (
              <>
                <li>{site.addressLine}</li>
                <li>{t('contact.hoursValue')}</li>
              </>
            ) : null}
          </ul>
        </div>
        <div>
          <h2 className={headingClass}>{t('footer.social')}</h2>
          <ul className="mt-4 space-y-2 text-sm">
            <li>
              <a
                href={posing ? posingBrand.instagram : site.social.instagram}
                className={linkClass}
                target="_blank"
                rel="noreferrer noopener"
              >
                {t('common.instagram')}
              </a>
            </li>
            {!posing ? (
              <li>
                <a
                  href={site.social.facebook}
                  className={linkClass}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t('common.facebook')}
                </a>
              </li>
            ) : null}
            {!posing ? (
              <li>
                <a
                  href={site.mapsUrl}
                  className={linkClass}
                  target="_blank"
                  rel="noreferrer noopener"
                >
                  {t('common.googleMaps')}
                </a>
              </li>
            ) : null}
          </ul>
        </div>
      </div>
      <div className={`border-t py-6 ${posing ? 'border-white/10' : 'border-moove-border'}`}>
        <p className={`text-center text-xs ${posing ? 'text-white/45' : 'text-moove-muted'}`}>
          © {new Date().getFullYear()}{' '}
          {posing ? posingBrand.brandName : site.name}. {t('common.copyright')}
        </p>
        <p
          className={`mt-4 flex flex-col items-center justify-center gap-2 text-center text-xs uppercase tracking-[0.18em] sm:flex-row sm:gap-3 ${
            posing ? 'text-white/35' : 'text-moove-muted'
          }`}
        >
          <span className="font-medium">{t('common.poweredBy')}</span>
          <a
            href="https://akantronics.gr/"
            target="_blank"
            rel="noreferrer noopener"
            className={`inline-flex items-center transition hover:opacity-100 focus-visible:opacity-100 ${
              posing ? 'opacity-70 invert' : 'opacity-90'
            }`}
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
