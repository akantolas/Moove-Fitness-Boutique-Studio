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
const WEEKDAY_KEYS = ['1', '2', '3', '4', '5', '6', '7']

const DEFAULT_TEMPLATE_TIMES = ['10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00']

const DEFAULTS = {
  default_duration_minutes: 30,
  grid_start_hour: 9,
  grid_end_hour: 21,
  grid_step_minutes: 30,
}

function buildDefaultWeekdayTemplates(gridStart, gridEnd) {
  const entry = {
    times: [...DEFAULT_TEMPLATE_TIMES],
    start_hour: gridStart,
    end_hour: gridEnd,
  }
  return Object.fromEntries(WEEKDAY_KEYS.map((key) => [key, { ...entry, times: [...entry.times] }]))
}

const DEFAULT_WEEKDAY_TEMPLATES = buildDefaultWeekdayTemplates(
  DEFAULTS.grid_start_hour,
  DEFAULTS.grid_end_hour,
)

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

function validateWeekdayTemplates(raw, gridStart, gridEnd) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return { ok: false, error: 'invalid_weekday_templates' }
  }

  const templates = {}
  for (const key of WEEKDAY_KEYS) {
    const entry = raw[key]
    if (!entry || typeof entry !== 'object') {
      return { ok: false, error: 'invalid_weekday_templates' }
    }

    if (!Array.isArray(entry.times)) {
      return { ok: false, error: 'invalid_weekday_templates' }
    }

    const normalized = []
    const seen = new Set()
    for (const rawTime of entry.times) {
      const time = normalizeTime(rawTime)
      if (!time) return { ok: false, error: 'invalid_time_format' }
      if (seen.has(time)) continue
      seen.add(time)
      normalized.push(time)
    }

    const startHour = Number(entry.start_hour)
    const endHour = Number(entry.end_hour)
    if (
      !Number.isInteger(startHour) ||
      !Number.isInteger(endHour) ||
      startHour < 0 ||
      startHour > 23 ||
      endHour < 1 ||
      endHour > 24 ||
      endHour <= startHour
    ) {
      return { ok: false, error: 'invalid_weekday_templates' }
    }

    if (startHour < gridStart || endHour > gridEnd) {
      return { ok: false, error: 'invalid_weekday_templates' }
    }

    templates[key] = {
      times: sortTimes(normalized),
      start_hour: startHour,
      end_hour: endHour,
    }
  }

  return { ok: true, templates }
}

function validateSettings(body) {
  if (!body || typeof body !== 'object') {
    return { ok: false, error: 'invalid_body' }
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

  const weekdayResult = validateWeekdayTemplates(body.weekday_templates, gridStart, gridEnd)
  if (!weekdayResult.ok) return weekdayResult

  return {
    ok: true,
    settings: {
      weekday_templates: weekdayResult.templates,
      default_duration_minutes: defaultDuration,
      grid_start_hour: gridStart,
      grid_end_hour: gridEnd,
      grid_step_minutes: gridStep,
    },
  }
}

function normalizeWeekdayTemplates(raw, gridStart, gridEnd) {
  const validated = validateWeekdayTemplates(raw, gridStart, gridEnd)
  if (validated.ok) return validated.templates
  return buildDefaultWeekdayTemplates(gridStart, gridEnd)
}

function toResponse(row) {
  const gridStart = row.grid_start_hour ?? DEFAULTS.grid_start_hour
  const gridEnd = row.grid_end_hour ?? DEFAULTS.grid_end_hour
  return {
    weekday_templates: normalizeWeekdayTemplates(row.weekday_templates, gridStart, gridEnd),
    default_duration_minutes: row.default_duration_minutes ?? DEFAULTS.default_duration_minutes,
    grid_start_hour: gridStart,
    grid_end_hour: gridEnd,
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
        'weekday_templates, default_duration_minutes, grid_start_hour, grid_end_hour, grid_step_minutes, updated_at',
      )
      .eq('id', 1)
      .maybeSingle()

    if (error) {
      if (error.message?.includes('weekday_templates')) {
        return json(res, 500, { ok: false, error: 'migration_required' })
      }
      return json(res, 500, { ok: false, error: error.message })
    }

    const fallback = {
      ...DEFAULTS,
      weekday_templates: DEFAULT_WEEKDAY_TEMPLATES,
    }
    return json(res, 200, { ok: true, settings: toResponse(data ?? fallback) })
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
          'weekday_templates, default_duration_minutes, grid_start_hour, grid_end_hour, grid_step_minutes, updated_at',
        )
        .single()

      if (error) {
        if (error.message?.includes('weekday_templates')) {
          return json(res, 500, { ok: false, error: 'migration_required' })
        }
        return json(res, 500, { ok: false, error: error.message })
      }
      return json(res, 200, { ok: true, settings: toResponse(data) })
    } catch {
      return json(res, 400, { ok: false, error: 'invalid_json' })
    }
  }

  return json(res, 405, { ok: false, error: 'method_not_allowed' })
}
