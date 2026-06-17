import { CalPosingEmbed } from '../components/CalPosingEmbed'
import { ZoomableImage } from '../components/ZoomableImage'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function PosingPage() {
  const { posing } = site
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const calUrl = posing.calLink ? `https://cal.com/${posing.calLink}` : null

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
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-2 lg:items-center lg:gap-16 lg:py-24">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <div className="w-full max-w-[17rem] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-2 shadow-[0_24px_64px_-24px_rgba(192,38,211,0.35)] sm:max-w-xs">
              <ZoomableImage
                src={posing.heroImage}
                alt={`${posing.brandName} — ${posing.brandSubtitle}`}
                wrapperClassName="block w-full cursor-zoom-in"
                className="h-auto w-full rounded-[1.35rem] object-cover"
                width={400}
                height={520}
              />
            </div>
            <p className="mt-8 text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
              {t('posing.hero.byCoach', vars)}
            </p>
            <h1 className="font-display mt-4 text-3xl font-semibold leading-tight text-white sm:text-4xl lg:text-[2.35rem]">
              {t('posing.hero.title')}
            </h1>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
              {t('posing.hero.body')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <a
                href="#booking"
                className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_32px_-8px_rgba(192,38,211,0.55)] transition hover:brightness-110"
              >
                {t('posing.hero.book')}
              </a>
              <a
                href={posing.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {t('common.instagram')}
              </a>
              {calUrl ? (
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                >
                  {t('posing.hero.openCal')}
                </a>
              ) : null}
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-2 shadow-[0_24px_64px_-24px_rgba(192,38,211,0.35)]">
              <ZoomableImage
                src={posing.logo}
                alt=""
                wrapperClassName="block w-full cursor-zoom-in"
                className="w-full rounded-[1.35rem] object-cover"
                width={600}
                height={780}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {t('posing.service.eyebrow')}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t('posing.service.title')}
            </h2>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {dictionary.posing.service.items.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-white/10 bg-white/[0.04] p-8 backdrop-blur-sm"
              >
                <h3 className="font-display text-xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-b border-white/10 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="font-display text-center text-3xl font-semibold text-white sm:text-4xl">
            {t('posing.how.title')}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {dictionary.posing.how.steps.map((step, i) => (
              <div key={step.title} className="text-center md:text-left">
                <span className="font-display text-3xl font-semibold text-fuchsia-400/40">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <h3 className="font-display mt-3 text-lg font-semibold text-white">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-white/60">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="booking" className="scroll-mt-20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-cyan-300/90">
              {t('posing.booking.eyebrow')}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t('posing.booking.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
              {t('posing.booking.body')}
            </p>
          </div>
          <div className="mt-10">
            <CalPosingEmbed calLink={posing.calLink} />
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 bg-black/30 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <h2 className="font-display text-center text-2xl font-semibold text-white sm:text-3xl">
            {t('posing.faq.title')}
          </h2>
          <dl className="mt-10 space-y-6">
            {dictionary.posing.faq.items.map((item) => (
              <div
                key={item.q}
                className="rounded-2xl border border-white/10 bg-white/[0.03] px-6 py-5"
              >
                <dt className="font-medium text-white">{item.q}</dt>
                <dd className="mt-2 text-sm leading-relaxed text-white/60">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </div>
  )
}
