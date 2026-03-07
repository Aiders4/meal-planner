import client from '../connection.js';

export interface Profile {
  id: number;
  user_id: number;
  calorie_target: number | null;
  protein_target: number | null;
  carb_target: number | null;
  fat_target: number | null;
  cuisine_preferences: string;
  max_cook_time_minutes: number | null;
  updated_at: string;
}

export interface ProfileData {
  calorie_target?: number | null;
  protein_target?: number | null;
  carb_target?: number | null;
  fat_target?: number | null;
  cuisine_preferences?: string[];
  max_cook_time_minutes?: number | null;
}

export interface DietaryRestriction {
  id: number;
  user_id: number;
  category: string;
  value: string;
}

export interface DislikedIngredient {
  id: number;
  user_id: number;
  ingredient: string;
}

export async function getProfile(userId: number): Promise<Profile | undefined> {
  const result = await client.execute({
    sql: 'SELECT * FROM profiles WHERE user_id = ?',
    args: [userId],
  });
  return result.rows[0] as unknown as Profile | undefined;
}

export async function upsertProfile(userId: number, data: ProfileData): Promise<Profile> {
  const cuisineJson = data.cuisine_preferences
    ? JSON.stringify(data.cuisine_preferences)
    : '[]';

  await client.execute({
    sql: `
      INSERT INTO profiles (user_id, calorie_target, protein_target, carb_target, fat_target, cuisine_preferences, max_cook_time_minutes)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        calorie_target = excluded.calorie_target,
        protein_target = excluded.protein_target,
        carb_target = excluded.carb_target,
        fat_target = excluded.fat_target,
        cuisine_preferences = excluded.cuisine_preferences,
        max_cook_time_minutes = excluded.max_cook_time_minutes,
        updated_at = datetime('now')
    `,
    args: [
      userId,
      data.calorie_target ?? null,
      data.protein_target ?? null,
      data.carb_target ?? null,
      data.fat_target ?? null,
      cuisineJson,
      data.max_cook_time_minutes ?? null,
    ],
  });

  return (await getProfile(userId))!;
}

export async function getRestrictions(userId: number): Promise<DietaryRestriction[]> {
  const result = await client.execute({
    sql: 'SELECT * FROM dietary_restrictions WHERE user_id = ?',
    args: [userId],
  });
  return result.rows as unknown as DietaryRestriction[];
}

export async function setRestrictions(
  userId: number,
  restrictions: { category: string; value: string }[]
): Promise<DietaryRestriction[]> {
  await client.batch(
    [
      { sql: 'DELETE FROM dietary_restrictions WHERE user_id = ?', args: [userId] },
      ...restrictions.map((r) => ({
        sql: 'INSERT INTO dietary_restrictions (user_id, category, value) VALUES (?, ?, ?)',
        args: [userId, r.category, r.value],
      })),
    ],
    'write'
  );

  return getRestrictions(userId);
}

export async function getDislikedIngredients(userId: number): Promise<DislikedIngredient[]> {
  const result = await client.execute({
    sql: 'SELECT * FROM disliked_ingredients WHERE user_id = ?',
    args: [userId],
  });
  return result.rows as unknown as DislikedIngredient[];
}

export async function setDislikedIngredients(
  userId: number,
  ingredients: string[]
): Promise<DislikedIngredient[]> {
  await client.batch(
    [
      { sql: 'DELETE FROM disliked_ingredients WHERE user_id = ?', args: [userId] },
      ...ingredients.map((ingredient) => ({
        sql: 'INSERT INTO disliked_ingredients (user_id, ingredient) VALUES (?, ?)',
        args: [userId, ingredient],
      })),
    ],
    'write'
  );

  return getDislikedIngredients(userId);
}
