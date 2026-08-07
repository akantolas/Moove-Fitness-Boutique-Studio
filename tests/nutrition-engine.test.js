import { describe, it } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculateBmr,
  calculateTdee,
  calculateTargetCalories,
  calculateMacros,
  calculateNutritionPlan,
  getMealSlotDistribution,
} from '../api/nutrition/_engine.js'
import { filterMealLibrary, buildWeeklyMealPlan } from '../api/nutrition/_matcher.js'
import { buildShoppingList } from '../api/nutrition/_shoppingList.js'
import mealLibrary from '../api/nutrition/_mealLibrary.json' with { type: 'json' }

const sampleResponses = {
  age: 30,
  gender: 'female',
  heightCm: 165,
  weightKg: 62,
  activity: 'moderate',
  goal: 'cut',
  dietType: 'omnivore',
  cookingLevel: 'moderate',
  mealsPerDay: 4,
  allergies: [],
  dislikedFoods: null,
}

describe('nutrition engine', () => {
  it('calculates BMR for female', () => {
    const bmr = calculateBmr(sampleResponses)
    assert.ok(bmr > 1200 && bmr < 1600)
  })

  it('calculates TDEE above BMR', () => {
    const bmr = calculateBmr(sampleResponses)
    const tdee = calculateTdee(sampleResponses)
    assert.ok(tdee > bmr)
  })

  it('cut goal reduces calories below TDEE', () => {
    const tdee = calculateTdee(sampleResponses)
    const target = calculateTargetCalories(sampleResponses)
    assert.ok(target < tdee)
  })

  it('returns macro grams that sum reasonably', () => {
    const target = calculateTargetCalories(sampleResponses)
    const macros = calculateMacros(sampleResponses, target)
    const kcal = macros.protein * 4 + macros.carbs * 4 + macros.fat * 9
    assert.ok(Math.abs(kcal - target) < target * 0.15)
  })

  it('builds meal slots for 4 meals', () => {
    const slots = getMealSlotDistribution(4)
    assert.equal(slots.length, 4)
    const totalShare = slots.reduce((sum, s) => sum + s.share, 0)
    assert.ok(Math.abs(totalShare - 1) < 0.01)
  })

  it('calculateNutritionPlan returns full structure', () => {
    const plan = calculateNutritionPlan(sampleResponses)
    assert.ok(plan.tdee > 0)
    assert.ok(plan.targetCalories > 0)
    assert.ok(plan.macros.protein > 0)
    assert.equal(plan.mealSlots.length, 4)
  })
})

describe('nutrition matcher', () => {
  it('filters library for vegan diet', () => {
    const filtered = filterMealLibrary(mealLibrary, { ...sampleResponses, dietType: 'vegan' })
    assert.ok(filtered.length > 0)
    for (const meal of filtered) {
      assert.ok(meal.dietTags.includes('vegan'))
    }
  })

  it('excludes meals with matching allergies', () => {
    const filtered = filterMealLibrary(mealLibrary, {
      ...sampleResponses,
      allergies: ['dairy'],
    })
    for (const meal of filtered) {
      assert.ok(!meal.excludeTags.includes('dairy'))
    }
  })

  it('builds a 7-day meal plan', () => {
    const calculated = calculateNutritionPlan(sampleResponses)
    const result = buildWeeklyMealPlan(mealLibrary, sampleResponses, calculated)
    assert.equal(result.ok, true)
    assert.equal(result.days.length, 7)
    for (const day of result.days) {
      assert.equal(day.meals.length, 4)
    }
  })

  it('builds shopping list from meal plan', () => {
    const calculated = calculateNutritionPlan(sampleResponses)
    const result = buildWeeklyMealPlan(mealLibrary, sampleResponses, calculated)
    assert.equal(result.ok, true)
    const list = buildShoppingList(result, 'el')
    assert.ok(list.length > 0)
  })
})

describe('nutrition pdf', () => {
  it('generates a landscape table PDF buffer', async () => {
    const { generateNutritionPdfBuffer } = await import('../api/nutrition/_pdf.js')
    const calculated = calculateNutritionPlan({ ...sampleResponses, name: 'Λία', mealsPerDay: 5 })
    const mealPlan = buildWeeklyMealPlan(
      mealLibrary,
      { ...sampleResponses, name: 'Λία', mealsPerDay: 5 },
      calculated,
    )
    assert.equal(mealPlan.ok, true)
    const shoppingList = buildShoppingList(mealPlan, 'el')
    const buffer = await generateNutritionPdfBuffer({
      locale: 'el',
      responses: { ...sampleResponses, name: 'Λία', mealsPerDay: 5 },
      calculated,
      mealPlan,
      shoppingList,
    })
    assert.ok(Buffer.isBuffer(buffer))
    assert.ok(buffer.length > 5000)
    assert.equal(buffer.subarray(0, 4).toString(), '%PDF')
    const pdfRaw = buffer.toString('latin1')
    const mediaBox = pdfRaw.match(/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/)
    assert.ok(mediaBox, 'expected MediaBox in PDF')
    assert.ok(Number(mediaBox[1]) > Number(mediaBox[2]), 'expected landscape page width > height')
  })
})
