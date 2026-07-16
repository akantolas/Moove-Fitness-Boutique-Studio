import { site } from '../site'
import { normalizeCalendarSettings, type CalendarSettings } from './posingDates'

export { isSupabaseConfigured } from './supabase'
export type { CalendarSettings }

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

export type AdminMember = {
  id: string
  full_name: string | null
  email: string
  phone: string | null
  division: string | null
  avatar_url: string | null
  role: string
  created_at: string
  updated_at: string
  user_packages?: AdminMemberPackage[]
  recent_bookings?: AdminMemberBooking[]
  plan_prices?: AdminMemberPlanPrice[]
}

export type AdminMemberPlanPrice = {
  plan_key: string
  price_eur: number
  note: string | null
  catalog_price_eur: number | null
  updated_at?: string
}

export type AdminMemberPackage = {
  id: string
  plan_key: string
  status: string
  sessions_total: number
  sessions_used: number
  created_at: string
}

export type AdminMemberBooking = {
  id: string
  status: string
  plan_key: string
  created_at: string
  slot: { start_at: string } | null
}

export type AdminPayment = {
  id: string
  plan_key: string
  status: string
  created_at: string
  user_id: string
  user_package_id: string | null
  profiles: { full_name: string | null; email: string; phone: string | null } | null
  slot: { start_at: string; end_at: string } | null
  user_package: { id: string; status: string; sessions_total: number } | null
}

export type AdminOverviewStats = {
  members: number
  pendingPayments: number
  activePackages: number
  weekBookings: number
}

export type AdminBookingRow = {
  id: string
  plan_key: string
  status: string
  created_at: string
  user_id: string
  profiles?: { full_name: string | null; email: string } | null
  slot?: { start_at: string; end_at: string } | null
}

export type AdminCalendarSlot = {
  id: string
  start_at: string
  end_at: string
  is_blocked: boolean
  booking?: {
    id: string
    status: string
    plan_key: string
    profiles?: { full_name: string | null; email: string } | null
  } | null
}

async function parseApiJson(res: Response) {
  const text = await res.text()
  try {
    return JSON.parse(text) as Record<string, unknown>
  } catch {
    throw new Error(text.startsWith('A server error') ? 'server_config_error' : 'invalid_api_response')
  }
}

export async function fetchPosingSlots(from: string, to: string): Promise<PosingSlot[]> {
  const res = await fetch(`/api/posing/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`)
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'slots_fetch_failed'))
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
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'booking_failed'))
  return data as {
    ok: boolean
    booking_id?: string
    booking_type?: 'new_package' | 'included_session'
    status?: string
    sessions_remaining?: number
    message?: string
  }
}

export async function fetchPosingMe(accessToken: string) {
  const res = await fetch('/api/posing/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'me_fetch_failed'))
  return data as {
    profile: { full_name: string | null; email: string; role: string }
    isAdmin: boolean
    packages: UserPackage[]
    bookings: PosingBooking[]
  }
}

export async function fetchAdminSlots(
  accessToken: string,
  from: string,
  to: string,
): Promise<AdminCalendarSlot[]> {
  const res = await fetch(
    `/api/posing/admin/slots?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
    { headers: { Authorization: `Bearer ${accessToken}` } },
  )
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'slots_failed'))
  return (data.slots ?? []) as AdminCalendarSlot[]
}

export async function adminCreateSlot(
  accessToken: string,
  start_at: string,
  end_at: string,
  is_blocked = false,
) {
  const res = await fetch('/api/posing/admin/slots', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ start_at, end_at, is_blocked }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'admin_slot_create_failed'))
  return data.slot
}

export async function adminUpdateSlot(
  accessToken: string,
  id: string,
  patch: { is_blocked: boolean },
) {
  const res = await fetch('/api/posing/admin/slots', {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ id, ...patch }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'admin_slot_update_failed'))
  return data.slot
}

export async function adminDeleteSlot(accessToken: string, id: string) {
  const res = await fetch(`/api/posing/admin/slots?id=${encodeURIComponent(id)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'admin_slot_delete_failed'))
}

export async function fetchAdminCalendarSettings(accessToken: string): Promise<CalendarSettings> {
  const res = await fetch('/api/posing/admin/calendar-settings', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'settings_fetch_failed'))
  return normalizeCalendarSettings(data.settings)
}

