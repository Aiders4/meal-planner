// Mirrors server-side allowedRestrictions in server/src/routes/profile.ts
export const ALLOWED_RESTRICTIONS: Record<string, string[]> = {
  lifestyle: ['vegetarian', 'vegan', 'pescatarian', 'flexitarian'],
  allergy: [
    'gluten', 'dairy', 'nuts', 'peanuts', 'tree-nuts', 'eggs',
    'shellfish', 'fish', 'soy', 'sesame', 'celery', 'mustard',
    'lupin', 'molluscs',
  ],
  religious: ['halal', 'kosher'],
  medical: ['low-sodium', 'low-sugar', 'diabetic-friendly', 'low-fodmap'],
}

export const ALLOWED_CUISINES = [
  'Italian', 'Mexican', 'Chinese', 'Japanese', 'Indian', 'Thai',
  'Mediterranean', 'Korean', 'Vietnamese', 'French', 'Greek',
  'Middle Eastern', 'American', 'Ethiopian', 'Caribbean',
]

export const COOK_TIME_MIN = 15
export const COOK_TIME_MAX = 120
export const COOK_TIME_STEP = 5
export const COOK_TIME_DEFAULT = 60

export const MACRO_UNIT_STORAGE_KEY = 'carte-macro-unit'
export const SHOPPING_CHECKS_STORAGE_KEY = 'carte-shopping-checks'

export const MEAL_TYPES = ['breakfast', 'lunch', 'dinner', 'snack'] as const
export type MealType = (typeof MEAL_TYPES)[number]

export function getDefaultMealType(): MealType {
  const hour = new Date().getHours()
  if (hour >= 21 || hour < 11) {
    return hour >= 5 && hour < 11 ? 'breakfast' : 'snack'
  }
  if (hour < 15) return 'lunch'
  return 'dinner'
}
