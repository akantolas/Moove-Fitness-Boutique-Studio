import {
  buildPackageExpiryReminderEmail,
  formatPackageDate,
} from '../../../lib/email/templates.js'
import {
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
  sendPosingEmailReliable,
} from '../_lib.js'

export const REMINDER_DAYS_BEFORE_EXPIRY = 5

/** Active packages expiring within the window that still have sessions and were not reminded for this expiry. */
export function packagesToRemind(packages, now = Date.now()) {
  const windowEnd = now + REMINDER_DAYS_BEFORE_EXPIRY * 86400000
  return packages.filter((pkg) => {
    const end = Date.parse(pkg.period_end ?? '')
    return (
      pkg.status === 'active' &&
      end > now &&
      end <= windowEnd &&
      pkg.sessions_total > pkg.sessions_used &&
      Date.parse(pkg.expiry_reminder_for ?? '') !== end
    )
  })
}

/** Daily Vercel cron: emails members whose package expires soon with sessions left. */
export async function handleExpiryReminders(req, res) {
  if (req.method !== 'GET')
    return json(res, 405, { ok: false, error: 'method_not_allowed' })
  const secret = process.env.CRON_SECRET
  if (!secret) return json(res, 503, { ok: false, error: 'cron_not_configured' })
  if (req.headers.authorization !== `Bearer ${secret}`) {
    return json(res, 401, { ok: false, error: 'unauthorized' })
  }

  const supabase = getSupabaseAdmin()
  const now = new Date()
  const { data: candidates, error } = await supabase
    .from('user_packages')
    .select(
      'id, user_id, plan_key, status, sessions_total, sessions_used, period_end, expiry_reminder_for',
    )
    .eq('status', 'active')
    .gt('period_end', now.toISOString())
    .lte(
      'period_end',
      new Date(
        now.getTime() + REMINDER_DAYS_BEFORE_EXPIRY * 86400000,
      ).toISOString(),
    )
  if (error) return json(res, 500, { ok: false, error: 'packages_fetch_failed' })

  const from = process.env.POSE_FROM_EMAIL ?? 'Move & Pose <info@moovefitness.gr>'
  let sent = 0
  const failed = []
  for (const pkg of packagesToRemind(candidates ?? [], now.getTime())) {
    try {
      const [{ data: profile }, { data: plan }, { data: lastBooking }] =
        await Promise.all([
          supabase
            .from('profiles')
            .select('full_name, email')
            .eq('id', pkg.user_id)
            .maybeSingle(),
          supabase
            .from('package_plans')
            .select('name_en, name_el')
            .eq('key', pkg.plan_key)
            .maybeSingle(),
          supabase
            .from('posing_bookings')
            .select('locale')
            .eq('user_package_id', pkg.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .maybeSingle(),
        ])
      if (!profile?.email) throw new Error('missing_email')
      const locale = normalizeBookingLocale(lastBooking?.locale)
      const email = buildPackageExpiryReminderEmail({
        attendeeName: profile.full_name ?? profile.email.split('@')[0],
        packageName:
          (locale === 'el' ? plan?.name_el : plan?.name_en) ?? pkg.plan_key,
        planKey: pkg.plan_key,
        sessionsRemaining: pkg.sessions_total - pkg.sessions_used,
        validUntil: formatPackageDate(pkg.period_end, locale),
        locale,
      })
      await sendPosingEmailReliable({
        from,
        to: [profile.email],
        subject: email.subject,
        html: email.html,
        text: email.text,
        idempotencyKey: `posing-expiry-reminder-${pkg.id}-${Date.parse(pkg.period_end)}`,
      })
      await supabase
        .from('user_packages')
        .update({ expiry_reminder_for: pkg.period_end })
        .eq('id', pkg.id)
      sent += 1
    } catch (err) {
      console.error('posing expiry reminder failed:', { packageId: pkg.id, error: err })
      failed.push(pkg.id)
    }
  }

  return json(res, failed.length ? 500 : 200, { ok: failed.length === 0, sent, failed })
}
