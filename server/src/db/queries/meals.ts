import db from '../connection.js';

export interface Meal {
  id: number;
  user_id: number;
  title: string;
  description: string | null;
  ingredients: string;
  instructions: string;
  calories: number | null;
  protein_g: number | null;
  carbs_g: number | null;
  fat_g: number | null;
  cook_time_minutes: number | null;
  cuisine: string | null;
  status: string;
  created_at: string;
}

export interface MealData {
  title: string;
  description?: string | null;
  ingredients: string[];
  instructions: string[];
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  cook_time_minutes?: number | null;
  cuisine?: string | null;
}

export interface MealFilters {
  status?: string;
  cuisine?: string;
  limit?: number;
  offset?: number;
}

export function createMeal(userId: number, data: MealData): Meal {
  const stmt = db.prepare(`
    INSERT INTO meals (user_id, title, description, ingredients, instructions, calories, protein_g, carbs_g, fat_g, cook_time_minutes, cuisine)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const result = stmt.run(
    userId,
    data.title,
    data.description ?? null,
    JSON.stringify(data.ingredients),
    JSON.stringify(data.instructions),
    data.calories ?? null,
    data.protein_g ?? null,
    data.carbs_g ?? null,
    data.fat_g ?? null,
    data.cook_time_minutes ?? null,
    data.cuisine ?? null
  );

  return getMealById(result.lastInsertRowid as number)!;
}

function getMealById(id: number): Meal | undefined {
  const stmt = db.prepare('SELECT * FROM meals WHERE id = ?');
  return stmt.get(id) as Meal | undefined;
}

export function getMealsByUser(userId: number, filters: MealFilters = {}): Meal[] {
  const conditions = ['user_id = ?'];
  const params: (string | number)[] = [userId];

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters.cuisine) {
    conditions.push('cuisine = ?');
    params.push(filters.cuisine);
  }

  const limit = filters.limit ?? 20;
  const offset = filters.offset ?? 0;

  const sql = `
    SELECT * FROM meals
    WHERE ${conditions.join(' AND ')}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  params.push(limit, offset);

  const stmt = db.prepare(sql);
  return stmt.all(...params) as Meal[];
}

export function updateMealStatus(
  mealId: number,
  userId: number,
  status: string
): boolean {
  const stmt = db.prepare(
    'UPDATE meals SET status = ? WHERE id = ? AND user_id = ?'
  );
  const result = stmt.run(status, mealId, userId);
  return result.changes > 0;
}
