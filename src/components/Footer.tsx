import { Link } from 'react-router-dom'
import { useCookieConsent } from '../cookies/CookieConsentProvider'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function Footer() {
  const { t } = useTranslation()
  const vars = useSiteVars()
  const { openPreferences } = useCookieConsent()

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
              <li>{vars.address}</li>
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
