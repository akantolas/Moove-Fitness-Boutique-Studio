import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { interpolate } from '../i18n/translate'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function PrivacyPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const sections = dictionary.privacy.page.sections

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow={t('privacy.page.eyebrow')}
        title={t('privacy.page.title')}
        description={t('privacy.page.description', vars)}
      />

      <p className="mt-8 text-sm text-moove-muted">{t('privacy.page.lastUpdated')}</p>

      <div className="mt-10 space-y-8">
        {sections.map((section) => (
          <section key={section.title} className="moove-card p-6 sm:p-8">
            <h2 className="font-display text-xl font-semibold text-moove-silver">
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-moove-muted sm:text-base">
              {interpolate(section.body, vars)}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/cookies"
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-b from-moove-lime via-moove-lime to-moove-lime-deep px-6 py-3 text-sm font-semibold text-moove-ink shadow-moove-glow transition hover:brightness-105 active:scale-[0.98]"
        >
          {t('privacy.page.viewCookies')}
        </Link>
        <Link
          to="/"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-moove-espresso/15 bg-moove-surface/60 px-6 py-3 text-sm font-medium text-moove-silver transition hover:border-moove-accent/40 hover:bg-moove-surface hover:text-moove-accent"
        >
          {t('privacy.page.backHome')}
        </Link>
      </div>
    </div>
  )
}
