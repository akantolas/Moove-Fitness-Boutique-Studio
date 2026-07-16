import { useState } from 'react'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { translateAuthError } from '../lib/posingAuthErrors'
import { useTranslation } from '../i18n/useTranslation'

const oauthButtonClass =
  'flex w-full items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.04] px-4 py-3 text-sm font-semibold text-white transition hover:border-white/22 hover:bg-white/[0.08] disabled:cursor-not-allowed disabled:opacity-50'

type PosingOAuthButtonsProps = {
  redirect: string
  disabled?: boolean
  onError?: (message: string) => void
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

export function PosingOAuthButtons({ redirect, disabled = false, onError }: PosingOAuthButtonsProps) {
  const { t } = useTranslation()
  const { signInWithGoogle } = usePosingAuth()
  const [loading, setLoading] = useState(false)

  async function handleGoogle() {
    onError?.('')
    setLoading(true)
    try {
      await signInWithGoogle(redirect)
    } catch (err) {
      onError?.(translateAuthError(err, t))
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        disabled={disabled || loading}
        onClick={handleGoogle}
        className={oauthButtonClass}
      >
        <GoogleIcon />
        {loading ? t('posing.auth.oauthRedirecting') : t('posing.auth.continueWithGoogle')}
      </button>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center" aria-hidden>
          <div className="w-full border-t border-white/10" />
        </div>
        <p className="relative mx-auto w-fit bg-[#08080c] px-3 text-xs font-medium uppercase tracking-[0.2em] text-white/40">
          {t('posing.auth.orContinueWithEmail')}
        </p>
      </div>
    </div>
  )
}
