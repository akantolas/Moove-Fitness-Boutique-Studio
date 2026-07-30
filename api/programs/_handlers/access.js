import {
  cors,
  getIncludedWorkoutKeys,
  getProgramContentForApi,
  getProgramName,
  getSupabaseAdmin,
  getWorkoutGroup,
  json,
  normalizeBookingLocale,
} from '../_lib.js'

export function buildProgramAccessPayload(programKey, locale, requestedWorkout = '') {
  const workoutKeys = getIncludedWorkoutKeys(programKey)
  if (!workoutKeys.length) {
    return { status: 404, error: 'content_not_found' }
  }
  if (requestedWorkout && !workoutKeys.includes(requestedWorkout)) {
    return { status: 403, error: 'workout_not_in_purchase' }
  }

  const activeWorkoutKey = requestedWorkout || workoutKeys[0]
  const content = getProgramContentForApi(activeWorkoutKey, locale)
  if (!content) return { status: 404, error: 'content_not_found' }

  return {
    status: 200,
    payload: {
      title: getProgramName(programKey, locale),
      programKey,
      workouts: workoutKeys.map((workoutKey) => ({
        key: workoutKey,
        title: getProgramName(workoutKey, locale),
        group: getWorkoutGroup(workoutKey),
      })),
      activeWorkoutKey,
      workoutTitle: getProgramName(activeWorkoutKey, locale),
      meta: content.meta ?? undefined,
      sections: content.sections,
    },
  }
}

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
  const requestedWorkout = String(req.query?.workout ?? '').trim()
  const access = buildProgramAccessPayload(
    purchase.program_key,
    contentLocale,
    requestedWorkout,
  )
  if (!access.payload) {
    return json(res, access.status, { ok: false, error: access.error })
  }

  return json(res, 200, {
    ok: true,
    ...access.payload,
  })
}
