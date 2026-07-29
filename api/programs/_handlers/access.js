import {
  cors,
  getProgramContentForApi,
  getProgramName,
  getSupabaseAdmin,
  json,
  normalizeBookingLocale,
} from '../_lib.js'

export async function handleAccess(req, res, tokenFromPath) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'GET') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  const token = String(tokenFromPath ?? '').trim()
  if (!token || token.length < 16) {
    return json(res, 404, { ok: false, error: 'not_found' })
  }

  const locale = normalizeBookingLocale(req.query?.locale)

  const supabase = getSupabaseAdmin()
  const { data: purchase } = await supabase
    .from('moove_program_purchases')
    .select('id, program_key, status, locale')
    .eq('access_token', token)
    .maybeSingle()

  if (!purchase || purchase.status !== 'paid') {
    return json(res, 404, { ok: false, error: 'not_found' })
  }

  const contentLocale = locale || purchase.locale || 'el'
  const content = getProgramContentForApi(purchase.program_key, contentLocale)
  if (!content) return json(res, 404, { ok: false, error: 'content_not_found' })

  return json(res, 200, {
    ok: true,
    title: getProgramName(purchase.program_key, contentLocale),
    programKey: purchase.program_key,
    meta: content.meta ?? undefined,
    sections: content.sections,
  })
}
