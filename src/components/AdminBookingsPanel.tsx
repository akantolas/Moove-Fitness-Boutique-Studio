import { useState } from 'react'
import type { AdminBookingRow } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { bookingStatusChipClass, bookingStatusLabel, planKeyLabel } from '../lib/posingLabels'
import { ConfirmDialog } from './ConfirmDialog'

type AdminBookingsPanelProps = {
  bookings: AdminBookingRow[]
  locale: Locale
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  loading: boolean
  busy?: boolean
  onConfirmPayment?: (bookingId: string) => Promise<void>
}

function formatSlot(iso: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(iso))
}

const STATUS_FILTERS = ['', 'pending_payment', 'confirmed', 'cancelled', 'completed'] as const

export function AdminBookingsPanel({
  bookings,
  locale,
  statusFilter,
  onStatusFilterChange,
  loading,
  busy = false,
  onConfirmPayment,
}: AdminBookingsPanelProps) {
  const { t, dictionary } = useTranslation()
  const [confirmId, setConfirmId] = useState<string | null>(null)
  const [confirmingId, setConfirmingId] = useState<string | null>(null)
  const [confirmError, setConfirmError] = useState('')

  async function handleConfirm(bookingId: string) {
    if (!onConfirmPayment) return
    setConfirmError('')
    setConfirmingId(bookingId)
    try {
      await onConfirmPayment(bookingId)
      setConfirmId(null)
    } catch (err) {
      setConfirmError(err instanceof Error ? err.message : 'payment_confirm_failed')
    } finally {
      setConfirmingId(null)
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-white">{t('posing.admin.allBookings')}</h2>
          <p className="mt-1 text-sm text-white/50">{t('posing.admin.allBookingsBody')}</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value)}
          className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white focus:border-fuchsia-300/60 focus:outline-none"
        >
          <option value="">{t('posing.admin.filterAll')}</option>
          {STATUS_FILTERS.filter(Boolean).map((status) => (
            <option key={status} value={status}>
              {bookingStatusLabel(status, t)}
            </option>
          ))}
        </select>
      </div>

      {confirmError ? (
        <p className="mt-4 rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
          {confirmError}
        </p>
      ) : null}

      {loading ? (
        <div className="mt-6 animate-pulse space-y-3">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="h-14 rounded-2xl border border-white/10 bg-white/[0.03]" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/50">
          {t('posing.admin.noBookings')}
        </p>
      ) : (
        <>
          <div className="mt-4 space-y-3 lg:hidden">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="rounded-2xl border border-white/10 bg-white/[0.02] p-4"
              >
                <p className="font-medium text-white">
                  {booking.profiles?.full_name ?? booking.profiles?.email ?? '—'}
                </p>
                <p className="mt-0.5 text-xs text-white/50">{booking.profiles?.email}</p>
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-white/65">
                  <span>
                    {booking.slot?.start_at ? formatSlot(booking.slot.start_at, locale) : '—'}
                  </span>
                  <span>·</span>
                  <span>
                    {planKeyLabel(booking.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                  </span>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(booking.status)}`}
                  >
                    {bookingStatusLabel(booking.status, t)}
                  </span>
                </div>
                {booking.status === 'pending_payment' && onConfirmPayment ? (
                  <button
                    type="button"
                    disabled={busy || confirmingId === booking.id}
                    onClick={() => setConfirmId(booking.id)}
                    className="mt-3 w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-4 py-2 text-xs font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
                  >
                    {confirmingId === booking.id
                      ? t('posing.admin.confirmingPayment')
                      : t('posing.admin.confirmPayment')}
                  </button>
                ) : null}
              </div>
            ))}
          </div>

          <div className="mt-4 hidden overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] lg:block">
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.14em] text-white/45">
                    <th className="px-4 py-3 font-semibold">{t('posing.account.fullName')}</th>
                    <th className="px-4 py-3 font-semibold">{t('posing.admin.date')}</th>
                    <th className="px-4 py-3 font-semibold">{t('nav.packages')}</th>
                    <th className="px-4 py-3 font-semibold">{t('posing.admin.bookings')}</th>
                    <th className="px-4 py-3 font-semibold">{t('posing.admin.actions')}</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="border-b border-white/5 last:border-0">
                      <td className="px-4 py-3 text-white">
                        <p>{booking.profiles?.full_name ?? booking.profiles?.email ?? '—'}</p>
                        <p className="text-xs text-white/45">{booking.profiles?.email}</p>
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {booking.slot?.start_at ? formatSlot(booking.slot.start_at, locale) : '—'}
                      </td>
                      <td className="px-4 py-3 text-white/70">
                        {planKeyLabel(booking.plan_key, (i) => dictionary.posing.pricing.packages[i]?.name)}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(booking.status)}`}
                        >
                          {bookingStatusLabel(booking.status, t)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {booking.status === 'pending_payment' && onConfirmPayment ? (
                          <button
                            type="button"
                            disabled={busy || confirmingId === booking.id}
                            onClick={() => setConfirmId(booking.id)}
                            className="rounded-full border border-fuchsia-200/35 bg-fuchsia-500/15 px-3 py-1 text-xs font-semibold text-fuchsia-100 transition hover:bg-fuchsia-500/25 disabled:opacity-50"
                          >
                            {confirmingId === booking.id
                              ? t('posing.admin.confirmingPayment')
                              : t('posing.admin.confirmPayment')}
                          </button>
                        ) : (
                          <span className="text-xs text-white/30">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

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
    </section>
  )
}
