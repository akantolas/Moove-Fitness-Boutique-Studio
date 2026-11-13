import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { useTranslation } from '../i18n/useTranslation'

export function ProgramsUnderProcessing() {
  const { t } = useTranslation()

  return (
    <div className="studio studio-frame flex min-h-[70svh] flex-col justify-center py-[clamp(4rem,2rem+6vw,8rem)]">
      <PageHeader title={t('programs.processing.title')} description={t('programs.processing.body')} />
      <p className="mt-8 max-w-[52ch] leading-[1.55] text-moove-muted">{t('programs.processing.note')}</p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/epikoinonia" className="studio-button">
          {t('programs.processing.cta')}
        </Link>
        <Link to="/" className="studio-button bg-moove-surface hover:bg-moove-elevated">
          {t('programs.processing.backHome')}
        </Link>
      </div>
    </div>
  )
}
