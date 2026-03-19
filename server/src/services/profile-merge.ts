import type { Profile, DietaryRestriction, DislikedIngredient } from '../db/queries/profiles.js';

export interface MergedProfile {
  calorie_target: number | null;
  protein_target: number | null;
  carb_target: number | null;
  fat_target: number | null;
  cuisine_preferences: string[];
  max_cook_time_minutes: number | null;
  restrictions: Array<{ category: string; value: string }>;
  disliked_ingredients: string[];
}

function sumNullable(a: number | null, b: number | null): number | null {
  if (a === null && b === null) return null;
  return (a ?? 0) + (b ?? 0);
}

export function mergeProfiles(
  profileA: Profile,
  restrictionsA: DietaryRestriction[],
  dislikedA: DislikedIngredient[],
  profileB: Profile,
  restrictionsB: DietaryRestriction[],
  dislikedB: DislikedIngredient[],
): MergedProfile {
  // Calories/macros: sum both (2-serving recipe)
  const calorie_target = sumNullable(profileA.calorie_target, profileB.calorie_target);
  const protein_target = sumNullable(profileA.protein_target, profileB.protein_target);
  const carb_target = sumNullable(profileA.carb_target, profileB.carb_target);
  const fat_target = sumNullable(profileA.fat_target, profileB.fat_target);

  // Restrictions: union (deduplicated by category+value)
  const restrictionSet = new Set<string>();
  const restrictions: Array<{ category: string; value: string }> = [];
  for (const r of [...restrictionsA, ...restrictionsB]) {
    const key = `${r.category}:${r.value}`;
    if (!restrictionSet.has(key)) {
      restrictionSet.add(key);
      restrictions.push({ category: r.category, value: r.value });
    }
  }

  // Disliked ingredients: union (deduplicated by lowercase name)
  const dislikedSet = new Set<string>();
  const disliked_ingredients: string[] = [];
  for (const d of [...dislikedA, ...dislikedB]) {
    const key = d.ingredient.toLowerCase();
    if (!dislikedSet.has(key)) {
      dislikedSet.add(key);
      disliked_ingredients.push(d.ingredient);
    }
  }

  // Cuisine preferences: intersection if both have prefs; if one empty, use other's
  const cuisinesA: string[] = JSON.parse(profileA.cuisine_preferences || '[]');
  const cuisinesB: string[] = JSON.parse(profileB.cuisine_preferences || '[]');
  let cuisine_preferences: string[];
  if (cuisinesA.length === 0) {
    cuisine_preferences = cuisinesB;
  } else if (cuisinesB.length === 0) {
    cuisine_preferences = cuisinesA;
  } else {
    const setB = new Set(cuisinesB);
    cuisine_preferences = cuisinesA.filter((c) => setB.has(c));
  }

  // Cook time: minimum (stricter); if one null, use the other
  let max_cook_time_minutes: number | null;
  if (profileA.max_cook_time_minutes === null) {
    max_cook_time_minutes = profileB.max_cook_time_minutes;
  } else if (profileB.max_cook_time_minutes === null) {
    max_cook_time_minutes = profileA.max_cook_time_minutes;
  } else {
    max_cook_time_minutes = Math.min(profileA.max_cook_time_minutes, profileB.max_cook_time_minutes);
  }

  return {
    calorie_target,
    protein_target,
    carb_target,
    fat_target,
    cuisine_preferences,
    max_cook_time_minutes,
    restrictions,
    disliked_ingredients,
  };
}
