import { useState } from 'react'
import type { AdminPayment } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { planKeyLabel, bookingStatusChipClass, bookingStatusLabel } from '../lib/posingLabels'
import { ConfirmDialog } from './ConfirmDialog'

type AdminPaymentsQueueProps = {
  payments: AdminPayment[]
  locale: Locale
  busy: boolean
  onConfirm: (bookingId: string) => Promise<void>
}

function formatDateTime(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

export function AdminPaymentsQueue({ payments, locale, busy, onConfirm }: AdminPaymentsQueueProps) {
  const { t, dictionary } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleConfirm(bookingId: string) {
    setError('')
    setConfirmingId(bookingId)
    try {
      await onConfirm(bookingId)
      setConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'payment_confirm_failed')
    } finally {
      setConfirmingId(null)
    }
  }

  if (payments.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
        <p className="text-sm text-white/50">{t('posing.admin.noPendingPayments')}</p>
      </div>
    )
  }

  return (
    <>
      {error ? (
        <p className="mb-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}
      <div className="space-y-3">
        {payments.map((payment) => (
          <div
            key={payment.id}
            className="rounded-2xl border border-amber-300/20 bg-amber-500/[0.04] p-4 sm:p-5"
          >
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-medium text-white">
                  {payment.profiles?.full_name ?? payment.profiles?.email ?? '—'}
                </p>
                <p className="mt-0.5 text-sm text-white/55">{payment.profiles?.email}</p>
                <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                  <span>
                    {planKeyLabel(payment.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                  </span>
                  {payment.slot?.start_at ? (
                    <span>· {formatDateTime(payment.slot.start_at, locale)}</span>
                  ) : null}
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(payment.status)}`}
                  >
                    {bookingStatusLabel(payment.status, t)}
                  </span>
                </div>
              </div>
              <button
                type="button"
                disabled={busy || confirmingId === payment.id}
                onClick={() => setConfirmId(payment.id)}
                className="shrink-0 rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-5 py-2.5 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
              >
                {confirmingId === payment.id
                  ? t('posing.admin.confirmingPayment')
                  : t('posing.admin.confirmPayment')}
              </button>
            </div>
          </div>
        ))}
      </div>

      <ConfirmDialog
        open={confirmId !== null}
        title={t('posing.admin.confirmPaymentTitle')}
        body={t('posing.admin.confirmPaymentBody')}
        confirmLabel={t('posing.admin.confirmPayment')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={confirmingId !== null}
        onConfirm={() => {
          if (confirmId) void handleConfirm(confirmId)
        }}
        onCancel={() => setConfirmId(null)}
      />
    </>
  )
}
