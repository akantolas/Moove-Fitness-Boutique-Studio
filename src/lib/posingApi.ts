import { site } from '../site'

export { isSupabaseConfigured } from './supabase'

export type PosingSlot = {
  id: string
  start_at: string
  end_at: string
}

export type UserPackage = {
  id: string
  plan_key: string
  sessions_total: number
  sessions_used: number
  sessions_remaining: number
  status: string
  period_start: string | null
  period_end: string | null
}

export type PosingBooking = {
  id: string
  plan_key: string
  status: string
  created_at: string
  slot: { start_at: string; end_at: string } | null
}

export async function fetchPosingSlots(from: string, to: string): Promise<PosingSlot[]> {
  const res = await fetch(`/api/posing/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'slots_fetch_failed')
  return data.slots as PosingSlot[]
}

export async function createPosingBooking(
  accessToken: string,
  payload: { slot_id: string; plan_key: string; locale: string },
) {
  const res = await fetch('/api/posing/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'booking_failed')
  return data
}

export async function fetchPosingMe(accessToken: string) {
  const res = await fetch('/api/posing/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'me_fetch_failed')
  return data as {
    profile: { full_name: string | null; email: string; role: string }
    isAdmin: boolean
    packages: UserPackage[]
    bookings: PosingBooking[]
  }
}

export async function adminCreateSlot(accessToken: string, start_at: string, end_at: string) {
  const res = await fetch('/api/posing/admin/slots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ start_at, end_at }),
  })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'admin_slot_create_failed')
  return data.slot
}

export async function adminDeleteSlot(accessToken: string, id: string) {
  const res = await fetch(`/api/posing/admin/slots?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await res.json()
  if (!res.ok || !data.ok) throw new Error(data.error ?? 'admin_slot_delete_failed')
}

export const posingPackageKeys = site.posing.packageKeys
