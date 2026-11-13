import { PageHeader } from '../components/PageHeader'
import { useReveal } from '../hooks/useReveal'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

const bookingProps = site.bookingUrl.startsWith('http') ? { target: '_blank', rel: 'noreferrer noopener' } : undefined

export function AboutPage() {
  const { t, dictionary, locale } = useTranslation()
  const vars = useSiteVars()
  const [firstParagraph, ...paragraphs] = dictionary.about.paragraphs

  useReveal()

  const gallery = [
    { src: '/image6.jpeg', alt: t('home.place.altRoom') },
    { src: '/image1.jpeg', alt: t('home.place.altClass') },
    { src: '/class-dance.jpg', alt: t('home.place.altWall') },
  ]

  return (
    <div className="studio">
      {/* Magda beside her name */}
      <section className="studio-frame studio-grid gap-y-10 pt-[clamp(3rem,2rem+4vw,6rem)] md:items-end">
        <div className="col-span-12 md:col-span-7">
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
        </div>
        <div className="col-span-12 md:col-span-5">
          <img
            src="/magda-4x5.jpg"
            alt={t('home.magda.portraitAlt')}
            width={620}
            height={775}
            fetchPriority="high"
            className="aspect-[4/5] w-full object-cover"
          />
        </div>
      </section>

      {/* Her background, the first paragraph as the lead */}
      <section className="studio-frame studio-grid gap-y-8 py-[var(--section-gap)]">
        <div className="col-span-12 md:col-span-4" data-reveal>
          <h2 className="studio-head">{t('about.experienceTitle')}</h2>
        </div>
        <div className="col-span-12 space-y-6 md:col-span-8" data-reveal>
          <p className="studio-lead max-w-[30ch]">{firstParagraph}</p>
          {paragraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-[60ch] leading-[1.6] text-moove-muted">
              {paragraph}
            </p>
          ))}
        </div>
      </section>

      {/* The studio itself, on black */}
      <section className="bg-moove-espresso text-white">
        <div className="studio-frame py-[clamp(4rem,2rem+6vw,8rem)]">
          <div className="studio-grid gap-y-6 md:items-end" data-reveal>
            <h2 className="studio-head col-span-12 md:col-span-5">{t('about.studioTitle')}</h2>
            <p className="studio-lead col-span-12 max-w-[30ch] text-white/80 md:col-span-6 md:col-start-7">
              {t('about.studioBody')}
            </p>
          </div>
          <div className="mt-14 grid gap-2 sm:grid-cols-3">
            {gallery.map((img) => (
              <img
                key={img.src}
                src={img.src}
                alt={img.alt}
                loading="lazy"
                className="aspect-[4/5] w-full object-cover"
              />
            ))}
          </div>
          <a href={site.bookingUrl} {...bookingProps} className="studio-button mt-12">
            {t('common.bookSpot')}
          </a>
        </div>
      </section>
    </div>
  )
}
