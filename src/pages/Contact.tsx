import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { site } from '../site'
import { useTranslation } from '../i18n/useTranslation'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const { t } = useTranslation()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!privacyAccepted || sending) return

    const form = e.currentTarget
    const data = new FormData(form)
    const name = String(data.get('name') ?? '').trim()
    const email = String(data.get('email') ?? '').trim()
    const message = String(data.get('message') ?? '').trim()
    const _gotcha = String(data.get('_gotcha') ?? '').trim()

    setSending(true)
    setError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, _gotcha }),
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        if (payload?.error === 'missing_email_config') {
          setError(t('contact.sendUnavailable'))
        } else {
          setError(t('contact.sendError'))
        }
        return
      }

      setSent(true)
      form.reset()
      setPrivacyAccepted(false)
    } catch {
      setError(t('contact.sendError'))
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <PageHeader
        eyebrow={t('contact.eyebrow')}
        title={t('contact.title')}
        description={t('contact.description')}
      />

      <div className="mt-14 grid gap-8 lg:grid-cols-2">
        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            {t('contact.detailsTitle')}
          </h2>
          <ul className="mt-8 space-y-6 text-sm">
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">{t('contact.address')}</span>
              <span className="mt-2 block text-base text-moove-silver">{site.addressLine}</span>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">{t('contact.phone')}</span>
              <a
                className="mt-2 block text-base font-medium text-moove-ink transition hover:text-moove-accent hover:underline"
                href={`tel:${site.phone.replace(/\s/g, '')}`}
              >
                {site.phone}
              </a>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">{t('common.email')}</span>
              <a
                className="mt-2 block text-base font-medium text-moove-ink transition hover:text-moove-accent hover:underline"
                href={`mailto:${site.email}`}
              >
                {site.email}
              </a>
            </li>
            <li>
              <span className="moove-eyebrow !text-[0.6rem]">{t('contact.hours')}</span>
              <span className="mt-2 block text-moove-silver">{t('contact.hoursValue')}</span>
            </li>
          </ul>
          <div className="mt-10">
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex rounded-full border border-moove-espresso/15 bg-moove-elevated/50 px-5 py-2.5 text-sm font-medium text-moove-silver transition hover:border-moove-lime/50 hover:text-moove-ink"
            >
              {t('contact.openMaps')}
            </a>
          </div>
        </section>

        <section className="moove-card p-8 sm:p-10">
          <h2 className="font-display text-xl font-semibold text-moove-silver">
            {t('contact.messageTitle')}
          </h2>
          {sent ? (
            <p className="mt-6 rounded-xl border border-moove-lime/30 bg-moove-lime/10 px-4 py-4 text-sm text-moove-silver">
              {t('contact.sent')}
            </p>
          ) : (
            <form className="mt-8 space-y-5" onSubmit={handleSubmit} noValidate>
              <input
                type="text"
                name="_gotcha"
                tabIndex={-1}
                autoComplete="one-time-code"
                defaultValue=""
                className="hidden"
                aria-hidden="true"
              />
              <div>
                <label htmlFor="name" className="moove-eyebrow !text-[0.6rem]">
                  {t('contact.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  disabled={sending}
                  className="mt-2 w-full rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20 disabled:opacity-60"
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="email" className="moove-eyebrow !text-[0.6rem]">
                  {t('common.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={sending}
                  className="mt-2 w-full rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20 disabled:opacity-60"
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="message" className="moove-eyebrow !text-[0.6rem]">
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={4}
                  disabled={sending}
                  className="mt-2 w-full resize-y rounded-xl border border-moove-border bg-moove-bg/50 px-4 py-3.5 text-sm text-moove-silver placeholder:text-moove-muted/50 focus:border-moove-lime/50 focus:outline-none focus:ring-2 focus:ring-moove-lime/20 disabled:opacity-60"
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>
              <label className="flex items-start gap-3 rounded-xl border border-moove-border/80 bg-moove-bg/30 px-4 py-4 text-sm leading-relaxed text-moove-muted">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  required
                  checked={privacyAccepted}
                  disabled={sending}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-moove-border accent-moove-lime-deep"
                />
                <span>
                  {t('contact.consentBefore')}{' '}
                  <Link
                    to="/privacy"
                    className="font-medium text-moove-accent underline-offset-2 hover:underline"
                  >
                    {t('privacy.footer.privacyPolicy')}
                  </Link>
                  {t('contact.consentAfter')}
                </span>
              </label>
              {error ? (
                <p className="rounded-xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!privacyAccepted || sending}
                className="w-full rounded-full bg-gradient-to-b from-moove-lime to-moove-lime-deep py-3.5 text-sm font-semibold text-moove-ink shadow-moove-glow transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-10"
              >
                {sending ? t('contact.sending') : t('common.send')}
              </button>
            </form>
          )}
        </section>
      </div>
    </div>
  )
}
