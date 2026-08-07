#!/usr/bin/env node
/**
 * Validates api/nutrition/_mealLibrary.json structure and minimum coverage.
 */
import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const libraryPath = join(__dirname, '../api/nutrition/_mealLibrary.json')

const MEAL_TYPES = ['breakfast', 'snack', 'lunch', 'dinner']
const COOKING_LEVELS = ['minimal', 'moderate', 'advanced']
const DIET_TAGS = ['omnivore', 'vegetarian', 'vegan']
const EXCLUDE_TAGS = ['gluten', 'dairy', 'nuts', 'eggs', 'soy', 'shellfish', 'fish']

function fail(message) {
  console.error(`validate-meal-library: ${message}`)
  process.exit(1)
}

const raw = readFileSync(libraryPath, 'utf8')
let library
try {
  library = JSON.parse(raw)
} catch {
  fail('invalid JSON')
}

if (!Array.isArray(library) || library.length === 0) {
  fail('library must be a non-empty array')
}

const ids = new Set()
for (const [index, meal] of library.entries()) {
  const prefix = `meal[${index}]`

  if (!meal.id || typeof meal.id !== 'string') fail(`${prefix}: missing id`)
  if (ids.has(meal.id)) fail(`${prefix}: duplicate id ${meal.id}`)
  ids.add(meal.id)

  if (!MEAL_TYPES.includes(meal.mealType)) fail(`${prefix}: invalid mealType`)
  if (!COOKING_LEVELS.includes(meal.cookingLevel)) fail(`${prefix}: invalid cookingLevel`)

  for (const field of ['calories', 'protein', 'carbs', 'fat', 'prepTimeMin']) {
    if (typeof meal[field] !== 'number' || meal[field] < 0) {
      fail(`${prefix}: invalid ${field}`)
    }
  }

  if (!meal.name?.el || !meal.name?.en) fail(`${prefix}: missing bilingual name`)
  if (!Array.isArray(meal.dietTags) || meal.dietTags.length === 0) {
    fail(`${prefix}: dietTags required`)
  }
  for (const tag of meal.dietTags) {
    if (!DIET_TAGS.includes(tag)) fail(`${prefix}: invalid dietTag ${tag}`)
  }

  if (!Array.isArray(meal.excludeTags)) fail(`${prefix}: excludeTags must be array`)
  for (const tag of meal.excludeTags) {
    if (!EXCLUDE_TAGS.includes(tag)) fail(`${prefix}: invalid excludeTag ${tag}`)
  }

  for (const loc of ['el', 'en']) {
    if (!Array.isArray(meal.ingredients?.[loc]) || meal.ingredients[loc].length === 0) {
      fail(`${prefix}: ingredients.${loc} required`)
    }
    if (!meal.instructions?.[loc]) fail(`${prefix}: instructions.${loc} required`)
  }
}

for (const mealType of MEAL_TYPES) {
  const count = library.filter((m) => m.mealType === mealType).length
  if (count < 3) {
    fail(`need at least 3 meals for mealType=${mealType}, found ${count}`)
  }
}

for (const diet of ['vegan', 'vegetarian', 'omnivore']) {
  const count = library.filter((m) => m.dietTags.includes(diet) || (diet !== 'vegan' && m.dietTags.includes('vegan'))).length
  if (count < 5) {
    fail(`need at least 5 meals compatible with ${diet}, found ${count}`)
  }
}

console.log(`validate-meal-library: OK (${library.length} meals)`)
