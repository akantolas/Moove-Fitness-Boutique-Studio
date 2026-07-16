import { useCallback, useEffect, useRef } from 'react'
import type { PosingBooking } from '../lib/posingApi'
import type { Locale } from '../i18n/types'
import {
  bookingDisplayStatus,
  bookingStatusChipClass,
  bookingStatusLabel,
  planKeyLabel,
} from '../lib/posingLabels'

function formatSlotTime(startAt: string, locale: Locale) {
  return new Intl.DateTimeFormat(locale === 'el' ? 'el-GR' : 'en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Europe/Athens',
  }).format(new Date(startAt))
}

type AccountHistoryItemProps = {
  booking: PosingBooking
  locale: Locale
  planName: string
  t: (key: string) => string
}

export function AccountHistoryItem({ booking, locale, planName, t }: AccountHistoryItemProps) {
  const displayStatus = bookingDisplayStatus(booking)

  return (
    <li className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3 opacity-80">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <p className="text-sm text-white">
          {booking.slot ? formatSlotTime(booking.slot.start_at, locale) : '—'}
        </p>
        <span
          className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.12em] ${bookingStatusChipClass(displayStatus)}`}
        >
          {bookingStatusLabel(displayStatus, t)}
        </span>
      </div>
      <p className="mt-1 text-xs text-white/50">{planName}</p>
    </li>
  )
}

type AccountHistoryModalProps = {
  open: boolean
  onClose: () => void
  bookings: PosingBooking[]
  locale: Locale
  getPackageName: (index: number) => string | undefined
  t: (key: string) => string
}

export function AccountHistoryModal({
  open,
  onClose,
  bookings,
  locale,
  getPackageName,
  t,
}: AccountHistoryModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    if (!open) return

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    panelRef.current?.focus()

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') dismiss()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, dismiss])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="account-history-modal-title"
    >
      <button
        type="button"
        className="animate-pose-overlay-fade absolute inset-0 bg-[#050508]/82 backdrop-blur-xl"
        aria-label={t('posing.account.avatarPreviewClose')}
        onClick={dismiss}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-pose-offers-modal-in relative flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#08080f] shadow-[0_40px_120px_-30px_rgba(244,114,182,0.35)] outline-none"
      >
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] opacity-60"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 50% at 50% 0%, rgba(192, 38, 211, 0.15) 0%, transparent 60%)',
          }}
          aria-hidden
        />
        <div className="relative flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 sm:px-6">
          <div>
            <h2 id="account-history-modal-title" className="text-lg font-semibold text-white">
              {t('posing.account.historyModalTitle')}
            </h2>
            <p className="mt-0.5 text-xs text-white/45">
              {bookings.length} {t('posing.account.history').toLowerCase()}
            </p>
          </div>
          <button
            type="button"
            onClick={dismiss}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-white/15 text-white/70 transition hover:bg-white/5 hover:text-white"
            aria-label={t('posing.account.avatarPreviewClose')}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <ul className="relative max-h-[70vh] space-y-3 overflow-y-auto px-5 py-4 sm:px-6">
          {bookings.map((booking) => (
            <AccountHistoryItem
              key={booking.id}
              booking={booking}
              locale={locale}
              planName={planKeyLabel(booking.plan_key, getPackageName, t)}
              t={t}
            />
          ))}
        </ul>
      </div>
    </div>
  )
}
