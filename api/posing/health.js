import { cors, getSupabaseAdmin, json } from '../_lib.js'

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
    hint: !hasUrl
      ? 'Set SUPABASE_URL on Vercel (not only VITE_SUPABASE_URL)'
      : !hasServiceKey
        ? 'Set SUPABASE_SERVICE_ROLE_KEY (legacy service_role JWT)'
        : null,
  })
}
