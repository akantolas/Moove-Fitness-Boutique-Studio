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
            <p className="mt-5 text-sm leading-relaxed text-moove-muted sm:text-base">
              {t('about.experienceBody')}
            </p>
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

      <section className="mt-16 border-t border-moove-border/80 pt-16 sm:pt-20">
        <div className="mx-auto max-w-2xl text-center">
          <p className="moove-eyebrow">{t('about.specializationsTitle')}</p>
          <div className="moove-rule mx-auto mt-6" aria-hidden />
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2">
          {dictionary.about.specializations.map((item, i) => (
            <article
              key={item.title}
              className="group moove-card p-8 transition duration-300 hover:-translate-y-1 hover:shadow-moove-soft"
            >
              <span className="font-display text-3xl font-semibold text-moove-lime/50 transition group-hover:text-moove-lime/80">
                {String(i + 1).padStart(2, '0')}
              </span>
              <h3 className="font-display mt-4 text-xl font-semibold text-moove-silver">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-moove-muted">{item.body}</p>
            </article>
          ))}
        </div>
      </section>

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
