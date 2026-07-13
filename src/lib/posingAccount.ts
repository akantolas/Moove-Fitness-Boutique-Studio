import { createSupabaseClient } from './supabase'
import type { PosingBooking, UserPackage } from './posingApi'

export type PosingProfile = {
  full_name: string | null
  email: string
  phone: string | null
  division: string | null
  notes: string | null
  avatar_url: string | null
  role: string
  created_at: string
}

export type PosingProfileInput = {
  full_name: string
  phone: string
  division: string
  notes: string
}

const AVATAR_BUCKET = 'posing-avatars'
const MAX_AVATAR_BYTES = 2 * 1024 * 1024
const ALLOWED_AVATAR_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

const profileSelect = 'full_name, email, phone, division, notes, avatar_url, role, created_at'

export function getProfileInitials(fullName: string | null, email: string) {
  if (fullName?.trim()) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean)
    if (parts.length >= 2) {
      return `${parts[0][0] ?? ''}${parts[parts.length - 1][0] ?? ''}`.toUpperCase()
    }
    return parts[0].slice(0, 2).toUpperCase()
  }
  return email.slice(0, 2).toUpperCase()
}

function resizeImageToAvatar(file: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const img = new Image()
    img.onload = () => {
      const size = 400
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      const ctx = canvas.getContext('2d')
      if (!ctx) {
        URL.revokeObjectURL(url)
        reject(new Error('avatar_resize_failed'))
        return
      }
      const scale = Math.max(size / img.width, size / img.height)
      const w = img.width * scale
      const h = img.height * scale
      ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h)
      canvas.toBlob(
        (blob) => {
          URL.revokeObjectURL(url)
          if (blob) resolve(blob)
          else reject(new Error('avatar_resize_failed'))
        },
        'image/jpeg',
        0.85,
      )
    }
    img.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('avatar_invalid_type'))
    }
    img.src = url
  })
}

export async function uploadPosingAvatar(userId: string, file: File): Promise<string> {
  if (!ALLOWED_AVATAR_TYPES.has(file.type)) {
    throw new Error('avatar_invalid_type')
  }
  if (file.size > MAX_AVATAR_BYTES) {
    throw new Error('avatar_too_large')
  }

  const blob = await resizeImageToAvatar(file)
  const path = `${userId}/avatar.jpg`
  const supabase = createSupabaseClient()

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, blob, { upsert: true, contentType: 'image/jpeg' })

  if (uploadError) throw new Error(uploadError.message)

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path)
  const publicUrl = data.publicUrl

  const { error: updateError } = await supabase
    .from('profiles')
    .update({ avatar_url: publicUrl, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (updateError) throw new Error(updateError.message)
  return publicUrl
}

export async function removePosingAvatar(userId: string) {
  const supabase = createSupabaseClient()
  const path = `${userId}/avatar.jpg`

  await supabase.storage.from(AVATAR_BUCKET).remove([path])

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: null, updated_at: new Date().toISOString() })
    .eq('id', userId)

  if (error) throw new Error(error.message)
}

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

const MIN_PASSWORD_LENGTH = 8

export async function changePosingPassword(
  email: string,
  currentPassword: string,
  newPassword: string,
) {
  if (newPassword.length < MIN_PASSWORD_LENGTH) {
    throw new Error('password_too_short')
  }
  if (currentPassword === newPassword) {
    throw new Error('password_same_as_current')
  }

  const supabase = createSupabaseClient()
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password: currentPassword,
  })
  if (signInError) throw new Error('invalid_password')

  const { error } = await supabase.auth.updateUser({ password: newPassword })
  if (error) {
    if (error.message.toLowerCase().includes('same')) {
      throw new Error('password_same_as_current')
    }
    throw new Error(error.message)
  }
}
