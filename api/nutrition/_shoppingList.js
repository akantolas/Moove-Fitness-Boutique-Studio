/**
 * @param {{ days: { meals: { meal: { ingredients: Record<string, string[]> } }[] }[] }} mealPlan
 * @param {string} locale
 */
export function buildShoppingList(mealPlan, locale = 'el') {
  const loc = locale === 'en' ? 'en' : 'el'
  const counts = new Map()

  for (const day of mealPlan.days ?? []) {
    for (const entry of day.meals ?? []) {
      const items = entry.meal?.ingredients?.[loc] ?? entry.meal?.ingredients?.el ?? []
      for (const item of items) {
        const key = item.trim()
        if (!key) continue
        counts.set(key, (counts.get(key) ?? 0) + 1)
      }
    }
  }

  return [...counts.entries()]
    .sort((a, b) => a[0].localeCompare(b[0], loc))
    .map(([item, times]) => ({ item, times }))
}
