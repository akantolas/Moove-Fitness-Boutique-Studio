import { Link } from 'react-router-dom'
import { LegalPageLayout } from '../components/LegalPageLayout'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function PrivacyPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()

  return (
    <LegalPageLayout
      title={t('privacy.page.title')}
      description={t('privacy.page.description', vars)}
      lastUpdated={t('privacy.page.lastUpdated')}
      sections={dictionary.privacy.page.sections}
      vars={vars}
      actions={
        <>
          <Link to="/cookies" className="studio-button">
            {t('privacy.page.viewCookies')}
          </Link>
          <Link to="/" className="studio-button bg-moove-surface hover:bg-moove-elevated">
            {t('privacy.page.backHome')}
          </Link>
        </>
      }
    />
  )
}
