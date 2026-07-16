import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { usePosingAuth } from '../contexts/PosingAuthContext'
import { useTranslation } from '../i18n/useTranslation'
import { createSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import { sanitizeAuthRedirect } from '../lib/posingAuthErrors'

export function PosingOAuthCallbackPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { loading, user } = usePosingAuth()
  const redirect = sanitizeAuthRedirect(searchParams.get('redirect'))
  const oauthError = searchParams.get('error')

  useEffect(() => {
    if (!isSupabaseConfigured) return
    void createSupabaseClient().auth.getSession()
  }, [])

  useEffect(() => {
    if (oauthError) {
      navigate(`/posing/login?redirect=${encodeURIComponent(redirect)}`, { replace: true })
      return
    }

    if (!loading && user) {
      navigate(redirect, { replace: true })
    }
  }, [loading, navigate, oauthError, redirect, user])

  return (
    <div className="mx-auto max-w-md px-4 py-16 text-center text-white/60">
      <p>{t('posing.account.loading')}</p>
    </div>
  )
}

export function PosingOAuthReturnGuard() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const search = window.location.search
    const hash = window.location.hash
    const onHome = window.location.pathname === '/'
    const hasCallback =
      searchParams.has('code') ||
      searchParams.has('error') ||
      hash.includes('access_token') ||
      hash.includes('error=')

    if (onHome && hasCallback) {
      const redirect = searchParams.get('redirect')
      const redirectQuery = redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''
      navigate(`/posing/auth/callback${redirectQuery}${search}${hash}`, { replace: true })
    }
  }, [navigate, searchParams])

  return null
}
