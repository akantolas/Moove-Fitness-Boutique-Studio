import { PageHeader } from '../components/PageHeader'
import { GhostLink, PrimaryLink } from '../components/Links'
import { SiteContainer } from '../components/SiteContainer'
import { useTranslation } from '../i18n/useTranslation'

export function ProgramsUnderProcessing() {
  const { t } = useTranslation()

  return (
    <SiteContainer className="py-14 sm:py-20">
      <PageHeader
        align="center"
        eyebrow={t('programs.processing.eyebrow')}
        title={t('programs.processing.title')}
        description={t('programs.processing.body')}
      />

      <div className="mx-auto mt-12 max-w-xl text-center">
        <p className="text-sm leading-relaxed text-moove-muted">{t('programs.processing.note')}</p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <PrimaryLink to="/epikoinonia">{t('programs.processing.cta')}</PrimaryLink>
          <GhostLink to="/">{t('programs.processing.backHome')}</GhostLink>
        </div>
      </div>
    </SiteContainer>
  )
}
