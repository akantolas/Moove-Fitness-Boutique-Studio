import { createSupabaseClient } from './supabase'
import type { PosingBooking, UserPackage } from './posingApi'

export type PosingProfile = {
  full_name: string | null
  email: string
  phone: string | null
  division: string | null
  notes: string | null
  role: string
}

export type PosingProfileInput = {
  full_name: string
  phone: string
  division: string
  notes: string
}

const profileSelect = 'full_name, email, phone, division, notes, role'

export async function fetchPosingIsAdmin(userId: string): Promise<boolean> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw new Error(error.message)
  return data?.role === 'admin'
}

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
    supabase.from('profiles').select(profileSelect).eq('id', userId).maybeSingle(),
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
    profile: profile as PosingProfile | null,
    isAdmin: profile?.role === 'admin',
    packages,
    bookings,
  }
}

export async function updatePosingProfile(
  userId: string,
  email: string,
  input: PosingProfileInput,
): Promise<PosingProfile> {
  const supabase = createSupabaseClient()
  const payload = {
    full_name: input.full_name.trim() || null,
    phone: input.phone.trim() || null,
    division: input.division.trim() || null,
    notes: input.notes.trim() || null,
    updated_at: new Date().toISOString(),
  }

  const { data: updated, error: updateError } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', userId)
    .select(profileSelect)
    .maybeSingle()

  if (!updateError && updated) {
    return updated as PosingProfile
  }

  const { data: inserted, error: insertError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email,
      role: 'client',
      ...payload,
    })
    .select(profileSelect)
    .single()

  if (insertError || !inserted) {
    throw new Error(insertError?.message ?? updateError?.message ?? 'profile_save_failed')
  }

  return inserted as PosingProfile
}

export async function deletePosingAccount(accessToken: string, password: string) {
  const res = await fetch('/api/posing/account/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ password }),
  })

  const text = await res.text()
  let data: Record<string, unknown> = {}
  try {
    data = JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error('server_config_error')
  }

  if (!res.ok || !data.ok) {
    throw new Error(String(data.error ?? 'delete_failed'))
  }
}
