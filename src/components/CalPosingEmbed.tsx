import { useEffect, useId, useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

declare global {
  interface Window {
    Cal?: CalApi
  }
}

type CalNamespaceApi = ((...args: unknown[]) => void) & {
  q?: unknown[]
}

type CalApi = ((...args: unknown[]) => void) & {
  config?: {
    forwardQueryParams?: boolean
  }
  loaded?: boolean
  ns?: Record<string, CalNamespaceApi>
  q?: unknown[]
}

type CalPosingEmbedProps = {
  calLink: string
  className?: string
}

const CAL_EMBED_SCRIPT = 'https://app.cal.com/embed/embed.js'
const CAL_NAMESPACE = 'online-posing-session'

function loadCalEmbed() {
  if (window.Cal) return window.Cal

  const cal = ((...args: unknown[]) => {
    const currentCal = window.Cal
    if (!currentCal) return

    if (!currentCal.loaded) {
      currentCal.ns = {}
      currentCal.q = currentCal.q || []
      document.head.appendChild(document.createElement('script')).src = CAL_EMBED_SCRIPT
      currentCal.loaded = true
    }

    if (args[0] === 'init') {
      const namespace = args[1]
      if (typeof namespace === 'string') {
        currentCal.ns = currentCal.ns || {}
        const namespaceApi = currentCal.ns[namespace] || (((...namespaceArgs: unknown[]) => {
          namespaceApi.q = namespaceApi.q || []
          namespaceApi.q.push(namespaceArgs)
        }) as CalNamespaceApi)

        currentCal.ns[namespace] = namespaceApi
        namespaceApi.q = namespaceApi.q || []
        namespaceApi.q.push(args)
        currentCal.q?.push(['initNamespace', namespace])
        return
      }
    }

    currentCal.q?.push(args)
  }) as CalApi

  window.Cal = cal
  return cal
}

export function CalPosingEmbed({ calLink, className = '' }: CalPosingEmbedProps) {
  const reactId = useId()
  const containerId = `cal-posing-${reactId.replace(/:/g, '')}`
  const { t } = useTranslation()
  const [sent, setSent] = useState(false)
  const [privacyAccepted, setPrivacyAccepted] = useState(false)

  useEffect(() => {
    if (!calLink) return

    const cal = loadCalEmbed()
    cal('init', CAL_NAMESPACE, { origin: 'https://app.cal.com' })
    cal.config = cal.config || {}
    cal.config.forwardQueryParams = true

    const calNamespace = cal.ns?.[CAL_NAMESPACE]
    calNamespace?.('inline', {
      elementOrSelector: `#${containerId}`,
      config: { layout: 'month_view', useSlotsViewOnSmallScreen: 'true' },
      calLink,
    })
    calNamespace?.('ui', { hideEventTypeDetails: false, layout: 'month_view' })
  }, [calLink, containerId])

  function handleFallbackSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!privacyAccepted || !event.currentTarget.reportValidity()) return

    const form = new FormData(event.currentTarget)
    const subject = t('posing.cal.emailSubject')
    const lines = [
      t('posing.cal.emailIntro'),
      '',
      `${t('posing.cal.name')}: ${form.get('name') ?? ''}`,
      `${t('common.email')}: ${form.get('email') ?? ''}`,
      `${t('posing.cal.phone')}: ${form.get('phone') ?? ''}`,
      `${t('posing.cal.sessionType')}: ${form.get('sessionType') ?? ''}`,
      `${t('posing.cal.preferredDate')}: ${form.get('preferredDate') ?? ''}`,
      `${t('posing.cal.message')}:`,
      `${form.get('message') ?? ''}`,
    ]

    window.location.href = `mailto:${site.email}?subject=${encodeURIComponent(
      subject,
    )}&body=${encodeURIComponent(lines.join('\n'))}`
    setSent(true)
  }

  if (!calLink) {
    return (
      <div
        className={`rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-7 ${className}`}
      >
        <p className="text-center text-sm leading-relaxed text-white/70">{t('posing.cal.pending')}</p>
        {sent ? (
          <p className="mt-6 rounded-xl border border-cyan-300/25 bg-cyan-300/10 px-4 py-4 text-center text-sm text-white/80">
            {t('posing.cal.sent')}
          </p>
        ) : (
          <form className="mt-7 space-y-5 text-left" onSubmit={handleFallbackSubmit} noValidate>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="posing-name" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('posing.cal.name')}
                </label>
                <input
                  id="posing-name"
                  name="name"
                  required
                  autoComplete="name"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                  placeholder={t('posing.cal.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="posing-email" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('common.email')}
                </label>
                <input
                  id="posing-email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                  placeholder={t('posing.cal.emailPlaceholder')}
                />
              </div>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="posing-phone" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('posing.cal.phone')}
                </label>
                <input
                  id="posing-phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                  placeholder={t('posing.cal.phonePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="posing-date" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                  {t('posing.cal.preferredDate')}
                </label>
                <input
                  id="posing-date"
                  name="preferredDate"
                  type="datetime-local"
                  className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                />
              </div>
            </div>
            <div>
              <label htmlFor="posing-session-type" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.cal.sessionType')}
              </label>
              <select
                id="posing-session-type"
                name="sessionType"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                defaultValue={t('posing.cal.options.online')}
              >
                <option>{t('posing.cal.options.online')}</option>
                <option>{t('posing.cal.options.live')}</option>
                <option>{t('posing.cal.options.bikini')}</option>
                <option>{t('posing.cal.options.makeup')}</option>
                <option>{t('posing.cal.options.other')}</option>
              </select>
            </div>
            <div>
              <label htmlFor="posing-message" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
                {t('posing.cal.message')}
              </label>
              <textarea
                id="posing-message"
                name="message"
                rows={4}
                className="mt-2 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-cyan-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
                placeholder={t('posing.cal.messagePlaceholder')}
              />
            </div>
            <label className="flex items-start gap-3 rounded-xl border border-white/10 bg-black/25 px-4 py-4 text-sm leading-relaxed text-white/60">
              <input
                type="checkbox"
                name="privacyConsent"
                required
                checked={privacyAccepted}
                onChange={(event) => setPrivacyAccepted(event.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-white/20 accent-cyan-300"
              />
              <span>
                {t('contact.consentBefore')}{' '}
                <Link to="/privacy" className="font-medium text-cyan-200 underline-offset-2 hover:underline">
                  {t('privacy.footer.privacyPolicy')}
                </Link>
                {t('contact.consentAfter')}
              </span>
            </label>
            <button
              type="submit"
              disabled={!privacyAccepted}
              className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black shadow-[0_8px_32px_-8px_rgba(192,38,211,0.55)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
            >
              {t('posing.cal.submit')}
            </button>
          </form>
        )}
      </div>
    )
  }

  return (
    <div
      id={containerId}
      className={`h-[48rem] w-full overflow-auto rounded-2xl bg-[#111] sm:h-[52rem] lg:h-[44rem] ${className}`}
    />
  )
}
