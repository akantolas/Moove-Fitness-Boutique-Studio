import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function TermsOfUsePage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const sections = dictionary.termsOfUse.page.sections

  return (
    <LegalPageLayout
      title={t('termsOfUse.page.title')}
      description={t('termsOfUse.page.description', vars)}
      lastUpdated={t('termsOfUse.page.lastUpdated')}
      sections={sections}
      vars={vars}
      actions={
        <>
          <Link to="/service-terms" className="studio-button">
            {t('serviceTerms.footer.serviceTerms')}
          </Link>
          <Link to="/privacy" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('termsOfUse.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
