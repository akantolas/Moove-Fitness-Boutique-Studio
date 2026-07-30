import { useState } from 'react'
import type { ProgramPaidPurchase, ProgramPurchasePayment } from '../lib/programsApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { ConfirmDialog } from './ConfirmDialog'

type AdminProgramPaymentsQueueProps = {
  payments: ProgramPurchasePayment[]
  paidPurchases: ProgramPaidPurchase[]
  locale: Locale
  busy: boolean
  onConfirm: (purchaseId: string) => Promise<void>
  onResendAccess: (purchaseId: string) => Promise<void>
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

function formatPrice(amountEur: number, locale: Locale) {
  return new Intl.NumberFormat(locale === 'el' ? 'el-GR' : 'en-IE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amountEur)
}

export function AdminProgramPaymentsQueue({
  payments,
  paidPurchases,
  locale,
  busy,
  onConfirm,
  onResendAccess,
}: AdminProgramPaymentsQueueProps) {
  const { t } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleConfirm(purchaseId: string) {
    setError('')
    setConfirmingId(purchaseId)
    try {
      await onConfirm(purchaseId)
      setConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'payment_confirm_failed')
    } finally {
      setConfirmingId(null)
    }
  }

  async function handleResend(purchaseId: string) {
    setError('')
    setResendingId(purchaseId)
    try {
      await onResendAccess(purchaseId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'resend_failed')
    } finally {
      setResendingId(null)
    }
  }

  return (
    <div className="space-y-8">
      {error ? (
        <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">{t('programs.admin.pendingTitle')}</h2>
        {payments.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-white/50">{t('programs.admin.noPending')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {payments.map((payment) => (
              <div
                key={payment.id}
                className="rounded-2xl border border-amber-300/20 bg-amber-500/[0.04] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{payment.email}</p>
                    <p className="mt-1 text-sm text-white/70">{payment.program_name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
                      <span>{formatPrice(payment.amount_eur, locale)}</span>
                      <span>· {formatDateTime(payment.created_at, locale)}</span>
                      <span>· Ref {payment.purchase_ref}</span>
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
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-white">{t('programs.admin.recentPaidTitle')}</h2>
        {paidPurchases.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center">
            <p className="text-sm text-white/50">{t('programs.admin.noPaid')}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {paidPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-white">{purchase.email}</p>
                    <p className="mt-1 text-sm text-white/70">{purchase.program_name}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-white/60">
                      <span>{formatPrice(purchase.amount_eur, locale)}</span>
                      <span>· {formatDateTime(purchase.created_at, locale)}</span>
                      <span>· Ref {purchase.purchase_ref}</span>
                      {purchase.payment_method ? <span>· {purchase.payment_method}</span> : null}
                    </div>
                  </div>
                  <button
                    type="button"
                    disabled={busy || resendingId === purchase.id}
                    onClick={() => void handleResend(purchase.id)}
                    className="shrink-0 rounded-full border border-white/20 px-5 py-2.5 text-sm font-semibold text-white/85 transition hover:bg-white/5 disabled:opacity-50"
                  >
                    {resendingId === purchase.id
                      ? t('programs.admin.resending')
                      : t('programs.admin.resendAccess')}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <ConfirmDialog
        open={confirmId !== null}
        title={t('posing.admin.confirmPaymentTitle')}
        body={t('programs.admin.confirmBody')}
        confirmLabel={t('posing.admin.confirmPayment')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={confirmingId !== null}
        onConfirm={() => {
          if (confirmId) void handleConfirm(confirmId)
        }}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
