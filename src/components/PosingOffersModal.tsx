import { useCallback, useEffect, useRef } from 'react'
import { useTranslation } from '../i18n/useTranslation'
import {
  isSeptemberOfferActive,
  markOffersPopupSeen,
  scrollToPosingPackages,
} from '../lib/posingOffers'
import { OffersModalBackdrop, SeptemberOfferFlyer } from './posingOffersShared'

type PosingOffersModalProps = {
  open: boolean
  onClose: () => void
}

export function PosingOffersModal({ open, onClose }: PosingOffersModalProps) {
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

  if (!open || !isSeptemberOfferActive()) return null

  function handleBookNow() {
    markOffersPopupSeen()
    onClose()
    scrollToPosingPackages()
  }

  return (
    <div
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={t('posing.offers.flyerAlt')}
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
        className="animate-pose-offers-modal-in relative flex w-full max-w-sm flex-col overflow-hidden rounded-[1.75rem] bg-[#08080f] shadow-[0_40px_120px_-30px_rgba(244,114,182,0.45)] outline-none sm:max-w-md"
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
          className="absolute right-3 top-3 z-10 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/12 bg-black/50 text-lg leading-none text-white/65 shadow-lg backdrop-blur-md transition hover:border-fuchsia-200/30 hover:bg-white/10 hover:text-white"
        >
          ×
        </button>

        <div className="overflow-hidden p-4 pt-10 sm:p-5 sm:pt-11">
          <SeptemberOfferFlyer
            variant="modal"
            onCta={handleBookNow}
            onDismiss={dismiss}
          />
        </div>
      </div>
    </div>
  )
}
