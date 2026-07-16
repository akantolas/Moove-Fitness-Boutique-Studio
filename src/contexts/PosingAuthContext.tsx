import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { createSupabaseClient, isSupabaseConfigured } from '../lib/supabase'
import { normalizeAuthEmail, type OAuthProvider, sanitizeAuthRedirect } from '../lib/posingAuthErrors'

export type { OAuthProvider } from '../lib/posingAuthErrors'

type PosingAuthContextValue = {
  configured: boolean
  loading: boolean
  user: User | null
  session: Session | null
  accessToken: string | null
  passwordRecovery: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signInWithOAuth: (provider: OAuthProvider, redirectPath: string) => Promise<void>
  signOut: () => Promise<void>
  requestPasswordReset: (email: string) => Promise<void>
  updatePassword: (password: string) => Promise<void>
}

const PosingAuthContext = createContext<PosingAuthContextValue | null>(null)

export function PosingAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [passwordRecovery, setPasswordRecovery] = useState(false)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createSupabaseClient()

    const { data: sub } = supabase.auth.onAuthStateChange((event, nextSession) => {
      if (event === 'PASSWORD_RECOVERY') {
        setPasswordRecovery(true)
      }
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({
      email: normalizeAuthEmail(email),
      password,
    })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email: normalizeAuthEmail(email),
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/posing/account`,
      },
    })
    if (error) throw error
  }, [])

  const signInWithOAuth = useCallback(async (provider: OAuthProvider, redirectPath: string) => {
    const supabase = createSupabaseClient()
    const safeRedirect = sanitizeAuthRedirect(redirectPath)
    const callbackUrl = new URL('/posing/auth/callback', window.location.origin)
    callbackUrl.searchParams.set('redirect', safeRedirect)
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: callbackUrl.toString(),
        ...(provider === 'apple' ? { scopes: 'name email' } : {}),
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setPasswordRecovery(false)
  }, [])

  const requestPasswordReset = useCallback(async (email: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.resetPasswordForEmail(normalizeAuthEmail(email), {
      redirectTo: `${window.location.origin}/posing/reset-password`,
    })
    if (error) throw error
  }, [])

  const updatePassword = useCallback(async (password: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.updateUser({ password })
    if (error) throw error
    setPasswordRecovery(false)
  }, [])

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user,
      session,
      accessToken: session?.access_token ?? null,
      passwordRecovery,
      signIn,
      signUp,
      signInWithOAuth,
      signOut,
      requestPasswordReset,
      updatePassword,
    }),
    [
      loading,
      passwordRecovery,
      session,
      signIn,
      signInWithOAuth,
      signOut,
      signUp,
      requestPasswordReset,
      updatePassword,
      user,
    ],
  )

  return <PosingAuthContext.Provider value={value}>{children}</PosingAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- auth hook colocated with provider
export function usePosingAuth() {
  const ctx = useContext(PosingAuthContext)
  if (!ctx) throw new Error('usePosingAuth must be used within PosingAuthProvider')
  return ctx
}
