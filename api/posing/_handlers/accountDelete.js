import {
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  readJsonBody,
} from '../_lib.js'

export async function handleAccountDelete(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()
  if (req.method !== 'POST') return json(res, 405, { ok: false, error: 'method_not_allowed' })

  try {
    const user = await getUserFromRequest(req)
    if (!user?.email) return json(res, 401, { ok: false, error: 'unauthorized' })

    if (await ensureAdmin(user)) {
      return json(res, 403, { ok: false, error: 'admin_cannot_delete' })
    }

    const body = await readJsonBody(req)
    const password = body?.password
    if (!password || typeof password !== 'string') {
      return json(res, 400, { ok: false, error: 'password_required' })
    }

    const supabase = getSupabaseAdmin()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    })
    if (signInError) {
      return json(res, 401, { ok: false, error: 'invalid_password' })
    }

    const { data: activeBookings } = await supabase
      .from('posing_bookings')
      .select('id')
      .eq('user_id', user.id)
      .in('status', ['pending_payment', 'confirmed'])
      .limit(1)

    if ((activeBookings ?? []).length > 0) {
      return json(res, 409, { ok: false, error: 'active_bookings' })
    }

    const { error: deleteError } = await supabase.auth.admin.deleteUser(user.id)
    if (deleteError) {
      return json(res, 500, { ok: false, error: deleteError.message })
    }

    return json(res, 200, { ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'server_error'
    return json(res, 500, { ok: false, error: message })
  }
}
