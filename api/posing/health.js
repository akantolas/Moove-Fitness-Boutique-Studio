import { cors, getSupabaseAdmin, hasEmailTransportConfig, json } from './_lib.js'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const hasUrl = Boolean(process.env.SUPABASE_URL ?? process.env.VITE_SUPABASE_URL)
  const hasServiceKey = Boolean(
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.SUPABASE_SECRET_KEY,
  )

  let adminClientOk = false
  if (hasUrl && hasServiceKey) {
    try {
      getSupabaseAdmin()
      adminClientOk = true
    } catch {
      adminClientOk = false
    }
  }

  return json(res, 200, {
    ok: true,
    hasUrl,
    hasServiceKey,
    adminClientOk,
    hasEmail: hasEmailTransportConfig(),
    emailProvider: process.env.SMTP_USER || process.env.SMTP_EMAIL
      ? 'smtp'
      : process.env.RESEND_API_KEY
        ? 'resend'
        : null,
    hint: !hasUrl
      ? 'Set SUPABASE_URL on Vercel (not only VITE_SUPABASE_URL)'
      : !hasServiceKey
        ? 'Set SUPABASE_SERVICE_ROLE_KEY (legacy service_role JWT)'
        : !hasEmailTransportConfig()
          ? 'Set RESEND_API_KEY (ImprovMX + Resend) or SMTP_USER + SMTP_PASS'
          : null,
  })
}
