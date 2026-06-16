import { useEffect, useId, useState, type ImgHTMLAttributes } from 'react'
import { createPortal } from 'react-dom'
import { useTranslation } from '../i18n/useTranslation'

type ZoomableImageProps = ImgHTMLAttributes<HTMLImageElement> & {
  wrapperClassName?: string
}

export function ZoomableImage({
  className = '',
  wrapperClassName = 'block w-full cursor-zoom-in',
  alt = '',
  src,
  ...imgProps
}: ZoomableImageProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const titleId = useId()

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }

    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKeyDown)

    return () => {
      document.body.style.overflow = prevOverflow
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  if (!src) {
    return <img alt={alt} className={className} src={src} {...imgProps} />
  }

  return (
    <>
      <button
        type="button"
        className={`${wrapperClassName} border-0 bg-transparent p-0 text-left transition hover:brightness-[1.02] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-moove-lime`}
        onClick={() => setOpen(true)}
        aria-label={t('common.viewLarger', { alt })}
      >
        <img alt={alt} className={className} src={src} {...imgProps} />
      </button>

      {open
        ? createPortal(
            <div
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/88 p-4 backdrop-blur-sm sm:p-8"
              role="dialog"
              aria-modal="true"
              aria-labelledby={titleId}
              onClick={() => setOpen(false)}
            >
              <button
                type="button"
                className="absolute right-4 top-4 z-10 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/50 text-xl text-white transition hover:bg-black/70 sm:right-6 sm:top-6"
                onClick={() => setOpen(false)}
                aria-label={t('common.close')}
              >
                ✕
              </button>
              <img
                id={titleId}
                src={src}
                alt={alt}
                className="max-h-[min(90vh,1200px)] max-w-[min(92vw,1400px)] rounded-lg object-contain shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}
    </>
  )
}
