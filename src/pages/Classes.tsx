import { useMemo } from 'react'
import { PageHeader } from '../components/PageHeader'
import { StudioTimetable } from '../components/StudioTimetable'
import { useCurrentTime } from '../hooks/useCurrentTime'
import { useReveal } from '../hooks/useReveal'
import { findNextClass } from '../lib/nextClass'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

export function ClassesPage() {
  const { t, dictionary } = useTranslation()
  const now = useCurrentTime()
  const next = useMemo(() => findNextClass(now), [now])

  useReveal()

  return (
    <div className="studio">
      <section className="studio-frame pt-[clamp(3rem,2rem+4vw,6rem)]">
        <PageHeader title={t('classes.title')} description={t('classes.description')} />
      </section>

      {/* The week's timetable, the same one as on the homepage */}
      <section className="mt-[clamp(3rem,2rem+4vw,6rem)] bg-moove-surface" aria-labelledby="week-plan-heading">
        <div className="studio-frame studio-grid gap-y-10 py-[clamp(4rem,2rem+6vw,8rem)]">
          <div className="col-span-12 md:col-span-4">
            <h2 id="week-plan-heading" className="studio-head max-w-[10ch]">
              {t('classes.weekTitle')}
            </h2>
            <p className="mt-4 text-moove-muted">{t('classes.weekRange')}</p>
            <a href={site.bookingUrl} {...bookingProps} className="studio-button mt-8">
              {t('common.bookClass')}
            </a>
          </div>
          <div className="col-span-12 md:col-span-8 md:pl-[2vw]">
            <StudioTimetable next={next} />
          </div>
        </div>
      </section>

      {/* What each class is, one tone step per class */}
      <section className="studio-frame py-[var(--section-gap)]" aria-labelledby="class-types-heading">
        <div data-reveal>
          <h2 id="class-types-heading" className="studio-head max-w-[12ch]">
            {t('classes.typesTitle')}
          </h2>
        </div>

        <ul className="mt-14 space-y-2 md:mt-20">
          {dictionary.classes.items.map((c) => (
            <li key={c.title} className="studio-grid gap-y-4 bg-moove-surface px-5 py-8 md:items-baseline md:px-8 md:py-10">
              <h3 className="col-span-12 text-[clamp(1.5rem,1rem+1.5vw,2.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em] md:col-span-5">
                {c.title}
              </h3>
              <div className="col-span-12 md:col-span-6 md:col-start-7">
                <p className="max-w-[52ch] leading-[1.55]">{c.desc}</p>
                <p className="studio-small mt-4 text-moove-muted">
                  {c.level} · {c.duration}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
