/**
 * Generate a sample nutrition PDF locally (no DB / payment).
 *
 * Usage: node scripts/preview-nutrition-pdf.js
 * Output: tmp/nutrition-preview.pdf
 */
import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { calculateNutritionPlan } from '../api/nutrition/_engine.js'
import { buildWeeklyMealPlan } from '../api/nutrition/_matcher.js'
import { buildShoppingList } from '../api/nutrition/_shoppingList.js'
import { generateNutritionPdfBuffer } from '../api/nutrition/_pdf.js'
import mealLibrary from '../api/nutrition/_mealLibrary.json' with { type: 'json' }

const __dirname = dirname(fileURLToPath(import.meta.url))
const outDir = join(__dirname, '..', 'tmp')
const outPath = join(outDir, 'nutrition-preview.pdf')

const responses = {
  age: 30,
  gender: 'female',
  heightCm: 165,
  weightKg: 62,
  activity: 'moderate',
  goal: 'maintain',
  dietType: 'omnivore',
  cookingLevel: 'moderate',
  mealsPerDay: 5,
  allergies: [],
  dislikedFoods: null,
  name: 'Λία',
  privacyConsent: true,
}

const calculated = calculateNutritionPlan(responses)
const mealPlan = buildWeeklyMealPlan(mealLibrary, responses, calculated)
if (!mealPlan.ok) {
  console.error('Meal plan failed:', mealPlan.error)
  process.exit(1)
}

const shoppingList = buildShoppingList(mealPlan, 'el')
const buffer = await generateNutritionPdfBuffer({
  locale: 'el',
  responses,
  calculated,
  mealPlan,
  shoppingList,
})

mkdirSync(outDir, { recursive: true })
writeFileSync(outPath, buffer)
console.log(`Wrote ${outPath} (${buffer.length} bytes)`)
