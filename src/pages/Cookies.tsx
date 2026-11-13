import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { useCookieConsent } from '../cookies/CookieConsentProvider'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function CookiesPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const { openPreferences } = useCookieConsent()

  return (
    <LegalPageLayout
      title={t('cookies.page.title')}
      description={t('cookies.page.description', vars)}
      lastUpdated={t('cookies.page.lastUpdated')}
      sections={dictionary.cookies.page.sections}
      actions={
        <>
          <button type="button" onClick={openPreferences} className="studio-button">
            {t('cookies.footer.manageCookies')}
          </button>
          <Link to="/privacy" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('cookies.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
