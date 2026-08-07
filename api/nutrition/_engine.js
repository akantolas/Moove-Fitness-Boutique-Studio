const ACTIVITY_MULTIPLIERS = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  very_active: 1.9,
}

const GOAL_MULTIPLIERS = {
  cut: 0.85,
  maintain: 1.0,
  bulk: 1.1,
}

/** Macro split as protein / carbs / fat percentages */
const MACRO_SPLITS = {
  cut: { protein: 0.4, carbs: 0.3, fat: 0.3 },
  maintain: { protein: 0.3, carbs: 0.4, fat: 0.3 },
  bulk: { protein: 0.3, carbs: 0.45, fat: 0.25 },
}

const KCAL_PER_G = { protein: 4, carbs: 4, fat: 9 }

/**
 * Mifflin-St Jeor BMR
 */
export function calculateBmr({ age, gender, heightCm, weightKg }) {
  const base = 10 * weightKg + 6.25 * heightCm - 5 * age
  return gender === 'male' ? base + 5 : base - 161
}

export function calculateTdee(responses) {
  const bmr = calculateBmr(responses)
  const multiplier = ACTIVITY_MULTIPLIERS[responses.activity] ?? 1.55
  return Math.round(bmr * multiplier)
}

export function calculateTargetCalories(responses) {
  const tdee = calculateTdee(responses)
  const goalMultiplier = GOAL_MULTIPLIERS[responses.goal] ?? 1.0
  return Math.round(tdee * goalMultiplier)
}

export function calculateMacros(responses, targetCalories) {
  const split = MACRO_SPLITS[responses.goal] ?? MACRO_SPLITS.maintain
  return {
    protein: Math.round((targetCalories * split.protein) / KCAL_PER_G.protein),
    carbs: Math.round((targetCalories * split.carbs) / KCAL_PER_G.carbs),
    fat: Math.round((targetCalories * split.fat) / KCAL_PER_G.fat),
  }
}

export function getMealSlotDistribution(mealsPerDay) {
  if (mealsPerDay === 3) {
    return [
      { mealType: 'breakfast', share: 0.25 },
      { mealType: 'lunch', share: 0.35 },
      { mealType: 'dinner', share: 0.4 },
    ]
  }
  if (mealsPerDay === 4) {
    return [
      { mealType: 'breakfast', share: 0.25 },
      { mealType: 'snack', share: 0.15 },
      { mealType: 'lunch', share: 0.3 },
      { mealType: 'dinner', share: 0.3 },
    ]
  }
  return [
    { mealType: 'breakfast', share: 0.2 },
    { mealType: 'snack', share: 0.1 },
    { mealType: 'lunch', share: 0.3 },
    { mealType: 'snack', share: 0.1 },
    { mealType: 'dinner', share: 0.3 },
  ]
}

/**
 * @param {Record<string, unknown>} responses
 */
export function calculateNutritionPlan(responses) {
  const tdee = calculateTdee(responses)
  const targetCalories = calculateTargetCalories(responses)
  const macros = calculateMacros(responses, targetCalories)
  const mealSlots = getMealSlotDistribution(responses.mealsPerDay).map((slot) => ({
    ...slot,
    targetCalories: Math.round(targetCalories * slot.share),
  }))

  return {
    tdee,
    targetCalories,
    macros,
    mealSlots,
  }
}
