import type { AdminBookingRow } from '../lib/posingApi'
import { useTranslation } from '../i18n/useTranslation'
import type { Locale } from '../i18n/types'
import { bookingStatusChipClass, bookingStatusLabel, planKeyLabel } from '../lib/posingLabels'

type AdminBookingsPanelProps = {
  bookings: AdminBookingRow[]
  locale: Locale
  statusFilter: string
  onStatusFilterChange: (status: string) => void
  loading: boolean
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
}: AdminBookingsPanelProps) {
  const { t, dictionary } = useTranslation()

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

      {loading ? (
        <p className="mt-6 text-sm text-white/50">{t('posing.account.loading')}</p>
      ) : bookings.length === 0 ? (
        <p className="mt-6 text-sm text-white/50">{t('posing.admin.noBookings')}</p>
      ) : (
        <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-black/20 text-xs uppercase tracking-[0.14em] text-white/45">
                  <th className="px-4 py-3 font-semibold">{t('posing.account.fullName')}</th>
                  <th className="px-4 py-3 font-semibold">{t('posing.admin.date')}</th>
                  <th className="px-4 py-3 font-semibold">{t('nav.packages')}</th>
                  <th className="px-4 py-3 font-semibold">{t('posing.admin.bookings')}</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-white/5 last:border-0">
                    <td className="px-4 py-3 text-white">
                      {booking.profiles?.full_name ?? booking.profiles?.email ?? '—'}
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
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </section>
  )
}
