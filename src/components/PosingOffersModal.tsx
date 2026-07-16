import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import {
  isJulyOfferActive,
  markOffersPopupSeen,
  scrollToPosingBooking,
} from '../lib/posingOffers'
import type { PosingOfferPlanKey } from '../site'
import { OffersSectionHeader, PosingOfferCards } from './posingOffersShared'

type PosingOffersModalProps = {
  open: boolean
  onClose: () => void
  onSelectOffer: (planKey: PosingOfferPlanKey) => void
}

export function PosingOffersModal({ open, onClose, onSelectOffer }: PosingOffersModalProps) {
  const { t } = useTranslation()
  const panelRef = useRef<HTMLDivElement>(null)

  const dismiss = useCallback(() => {
    markOffersPopupSeen()
    onClose()
  }, [onClose])

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

  if (!open || !isJulyOfferActive()) return null

  function handleSelect(planKey: PosingOfferPlanKey) {
    markOffersPopupSeen()
    onSelectOffer(planKey)
    onClose()
    scrollToPosingBooking()
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="posing-offers-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/75 backdrop-blur-md"
        aria-label={t('posing.offers.modalDismiss')}
        onClick={dismiss}
      />
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-3xl border border-fuchsia-200/25 bg-[#0a0a10] shadow-[0_32px_100px_-24px_rgba(244,114,182,0.55)] outline-none ring-1 ring-fuchsia-300/15"
      >
        <div
          className="pointer-events-none absolute -inset-px rounded-3xl opacity-70"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 70% 50% at 50% 0%, rgba(192, 38, 211, 0.18) 0%, transparent 60%)',
          }}
          aria-hidden
        />
        <button
          type="button"
          onClick={dismiss}
          aria-label={t('posing.offers.modalCloseAria')}
          className="absolute right-4 top-4 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/40 text-lg text-white/70 transition hover:border-white/25 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <div className="overflow-y-auto px-5 pb-5 pt-8 sm:px-8 sm:pb-8 sm:pt-10">
          <OffersSectionHeader titleId="posing-offers-modal-title" />
          <PosingOfferCards onSelect={handleSelect} compact className="mt-8" />
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-white/60 transition hover:border-white/25 hover:bg-white/5 hover:text-white/80"
            >
              {t('posing.offers.modalDismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
