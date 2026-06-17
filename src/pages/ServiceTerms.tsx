import { Link } from 'react-router-dom'
import {
  LegalPageLayout,
  legalGhostLinkClassName,
  legalPrimaryLinkClassName,
} from '../components/LegalPageLayout'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function ServiceTermsPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const sections = dictionary.serviceTerms.page.sections

  return (
    <LegalPageLayout
      eyebrow={t('serviceTerms.page.eyebrow')}
      title={t('serviceTerms.page.title')}
      description={t('serviceTerms.page.description', vars)}
      lastUpdated={t('serviceTerms.page.lastUpdated')}
      sections={sections}
      vars={vars}
      actions={
        <>
          <Link to="/terms" className={legalPrimaryLinkClassName()}>
            {t('termsOfUse.footer.termsOfUse')}
          </Link>
          <Link to="/privacy" className={legalGhostLinkClassName()}>
            {t('privacy.footer.privacyPolicy')}
          </Link>
          <Link to="/" className={legalGhostLinkClassName()}>
            {t('serviceTerms.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
