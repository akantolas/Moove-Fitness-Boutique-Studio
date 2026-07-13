import type { AuthError } from '@supabase/supabase-js'

export function normalizeAuthEmail(email: string) {
  return email.trim().toLowerCase()
}

export function translateAuthError(error: unknown, t: (key: string) => string) {
  if (!error || typeof error !== 'object') {
    return t('posing.auth.errorGeneric')
  }

  const authError = error as AuthError
  const code = authError.code?.toLowerCase() ?? ''
  const message = (authError.message ?? '').toLowerCase()

  if (code === 'email_not_confirmed' || message.includes('email not confirmed')) {
    return t('posing.auth.emailNotConfirmed')
  }

  if (
    code === 'invalid_credentials' ||
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials')
  ) {
    return t('posing.auth.invalidCredentials')
  }

  if (message.includes('rate limit') || code === 'over_email_send_rate_limit') {
    return t('posing.auth.rateLimit')
  }

  if (authError.message) return authError.message
  return t('posing.auth.errorGeneric')
}
