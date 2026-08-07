export type NutritionGender = 'female' | 'male'
export type NutritionActivity = 'sedentary' | 'light' | 'moderate' | 'active' | 'very_active'
export type NutritionGoal = 'cut' | 'maintain' | 'bulk'
export type NutritionDietType = 'omnivore' | 'vegetarian' | 'vegan'
export type NutritionCookingLevel = 'minimal' | 'moderate' | 'advanced'
export type NutritionAllergy =
  | 'gluten'
  | 'dairy'
  | 'nuts'
  | 'eggs'
  | 'soy'
  | 'shellfish'
  | 'fish'

export type NutritionResponses = {
  age: number
  gender: NutritionGender
  heightCm: number
  weightKg: number
  activity: NutritionActivity
  goal: NutritionGoal
  dietType: NutritionDietType
  cookingLevel: NutritionCookingLevel
  mealsPerDay: 3 | 4 | 5
  allergies: NutritionAllergy[]
  name?: string | null
  dislikedFoods?: string | null
  privacyConsent: boolean
}

export const DEFAULT_NUTRITION_RESPONSES: NutritionResponses = {
  age: 30,
  gender: 'female',
  heightCm: 165,
  weightKg: 62,
  activity: 'moderate',
  goal: 'maintain',
  dietType: 'omnivore',
  cookingLevel: 'minimal',
  mealsPerDay: 4,
  allergies: [],
  name: '',
  dislikedFoods: '',
  privacyConsent: false,
}

export type NutritionOrderPayment = {
  id: string
  email: string
  amount_eur: number
  status: string
  purchase_type: string
  program_key: string | null
  created_at: string
  order_ref: string
}

export type NutritionPaidOrder = NutritionOrderPayment & {
  payment_method: string | null
  plan_email_sent_at: string | null
  responses: NutritionResponses
}
