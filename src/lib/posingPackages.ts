import { createSupabaseClient } from './supabase'
import type { PosingPlanKey } from '../site'

export type PackagePlan = {
  key: string
  name_en: string
  name_el: string
  sessions_total: number
  period_days: number
  duration_minutes: number
}

export type PackageQuotaStatus = 'none' | 'pending_payment' | 'active' | 'exhausted'

export type PackageQuota = {
  planKey: string
  sessionsTotal: number
  sessionsUsed: number
  sessionsRemaining: number
  status: PackageQuotaStatus
  userPackageId: string | null
}

export async function fetchPackagePlan(planKey: PosingPlanKey): Promise<PackagePlan | null> {
  const supabase = createSupabaseClient()
  const { data, error } = await supabase
    .from('package_plans')
    .select('key, name_en, name_el, sessions_total, period_days, duration_minutes')
    .eq('key', planKey)
    .maybeSingle()

  if (error || !data) return null
  return data as PackagePlan
}

export async function fetchUserPackageQuota(
  userId: string,
  planKey: PosingPlanKey,
): Promise<PackageQuota> {
  const plan = await fetchPackagePlan(planKey)
  const sessionsTotal = plan?.sessions_total ?? 1

  const supabase = createSupabaseClient()
  const now = new Date().toISOString()

  const { data: pending } = await supabase
    .from('user_packages')
    .select('id, sessions_total, sessions_used')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .eq('status', 'pending_payment')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (pending) {
    const total = pending.sessions_total
    const used = pending.sessions_used
    return {
      planKey,
      sessionsTotal: total,
      sessionsUsed: used,
      sessionsRemaining: Math.max(0, total - used),
      status: 'pending_payment',
      userPackageId: pending.id,
    }
  }

  const { data: active } = await supabase
    .from('user_packages')
    .select('id, sessions_total, sessions_used')
    .eq('user_id', userId)
    .eq('plan_key', planKey)
    .eq('status', 'active')
    .gt('period_end', now)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle()

  if (active) {
    const remaining = Math.max(0, active.sessions_total - active.sessions_used)
    return {
      planKey,
      sessionsTotal: active.sessions_total,
      sessionsUsed: active.sessions_used,
      sessionsRemaining: remaining,
      status: remaining > 0 ? 'active' : 'exhausted',
      userPackageId: active.id,
    }
  }

  return {
    planKey,
    sessionsTotal,
    sessionsUsed: 0,
    sessionsRemaining: sessionsTotal,
    status: 'none',
    userPackageId: null,
  }
}

export function sumActiveSessionsRemaining(
  packages: Array<{ status: string; sessions_total: number; sessions_used: number }>,
) {
  return packages
    .filter((p) => p.status === 'active')
    .reduce((sum, p) => sum + Math.max(0, p.sessions_total - p.sessions_used), 0)
}
