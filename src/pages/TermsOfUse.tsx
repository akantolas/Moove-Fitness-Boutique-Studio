import { Link } from 'react-router-dom'
import {
  LegalPageLayout,
  legalGhostLinkClassName,
  legalPrimaryLinkClassName,
} from '../components/LegalPageLayout'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function TermsOfUsePage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const sections = dictionary.termsOfUse.page.sections

  return (
    <LegalPageLayout
      eyebrow={t('termsOfUse.page.eyebrow')}
      title={t('termsOfUse.page.title')}
      description={t('termsOfUse.page.description', vars)}
      lastUpdated={t('termsOfUse.page.lastUpdated')}
      sections={sections}
      vars={vars}
      actions={
        <>
          <Link to="/service-terms" className={legalPrimaryLinkClassName()}>
            {t('serviceTerms.footer.serviceTerms')}
          </Link>
          <Link to="/privacy" className={legalGhostLinkClassName()}>
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/" className={legalGhostLinkClassName()}>
            {t('termsOfUse.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
