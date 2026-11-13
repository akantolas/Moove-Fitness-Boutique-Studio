import { PageHeader } from '../components/PageHeader'
import { useReveal } from '../hooks/useReveal'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

export function AboutPage() {
  const { t, dictionary, locale } = useTranslation()
  const vars = useSiteVars()
  const [firstParagraph, ...paragraphs] = dictionary.about.paragraphs
  const space = dictionary.about.space
  const [first, second] = space.blocks

  useReveal()

  return (
    <div className="studio">
      {/* Her name and what she does */}
      <section className="studio-frame pt-[clamp(3rem,2rem+4vw,6rem)]">
        <PageHeader
          title={locale === 'en' ? site.ownerNameEn : site.ownerName}
          description={t('about.description', vars)}
        />
        <ul className="mt-8 flex flex-wrap gap-2">
          {dictionary.about.highlights.map((highlight) => (
            <li key={highlight} className="studio-small rounded-full bg-moove-surface px-4 py-2">
              {highlight}
            </li>
          ))}
        </ul>
      </section>

      {/* Her background: the portrait under the heading, the text beside it */}
      <section className="studio-frame studio-grid gap-y-10 py-[var(--section-gap)]">
        <div className="col-span-12 md:col-span-4">
          <h2 className="studio-head">{t('about.experienceTitle')}</h2>
          <img
            src="/magda-4x5.jpg"
            alt={t('home.magda.portraitAlt')}
            width={620}
            height={775}
            className="mt-8 aspect-[4/5] w-full max-w-[26rem] object-cover md:mt-10"
          />
        </div>
        <div className="col-span-12 space-y-6 md:col-span-8 md:pl-[2vw] md:pt-[calc(var(--step-head)*1.4)]" data-reveal>
          <p className="studio-lead max-w-[30ch]">{firstParagraph}</p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[60ch] leading-[1.6] text-moove-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* The studio: a large statement, then two photographs set out of step */}
      <section className="overflow-hidden bg-moove-surface">
        <div className="studio-frame py-[var(--section-gap)]">
          <div className="studio-grid gap-y-8 lg:items-end" data-reveal>
            <h2 className="studio-display col-span-12 text-balance text-[clamp(3.25rem,0.8rem+7.5vw,8.5rem)] leading-[0.98] lg:col-span-8">
              {space.titleStart}
              <br />
              <span className="mt-[0.12em] inline-block bg-moove-lime px-[0.06em] pb-[0.08em] leading-[0.95]">{space.titleEmphasis}</span>.
            </h2>
            <p className="studio-lead col-span-12 max-w-[30ch] text-moove-muted lg:col-span-4 lg:pb-3">
              {t('about.studioBody')}
            </p>
          </div>

          <div className="mt-16 grid gap-y-16 md:mt-24 md:grid-cols-2 md:gap-x-[clamp(1.5rem,1rem+2vw,3rem)]">
            <div className="flex flex-col gap-8 md:gap-12">
              <figure className="about-photo relative aspect-[3/4] overflow-hidden bg-moove-elevated">
                <img
                  src="/image6.jpeg"
                  alt={t('home.place.altRoom')}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <figcaption className="studio-small absolute bottom-5 left-5 rounded-full bg-moove-lime px-3.5 py-1.5 text-moove-ink">
                  {first.caption}
                </figcaption>
              </figure>
              <div className="max-w-md" data-reveal>
                <h3 className="text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
                  {first.title}
                </h3>
                <p className="mt-3 leading-[1.55] text-moove-muted">{first.body}</p>
              </div>
            </div>

            {/* Second column sits lower, text above its photograph on wide screens */}
            <div className="flex flex-col gap-8 md:gap-12 md:pt-24">
              <figure className="about-photo relative aspect-[3/4] overflow-hidden bg-moove-elevated">
                <img
                  src="/image1.jpeg"
                  alt={t('home.place.altClass')}
                  width={1349}
                  height={1500}
                  loading="lazy"
                  className="h-full w-full object-cover"
                />
                <figcaption className="studio-small absolute bottom-5 right-5 rounded-full bg-moove-lime px-3.5 py-1.5 text-moove-ink">
                  {second.caption}
                </figcaption>
              </figure>
              <div className="max-w-md md:order-first md:ml-auto md:text-right" data-reveal>
                <h3 className="text-[clamp(1.5rem,1.1rem+1.2vw,2.25rem)] font-extrabold leading-[1.05] tracking-[-0.035em]">
                  {second.title}
                </h3>
                <p className="mt-3 leading-[1.55] text-moove-muted">{second.body}</p>
              </div>
            </div>
          </div>

          <a href={site.bookingUrl} {...bookingProps} className="studio-button mt-16 md:mt-24">
            {t('common.bookSpot')}
          </a>
        </div>
      </section>
    </div>
  )
}
