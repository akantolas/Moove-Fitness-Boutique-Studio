import { createSupabaseClient } from './supabase'
import type { PosingBooking, UserPackage } from './posingApi'

export async function fetchPosingAccountData(userId: string) {
  const supabase = createSupabaseClient()

  const [packagesRes, bookingsRes, profileRes] = await Promise.all([
    supabase
      .from('user_packages')
      .select('id, plan_key, sessions_total, sessions_used, status, period_start, period_end, created_at')
      .order('created_at', { ascending: false }),
    supabase
      .from('posing_bookings')
      .select('id, plan_key, status, created_at, slot:availability_slots(start_at, end_at)')
      .order('created_at', { ascending: false }),
    supabase.from('profiles').select('full_name, email, role').eq('id', userId).maybeSingle(),
  ])

  if (packagesRes.error) throw new Error(packagesRes.error.message)
  if (bookingsRes.error) throw new Error(bookingsRes.error.message)

  const profile = profileRes.error ? null : profileRes.data ?? null

  const packages: UserPackage[] = (packagesRes.data ?? []).map((p) => ({
    ...p,
    sessions_remaining: Math.max(0, p.sessions_total - p.sessions_used),
  }))

  const bookings: PosingBooking[] = (bookingsRes.data ?? []).map((row) => {
    const slot = Array.isArray(row.slot) ? row.slot[0] ?? null : row.slot
    return {
      id: row.id,
      plan_key: row.plan_key,
      status: row.status,
      created_at: row.created_at,
      slot,
    }
  })

  return {
    profile,
    isAdmin: profile?.role === 'admin',
    packages,
    bookings,
  }
}
