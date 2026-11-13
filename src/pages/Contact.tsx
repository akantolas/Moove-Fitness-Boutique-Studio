import { useRef, useState, type FormEvent, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useStudioStatus } from '../hooks/useStudioStatus'
import { site } from '../site'
import { useSiteVars, useTranslation } from '../i18n/useTranslation'

const MESSAGE_MIN = 10
const MESSAGE_MAX = 1000
const VISITS_DEFAULT = 2

type FieldName = 'name' | 'email' | 'message' | 'consent'
type Values = { name: string; email: string; message: string; consent: boolean }

const rules: Record<FieldName, (values: Values) => boolean> = {
  name: (v) => v.name.trim().length > 1,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.email.trim()),
  message: (v) => v.message.trim().length >= MESSAGE_MIN,
  consent: (v) => v.consent,
}

const fieldOrder: FieldName[] = ['name', 'email', 'message', 'consent']

const reduceMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Icon({ children }: { children: ReactNode }) {
  return (
    <span className="grid h-10 w-10 flex-none place-items-center bg-white/10">
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        {children}
      </svg>
    </span>
  )
}

export function ContactPage() {
  const { t, locale, dictionary } = useTranslation()
  const vars = useSiteVars()
  const reach = dictionary.contact.reach
  const status = useStudioStatus()

  const [values, setValues] = useState<Values>({ name: '', email: '', message: '', consent: false })
  const [topics, setTopics] = useState<string[]>([])
  const [visits, setVisits] = useState(VISITS_DEFAULT)
  const [invalid, setInvalid] = useState<Partial<Record<FieldName, boolean>>>({})
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')
  const [sentTo, setSentTo] = useState<{ name: string; email: string } | null>(null)

  const formRef = useRef<HTMLFormElement>(null)
  const successHeadingRef = useRef<HTMLHeadingElement>(null)

  const visitsLabel =
    visits >= 5 ? reach.visitsMax : visits === 1 ? reach.visitsOne : t('contact.reach.visitsMany', { n: visits })

  function update<K extends keyof Values>(key: K, value: Values[K]) {
    const next = { ...values, [key]: value }
    setValues(next)
    // Once a field has been flagged, clear the flag as soon as it becomes valid.
    if (invalid[key]) setInvalid((prev) => ({ ...prev, [key]: !rules[key](next) }))
  }

  function toggleTopic(topic: string) {
    setTopics((prev) => (prev.includes(topic) ? prev.filter((x) => x !== topic) : [...prev, topic]))
  }

  function shake(el: Element | null) {
    if (!el || reduceMotion()) return
    el.animate(
      [
        { transform: 'translateX(0)' },
        { transform: 'translateX(-6px)' },
        { transform: 'translateX(6px)' },
        { transform: 'translateX(0)' },
      ],
      { duration: 300 },
    )
  }

  /** The topics and visits travel inside the message, so the contact API stays as it is. */
  function composeMessage() {
    const lines: string[] = []
    if (topics.length) lines.push(`${reach.mailInterests}: ${topics.join(', ')}`)
    lines.push(`${reach.mailVisits}: ${visits >= 5 ? '5+' : visits}`)
    return `${lines.join('\n')}\n\n${values.message.trim()}`
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (sending) return

    const nextInvalid = Object.fromEntries(fieldOrder.map((f) => [f, !rules[f](values)])) as Record<FieldName, boolean>
    setInvalid(nextInvalid)
    const firstBad = fieldOrder.find((f) => nextInvalid[f])
    if (firstBad) {
      const input = formRef.current?.querySelector<HTMLElement>(`[name="${firstBad}"]`)
      input?.focus()
      shake(input?.closest('[data-field]') ?? null)
      return
    }

    const gotcha = String(new FormData(event.currentTarget).get('_gotcha') ?? '').trim()
    setSending(true)
    setSendError('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          message: composeMessage(),
          _gotcha: gotcha,
          locale,
        }),
      })

      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null
        setSendError(payload?.error === 'missing_email_config' ? t('contact.sendUnavailable') : t('contact.sendError'))
        return
      }

      setSentTo({ name: values.name.trim().split(/\s+/)[0], email: values.email.trim() })
      requestAnimationFrame(() => successHeadingRef.current?.focus())
    } catch {
      setSendError(t('contact.sendError'))
    } finally {
      setSending(false)
    }
  }

  function startOver() {
    setValues({ name: '', email: '', message: '', consent: false })
    setTopics([])
    setVisits(VISITS_DEFAULT)
    setInvalid({})
    setSendError('')
    setSentTo(null)
    requestAnimationFrame(() => formRef.current?.querySelector<HTMLInputElement>('[name="name"]')?.focus())
  }

  const describedBy = (field: FieldName) => (invalid[field] ? `${field}-error` : undefined)

  return (
    <div className="studio studio-frame pb-[var(--section-gap)] pt-[clamp(2rem,1rem+3vw,4rem)]">
      <section className="grid md:grid-cols-[0.9fr_1.1fr]">
        {/* The studio's details on black */}
        <aside className="reach-info flex flex-col bg-moove-espresso p-[clamp(1.5rem,1rem+2.5vw,3rem)] text-white">
          <h1 className="studio-head max-w-[14ch] text-[clamp(2.25rem,1.4rem+2.6vw,3.75rem)]">{reach.title}</h1>
          <p className="mt-5 max-w-[34ch] leading-[1.5] text-white/70">{reach.body}</p>

          {status.text ? (
            <p className="studio-small mt-7 flex items-center gap-2.5 text-white/85">
              <i className="reach-dot" data-open={status.open ? 'true' : 'false'} aria-hidden />
              {status.text}
            </p>
          ) : null}

          <ul className="mt-10 grid gap-2.5 md:mt-auto md:pt-12">
            <li>
              <a className="reach-way" href={`mailto:${site.email}`}>
                <Icon>
                  <rect x="3" y="5" width="18" height="14" rx="2" />
                  <path d="m3 7 9 6 9-6" />
                </Icon>
                <span className="min-w-0">
                  <b className="block break-words font-semibold">{site.email}</b>
                  <span className="studio-small font-normal text-white/60">{reach.emailHint}</span>
                </span>
              </a>
            </li>
            <li>
              <a className="reach-way" href={`tel:${site.phone.replace(/\s/g, '')}`}>
                <Icon>
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                </Icon>
                <span className="min-w-0">
                  <b className="block font-semibold">{site.phone}</b>
                  <span className="studio-small font-normal text-white/60">{t('contact.hoursValue')}</span>
                </span>
              </a>
            </li>
            <li>
              <a className="reach-way" href={site.mapsUrl} target="_blank" rel="noreferrer noopener">
                <Icon>
                  <path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0z" />
                  <circle cx="12" cy="10" r="3" />
                </Icon>
                <span className="min-w-0">
                  <b className="block font-semibold">{vars.address}</b>
                  <span className="studio-small font-normal text-white/60">{reach.addressHint}</span>
                </span>
              </a>
            </li>
          </ul>
        </aside>

        {/* The message form, on a tone step */}
        <div className="relative bg-moove-surface">
          <form
            ref={formRef}
            noValidate
            onSubmit={handleSubmit}
            aria-hidden={sentTo ? true : undefined}
            inert={sentTo ? true : undefined}
            className="grid content-start gap-5 p-[clamp(1.5rem,1rem+2.5vw,3rem)]"
          >
            <input
              type="text"
              name="_gotcha"
              tabIndex={-1}
              autoComplete="one-time-code"
              defaultValue=""
              className="hidden"
              aria-hidden="true"
            />

            <fieldset>
              <legend className="studio-small mb-3">{reach.topicsLabel}</legend>
              <div className="flex flex-wrap gap-2">
                {reach.topics.map((topic) => (
                  <button
                    key={topic}
                    type="button"
                    className="reach-topic"
                    aria-pressed={topics.includes(topic)}
                    onClick={() => toggleTopic(topic)}
                  >
                    {topic}
                  </button>
                ))}
              </div>
            </fieldset>

            <div className="grid gap-5 sm:grid-cols-2 sm:gap-3">
              <div className="reach-field" data-field data-invalid={invalid.name ? 'true' : undefined}>
                <input
                  id="name"
                  name="name"
                  placeholder=" "
                  autoComplete="name"
                  maxLength={120}
                  value={values.name}
                  disabled={sending}
                  aria-invalid={invalid.name || undefined}
                  aria-describedby={describedBy('name')}
                  onChange={(e) => update('name', e.target.value)}
                />
                <label htmlFor="name">{t('contact.name')}</label>
                {invalid.name ? (
                  <p id="name-error" className="mt-1.5 text-sm text-[#b71c1c]">
                    {reach.errors.name}
                  </p>
                ) : null}
              </div>
              <div className="reach-field" data-field data-invalid={invalid.email ? 'true' : undefined}>
                <input
                  id="email"
                  name="email"
                  type="email"
                  inputMode="email"
                  placeholder=" "
                  autoComplete="email"
                  maxLength={254}
                  value={values.email}
                  disabled={sending}
                  aria-invalid={invalid.email || undefined}
                  aria-describedby={describedBy('email')}
                  onChange={(e) => update('email', e.target.value)}
                />
                <label htmlFor="email">{t('common.email')}</label>
                {invalid.email ? (
                  <p id="email-error" className="mt-1.5 text-sm text-[#b71c1c]">
                    {reach.errors.email}
                  </p>
                ) : null}
              </div>
            </div>

            <div data-field>
              <div className="reach-field" data-invalid={invalid.message ? 'true' : undefined}>
                <textarea
                  id="message"
                  name="message"
                  placeholder=" "
                  maxLength={MESSAGE_MAX}
                  value={values.message}
                  disabled={sending}
                  aria-invalid={invalid.message || undefined}
                  aria-describedby={`message-count${invalid.message ? ' message-error' : ''}`}
                  onChange={(e) => update('message', e.target.value)}
                />
                <label htmlFor="message">{reach.messageLabel}</label>
                <span
                  id="message-count"
                  className="pointer-events-none absolute bottom-2.5 right-3 text-xs tabular-nums text-moove-muted"
                >
                  {values.message.length}/{MESSAGE_MAX}
                </span>
              </div>
              {invalid.message ? (
                <p id="message-error" className="mt-1.5 text-sm text-[#b71c1c]">
                  {t('contact.reach.errors.message', { min: MESSAGE_MIN })}
                </p>
              ) : null}
            </div>

            <div className="grid gap-2">
              <div className="flex items-baseline justify-between gap-4">
                <label htmlFor="visits" className="studio-small">
                  {reach.visitsLabel}
                </label>
                <b className="studio-small tabular-nums" aria-hidden>
                  {visitsLabel}
                </b>
              </div>
              <input
                id="visits"
                type="range"
                min={1}
                max={5}
                step={1}
                value={visits}
                disabled={sending}
                aria-valuetext={visitsLabel}
                onChange={(e) => setVisits(Number(e.target.value))}
                className="h-6 w-full cursor-pointer accent-moove-ink"
              />
            </div>

            <div data-field>
              <label className="flex items-start gap-3 leading-[1.5] text-moove-muted">
                <input
                  type="checkbox"
                  name="consent"
                  checked={values.consent}
                  disabled={sending}
                  aria-invalid={invalid.consent || undefined}
                  aria-describedby={describedBy('consent')}
                  onChange={(e) => update('consent', e.target.checked)}
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
              {invalid.consent ? (
                <p id="consent-error" className="mt-1.5 text-sm text-[#b71c1c]">
                  {reach.errors.consent}
                </p>
              ) : null}
            </div>

            {sendError ? (
              <p className="bg-red-50 px-4 py-3 text-red-800" role="alert">
                {sendError}
              </p>
            ) : null}

            <button
              type="submit"
              disabled={sending}
              aria-busy={sending || undefined}
              className="studio-button studio-button--ink w-full disabled:cursor-wait disabled:hover:translate-y-0"
            >
              {sending ? <span className="reach-spin" aria-hidden /> : null}
              <span className={sending ? 'opacity-70' : undefined}>
                {sending ? t('contact.sending') : reach.submit}
              </span>
            </button>
          </form>

          {/* Confirmation over the form, with the check drawn in */}
          <div className="reach-success" data-on={sentTo ? 'true' : 'false'} aria-live="polite">
            {sentTo ? (
              <div>
                <svg viewBox="0 0 84 84" className="mx-auto h-[84px] w-[84px]" aria-hidden>
                  <circle cx="42" cy="42" r="38" />
                  <path d="m27 43 10 10 20-22" />
                </svg>
                <h2
                  ref={successHeadingRef}
                  tabIndex={-1}
                  className="mt-5 text-[length:var(--step-lead)] font-extrabold tracking-[-0.03em] outline-none"
                >
                  {reach.successTitle}
                </h2>
                <p className="mx-auto mt-2 max-w-[34ch] text-moove-muted">
                  {t('contact.reach.successBody', { name: sentTo.name, email: sentTo.email })}
                </p>
                <button
                  type="button"
                  onClick={startOver}
                  className="studio-button mt-6 bg-moove-bg hover:bg-moove-elevated"
                >
                  {reach.again}
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  )
}
