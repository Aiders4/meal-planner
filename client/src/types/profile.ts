export interface ProfileResponse {
  profile: {
    id: number
    user_id: number
    calorie_target: number | null
    protein_target: number | null
    carb_target: number | null
    fat_target: number | null
    cuisine_preferences: string // JSON string in DB
    max_cook_time_minutes: number | null
    updated_at: string
  } | null
  dietary_restrictions: {
    id: number
    user_id: number
    category: string
    value: string
  }[]
  disliked_ingredients: {
    id: number
    user_id: number
    ingredient: string
  }[]
}

export interface ProfileFormState {
  calorie_target: string
  protein_target: string
  carb_target: string
  fat_target: string
  restrictions: Set<string>
  cuisine_preferences: string[]
  disliked_ingredients: string[]
  max_cook_time_minutes: number
}
