import { ButtonLink } from '../components/Links'
import { PageHeader } from '../components/PageHeader'
import { WeekScheduleCarousel } from '../components/WeekScheduleCarousel'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

export function ClassesPage() {
  const { t, dictionary } = useTranslation()

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow={t('classes.eyebrow')}
        title={t('classes.title')}
        description={t('classes.description')}
      />

      <section className="mt-14" aria-labelledby="week-plan-heading">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              id="week-plan-heading"
              className="font-display text-2xl font-semibold text-moove-silver sm:text-3xl"
            >
              {t('classes.weekTitle')}
            </h2>
            <p className="mt-2 text-sm text-moove-muted">{t('classes.weekRange')}</p>
          </div>
          <ButtonLink
            href={site.bookingUrl}
            external={site.bookingUrl.startsWith('http')}
            className="shrink-0 self-start sm:self-auto"
          >
            {t('common.bookClass')}
          </ButtonLink>
        </div>

        <WeekScheduleCarousel />
      </section>

      <section className="mt-20" aria-labelledby="class-types-heading">
        <p className="moove-eyebrow">{t('classes.detailsEyebrow')}</p>
        <h2
          id="class-types-heading"
          className="font-display mt-3 text-2xl font-semibold text-moove-silver sm:text-3xl"
        >
          {t('classes.typesTitle')}
        </h2>
        <div className="moove-rule mt-5" aria-hidden />

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          {dictionary.classes.items.map((c, i) => (
            <article
              key={c.title}
              className="group moove-card flex flex-col p-8 transition hover:-translate-y-0.5 hover:shadow-moove-soft"
            >
              <span className="font-display text-sm font-semibold text-moove-lime/70">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-2 text-xl font-semibold text-moove-silver">
                {c.title}
              </h3>
              <dl className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    {t('common.level')}
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">{c.level}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    {t('common.duration')}
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">{c.duration}</dd>
                </div>
              </dl>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-moove-muted">{c.desc}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
