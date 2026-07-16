import type { AuthError } from '@supabase/supabase-js'

export function sanitizeAuthRedirect(path: string | null): string {
  if (!path || !path.startsWith('/posing') || path.startsWith('//')) {
    return '/posing/account'
  }
  return path
}

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

  if (
    code === 'same_password' ||
    message.includes('same password') ||
    message.includes('should be different')
  ) {
    return t('posing.auth.samePassword')
  }

  if (message.includes('weak') || message.includes('too short')) {
    return t('posing.auth.weakPassword')
  }

  if (
    code === 'otp_expired' ||
    message.includes('expired') ||
    (message.includes('invalid') && message.includes('token'))
  ) {
    return t('posing.auth.resetLinkInvalid')
  }

  if (authError.message) return authError.message
  return t('posing.auth.errorGeneric')
}
