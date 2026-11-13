import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function ServiceTermsPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const sections = dictionary.serviceTerms.page.sections

  return (
    <LegalPageLayout
      title={t('serviceTerms.page.title')}
      description={t('serviceTerms.page.description', vars)}
      lastUpdated={t('serviceTerms.page.lastUpdated')}
      sections={sections}
      vars={vars}
      actions={
        <>
          <Link to="/terms" className="studio-button">
            {t('termsOfUse.footer.termsOfUse')}
          </Link>
          <Link to="/privacy" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('serviceTerms.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
