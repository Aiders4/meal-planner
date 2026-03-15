import client from '../connection.js';

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
  meal_type: string | null;
  on_shopping_list: number;
  status: string;
  created_at: string;
}

export interface MealData {
  title: string;
  description?: string | null;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  instructions: string[];
  calories?: number | null;
  protein_g?: number | null;
  carbs_g?: number | null;
  fat_g?: number | null;
  cook_time_minutes?: number | null;
  cuisine?: string | null;
  meal_type?: string | null;
}

export interface MealFilters {
  status?: string;
  cuisine?: string;
  meal_type?: string;
  limit?: number;
  offset?: number;
}

export async function createMeal(userId: number, data: MealData): Promise<Meal> {
  const result = await client.execute({
    sql: `
      INSERT INTO meals (user_id, title, description, ingredients, instructions, calories, protein_g, carbs_g, fat_g, cook_time_minutes, cuisine, meal_type)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    args: [
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
      data.cuisine ?? null,
      data.meal_type ?? null,
    ],
  });

  return (await getMealById(Number(result.lastInsertRowid)))!;
}

export async function getMealById(id: number): Promise<Meal | undefined> {
  const result = await client.execute({
    sql: 'SELECT * FROM meals WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as Meal | undefined;
}

export async function getMealByIdAndUser(id: number, userId: number): Promise<Meal | undefined> {
  const result = await client.execute({
    sql: 'SELECT * FROM meals WHERE id = ? AND user_id = ?',
    args: [id, userId],
  });
  return result.rows[0] as unknown as Meal | undefined;
}

export async function getMealsByUser(userId: number, filters: MealFilters = {}): Promise<Meal[]> {
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

  if (filters.meal_type) {
    conditions.push('meal_type = ?');
    params.push(filters.meal_type);
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

  const result = await client.execute({ sql, args: params });
  return result.rows as unknown as Meal[];
}

export async function updateMealStatus(
  mealId: number,
  userId: number,
  status: string
): Promise<boolean> {
  const result = await client.execute({
    sql: 'UPDATE meals SET status = ? WHERE id = ? AND user_id = ?',
    args: [status, mealId, userId],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function countMealsByUser(userId: number, filters?: { status?: string; meal_type?: string }): Promise<number> {
  const conditions = ['user_id = ?'];
  const params: (string | number)[] = [userId];

  if (filters?.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  if (filters?.meal_type) {
    conditions.push('meal_type = ?');
    params.push(filters.meal_type);
  }

  const result = await client.execute({
    sql: `SELECT COUNT(*) as count FROM meals WHERE ${conditions.join(' AND ')}`,
    args: params,
  });
  const row = result.rows[0] as unknown as { count: number };
  return row.count;
}

export async function countMealsByUserToday(userId: number): Promise<number> {
  const result = await client.execute({
    sql: `SELECT COUNT(*) as count FROM meals WHERE user_id = ? AND date(created_at) = date('now')`,
    args: [userId],
  });
  const row = result.rows[0] as unknown as { count: number };
  return row.count;
}

export async function getRecentAcceptedMealTitles(userId: number, limit: number = 10): Promise<string[]> {
  const result = await client.execute({
    sql: `SELECT title FROM meals WHERE user_id = ? AND status = 'accepted' ORDER BY created_at DESC LIMIT ?`,
    args: [userId, limit],
  });
  return (result.rows as unknown as { title: string }[]).map(r => r.title);
}

export async function getRecentRejectedMealTitles(userId: number, limit: number = 10): Promise<string[]> {
  const result = await client.execute({
    sql: `SELECT title FROM meals WHERE user_id = ? AND status = 'rejected' ORDER BY created_at DESC LIMIT ?`,
    args: [userId, limit],
  });
  return (result.rows as unknown as { title: string }[]).map(r => r.title);
}

export async function deletePendingMeals(userId: number): Promise<number> {
  const result = await client.execute({
    sql: `DELETE FROM meals WHERE user_id = ? AND status = 'pending'`,
    args: [userId],
  });
  return result.rowsAffected ?? 0;
}

export async function getPendingMeal(userId: number): Promise<Meal | undefined> {
  const result = await client.execute({
    sql: `SELECT * FROM meals WHERE user_id = ? AND status = 'pending' ORDER BY created_at DESC LIMIT 1`,
    args: [userId],
  });
  return result.rows[0] as unknown as Meal | undefined;
}

export async function getShoppingListMeals(userId: number): Promise<Meal[]> {
  const result = await client.execute({
    sql: `SELECT * FROM meals WHERE user_id = ? AND on_shopping_list = 1 AND status = 'accepted' ORDER BY created_at DESC`,
    args: [userId],
  });
  return result.rows as unknown as Meal[];
}

export async function updateMealShoppingList(
  mealId: number,
  userId: number,
  onShoppingList: boolean
): Promise<boolean> {
  const result = await client.execute({
    sql: `UPDATE meals SET on_shopping_list = ? WHERE id = ? AND user_id = ? AND status = 'accepted'`,
    args: [onShoppingList ? 1 : 0, mealId, userId],
  });
  return (result.rowsAffected ?? 0) > 0;
}

export async function clearShoppingList(userId: number): Promise<number> {
  const result = await client.execute({
    sql: `UPDATE meals SET on_shopping_list = 0 WHERE user_id = ? AND on_shopping_list = 1`,
    args: [userId],
  });
  return result.rowsAffected ?? 0;
}
