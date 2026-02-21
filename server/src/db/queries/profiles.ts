import db from '../connection.js';

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

export function getProfile(userId: number): Profile | undefined {
  const stmt = db.prepare('SELECT * FROM profiles WHERE user_id = ?');
  return stmt.get(userId) as Profile | undefined;
}

export function upsertProfile(userId: number, data: ProfileData): Profile {
  const cuisineJson = data.cuisine_preferences
    ? JSON.stringify(data.cuisine_preferences)
    : '[]';

  const stmt = db.prepare(`
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
  `);

  stmt.run(
    userId,
    data.calorie_target ?? null,
    data.protein_target ?? null,
    data.carb_target ?? null,
    data.fat_target ?? null,
    cuisineJson,
    data.max_cook_time_minutes ?? null
  );

  return getProfile(userId)!;
}

export function getRestrictions(userId: number): DietaryRestriction[] {
  const stmt = db.prepare('SELECT * FROM dietary_restrictions WHERE user_id = ?');
  return stmt.all(userId) as DietaryRestriction[];
}

export function setRestrictions(
  userId: number,
  restrictions: { category: string; value: string }[]
): DietaryRestriction[] {
  const deleteStmt = db.prepare('DELETE FROM dietary_restrictions WHERE user_id = ?');
  const insertStmt = db.prepare(
    'INSERT INTO dietary_restrictions (user_id, category, value) VALUES (?, ?, ?)'
  );

  const transaction = db.transaction(() => {
    deleteStmt.run(userId);
    for (const r of restrictions) {
      insertStmt.run(userId, r.category, r.value);
    }
  });

  transaction();
  return getRestrictions(userId);
}

export function getDislikedIngredients(userId: number): DislikedIngredient[] {
  const stmt = db.prepare('SELECT * FROM disliked_ingredients WHERE user_id = ?');
  return stmt.all(userId) as DislikedIngredient[];
}

export function setDislikedIngredients(
  userId: number,
  ingredients: string[]
): DislikedIngredient[] {
  const deleteStmt = db.prepare('DELETE FROM disliked_ingredients WHERE user_id = ?');
  const insertStmt = db.prepare(
    'INSERT INTO disliked_ingredients (user_id, ingredient) VALUES (?, ?)'
  );

  const transaction = db.transaction(() => {
    deleteStmt.run(userId);
    for (const ingredient of ingredients) {
      insertStmt.run(userId, ingredient);
    }
  });

  transaction();
  return getDislikedIngredients(userId);
}
