import { Link } from 'react-router-dom'
import { useCookieConsent } from '../cookies/CookieConsentProvider'
import { site } from '../site'
import { useIsPosingRoute, posingBookingHref } from '../hooks/useIsPosingRoute'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function Footer() {
  const posing = useIsPosingRoute()
  const { posing: posingBrand } = site
  const { t } = useTranslation()
  const vars = useSiteVars()
  const { openPreferences } = useCookieConsent()

  const linkClass = posing
    ? 'text-white/55 transition hover:text-cyan-300'
    : 'text-moove-muted transition hover:text-moove-lime'

  const headingClass = posing
    ? 'font-display text-sm font-semibold uppercase tracking-widest text-white'
    : 'font-display text-sm font-semibold uppercase tracking-widest text-moove-silver'

  if (!posing) {
    const studioLink = 'transition-opacity hover:opacity-60'
    return (
      <footer className="studio relative overflow-hidden bg-moove-lime text-moove-ink">
        <div className="studio-frame pt-[clamp(5rem,3rem+5vw,8rem)]">
          <div className="studio-grid gap-y-12">
            <div className="col-span-12 md:col-span-7">
              <h2 className="studio-head max-w-[12ch]">{t('footer.invite')}</h2>
              <a
                href={site.bookingUrl}
                className="studio-button studio-button--ink mt-8"
                {...(site.bookingUrl.startsWith('http')
                  ? { target: '_blank', rel: 'noreferrer noopener' }
                  : undefined)}
              >
                {t('common.bookSpot')}
              </a>
            </div>
            <nav
              className="col-span-12 grid grid-cols-2 gap-x-6 gap-y-8 md:col-span-4 md:col-start-9"
              aria-label={t('footer.nav')}
            >
              <ul className="space-y-2 font-semibold">
                <li>
                  <Link to="/mathimata" className={studioLink}>
                    {t('nav.classes')}
                  </Link>
                </li>
                <li>
                  <Link to="/sxetika" className={studioLink}>
                    {t('nav.about')}
                  </Link>
                </li>
                <li>
                  <Link to="/epikoinonia" className={studioLink}>
                    {t('nav.contact')}
                  </Link>
                </li>
                <li>
                  <Link to="/posing" className={studioLink}>
                    {t('footer.moveAndPose')}
                  </Link>
                </li>
              </ul>
              <ul className="space-y-2 font-semibold">
                <li>
                  <a href={site.social.instagram} className={studioLink} target="_blank" rel="noreferrer noopener">
                    {t('common.instagram')}
                  </a>
                </li>
                <li>
                  <a href={site.social.facebook} className={studioLink} target="_blank" rel="noreferrer noopener">
                    {t('common.facebook')}
                  </a>
                </li>
                <li>
                  <a href={site.mapsUrl} className={studioLink} target="_blank" rel="noreferrer noopener">
                    {t('common.googleMaps')}
                  </a>
                </li>
              </ul>
              <ul className="studio-small col-span-2 space-y-1 font-normal">
                <li>
                  <a className={studioLink} href={`tel:${site.phone.replace(/\s/g, '')}`}>
                    {site.phone}
                  </a>
                  {' · '}
                  <a className={studioLink} href={`mailto:${site.email}`}>
                    {site.email}
                  </a>
                </li>
                <li>{site.addressLine}</li>
                <li>{t('contact.hoursValue')}</li>
              </ul>
            </nav>
          </div>

          <div className="studio-small mt-20 flex flex-col gap-4 font-normal md:flex-row md:items-center md:justify-between">
            <p className="flex flex-wrap gap-x-5 gap-y-2">
              <span>
                © {new Date().getFullYear()} {site.name}
              </span>
              <Link to="/privacy" className={studioLink}>
                {t('privacy.footer.privacyPolicy')}
              </Link>
              <Link to="/cookies" className={studioLink}>
                {t('cookies.footer.cookiePolicy')}
              </Link>
              <Link to="/terms" className={studioLink}>
                {t('termsOfUse.footer.termsOfUse')}
              </Link>
              <Link to="/service-terms" className={studioLink}>
                {t('serviceTerms.footer.serviceTerms')}
              </Link>
              <button
                type="button"
                onClick={openPreferences}
                className={`${studioLink} cursor-pointer border-0 bg-transparent p-0 font-inherit`}
              >
                {t('cookies.footer.manageCookies')}
              </button>
            </p>
            <a
              href="https://akantronics.gr/"
              target="_blank"
              rel="noreferrer noopener"
              className={`inline-flex items-center gap-2 ${studioLink}`}
              aria-label="Akantronics — Electronics Engineer & Developer"
            >
              <span>{t('common.poweredBy')}</span>
              <img src="/akantronics-wordmark.png" alt="Akantronics" className="h-8 w-auto" width={220} height={44} />
            </a>
          </div>
        </div>
        <p
          className="studio-display pointer-events-none -mb-[0.2em] mt-6 select-none whitespace-nowrap pl-[var(--gutter)] text-[46vw] leading-[0.8] md:text-[28vw]"
          aria-hidden
        >
          {site.name}
        </p>
        <div className="h-24 lg:hidden" aria-hidden />
      </footer>
    )
  }

  return (
    <footer
      className={
        posing
          ? 'border-t border-white/10 bg-[#06060a] pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
          : 'border-t border-moove-border/80 bg-moove-espresso/[0.04] pb-[calc(7.75rem+env(safe-area-inset-bottom,0px))] lg:pb-0'
      }
    >
      <div className="moove-site-container-wide grid gap-10 py-14 md:grid-cols-2 lg:grid-cols-4">
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
                {t('footer.posingSubtitle')}
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
            {posing ? (
              <>
                <li>
                  <Link to="/posing/about" className={linkClass}>
                    {t('nav.about')}
                  </Link>
                </li>
                <li>
                  <a href={posingBookingHref} className={linkClass}>
                    {t('common.bookPosingSession')}
                  </a>
                </li>
              </>
            ) : null}
            {!posing ? (
              <li>
                <Link to="/posing" className={linkClass}>
                  {t('footer.moveAndPose')}
                </Link>
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
        <p className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-center text-xs">
          <Link to="/privacy" className={linkClass}>
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/cookies" className={linkClass}>
            {t('cookies.footer.cookiePolicy')}
          </Link>
          <Link to="/terms" className={linkClass}>
            {t('termsOfUse.footer.termsOfUse')}
          </Link>
          <Link to="/service-terms" className={linkClass}>
            {t('serviceTerms.footer.serviceTerms')}
          </Link>
          <button
            type="button"
            onClick={openPreferences}
            className={`${linkClass} cursor-pointer border-0 bg-transparent p-0 font-inherit`}
          >
            {t('cookies.footer.manageCookies')}
          </button>
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
