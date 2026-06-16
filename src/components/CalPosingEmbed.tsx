import { useEffect, useId } from 'react'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

declare global {
  interface Window {
    Cal?: (...args: unknown[]) => void
  }
}

type CalPosingEmbedProps = {
  calLink: string
  className?: string
}

export function CalPosingEmbed({ calLink, className = '' }: CalPosingEmbedProps) {
  const reactId = useId()
  const containerId = `cal-posing-${reactId.replace(/:/g, '')}`
  const { t } = useTranslation()

  useEffect(() => {
    if (!calLink) return

    const init = () => {
      window.Cal?.('inline', {
        elementOrSelector: `#${containerId}`,
        calLink,
        layout: 'month_view',
      })
    }

    if (window.Cal) {
      init()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://app.cal.com/embed/embed.js'
    script.async = true
    script.onload = init
    document.head.appendChild(script)

    return () => {
      script.remove()
    }
  }, [calLink, containerId])

  if (!calLink) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center ${className}`}
      >
        <p className="text-sm text-white/70">{t('posing.cal.pending')}</p>
        <div className="mt-6 flex justify-center">
          <a
            href={`mailto:${site.email}?subject=${encodeURIComponent(t('posing.cal.emailSubject'))}`}
            className="inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-6 py-3 text-sm font-semibold text-black transition hover:brightness-110"
          >
            {t('common.email')}
          </a>
        </div>
      </div>
    )
  }

  return (
    <div
      id={containerId}
      className={`min-h-[32rem] w-full overflow-hidden rounded-2xl bg-white ${className}`}
    />
  )
}
