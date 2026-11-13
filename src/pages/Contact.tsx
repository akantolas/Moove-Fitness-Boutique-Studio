import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { PageHeader } from '../components/PageHeader'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

export function ContactPage() {
  const [sent, setSent] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [privacyAccepted, setPrivacyAccepted] = useState(false)
  const { t, locale } = useTranslation()
  const vars = useSiteVars()

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
        body: JSON.stringify({ name, email, message, _gotcha, locale }),
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

  const label = 'studio-small block text-moove-muted'
  const input = 'w-full min-h-12 bg-moove-bg px-4 py-3 text-[length:var(--step-body)] text-moove-ink placeholder:text-moove-muted/70 disabled:opacity-60'

  return (
    <div className="studio">
      <section className="studio-frame pt-[clamp(3rem,2rem+4vw,6rem)]">
        <PageHeader title={t('contact.title')} description={t('contact.description')} />
      </section>

      <section className="studio-frame studio-grid gap-y-14 pb-[var(--section-gap)] pt-[clamp(3rem,2rem+4vw,6rem)]">
        {/* The ways to reach the studio, as large type */}
        <div className="col-span-12 md:col-span-5">
          <h2 className="sr-only">{t('contact.detailsTitle')}</h2>
          <dl className="space-y-8">
            <div>
              <dt className={label}>{t('contact.phone')}</dt>
              <dd className="mt-1">
                <a className="studio-lead font-semibold hover:underline" href={`tel:${site.phone.replace(/\s/g, '')}`}>
                  {site.phone}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>{t('common.email')}</dt>
              <dd className="mt-1">
                <a className="studio-lead break-words font-semibold hover:underline" href={`mailto:${site.email}`}>
                  {site.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>{t('contact.address')}</dt>
              <dd className="mt-1 leading-[1.45]">
                {vars.address}
                <a href={site.mapsUrl} target="_blank" rel="noreferrer noopener" className="studio-link mt-2 block w-fit">
                  {t('contact.openMaps')}
                </a>
              </dd>
            </div>
            <div>
              <dt className={label}>{t('contact.hours')}</dt>
              <dd className="mt-1 leading-[1.45]">{t('contact.hoursValue')}</dd>
            </div>
          </dl>
        </div>

        {/* The message form on a tone step */}
        <div className="col-span-12 bg-moove-surface p-6 md:col-span-7 md:p-10">
          <h2 className="text-[length:var(--step-lead)] font-extrabold leading-[1.15] tracking-[-0.03em]">
            {t('contact.messageTitle')}
          </h2>
          {sent ? (
            <p className="mt-6 bg-moove-lime px-5 py-4 font-semibold" role="status">
              {t('contact.sent')}
            </p>
          ) : (
            <form className="mt-8 space-y-6" onSubmit={handleSubmit} noValidate>
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
                <label htmlFor="name" className={label}>
                  {t('contact.name')}
                </label>
                <input
                  id="name"
                  name="name"
                  required
                  autoComplete="name"
                  disabled={sending}
                  className={`mt-2 ${input}`}
                  placeholder={t('contact.namePlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="email" className={label}>
                  {t('common.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  disabled={sending}
                  className={`mt-2 ${input}`}
                  placeholder={t('contact.emailPlaceholder')}
                />
              </div>
              <div>
                <label htmlFor="message" className={label}>
                  {t('contact.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={5}
                  disabled={sending}
                  className={`mt-2 resize-y ${input}`}
                  placeholder={t('contact.messagePlaceholder')}
                />
              </div>
              <label className="flex items-start gap-3 leading-[1.5] text-moove-muted">
                <input
                  type="checkbox"
                  name="privacyConsent"
                  required
                  checked={privacyAccepted}
                  disabled={sending}
                  onChange={(event) => setPrivacyAccepted(event.target.checked)}
                  className="mt-1 h-5 w-5 shrink-0 accent-moove-ink"
                />
                <span>
                  {t('contact.consentBefore')}{' '}
                  <Link to="/privacy" className="studio-link text-moove-ink">
                    {t('privacy.footer.privacyPolicy')}
                  </Link>
                  {t('contact.consentAfter')}
                </span>
              </label>
              {error ? (
                <p className="bg-red-50 px-4 py-3 text-red-800" role="alert">
                  {error}
                </p>
              ) : null}
              <button
                type="submit"
                disabled={!privacyAccepted || sending}
                className="studio-button studio-button--ink w-full disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0 sm:w-auto"
              >
                {sending ? t('contact.sending') : t('common.send')}
              </button>
            </form>
          )}
        </div>
      </section>
    </div>
  )
}
