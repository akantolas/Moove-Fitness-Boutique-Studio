import {
  cors,
  ensureAdmin,
  getSupabaseAdmin,
  getUserFromRequest,
  json,
  readJsonBody,
} from '../_lib.js'

const TIME_RE = /^([01]\d|2[0-3]):([0-5]\d)$/
const GRID_STEPS = new Set([15, 30, 60])

const DEFAULTS = {
  day_template_times: ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'],
  default_duration_minutes: 30,
  grid_start_hour: 9,
  grid_end_hour: 21,
  grid_step_minutes: 30,
}

function normalizeTime(value) {
  if (typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!TIME_RE.test(trimmed)) return null
  const [hour, minute] = trimmed.split(':')
  return `${hour}:${minute}`
}

function sortTimes(times) {
  return [...times].sort((a, b) => {
    const [ah, am] = a.split(':').map(Number)
    const [bh, bm] = b.split(':').map(Number)
    return ah * 60 + am - (bh * 60 + bm)
  })
}

function validateSettings(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body' }
  }

  const rawTimes = body.day_template_times
  if (!Array.isArray(rawTimes)) {
    return { ok: false, error: 'invalid_template_times' }
  }

  const normalized = []
  const seen = new Set()
  for (const raw of rawTimes) {
    const time = normalizeTime(raw)
    if (!time) return { ok: false, error: 'invalid_time_format' }
    if (seen.has(time)) continue
    seen.add(time)
    normalized.push(time)
  }

  const defaultDuration = Number(body.default_duration_minutes)
  if (!Number.isInteger(defaultDuration) || defaultDuration < 15 || defaultDuration > 120) {
    return { ok: false, error: 'invalid_duration' }
  }

  const gridStart = Number(body.grid_start_hour)
  const gridEnd = Number(body.grid_end_hour)
  if (
    !Number.isInteger(gridStart) ||
    !Number.isInteger(gridEnd) ||
    gridStart < 0 ||
    gridStart > 23 ||
    gridEnd < 1 ||
    gridEnd > 24 ||
    gridEnd <= gridStart
  ) {
    return { ok: false, error: 'invalid_grid_hours' }
  }

  const gridStep = Number(body.grid_step_minutes)
  if (!GRID_STEPS.has(gridStep)) {
    return { ok: false, error: 'invalid_grid_step' }
  }

  return {
    ok: true,
    settings: {
      day_template_times: sortTimes(normalized),
      default_duration_minutes: defaultDuration,
      grid_start_hour: gridStart,
      grid_end_hour: gridEnd,
      grid_step_minutes: gridStep,
    },
  }
}

function toResponse(row) {
  return {
    day_template_times: row.day_template_times ?? DEFAULTS.day_template_times,
    default_duration_minutes: row.default_duration_minutes ?? DEFAULTS.default_duration_minutes,
    grid_start_hour: row.grid_start_hour ?? DEFAULTS.grid_start_hour,
    grid_end_hour: row.grid_end_hour ?? DEFAULTS.grid_end_hour,
    grid_step_minutes: row.grid_step_minutes ?? DEFAULTS.grid_step_minutes,
    updated_at: row.updated_at ?? null,
  }
}

export default async function handler(req, res) {
  cors(res)
  if (req.method === 'OPTIONS') return res.status(204).end()

  const user = await getUserFromRequest(req)
  if (!user) return json(res, 401, { ok: false, error: 'unauthorized' })
  if (!(await ensureAdmin(user))) return json(res, 403, { ok: false, error: 'forbidden' })

  const supabase = getSupabaseAdmin()

  if (req.method === 'GET') {
    const { data, error } = await supabase
      .from('posing_calendar_settings')
      .select(
        'day_template_times, default_duration_minutes, grid_start_hour, grid_end_hour, grid_step_minutes, updated_at',
      )
      .eq('id', 1)
      .maybeSingle()

    if (error) return json(res, 500, { ok: false, error: error.message })
    return json(res, 200, { ok: true, settings: toResponse(data ?? DEFAULTS) })
  }

  if (req.method === 'PUT') {
    try {
      const body = await readJsonBody(req)
      const validated = validateSettings(body)
      if (!validated.ok) {
        return json(res, 400, { ok: false, error: validated.error })
      }

      const { data, error } = await supabase
        .from('posing_calendar_settings')
        .upsert({ id: 1, ...validated.settings, updated_at: new Date().toISOString() })
        .select(
          'day_template_times, default_duration_minutes, grid_start_hour, grid_end_hour, grid_step_minutes, updated_at',
        )
        .single()

      if (error) return json(res, 500, { ok: false, error: error.message })
      return json(res, 200, { ok: true, settings: toResponse(data) })
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_json' })
    }
  }

  return json(res, 405, { ok: false, error: 'method_not_allowed' })
}
