const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const GENDERS = new Set(['female', 'male'])
const ACTIVITIES = new Set(['sedentary', 'light', 'moderate', 'active', 'very_active'])
const GOALS = new Set(['cut', 'maintain', 'bulk'])
const DIET_TYPES = new Set(['omnivore', 'vegetarian', 'vegan'])
const COOKING_LEVELS = new Set(['minimal', 'moderate', 'advanced'])
const MEALS_PER_DAY = new Set([3, 4, 5])
const ALLERGIES = new Set(['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish'])

function parseNumber(value) {
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

function inRange(n, min, max) {
  return n !== null && n >= min && n <= max
}

/**
 * @param {unknown} raw
 * @returns {{ ok: true, data: Record<string, unknown> } | { ok: false, error: string }}
 */
export function validateNutritionResponses(raw) {
  if (!raw || typeof raw !== 'object') {
    return { ok: false, error: 'invalid_responses' }
  }

  const body = /** @type {Record<string, unknown>} */ (raw)
  const age = parseNumber(body.age)
  const heightCm = parseNumber(body.heightCm ?? body.height_cm)
  const weightKg = parseNumber(body.weightKg ?? body.weight_kg)
  const gender = String(body.gender ?? '').trim()
  const activity = String(body.activity ?? '').trim()
  const goal = String(body.goal ?? '').trim()
  const dietType = String(body.dietType ?? body.diet_type ?? '').trim()
  const cookingLevel = String(body.cookingLevel ?? body.cooking_level ?? 'minimal').trim()
  const mealsPerDay = parseNumber(body.mealsPerDay ?? body.meals_per_day)
  const name = String(body.name ?? '').trim().slice(0, 120)
  const dislikedFoods = String(body.dislikedFoods ?? body.disliked_foods ?? '').trim().slice(0, 500)
  const privacyConsent = body.privacyConsent === true || body.privacy_consent === true

  if (!inRange(age, 16, 80)) return { ok: false, error: 'invalid_age' }
  if (!GENDERS.has(gender)) return { ok: false, error: 'invalid_gender' }
  if (!inRange(heightCm, 140, 220)) return { ok: false, error: 'invalid_height' }
  if (!inRange(weightKg, 40, 200)) return { ok: false, error: 'invalid_weight' }
  if (!ACTIVITIES.has(activity)) return { ok: false, error: 'invalid_activity' }
  if (!GOALS.has(goal)) return { ok: false, error: 'invalid_goal' }
  if (!DIET_TYPES.has(dietType)) return { ok: false, error: 'invalid_diet' }
  if (!COOKING_LEVELS.has(cookingLevel)) return { ok: false, error: 'invalid_cooking_level' }
  if (!MEALS_PER_DAY.has(mealsPerDay)) return { ok: false, error: 'invalid_meals_per_day' }
  if (!privacyConsent) return { ok: false, error: 'privacy_required' }

  const allergiesRaw = body.allergies
  const allergies = Array.isArray(allergiesRaw)
    ? allergiesRaw.map((a) => String(a).trim()).filter((a) => ALLERGIES.has(a))
    : []

  return {
    ok: true,
    data: {
      age,
      gender,
      heightCm,
      weightKg,
      activity,
      goal,
      dietType,
      cookingLevel,
      mealsPerDay,
      allergies,
      name: name || null,
      dislikedFoods: dislikedFoods || null,
      privacyConsent: true,
    },
  }
}

export function validateNutritionEmail(email) {
  const normalized = String(email ?? '').trim().toLowerCase()
  if (!normalized || !EMAIL_RE.test(normalized)) {
    return { ok: false, error: 'invalid_email' }
  }
  return { ok: true, email: normalized }
}
