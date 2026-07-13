import { PageHeader } from '../components/PageHeader'
import { ZoomableImage } from '../components/ZoomableImage'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function AboutPage() {
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()

  const gallery = [
    { src: '/image3.jpeg', alt: t('about.gallery.pilates') },
    { src: '/image6.jpeg', alt: t('about.gallery.reformer') },
    { src: '/card.png', alt: site.name },
  ]

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow={t('about.eyebrow')}
        title={site.ownerName}
        description={t('about.description', vars)}
      />

      <div className="mt-14 grid gap-10 lg:grid-cols-2 lg:items-start lg:gap-12">
        <section className="overflow-hidden rounded-[1.25rem] border border-moove-border shadow-moove-soft">
          <ZoomableImage
            src="/image1.jpeg"
            alt={`${site.ownerName} — ${site.name}`}
            wrapperClassName="block w-full cursor-zoom-in"
            className="aspect-[4/5] w-full object-cover"
            width={1349}
            height={1500}
          />
        </section>

        <div className="flex flex-col gap-8">
          <section className="moove-card p-8 sm:p-10">
            <p className="moove-eyebrow">{t('about.experienceTitle')}</p>
            <div className="mt-5 space-y-4">
              {dictionary.about.paragraphs.map((paragraph) => (
                <p key={paragraph} className="text-sm leading-relaxed text-moove-muted sm:text-base">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-6 flex flex-wrap gap-2">
              {dictionary.about.highlights.map((highlight) => (
                <span
                  key={highlight}
                  className="rounded-full border border-moove-border/80 bg-moove-elevated/40 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-moove-silver"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </section>

          <section className="moove-card p-8 sm:p-10">
            <h2 className="font-display text-lg font-semibold text-moove-silver">
              {t('about.studioTitle')}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-moove-muted">{t('about.studioBody')}</p>
          </section>
        </div>
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {gallery.map((img) => (
          <div
            key={img.src}
            className="overflow-hidden rounded-2xl border border-moove-border/80 shadow-moove-lift"
          >
            <ZoomableImage
              src={img.src}
              alt={img.alt}
              wrapperClassName="block w-full cursor-zoom-in overflow-hidden"
              className="aspect-[4/3] w-full object-cover transition duration-500 hover:scale-105"
              width={400}
              height={300}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
