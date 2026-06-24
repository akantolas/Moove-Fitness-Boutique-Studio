import { useState } from 'react'
import { CalPosingEmbed } from '../components/CalPosingEmbed'
import { ZoomableImage } from '../components/ZoomableImage'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function PosingPage() {
  const { posing } = site
  const { t, dictionary } = useTranslation()
  const vars = useSiteVars()
  const calUrl = posing.calLink ? `https://cal.com/${posing.calLink}` : null
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(0)
  const selectedPackage = dictionary.posing.pricing.packages[selectedPackageIndex]?.name ?? ''

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
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:min-h-[calc(100svh-4rem)] lg:grid-cols-[0.95fr_1.05fr] lg:items-center lg:gap-16 lg:py-16">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {t('posing.hero.byCoach', vars)}
            </p>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              {posing.brandName}
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.32em] text-fuchsia-100/65">
              {posing.brandSubtitle}
            </p>
            <h2 className="font-display mt-6 max-w-xl text-2xl font-semibold leading-tight text-white/92 sm:text-3xl lg:text-[2.35rem]">
              {t('posing.hero.title')}
            </h2>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-white/65">
              {t('posing.hero.body')}
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3 lg:justify-start">
              <a
                href="#packages"
                className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-300 to-rose-200 px-7 py-3 text-sm font-semibold text-[#160714] shadow-[0_10px_34px_-14px_rgba(244,114,182,0.85)] transition hover:brightness-110"
              >
                {t('posing.hero.viewPackages')}
              </a>
              <a
                href="#booking"
                className="inline-flex rounded-full border border-white/20 bg-white/5 px-7 py-3 text-sm font-medium text-white transition hover:bg-white/10"
              >
                {t('posing.hero.book')}
              </a>
            </div>
            <div className="mt-7 flex flex-wrap justify-center gap-2 lg:justify-start">
              {dictionary.posing.hero.chips.map((chip) => (
                <span
                  key={chip}
                  className="rounded-full border border-fuchsia-100/15 bg-white/[0.045] px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] text-white/58"
                >
                  {chip}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <a
                href={posing.instagram}
                target="_blank"
                rel="noreferrer noopener"
                className="text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-100/55 transition hover:text-fuchsia-100"
              >
                {t('common.instagram')}
              </a>
              {calUrl ? (
                <a
                  href={calUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="ml-5 text-xs font-semibold uppercase tracking-[0.18em] text-fuchsia-100/55 transition hover:text-fuchsia-100"
                >
                  {t('posing.hero.openCal')}
                </a>
              ) : null}
            </div>
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

      <section id="packages" className="scroll-mt-20 border-b border-white/10 bg-black/20 py-16 sm:py-20">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {t('posing.pricing.eyebrow')}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t('posing.pricing.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/60">
              {t('posing.pricing.body')}
            </p>
          </div>

          <div className="mt-10 grid gap-5 lg:grid-cols-4">
            {dictionary.posing.pricing.packages.map((pack, index) => (
              <article
                key={pack.name}
                className="relative flex min-h-[28rem] overflow-hidden rounded-2xl border border-fuchsia-200/25 bg-black shadow-[0_24px_70px_-34px_rgba(217,70,239,0.85)]"
              >
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-85"
                  style={{
                    backgroundImage: `url('${pack.backgroundImage}')`,
                  }}
                  aria-hidden
                />
                <div
                  className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,6,12,0.38),rgba(6,6,12,0.58)_48%,rgba(6,6,12,0.82)),radial-gradient(circle_at_28%_16%,rgba(244,114,182,0.18),transparent_36%)]"
                  aria-hidden
                />
                <div className="relative flex min-h-full w-full flex-col p-6 [text-shadow:0_2px_10px_rgba(0,0,0,0.85)]">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-100">
                      {pack.label}
                    </p>
                    <h3 className="font-display mt-3 text-2xl font-semibold text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.65)]">
                      {pack.name}
                    </h3>
                  </div>
                  <ul className="mt-6 flex-1 space-y-3 text-sm leading-relaxed text-white/76">
                    {pack.features.map((feature) => (
                      <li key={feature} className="flex gap-3">
                        <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-fuchsia-200/55 bg-black/35 text-[0.7rem] text-fuchsia-100">
                          ✓
                        </span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a
                    href="#booking"
                    onClick={() => setSelectedPackageIndex(index)}
                    className="mt-7 inline-flex justify-center rounded-full border border-fuchsia-100/35 bg-black/35 px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_36px_-22px_rgba(244,114,182,0.9)] backdrop-blur-sm transition hover:border-fuchsia-100/55 hover:bg-fuchsia-400/18"
                  >
                    {pack.cta}
                  </a>
                </div>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-10 max-w-5xl rounded-3xl border border-fuchsia-100/15 bg-white/[0.035] p-4 shadow-[0_24px_70px_-48px_rgba(244,114,182,0.85)] sm:p-5">
            <p className="text-center text-xs font-semibold uppercase tracking-[0.24em] text-fuchsia-200/75">
              {t('posing.pricing.includedTitle')}
            </p>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {dictionary.posing.pricing.included.map((item) => (
                <div key={item} className="flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-center text-xs font-semibold uppercase tracking-[0.14em] text-white/68">
                  <span className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-fuchsia-200/45 text-[0.65rem] text-fuchsia-100">
                    ✓
                  </span>
                  <span>{item}</span>
                </div>
              ))}
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
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {t('posing.booking.eyebrow')}
            </p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-white sm:text-4xl">
              {t('posing.booking.title')}
            </h2>
            <p className="mx-auto mt-4 max-w-lg text-sm leading-relaxed text-white/60">
              {t('posing.booking.body')}
            </p>
          </div>
          <div className="mt-10 overflow-hidden rounded-3xl border border-fuchsia-200/20 bg-white/[0.035] p-3 shadow-[0_26px_80px_-44px_rgba(217,70,239,0.85)] sm:p-5">
            <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-black/35 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-200/80">
                  {t('posing.booking.selectedLabel')}
                </p>
                <p className="font-display mt-1 text-xl font-semibold text-white">{selectedPackage}</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.14em] text-white/62">
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">
                  Cal.com
                </span>
                <span className="rounded-full border border-white/10 bg-white/8 px-3 py-2">
                  Stripe
                </span>
              </div>
            </div>
            <CalPosingEmbed calLink={posing.calLink} />
          </div>
          <p className="mx-auto mt-4 max-w-2xl text-center text-xs leading-relaxed text-white/45">
            {t('posing.booking.paymentNote')}
          </p>
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
