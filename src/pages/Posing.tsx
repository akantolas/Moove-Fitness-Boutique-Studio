import { useEffect, useMemo, useState } from 'react'
import { useLocation, useSearchParams } from 'react-router-dom'
import { PoseBookingCalendar } from '../components/PoseBookingCalendar'
import { PosingOffersModal } from '../components/PosingOffersModal'
import { PosingOffersSection } from '../components/PosingOffersSection'
import { PosingPackagesCarousel } from '../components/PosingPackagesCarousel'
import { ZoomableImage } from '../components/ZoomableImage'
import { fetchPackagePlan } from '../lib/posingPackages'
import { hasSeenOffersPopup, isJulyOfferActive } from '../lib/posingOffers'
import { isPosingPlanKey, planKeyLabel } from '../lib/posingLabels'
import { site, type PosingOfferPlanKey, type PosingPackageKey, type PosingPlanKey } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

const posingHeroGhostCtaClass =
  'inline-flex items-center justify-center rounded-full border border-white/14 bg-white/[0.035] px-7 py-3 text-sm font-semibold text-white/78 shadow-[0_10px_30px_-24px_rgba(244,114,182,0.55)] backdrop-blur-md transition-all duration-200 hover:border-fuchsia-100/28 hover:bg-white/[0.06] hover:text-white'

function packageIndexFromParam(param: string | null, keys: readonly PosingPackageKey[]) {
  if (!param) return 0
  const idx = keys.indexOf(param as PosingPackageKey)
  return idx >= 0 ? idx : 0
}

function planKeyFromSearchParams(
  searchParams: URLSearchParams,
  packageKeys: readonly PosingPackageKey[],
): PosingPlanKey {
  const planParam = searchParams.get('plan')
  if (planParam && isPosingPlanKey(planParam)) return planParam
  const packageParam = searchParams.get('package')
  const idx = packageIndexFromParam(packageParam, packageKeys)
  return packageKeys[idx] ?? packageKeys[0]
}

