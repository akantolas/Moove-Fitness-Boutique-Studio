import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import {
  isJulyOfferActive,
  markOffersPopupSeen,
  scrollToPosingBooking,
} from '../lib/posingOffers'
import type { PosingOfferPlanKey } from '../site'
import {
  OffersModalBackdrop,
  OffersSectionHeader,
  PosingOfferCards,
} from './posingOffersShared'

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
        className="animate-pose-overlay-fade absolute inset-0 bg-[#050508]/82 backdrop-blur-xl"
        aria-label={t('posing.offers.modalDismiss')}
        onClick={dismiss}
      >
        <OffersModalBackdrop />
      </button>

      <div
        ref={panelRef}
        tabIndex={-1}
        className="animate-pose-offers-modal-in relative flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-[1.75rem] bg-[#08080f] shadow-[0_40px_120px_-30px_rgba(244,114,182,0.45)] outline-none"
      >
        <div className="pose-offers-shimmer-border h-[2px] w-full shrink-0" aria-hidden />
        <div
          className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-white/10"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -inset-px rounded-[1.75rem] opacity-80"
          style={{
            backgroundImage:
              'radial-gradient(ellipse 80% 45% at 50% -5%, rgba(192, 38, 211, 0.2) 0%, transparent 55%), radial-gradient(circle at 100% 100%, rgba(251, 191, 36, 0.08) 0%, transparent 40%)',
          }}
          aria-hidden
        />

        <button
          type="button"
          onClick={dismiss}
          aria-label={t('posing.offers.modalCloseAria')}
          className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/12 bg-black/50 text-xl leading-none text-white/65 shadow-lg backdrop-blur-md transition hover:border-fuchsia-200/30 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <div className="overflow-y-auto px-5 pb-6 pt-7 sm:px-10 sm:pb-8 sm:pt-9">
          <OffersSectionHeader
            titleId="posing-offers-modal-title"
            variant="modal"
            showLogo
          />
          <div
            className="mx-auto mt-6 h-px max-w-xs bg-gradient-to-r from-transparent via-fuchsia-300/35 to-transparent sm:mt-8"
            aria-hidden
          />
          <PosingOfferCards onSelect={handleSelect} compact className="mt-6 sm:mt-8" />
          <div className="mt-7 flex justify-center sm:mt-8">
            <button
              type="button"
              onClick={dismiss}
              className="rounded-full border border-white/12 bg-white/[0.03] px-6 py-2.5 text-sm font-semibold text-white/55 backdrop-blur-sm transition hover:border-white/22 hover:bg-white/[0.06] hover:text-white/85"
            >
              {t('posing.offers.modalDismiss')}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
