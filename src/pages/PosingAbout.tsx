import { Link } from 'react-router-dom'
import { ZoomableImage } from '../components/ZoomableImage'
import { site } from '../site'
import { posingBookingHref, posingPackagesHref } from '../hooks/useIsPosingRoute'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function PosingAboutPage() {
  const { posing } = site
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const about = dictionary.posing.about

  return (
    <div className="pose-page bg-[#08080c] text-white">
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(192, 38, 211, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 sm:py-24">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
            {t('posing.about.eyebrow')}
          </p>
          <h1 className="font-display mt-5 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-5xl">
            {about.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/72 sm:text-xl">
            {about.lead}
          </p>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
          <div className="space-y-6">
            {about.paragraphs.map((paragraph) => (
              <p key={paragraph} className="text-base leading-relaxed text-white/68 sm:text-lg">
                {paragraph}
              </p>
            ))}
            <p className="font-display pt-2 text-2xl font-semibold leading-snug text-fuchsia-100 sm:text-3xl">
              {about.closing}
            </p>
            <div className="flex flex-wrap gap-3 pt-4">
              <a
                href={posingPackagesHref}
                className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-300 to-rose-200 px-7 py-3 text-sm font-semibold text-[#160714] shadow-[0_10px_34px_-14px_rgba(244,114,182,0.85)] transition hover:brightness-110"
              >
                {t('posing.about.viewPackages')}
              </a>
              <a
                href={posingBookingHref}
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {t('posing.about.bookSession')}
              </a>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/45">
              {t('posing.hero.byCoach', vars)}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="absolute -inset-8 rounded-full bg-fuchsia-500/18 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-100/18 bg-white/[0.04] p-2 shadow-[0_32px_90px_-42px_rgba(244,114,182,0.9)]">
              <ZoomableImage
                src={posing.heroImage}
                alt={`${posing.brandName} — ${posing.brandSubtitle}`}
                wrapperClassName="block w-full cursor-zoom-in"
                className="aspect-[4/5] w-full rounded-[1.55rem] object-cover"
                width={640}
                height={800}
              />
              <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-b-[1.55rem] bg-gradient-to-t from-black/72 to-transparent px-6 pb-6 pt-20">
                <img
                  src={posing.logo}
                  alt=""
                  className="h-16 w-auto opacity-95"
                  width={160}
                  height={80}
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-14 sm:py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <p className="text-sm text-white/55">{t('posing.about.studioNote')}</p>
          <Link
            to="/posing"
            className="mt-4 inline-block text-sm font-semibold uppercase tracking-[0.16em] text-fuchsia-200/75 transition hover:text-fuchsia-100"
          >
            {t('posing.about.backToPosing')}
          </Link>
        </div>
      </section>
    </div>
  )
}
