const COOKING_RANK = { minimal: 1, moderate: 2, advanced: 3 }

/**
 * @param {import('./_mealLibrary.json')} meal
 * @param {string} dietType
 */
export function mealMatchesDiet(meal, dietType) {
  const tags = meal.dietTags ?? []
  if (dietType === 'vegan') return tags.includes('vegan')
  if (dietType === 'vegetarian') return tags.includes('vegetarian') || tags.includes('vegan')
  return tags.includes('omnivore') || tags.includes('vegetarian') || tags.includes('vegan')
}

/**
 * @param {import('./_mealLibrary.json')} meal
 * @param {string[]} allergies
 */
export function mealMatchesAllergies(meal, allergies) {
  const exclude = new Set(meal.excludeTags ?? [])
  return !allergies.some((a) => exclude.has(a))
}

/**
 * @param {import('./_mealLibrary.json')} meal
 * @param {string} cookingLevel
 */
export function mealMatchesCookingLevel(meal, cookingLevel) {
  const maxRank = COOKING_RANK[cookingLevel] ?? 1
  const mealRank = COOKING_RANK[meal.cookingLevel] ?? 1
  return mealRank <= maxRank
}

/**
 * @param {import('./_mealLibrary.json')} meal
 * @param {string|null} dislikedFoods
 * @param {string} locale
 */
export function mealMatchesDislikes(meal, dislikedFoods, locale = 'el') {
  if (!dislikedFoods) return true
  const haystack = [
    meal.name?.[locale] ?? '',
    meal.name?.el ?? '',
    meal.name?.en ?? '',
    ...(meal.ingredients?.[locale] ?? []),
    ...(meal.ingredients?.el ?? []),
    ...(meal.ingredients?.en ?? []),
  ]
    .join(' ')
    .toLowerCase()

  const tokens = dislikedFoods
    .toLowerCase()
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean)

  return !tokens.some((token) => haystack.includes(token))
}

/**
 * @param {import('./_mealLibrary.json')[]} library
 * @param {Record<string, unknown>} responses
 */
export function filterMealLibrary(library, responses) {
  const locale = responses.locale === 'en' ? 'en' : 'el'
  return library.filter(
    (meal) =>
      mealMatchesDiet(meal, responses.dietType) &&
      mealMatchesAllergies(meal, responses.allergies ?? []) &&
      mealMatchesCookingLevel(meal, responses.cookingLevel) &&
      mealMatchesDislikes(meal, responses.dislikedFoods, locale),
  )
}

/**
 * @param {import('./_mealLibrary.json')[]} candidates
 * @param {string} mealType
 * @param {number} targetCalories
 * @param {Set<string>} usedIds
 */
function pickMealForSlot(candidates, mealType, targetCalories, usedIds) {
  const pool = candidates.filter((m) => m.mealType === mealType && !usedIds.has(m.id))
  if (!pool.length) return null

  const tolerance = targetCalories * 0.15
  const scored = pool
    .map((meal) => ({
      meal,
      diff: Math.abs(meal.calories - targetCalories),
    }))
    .sort((a, b) => a.diff - b.diff)

  const withinTolerance = scored.filter((s) => s.diff <= tolerance)
  const pick = (withinTolerance[0] ?? scored[0])?.meal
  return pick ?? null
}

/**
 * @param {import('./_mealLibrary.json')[]} library
 * @param {Record<string, unknown>} responses
 * @param {{ mealSlots: { mealType: string; targetCalories: number }[] }} calculated
 */
export function buildWeeklyMealPlan(library, responses, calculated) {
  const filtered = filterMealLibrary(library, responses)
  const usedIds = new Set()
  const days = []

  for (let day = 1; day <= 7; day += 1) {
    const meals = []
    for (const slot of calculated.mealSlots) {
      let meal = pickMealForSlot(filtered, slot.mealType, slot.targetCalories, usedIds)
      if (!meal) {
        meal = pickMealForSlot(filtered, slot.mealType, slot.targetCalories, new Set())
      }
      if (!meal) {
        return { ok: false, error: 'no_matching_meals', day, mealType: slot.mealType }
      }
      usedIds.add(meal.id)
      meals.push({
        mealType: slot.mealType,
        targetCalories: slot.targetCalories,
        meal: {
          id: meal.id,
          name: meal.name,
          calories: meal.calories,
          protein: meal.protein,
          carbs: meal.carbs,
          fat: meal.fat,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          prepTimeMin: meal.prepTimeMin,
        },
      })
    }
    days.push({ day, meals })
  }

  return { ok: true, days }
}
