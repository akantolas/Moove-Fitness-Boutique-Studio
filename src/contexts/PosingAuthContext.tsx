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

type PosingAuthContextValue = {
  configured: boolean
  loading: boolean
  user: User | null
  session: Session | null
  accessToken: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signOut: () => Promise<void>
}

const PosingAuthContext = createContext<PosingAuthContextValue | null>(null)

export function PosingAuthProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [session, setSession] = useState<Session | null>(null)
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    if (!isSupabaseConfigured) return

    const supabase = createSupabaseClient()
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      setUser(data.session?.user ?? null)
      setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession)
      setUser(nextSession?.user ?? null)
      setLoading(false)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  }, [])

  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${window.location.origin}/posing/account`,
      },
    })
    if (error) throw error
  }, [])

  const signOut = useCallback(async () => {
    const supabase = createSupabaseClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }, [])

  const value = useMemo(
    () => ({
      configured: isSupabaseConfigured,
      loading,
      user,
      session,
      accessToken: session?.access_token ?? null,
      signIn,
      signUp,
      signOut,
    }),
    [loading, session, signIn, signOut, signUp, user],
  )

  return <PosingAuthContext.Provider value={value}>{children}</PosingAuthContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components -- auth hook colocated with provider
export function usePosingAuth() {
  const ctx = useContext(PosingAuthContext)
  if (!ctx) throw new Error('usePosingAuth must be used within PosingAuthProvider')
  return ctx
}
