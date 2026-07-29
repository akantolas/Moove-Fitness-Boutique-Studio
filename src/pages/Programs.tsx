import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mooveProgramCatalog, type MooveProgramKey } from '../data/moovePrograms'
import { createProgramOrder, fetchProgramOrderStatus } from '../lib/programsApi'
import { useTranslation } from '../i18n/useTranslation'

type OrderState = 'idle' | 'submitting' | 'error'

export function ProgramsPage() {
  const { t, locale, dictionary } = useTranslation()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const purchaseRef = searchParams.get('purchase') ?? ''

  const [selectedKey, setSelectedKey] = useState<MooveProgramKey | null>(null)
  const [checkoutProgram, setCheckoutProgram] = useState<(typeof mooveProgramCatalog)[number] | null>(null)
  const [email, setEmail] = useState('')
  const [orderState, setOrderState] = useState<OrderState>('idle')
  const [orderError, setOrderError] = useState('')
  const [pollStatus, setPollStatus] = useState<string | null>(null)

  useEffect(() => {
    if (!paymentSuccess || !purchaseRef) return

    let attempts = 0
    const maxAttempts = 15
    const interval = window.setInterval(() => {
      attempts += 1
      fetchProgramOrderStatus(purchaseRef)
        .then((data) => setPollStatus(data.status))
        .catch(() => {
          /* ignore poll errors */
        })
      if (attempts >= maxAttempts) window.clearInterval(interval)
    }, 2000)

    return () => window.clearInterval(interval)
  }, [paymentSuccess, purchaseRef])

  useEffect(() => {
    if (!checkoutProgram) return

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape' && orderState !== 'submitting') {
        setCheckoutProgram(null)
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [checkoutProgram, orderState])

  function openCheckout(program: (typeof mooveProgramCatalog)[number]) {
    setCheckoutProgram(program)
    setSelectedKey(program.key)
    setOrderState('idle')
    setOrderError('')
  }

  async function handleOrder(programKey: MooveProgramKey) {
    if (!email.trim()) {
      setOrderError(t('programs.order.invalidEmail'))
      return
    }

    setSelectedKey(programKey)
    setOrderState('submitting')
    setOrderError('')
    try {
      const result = await createProgramOrder({
        programKey,
        email: email.trim(),
        locale,
      })
      window.location.assign(result.checkoutUrl)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'order_failed'
      setOrderError(t(`programs.order.errors.${code}`) || code)
      setOrderState('error')
    }
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-moove-border/80">
        <div className="programs-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="pointer-events-none absolute -right-20 top-8 h-72 w-72 rounded-full bg-moove-lime/15 blur-3xl" aria-hidden />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center lg:py-24">
          <div className="animate-fade-up">
            <p className="moove-eyebrow">{t('programs.eyebrow')}</p>
            <h1 className="font-display mt-5 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-tight text-moove-silver sm:text-5xl lg:text-[3.5rem]">
              {t('programs.title')}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-moove-muted sm:text-lg">
              {t('programs.description')}
            </p>
            <a
              href="#programs"
              className="mt-9 inline-flex items-center rounded-full bg-moove-espresso px-6 py-3 text-sm font-semibold text-moove-lime transition hover:brightness-110"
            >
              {t('programs.heroCta')}
              <span className="ml-2" aria-hidden>↓</span>
            </a>
            <ul className="mt-10 grid gap-3 text-sm text-moove-silver sm:grid-cols-3">
              {Object.values(dictionary.programs.proof).map((proof) => (
                <li key={proof} className="flex items-start gap-2">
                  <span className="mt-1 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-moove-lime text-[10px] text-moove-espresso">✓</span>
                  <span>{proof}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="animate-fade-up relative mx-auto w-full max-w-md [animation-delay:120ms] lg:max-w-none">
            <div className="programs-cover relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/40 shadow-moove-soft">
              <img
                src="/image4.jpeg"
                alt={t('programs.heroImageAlt')}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-moove-espresso/85 via-moove-espresso/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-7 sm:p-8">
                <span className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-moove-lime backdrop-blur">
                  {t('programs.heroBadge')}
                </span>
                <p className="font-display mt-4 text-2xl font-semibold text-white sm:text-3xl">Peach Collection</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
        {paymentSuccess ? (
          <div className="rounded-2xl border border-moove-lime/30 bg-moove-lime/10 p-6">
            <p className="font-display text-lg font-semibold text-moove-silver">{t('programs.paymentSuccess.title')}</p>
            <p className="mt-2 text-sm text-moove-muted">
              {pollStatus === 'paid' ? t('programs.paymentSuccess.paid') : t('programs.paymentSuccess.body')}
            </p>
          </div>
        ) : null}

        <section id="programs" className="scroll-mt-24">
          {(['collection', 'sculpt', 'build'] as const).map((collectionKey) => {
            const collection = dictionary.programs.collections[collectionKey]
            const programs = mooveProgramCatalog.filter((program) => program.collectionKey === collectionKey)

            return (
              <div key={collectionKey} className="mt-20 first:mt-16">
                <div className="max-w-2xl">
                  <p className="moove-eyebrow">{collection.eyebrow}</p>
                  <h2 className="font-display mt-3 text-3xl font-semibold text-moove-silver sm:text-4xl">{collection.title}</h2>
                  <p className="mt-3 text-moove-muted">{collection.body}</p>
                </div>
                <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                  {programs.map((program) => {
                    const item = dictionary.programs.items[program.key]
                    const title = item?.title ?? program.key

                    return (
                      <article
                        key={program.key}
                        className={`group programs-card relative flex flex-col overflow-hidden rounded-[1.5rem] border transition duration-300 hover:-translate-y-1 hover:shadow-moove-soft ${
                          program.featured
                            ? 'border-moove-lime/60 bg-moove-espresso text-white'
                            : 'border-moove-border/80 bg-moove-surface'
                        }`}
                      >
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <img
                            src={program.imagePath}
                            alt=""
                            className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]"
                            style={{ objectPosition: program.imagePosition }}
                          />
                          <div className={`absolute inset-0 ${program.featured ? 'bg-moove-espresso/45' : 'bg-moove-espresso/20'}`} />
                          {program.featured ? (
                            <span className="absolute left-5 top-5 rounded-full bg-moove-lime px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-moove-espresso">
                              {t('programs.featured')}
                            </span>
                          ) : null}
                        </div>

                        <div className="flex flex-1 flex-col p-6 sm:p-7">
                          <p className={`text-[10px] font-semibold uppercase tracking-[0.2em] ${program.featured ? 'text-moove-lime' : 'text-moove-accent'}`}>
                            {t(`programs.benefits.${program.benefitKey}`)}
                          </p>
                          <h3 className={`font-display mt-3 text-2xl font-semibold leading-[1.13] ${program.featured ? 'text-white' : 'text-moove-silver'}`}>
                            {title}
                          </h3>
                          <p className={`mt-3 flex-1 text-sm leading-relaxed ${program.featured ? 'text-moove-glow/90' : 'text-moove-muted'}`}>
                            {t(`programs.outcomes.${program.outcomeKey}`)}
                          </p>

                          <div className="mt-7 flex flex-wrap gap-2">
                            <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${program.featured ? 'border-white/20 text-white/90' : 'border-moove-border/80 text-moove-silver'}`}>
                              {t(`programs.levels.${program.levelKey}`)}
                            </span>
                            <span className={`rounded-full border px-3 py-1.5 text-xs font-medium ${program.featured ? 'border-white/20 text-white/90' : 'border-moove-border/80 text-moove-silver'}`}>
                              {t(`programs.durations.${program.durationKey}`)}
                            </span>
                          </div>

                          <div className={`mt-6 flex items-center justify-between border-t pt-5 ${program.featured ? 'border-white/15' : 'border-moove-border/80'}`}>
                            <div>
                              <p className={`text-[10px] font-semibold uppercase tracking-[0.16em] ${program.featured ? 'text-white/50' : 'text-moove-muted/70'}`}>
                                {t('programs.priceLabel')}
                              </p>
                              <p className={`mt-1 font-display text-2xl font-semibold ${program.featured ? 'text-moove-lime' : 'text-moove-silver'}`}>
                                {program.priceEur}€
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() => openCheckout(program)}
                              className={`rounded-full px-4 py-2.5 text-xs font-semibold transition ${
                                program.featured
                                  ? 'bg-moove-lime text-moove-espresso hover:bg-moove-lime-hover'
                                  : 'border border-moove-espresso bg-moove-espresso text-moove-lime hover:brightness-110'
                              }`}
                            >
                              {t('programs.order.cta')}
                            </button>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </section>

        <section className="mt-20 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[1.75rem] border border-moove-border/80 bg-moove-elevated/50 p-7 sm:p-9">
            <p className="moove-eyebrow">{t('programs.includes.eyebrow')}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-moove-silver">{t('programs.includes.title')}</h2>
            <ul className="mt-7 space-y-4">
              {dictionary.programs.includes.items.map((item) => (
                <li key={item} className="flex gap-3 text-sm leading-relaxed text-moove-muted">
                  <span className="mt-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-moove-lime text-xs text-moove-espresso">✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-[1.75rem] bg-moove-espresso p-7 text-white sm:p-9">
            <p className="moove-eyebrow !text-moove-lime">{t('programs.delivery.eyebrow')}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold">{t('programs.delivery.title')}</h2>
            <ol className="mt-7 space-y-5">
              {dictionary.programs.delivery.steps.map((step, index) => (
                <li key={step.title} className="flex gap-4">
                  <span className="font-display text-2xl text-moove-lime/80">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3 className="font-semibold">{step.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-moove-glow/90">{step.body}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>
      </main>

      {checkoutProgram ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-moove-espresso/55 p-4 backdrop-blur-sm sm:items-center sm:p-6"
          role="presentation"
          onMouseDown={() => {
            if (orderState !== 'submitting') setCheckoutProgram(null)
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="program-checkout-title"
            className="w-full max-w-lg rounded-[1.75rem] border border-white/60 bg-moove-surface p-6 shadow-moove-soft sm:p-8"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-5">
              <div>
                <p className="moove-eyebrow">{t('programs.purchase.eyebrow')}</p>
                <h2 id="program-checkout-title" className="font-display mt-3 text-2xl font-semibold text-moove-silver">
                  {t('programs.purchase.title')}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setCheckoutProgram(null)}
                disabled={orderState === 'submitting'}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-moove-border text-lg text-moove-muted transition hover:border-moove-espresso hover:text-moove-espresso disabled:opacity-50"
                aria-label={t('common.close')}
              >
                ×
              </button>
            </div>

            <div className="mt-6 rounded-2xl border border-moove-lime/30 bg-moove-lime/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-moove-accent">
                {t('programs.priceLabel')}
              </p>
              <div className="mt-2 flex items-end justify-between gap-4">
                <p className="font-display text-lg font-semibold text-moove-silver">
                  {dictionary.programs.items[checkoutProgram.key]?.title ?? checkoutProgram.key}
                </p>
                <span className="shrink-0 text-lg font-bold text-moove-espresso">{checkoutProgram.priceEur}€</span>
              </div>
            </div>

            <p className="mt-5 text-sm leading-relaxed text-moove-muted">{t('programs.purchase.body')}</p>
            <div className="mt-5 rounded-xl border border-moove-border/70 bg-moove-elevated/45 px-4 py-3 text-sm font-medium text-moove-silver">
              {t('programs.purchase.paymentMethod')}
            </div>
            <label className="mt-6 block text-sm font-semibold text-moove-silver" htmlFor="program-email">
              {t('programs.order.emailLabel')}
            </label>
            <input
              id="program-email"
              type="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t('programs.order.emailPlaceholder')}
              className="mt-2 w-full rounded-xl border border-moove-border/80 bg-white px-4 py-3.5 text-sm text-moove-silver outline-none ring-moove-lime/40 focus:ring-2"
            />
            <p className="mt-3 text-xs leading-relaxed text-moove-muted">{t('programs.order.hint')}</p>

            {orderError ? (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {orderError}
              </p>
            ) : null}

            <button
              type="button"
              disabled={orderState === 'submitting'}
              onClick={() => void handleOrder(checkoutProgram.key)}
              className="mt-7 inline-flex w-full items-center justify-center rounded-full bg-moove-espresso px-6 py-3.5 text-sm font-semibold text-moove-lime transition hover:brightness-110 disabled:opacity-60"
            >
              {orderState === 'submitting' && selectedKey === checkoutProgram.key
                ? t('programs.order.submitting')
                : t('programs.order.cta')}
            </button>
          </section>
        </div>
      ) : null}
    </>
  )
}
