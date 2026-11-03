import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? ''

// A masked or placeholder URL (e.g. from `vercel env pull`) counts as unconfigured,
// so the studio pages still render instead of crashing on startup.
export const isSupabaseConfigured = Boolean(/^https?:\/\//.test(supabaseUrl) && supabaseAnonKey)

export function createSupabaseClient() {
  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured')
  }
  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      detectSessionInUrl: true,
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}