export function PosingPage() {
  const { posing } = site
  const { t, dictionary, locale } = useTranslation()
  const vars = useSiteVars()
  const [searchParams] = useSearchParams()
  const location = useLocation()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const accountDeleted = Boolean(
    (location.state as { accountDeleted?: boolean } | null)?.accountDeleted,
  )
  const [selectedPackageIndex, setSelectedPackageIndex] = useState(() =>
    packageIndexFromParam(searchParams.get('package'), posing.packageKeys),
  )
  const [selectedPlanKey, setSelectedPlanKey] = useState<PosingPlanKey>(() =>
    planKeyFromSearchParams(searchParams, posing.packageKeys),
  )
  const [sessionsTotal, setSessionsTotal] = useState<number | null>(null)
  const [offersModalOpen, setOffersModalOpen] = useState(false)

  const selectedPackageName = useMemo(
    () =>
      planKeyLabel(selectedPlanKey, (i) => dictionary.posing.pricing.packages[i]?.name, t),
    [selectedPlanKey, dictionary.posing.pricing.packages, t],
  )

  useEffect(() => {
    if (!isJulyOfferActive()) return
    if (!hasSeenOffersPopup()) setOffersModalOpen(true)
  }, [])

  useEffect(() => {
    const param = searchParams.get('package')
    const idx = packageIndexFromParam(param, posing.packageKeys)
    setSelectedPackageIndex(idx)

    const planParam = searchParams.get('plan')
    if (planParam && isPosingPlanKey(planParam)) {
      setSelectedPlanKey(planParam)
    } else if (param) {
      setSelectedPlanKey(posing.packageKeys[idx] ?? posing.packageKeys[0])
    }
  }, [searchParams, posing.packageKeys])

  useEffect(() => {
    let cancelled = false
    fetchPackagePlan(selectedPlanKey).then((plan) => {
      if (!cancelled) setSessionsTotal(plan?.sessions_total ?? null)
    })
    return () => {
      cancelled = true
    }
  }, [selectedPlanKey])

  function handleCarouselSelect(index: number) {
    setSelectedPackageIndex(index)
    setSelectedPlanKey(posing.packageKeys[index] ?? posing.packageKeys[0])
  }

  function handleOfferSelect(planKey: PosingOfferPlanKey) {
    setSelectedPlanKey(planKey)
  }

  return (
    <div className="pose-page bg-[#08080c] text-white">
      <PosingOffersModal
        open={offersModalOpen}
        onClose={() => setOffersModalOpen(false)}
        onSelectOffer={handleOfferSelect}
      />
      {accountDeleted ? (
        <div className="border-b border-emerald-300/20 bg-emerald-400/10 px-4 py-3 text-center text-sm text-emerald-100">
          {t('posing.account.deleteSuccess')}
        </div>
      ) : null}
      <section className="relative overflow-hidden border-b border-white/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 60% at 20% 0%, rgba(192, 38, 211, 0.22) 0%, transparent 55%), radial-gradient(circle at 85% 20%, rgba(34, 211, 238, 0.15) 0%, transparent 45%)',
          }}
          aria-hidden
        />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-10 sm:px-6 sm:py-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start lg:gap-12 lg:py-10">
          <div className="order-2 flex flex-col items-center text-center lg:order-1 lg:items-start lg:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
              {t('posing.hero.byCoach', vars)}
            </p>
            <h1 className="font-display mt-5 text-5xl font-semibold leading-[0.95] text-white sm:text-6xl lg:text-7xl">
              {posing.brandName}
            </h1>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.32em] text-fuchsia-100/65">
              {t('footer.posingSubtitle')}
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
              {isJulyOfferActive() ? (
                <a href="#offers" className={posingHeroGhostCtaClass}>
                  {t('posing.offers.heroCta')}
                </a>
              ) : null}
              <a href="#booking" className={posingHeroGhostCtaClass}>
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
          </div>

          <div className="relative order-1 mx-auto w-full max-w-md lg:order-2 lg:max-w-none">
            <div className="absolute -inset-8 rounded-full bg-fuchsia-500/18 blur-3xl" aria-hidden />
            <div className="relative overflow-hidden rounded-[2rem] border border-fuchsia-100/18 bg-white/[0.04] p-2 shadow-[0_32px_90px_-42px_rgba(244,114,182,0.9)]">
              <ZoomableImage
                src={posing.heroImage}
                alt={`${posing.brandName} — ${t('footer.posingSubtitle')}`}
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

          <PosingPackagesCarousel
            packages={dictionary.posing.pricing.packages}
            packageKeys={posing.packageKeys}
            activeIndex={selectedPackageIndex}
            onSelect={handleCarouselSelect}
          />

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

      <PosingOffersSection onSelectOffer={handleOfferSelect} />

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

          <div className="relative mt-10 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/[0.03] px-6 py-8 sm:px-10 sm:py-10">
            <div
              className="pointer-events-none absolute inset-0 opacity-80"
              style={{
                backgroundImage:
                  'radial-gradient(ellipse 70% 80% at 50% 0%, rgba(192, 38, 211, 0.16) 0%, transparent 55%)',
              }}
              aria-hidden
            />
            <div className="relative text-center">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
                {dictionary.posing.service.federations.eyebrow}
              </p>
              <h3 className="font-display mt-3 text-xl font-semibold text-white sm:text-2xl">
                {dictionary.posing.service.federations.title}
              </h3>
              <ul className="mt-7 flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
                {dictionary.posing.service.federations.names.map((name) => (
                  <li
                    key={name}
                    className="rounded-full border border-white/15 bg-white/[0.04] px-4 py-2 font-display text-xs font-semibold tracking-[0.18em] text-white/85 transition hover:border-fuchsia-300/40 hover:text-fuchsia-100 sm:px-5 sm:text-sm"
                  >
                    {name}
                  </li>
                ))}
              </ul>
            </div>
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
          {paymentSuccess ? (
            <div className="mx-auto mb-8 max-w-2xl rounded-2xl border border-emerald-300/25 bg-emerald-400/10 px-5 py-4 text-center text-sm leading-relaxed text-emerald-100">
              {t('posing.booking.paymentSuccess')}
            </div>
          ) : null}
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
            <div className="mb-4 rounded-2xl border border-fuchsia-200/30 bg-black/35 px-4 py-4">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-fuchsia-200/80">
                {t('posing.booking.selectedLabel')}
              </p>
              <p className="font-display mt-1 text-xl font-semibold text-white">{selectedPackageName}</p>
              {sessionsTotal != null ? (
                <p className="mt-1 text-sm text-fuchsia-100/75">
                  {t('posing.booking.sessionsIncluded', { count: sessionsTotal })}
                </p>
              ) : null}
            </div>
            <PoseBookingCalendar
              selectedPlanKey={selectedPlanKey}
              selectedPackageName={selectedPackageName}
              locale={locale}
            />
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
