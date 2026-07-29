import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { mooveProgramCatalog, type MooveProgramKey } from '../data/moovePrograms'
import { createProgramOrder, fetchProgramOrderStatus } from '../lib/programsApi'
import { useTranslation } from '../i18n/useTranslation'

type OrderState = 'idle' | 'submitting' | 'success' | 'error'

export function ProgramsPage() {
  const { t, locale, dictionary } = useTranslation()
  const [searchParams] = useSearchParams()
  const paymentSuccess = searchParams.get('payment') === 'success'
  const purchaseRef = searchParams.get('purchase') ?? ''

  const [selectedKey, setSelectedKey] = useState<MooveProgramKey>(
    mooveProgramCatalog[0]?.key ?? 'peach_start',
  )
  const [email, setEmail] = useState('')
  const [orderState, setOrderState] = useState<OrderState>('idle')
  const [orderError, setOrderError] = useState('')
  const [orderRef, setOrderRef] = useState('')
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
      setOrderRef(result.purchaseRef)
      setOrderState('success')
    } catch (err) {
      const code = err instanceof Error ? err.message : 'order_failed'
      setOrderError(t(`programs.order.errors.${code}`) || code)
      setOrderState('error')
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow={t('programs.eyebrow')}
        title={t('programs.title')}
        description={t('programs.description')}
      />

      {paymentSuccess ? (
        <div className="mt-10 rounded-2xl border border-moove-lime/30 bg-moove-lime/10 p-6">
          <p className="font-display text-lg font-semibold text-moove-silver">
            {t('programs.paymentSuccess.title')}
          </p>
          <p className="mt-2 text-sm text-moove-muted">
            {pollStatus === 'paid'
              ? t('programs.paymentSuccess.paid')
              : t('programs.paymentSuccess.body')}
          </p>
        </div>
      ) : null}

      <div className="mt-10 rounded-2xl border border-moove-border/80 bg-moove-espresso/[0.03] p-6 sm:p-8">
        <label className="block text-sm font-medium text-moove-silver" htmlFor="program-email">
          {t('programs.order.emailLabel')}
        </label>
        <input
          id="program-email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('programs.order.emailPlaceholder')}
          className="mt-2 w-full max-w-md rounded-xl border border-moove-border/80 bg-white px-4 py-3 text-sm text-moove-silver outline-none ring-moove-lime/40 focus:ring-2"
        />
        <p className="mt-3 text-sm text-moove-muted">{t('programs.order.hint')}</p>
      </div>

      {orderState === 'success' ? (
        <div className="mt-8 rounded-2xl border border-moove-lime/25 bg-moove-lime/10 p-6">
          <p className="font-medium text-moove-silver">{t('programs.order.successTitle')}</p>
          <p className="mt-2 text-sm text-moove-muted">{t('programs.order.successBody')}</p>
          {orderRef ? (
            <p className="mt-2 text-xs text-moove-muted">
              {t('programs.order.refLabel')}: {orderRef}
            </p>
          ) : null}
        </div>
      ) : null}

      {orderError ? (
        <p className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          {orderError}
        </p>
      ) : null}

      <div className="mt-12 grid gap-6 lg:grid-cols-2">
        {mooveProgramCatalog.map((program, index) => {
          const item = dictionary.programs.items[program.key]
          const title = item?.title ?? program.key
          const desc = item?.desc ?? ''

          return (
            <article
              key={program.key}
              className="moove-card flex flex-col p-8 transition hover:-translate-y-0.5 hover:shadow-moove-soft"
            >
              <span className="font-display text-sm font-semibold text-moove-lime/70">
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2 className="font-display mt-2 text-xl font-semibold text-moove-silver">{title}</h2>
              <dl className="mt-4 flex flex-wrap gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    {t('common.level')}
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">
                    {t(`programs.levels.${program.levelKey}`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    {t('programs.durationLabel')}
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">
                    {t(`programs.durations.${program.durationKey}`)}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-moove-muted/70">
                    {t('programs.priceLabel')}
                  </dt>
                  <dd className="mt-1 font-medium text-moove-silver/90">{program.priceEur}€</dd>
                </div>
              </dl>
              <p className="mt-4 flex-1 text-sm leading-relaxed text-moove-muted">{desc}</p>
              <button
                type="button"
                disabled={orderState === 'submitting'}
                onClick={() => void handleOrder(program.key)}
                className="mt-6 inline-flex items-center justify-center rounded-full bg-moove-espresso px-6 py-3 text-sm font-semibold text-moove-lime transition hover:brightness-110 disabled:opacity-60"
              >
                {orderState === 'submitting' && selectedKey === program.key
                  ? t('programs.order.submitting')
                  : t('programs.order.cta')}
              </button>
            </article>
          )
        })}
      </div>
    </div>
  )
}