export async function saveAdminCalendarSettings(
  accessToken: string,
  payload: Omit<CalendarSettings, 'updated_at'>,
): Promise<CalendarSettings> {
  const res = await fetch('/api/posing/admin/calendar-settings', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'settings_save_failed'))
  return normalizeCalendarSettings(data.settings)
}

export async function fetchAdminMembers(accessToken: string): Promise<AdminMember[]> {
  const res = await fetch('/api/posing/admin/members', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'members_fetch_failed'))
  return data.members as AdminMember[]
}

export async function adminDeleteMember(accessToken: string, memberId: string) {
  const res = await fetch(`/api/posing/admin/members?id=${encodeURIComponent(memberId)}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'delete_member_failed'))
}

export async function adminUpsertMemberPrice(
  accessToken: string,
  userId: string,
  planKey: string,
  priceEur: number,
  note?: string,
) {
  const res = await fetch('/api/posing/admin/members', {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ user_id: userId, plan_key: planKey, price_eur: priceEur, note }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'price_save_failed'))
  return data.plan_price as AdminMemberPlanPrice
}

export async function adminDeleteMemberPrice(
  accessToken: string,
  userId: string,
  planKey: string,
) {
  const res = await fetch(
    `/api/posing/admin/members?id=${encodeURIComponent(userId)}&plan_key=${encodeURIComponent(planKey)}`,
    {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'price_delete_failed'))
}

export async function cancelPosingBooking(accessToken: string, bookingId: string, locale: string) {
  const res = await fetch(
    `/api/posing/bookings?id=${encodeURIComponent(bookingId)}&locale=${encodeURIComponent(locale)}`,
    {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'cancel_failed'))
  return data as { ok: boolean; already?: boolean }
}

export async function downloadBookingCalendar(
  accessToken: string,
  bookingId: string,
  locale: string,
) {
  const res = await fetch(
    `/api/posing/bookings?id=${encodeURIComponent(bookingId)}&format=ics&locale=${encodeURIComponent(locale)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
    },
  )
  if (!res.ok) {
    const data = await parseApiJson(res).catch(() => ({ error: 'calendar_download_failed' }))
    throw new Error(String(data.error ?? 'calendar_download_failed'))
  }
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = `move-pose-${bookingId.slice(0, 8)}.ics`
  anchor.click()
  URL.revokeObjectURL(url)
}

export async function fetchAdminOverview(accessToken: string): Promise<AdminOverviewStats> {
  const res = await fetch('/api/posing/admin/bookings?view=stats', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'overview_fetch_failed'))
  return data.stats as AdminOverviewStats
}

export async function fetchAdminPayments(accessToken: string): Promise<AdminPayment[]> {
  const res = await fetch('/api/posing/admin/bookings?view=payments', {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payments_fetch_failed'))
  return data.payments as AdminPayment[]
}

export async function adminConfirmPayment(accessToken: string, bookingId: string) {
  const res = await fetch('/api/posing/admin/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ booking_id: bookingId }),
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'payment_confirm_failed'))
  return data as { ok: boolean; already?: boolean }
}

export async function fetchAdminBookings(
  accessToken: string,
  status?: string,
): Promise<AdminBookingRow[]> {
  const url = status
    ? `/api/posing/admin/bookings?status=${encodeURIComponent(status)}`
    : '/api/posing/admin/bookings'
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  const data = await parseApiJson(res)
  if (!res.ok || !data.ok) throw new Error(String(data.error ?? 'bookings_fetch_failed'))
  return data.bookings as AdminBookingRow[]
}

export const posingPackageKeys = site.posing.packageKeys
