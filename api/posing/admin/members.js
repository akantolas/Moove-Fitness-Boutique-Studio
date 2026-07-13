import { cors, ensureAdmin, getSupabaseAdmin, getUserFromRequest, json } from '../_lib.js'

const PROFILE_SELECT = 'id, full_name, email, phone, division, role, created_at, updated_at'

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data: members, error } = await supabase
      .from('profiles')
      .select(PROFILE_SELECT)
      .order('created_at', { ascending: false })

    if (error) return json(res, 500, { ok: false, error: error.message })
    return json(res, 200, { ok: true, members: members ?? [] })
  }

  if (req.method === 'DELETE') {
    const memberId = req.query?.id
    if (!memberId || typeof memberId !== 'string') {
      return json(res, 400, { ok: false, error: 'missing_id' })
    }

    if (memberId === user.id) {
      return json(res, 403, { ok: false, error: 'cannot_delete_self' })
    }

    const { data: target } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', memberId)
      .maybeSingle()

    if (!target) return json(res, 404, { ok: false, error: 'member_not_found' })
    if (target.role === 'admin') {
      return json(res, 403, { ok: false, error: 'cannot_delete_admin' })
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(memberId)
    if (deleteError) {
      return json(res, 500, { ok: false, error: deleteError.message })
    }

    return json(res, 200, { ok: true })
  }

  return json(res, 405, { ok: false, error: 'method_not_allowed' })
}
