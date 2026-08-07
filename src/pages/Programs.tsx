import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { NutritionQuestionnaire } from '../components/NutritionQuestionnaire'
import {
  formatProgramPrice,
  mooveProgramCatalog,
  type MooveProgramKey,
} from '../data/moovePrograms'
import { createProgramOrder, fetchProgramOrderStatus } from '../lib/programsApi'
import type { NutritionResponses } from '../lib/nutritionTypes'
import { ProgramShowcase } from '../components/ProgramShowcase'
import { SiteContainer } from '../components/SiteContainer'
import { useTranslation } from '../i18n/useTranslation'

type OrderState = 'idle' | 'submitting' | 'error'

const NUTRITION_ADDON_CENTS = 2500

export function ProgramsPage() {
  const { t, locale, dictionary } = useTranslation()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const purchaseRef = searchParams.get('purchase') ?? ''

  const [selectedKey, setSelectedKey] = useState<MooveProgramKey | null>(null)
  const [checkoutProgram, setCheckoutProgram] = useState<(typeof mooveProgramCatalog)[number] | null>(null)
  const [email, setEmail] = useState('')
  const [includeNutrition, setIncludeNutrition] = useState(false)
  const [showQuestionnaire, setShowQuestionnaire] = useState(false)
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
    setShowQuestionnaire(false)
    setOrderState('idle')
    setOrderError('')
  }

  async function handleOrder(programKey: MooveProgramKey, nutritionResponses?: NutritionResponses) {
    if (!email.trim()) {
      setOrderError(t('programs.order.invalidEmail'))
      return
    }

    if (includeNutrition && !nutritionResponses) {
      setShowQuestionnaire(true)
      setOrderError('')
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
        includeNutrition: Boolean(nutritionResponses),
        nutritionResponses,
      })
      window.location.assign(result.checkoutUrl)
    } catch (err) {
      const code = err instanceof Error ? err.message : 'order_failed'
      setOrderError(t(`programs.order.errors.${code}`) || code)
      setOrderState('error')
    }
  }

  function checkoutTotalCents(program: (typeof mooveProgramCatalog)[number]) {
    return program.priceCents + (includeNutrition ? NUTRITION_ADDON_CENTS : 0)
  }

  return (
    <>
      <section className="relative overflow-hidden border-b border-moove-border/80">
        <div className="programs-hero-grid pointer-events-none absolute inset-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 opacity-90"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 65% 55% at 10% 25%, rgba(196, 240, 49, 0.16) 0%, transparent 52%), radial-gradient(circle at 88% 12%, rgba(232, 180, 160, 0.38) 0%, transparent 38%)',
          }}
          aria-hidden
        />
        <SiteContainer className="relative grid gap-8 py-10 sm:py-12 lg:grid-cols-[1.08fr_0.92fr] lg:items-start lg:py-14 xl:gap-12">
          <div className="animate-fade-up">
            <p className="moove-eyebrow">{t('programs.eyebrow')}</p>
            <div className="moove-rule mt-4" aria-hidden />
            <h1 className="font-display mt-4 max-w-2xl text-4xl font-semibold leading-[1.06] tracking-tight text-moove-silver sm:text-5xl lg:text-[3.5rem]">
              {t('programs.title')}
              <span className="mt-1 block text-gradient-lime sm:mt-2">{t('programs.titleAccent')}</span>
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-moove-muted sm:text-lg">
              {t('programs.description')}
            </p>
            <a
              href="#programs"
              className="mt-7 inline-flex items-center rounded-full bg-moove-espresso px-6 py-3 text-sm font-semibold text-moove-lime shadow-moove-lift transition hover:-translate-y-0.5 hover:brightness-110"
            >
              {t('programs.heroCta')}
              <span className="ml-2" aria-hidden>↓</span>
            </a>
            <dl className="mt-8 grid gap-4 border-t border-moove-border/70 pt-6 sm:grid-cols-3">
              {Object.values(dictionary.programs.proof).map((proof) => (
                <div key={proof}>
                  <dt className="font-display text-sm font-semibold text-moove-silver sm:text-base">{proof}</dt>
                </div>
              ))}
            </dl>
          </div>

          <div className="moove-hero-breakout animate-fade-up relative mx-auto w-full max-w-md [animation-delay:120ms] lg:max-w-none">
            <div
              className="pointer-events-none absolute -right-4 -top-4 -z-10 h-32 w-32 rounded-full bg-moove-lime/20 blur-2xl"
              aria-hidden
            />
            <div className="programs-cover relative aspect-[4/5] overflow-hidden rounded-[2rem] border border-white/40 shadow-moove-soft ring-1 ring-moove-lime/20">
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
        </SiteContainer>
      </section>

      <SiteContainer as="main" className="pb-14 pt-8 sm:pb-16 sm:pt-10">
        {paymentSuccess ? (
          <div className="rounded-2xl border border-moove-lime/30 bg-moove-lime/10 p-6">
            <p className="font-display text-lg font-semibold text-moove-silver">{t('programs.paymentSuccess.title')}</p>
            <p className="mt-2 text-sm text-moove-muted">
              {pollStatus === 'paid' ? t('programs.paymentSuccess.paid') : t('programs.paymentSuccess.body')}
            </p>
          </div>
        ) : null}

        <section id="programs" className="scroll-mt-24">
          <div className="max-w-2xl">
            <p className="moove-eyebrow">{t('programs.catalog.eyebrow')}</p>
            <h2 className="font-display mt-3 text-3xl font-semibold text-moove-silver sm:text-4xl">
              {t('programs.catalog.title')}
            </h2>
            <p className="mt-3 text-moove-muted">{t('programs.catalog.body')}</p>
          </div>

          <ProgramShowcase
            programs={mooveProgramCatalog}
            copy={dictionary.programs.items}
            onPurchase={openCheckout}
          />
        </section>

        <section className="mt-14 grid gap-5 sm:mt-16 lg:grid-cols-[1.2fr_0.8fr] xl:gap-8">
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
      </SiteContainer>

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
            className={`w-full max-w-lg rounded-[1.75rem] border border-white/60 bg-moove-surface p-6 shadow-moove-soft sm:p-8${showQuestionnaire ? ' max-h-[90vh] overflow-y-auto' : ''}`}
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
                <div className="shrink-0 text-right">
                  <span className="text-lg font-bold text-moove-espresso">
                    {formatProgramPrice(checkoutTotalCents(checkoutProgram), locale)}
                  </span>
                  <p className="mt-1 text-[10px] text-moove-muted">{t('programs.vatIncluded')}</p>
                </div>
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

            {!showQuestionnaire ? (
              <>
                <label className="mt-5 flex cursor-pointer items-start gap-3 text-sm text-moove-silver">
                  <input
                    type="checkbox"
                    checked={includeNutrition}
                    onChange={(event) => setIncludeNutrition(event.target.checked)}
                    className="mt-1 rounded border-moove-border text-moove-espresso focus:ring-moove-lime"
                  />
                  <span>{t('programs.order.nutritionAddon', { price: NUTRITION_ADDON_CENTS / 100 })}</span>
                </label>
                <p className="mt-2 text-xs text-moove-muted">{t('programs.order.nutritionAddonHint')}</p>
              </>
            ) : null}

            {showQuestionnaire ? (
              <div className="mt-6">
                <h3 className="font-display text-lg font-semibold text-moove-silver">
                  {t('programs.order.nutritionQuestionnaireTitle')}
                </h3>
                <p className="mt-2 text-sm text-moove-muted">{t('programs.order.nutritionQuestionnaireHint')}</p>
                <div className="mt-4">
                  <NutritionQuestionnaire
                    email={email}
                    hideEmail
                    busy={orderState === 'submitting'}
                    onComplete={(responses) => void handleOrder(checkoutProgram.key, responses)}
                    submitLabel={
                      orderState === 'submitting' ? t('programs.order.submitting') : t('programs.order.cta')
                    }
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setShowQuestionnaire(false)}
                  disabled={orderState === 'submitting'}
                  className="mt-4 text-sm text-moove-muted underline disabled:opacity-50"
                >
                  {t('programs.order.cancelNutrition')}
                </button>
              </div>
            ) : null}

            {orderError ? (
              <p className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
                {orderError}
              </p>
            ) : null}

            {!showQuestionnaire ? (
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
            ) : null}
          </section>
        </div>
      ) : null}
    </>
  )
}
