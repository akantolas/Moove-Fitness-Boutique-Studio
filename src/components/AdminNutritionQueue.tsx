import { useState } from 'react'
import type {
  NutritionOrderPayment,
  NutritionPaidOrder,
} from '../lib/nutritionTypes'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { ConfirmDialog } from './ConfirmDialog'
import { AdminPagination } from './AdminPagination'
import { DeliveryStatus } from './DeliveryStatus'

type AdminNutritionQueueProps = {
  payments: NutritionOrderPayment[]
  paidOrders: NutritionPaidOrder[]
  locale: Locale
  busy: boolean
  onConfirm: (orderId: string) => Promise<void>
  onResend: (orderId: string) => Promise<void>
  onPreview: (orderId: string) => Promise<void>
  page: number
  total: number
  onPageChange: (page: number) => void
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

export function AdminNutritionQueue({
  payments,
  paidOrders,
  locale,
  busy,
  onConfirm,
  onResend,
  onPreview,
  page,
  total,
  onPageChange,
}: AdminNutritionQueueProps) {
  const { t } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [resendingId, setResendingId] = useState<string | null>(null)
  const [previewingId, setPreviewingId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleConfirm(orderId: string) {
    setError('')
    setConfirmingId(orderId)
    try {
      await onConfirm(orderId)
      setConfirmId(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'payment_confirm_failed')
    } finally {
      setConfirmingId(null)
    }
  }

  async function handleResend(orderId: string) {
    setError('')
    setResendingId(orderId)
    try {
      await onResend(orderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'resend_failed')
    } finally {
      setResendingId(null)
    }
  }

  async function handlePreview(orderId: string) {
    setError('')
    setPreviewingId(orderId)
    try {
      await onPreview(orderId)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'preview_failed')
    } finally {
      setPreviewingId(null)
    }
  }

  return (
    <div className="space-y-10">
      {error ? (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
          {error}
        </p>
      ) : null}

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          {t('nutrition.admin.pendingTitle')}
        </h2>
        {payments.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">
            {t('nutrition.admin.noPending')}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {payments.map((payment) => (
              <li
                key={payment.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{payment.email}</p>
                    <p className="mt-1 text-white/60">
                      {payment.order_ref} ·{' '}
                      {new Intl.NumberFormat(
                        locale === 'el' ? 'el-GR' : 'en-IE',
                        { style: 'currency', currency: 'EUR' },
                      ).format(
                        payment.total_amount_eur ?? payment.amount_eur,
                      )}{' '}
                      · {formatDateTime(payment.created_at, locale)}
                    </p>
                    {payment.confirms_bundle ? (
                      <p className="mt-2 text-xs text-fuchsia-200">
                        {t('posing.admin.paidBundleConfirmation')}
                      </p>
                    ) : null}
                    <p className="mt-1 text-xs text-white/50">
                      {payment.purchase_type === 'program_addon'
                        ? t('nutrition.admin.typeAddon')
                        : t('nutrition.admin.typeStandalone')}
                    </p>
                  </div>
                  <button
                    type="button"
                    disabled={busy || confirmingId === payment.id}
                    onClick={() => setConfirmId(payment.id)}
                    className="rounded-full bg-fuchsia-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-fuchsia-500 disabled:opacity-50"
                  >
                    {confirmingId === payment.id
                      ? t('posing.admin.confirmingPayment')
                      : t('posing.admin.confirmPayment')}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold text-white">
          {t('nutrition.admin.recentPaidTitle')}
        </h2>
        {paidOrders.length === 0 ? (
          <p className="mt-4 text-sm text-white/50">
            {t('nutrition.admin.noPaid')}
          </p>
        ) : (
          <ul className="mt-4 space-y-3">
            {paidOrders.map((order) => (
              <li
                key={order.id}
                className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/80"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-medium text-white">{order.email}</p>
                    <p className="mt-1 text-white/60">
                      {order.order_ref} · {order.amount_eur}€ ·{' '}
                      {formatDateTime(order.created_at, locale)}
                    </p>
                    {order.status === 'generation_failed' ? (
                      <p className="mt-1 text-xs text-rose-200">
                        {t('nutrition.admin.statusFailed')}
                      </p>
                    ) : null}
                    <DeliveryStatus status={order.delivery_status} />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={
                        busy || previewingId === order.id || !order.has_pdf
                      }
                      onClick={() => void handlePreview(order.id)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50"
                    >
                      {previewingId === order.id
                        ? '…'
                        : t('nutrition.admin.previewPdf')}
                    </button>
                    <button
                      type="button"
                      disabled={busy || resendingId === order.id}
                      onClick={() => void handleResend(order.id)}
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10 disabled:opacity-50"
                    >
                      {resendingId === order.id
                        ? t('nutrition.admin.resending')
                        : t('nutrition.admin.resendPlan')}
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedId(expandedId === order.id ? null : order.id)
                      }
                      className="rounded-full border border-white/20 px-3 py-1.5 text-xs text-white/80 hover:bg-white/10"
                    >
                      {t('nutrition.admin.viewResponses')}
                    </button>
                  </div>
                </div>
                {expandedId === order.id ? (
                  <pre className="mt-3 max-h-48 overflow-auto rounded-lg bg-black/30 p-3 text-xs text-white/70">
                    {JSON.stringify(order.responses, null, 2)}
                  </pre>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      <AdminPagination
        page={page}
        total={total}
        busy={busy}
        onChange={onPageChange}
      />

      <ConfirmDialog
        open={confirmId !== null}
        title={t('posing.admin.confirmPaymentTitle')}
        body={t(
          payments.find((p) => p.id === confirmId)?.confirms_bundle
            ? 'posing.admin.paidBundleConfirmation'
            : 'nutrition.admin.confirmBody',
        )}
        confirmLabel={t('posing.admin.confirmPayment')}
        cancelLabel={t('posing.admin.cancelDeleteMember')}
        busy={confirmingId !== null}
        onConfirm={() => confirmId && void handleConfirm(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
    </div>
  )
}
