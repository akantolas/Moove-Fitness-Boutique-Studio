import { PageHeader } from '../components/PageHeader'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function AboutPage() {
  const { t } = useTranslation()
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

      <div className="mt-14 grid gap-8 lg:grid-cols-2 lg:items-start">
        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-2xl font-semibold text-moove-silver">
            {t('about.philosophyTitle')}
          </h2>
          <p className="mt-5 text-sm leading-relaxed text-moove-muted sm:text-base">
            {t('about.philosophy1', vars)}
          </p>
          <p className="mt-4 text-sm leading-relaxed text-moove-muted sm:text-base">
            {t('about.philosophy2')}
          </p>
        </section>

        <section className="overflow-hidden rounded-[1.25rem] border border-moove-border shadow-moove-soft">
          <img
            src="/image1.jpeg"
            alt={`${site.ownerName} — ${site.name}`}
            className="h-auto w-full"
            width={1349}
            height={1500}
          />
          <div className="bg-moove-surface/95 px-6 py-5">
            <h2 className="font-display text-lg font-semibold text-moove-silver">
              {t('about.studioTitle')}
            </h2>
            <p className="mt-2 text-sm text-moove-muted">{t('about.studioBody')}</p>
          </div>
        </section>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {gallery.map((img) => (
          <div
            key={img.src}
            className="overflow-hidden rounded-2xl border border-moove-border/80 shadow-moove-lift"
          >
            <img
              src={img.src}
              alt={img.alt}
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
