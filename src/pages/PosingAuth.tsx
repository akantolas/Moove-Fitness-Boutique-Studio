import { useEffect, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { PasswordInput } from '../components/PasswordInput'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { useTranslation } from '../i18n/useTranslation'

const inputClass =
  'mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white placeholder:text-white/35 focus:border-fuchsia-300/60 focus:outline-none focus:ring-2 focus:ring-fuchsia-300/20'

export function PosingLoginPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/posing/account'
  const { configured, loading, user, signIn } = usePosingAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate(redirect, { replace: true })
  }, [loading, navigate, redirect, user])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    setSubmitting(true)
    try {
      await signIn(email, password)
      navigate(redirect, { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : t('posing.auth.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-white/70">
        <p>{t('posing.auth.notConfigured')}</p>
        <Link to="/posing" className="mt-4 inline-block text-fuchsia-300 hover:underline">
          {t('posing.about.backToPosing')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-20">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
        Move & Pose
      </p>
      <h1 className="font-display mt-3 text-center text-3xl font-semibold text-white">
        {t('posing.auth.loginTitle')}
      </h1>
      <p className="mt-3 text-center text-sm text-white/60">{t('posing.auth.loginBody')}</p>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="login-email" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
            {t('common.email')}
          </label>
          <input
            id="login-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <PasswordInput
          id="login-password"
          label={t('posing.auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="current-password"
        />
        {error ? (
          <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? t('posing.auth.signingIn') : t('posing.auth.login')}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        {t('posing.auth.noAccount')}{' '}
        <Link
          to={`/posing/signup?redirect=${encodeURIComponent(redirect)}`}
          className="font-medium text-fuchsia-200 hover:underline"
        >
          {t('posing.auth.signup')}
        </Link>
      </p>
    </div>
  )
}

export function PosingSignupPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') ?? '/posing/account'
  const { configured, loading, user, signUp } = usePosingAuth()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && user) navigate(redirect, { replace: true })
  }, [loading, navigate, redirect, user])

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError(t('posing.auth.passwordMismatch'))
      return
    }

    setSubmitting(true)
    try {
      await signUp(email, password, fullName)
      setSuccess(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : t('posing.auth.errorGeneric'))
    } finally {
      setSubmitting(false)
    }
  }

  if (!configured) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center text-white/70">
        <p>{t('posing.auth.notConfigured')}</p>
      </div>
    )
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-semibold text-white">{t('posing.auth.signupSuccessTitle')}</h1>
        <p className="mt-4 text-sm leading-relaxed text-white/65">{t('posing.auth.signupSuccessBody')}</p>
        <Link
          to={`/posing/login?redirect=${encodeURIComponent(redirect)}`}
          className="mt-8 inline-flex rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black"
        >
          {t('posing.auth.login')}
        </Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-md px-4 py-16 sm:py-20">
      <p className="text-center text-xs font-semibold uppercase tracking-[0.28em] text-fuchsia-300/90">
        Move & Pose
      </p>
      <h1 className="font-display mt-3 text-center text-3xl font-semibold text-white">
        {t('posing.auth.signupTitle')}
      </h1>
      <p className="mt-3 text-center text-sm text-white/60">{t('posing.auth.signupBody')}</p>

      <form className="mt-10 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="signup-name" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
            {t('posing.auth.fullName')}
          </label>
          <input
            id="signup-name"
            required
            autoComplete="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className={inputClass}
          />
        </div>
        <div>
          <label htmlFor="signup-email" className="text-xs font-semibold uppercase tracking-[0.22em] text-white/55">
            {t('common.email')}
          </label>
          <input
            id="signup-email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </div>
        <PasswordInput
          id="signup-password"
          label={t('posing.auth.password')}
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
        />
        <PasswordInput
          id="signup-confirm-password"
          label={t('posing.auth.confirmPassword')}
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={8}
        />
        {error ? (
          <p className="rounded-xl border border-rose-300/25 bg-rose-400/10 px-4 py-3 text-sm text-rose-100">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={submitting || loading}
          className="w-full rounded-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 px-7 py-3 text-sm font-semibold text-black transition hover:brightness-110 disabled:opacity-50"
        >
          {submitting ? t('posing.auth.signingUp') : t('posing.auth.signup')}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-white/55">
        {t('posing.auth.hasAccount')}{' '}
        <Link
          to={`/posing/login?redirect=${encodeURIComponent(redirect)}`}
          className="font-medium text-fuchsia-200 hover:underline"
        >
          {t('posing.auth.login')}
        </Link>
      </p>
    </div>
  )
}
