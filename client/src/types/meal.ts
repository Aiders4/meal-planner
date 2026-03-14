export interface Ingredient {
  name: string
  quantity: number
  unit: string
}

export interface Meal {
  id: number
  user_id: number
  title: string
  description: string | null
  ingredients: Ingredient[]
  instructions: string[]
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  cook_time_minutes: number | null
  cuisine: string | null
  meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | null
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
}

export interface GenerateResponse {
  meal: Meal
  warnings: string[]
}

export interface MacroTargets {
  calorie_target: number | null
  protein_target: number | null
  carb_target: number | null
  fat_target: number | null
}
