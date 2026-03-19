import { Router } from 'express';
import { z } from 'zod';
import rateLimit from 'express-rate-limit';
import { requireAuth } from '../middleware/auth.js';
import {
  createMeal,
  getMealByIdAndUser,
  getMealsByUser,
  countMealsByUser,
  countMealsByUserToday,
  updateMealStatus,
  updateMealShoppingList,
  getShoppingListMeals,
  clearShoppingList,
  getRecentAcceptedMealTitles,
  getRecentRejectedMealTitles,
  deletePendingMeals,
  getPendingMeal,
  pruneOldRejectedMeals,
} from '../db/queries/meals.js';
import { getProfile, getRestrictions, getDislikedIngredients } from '../db/queries/profiles.js';
import { isPartner } from '../db/queries/partners.js';
import { generateMeal, AIServiceError } from '../services/ai.js';
import { mergeProfiles } from '../services/profile-merge.js';

const router = Router();

/** Parse a JSON column that may have been double-stringified */
function parseJsonColumn(value: string): unknown {
  let result: unknown = JSON.parse(value);
  if (typeof result === 'string') {
    result = JSON.parse(result);
  }
  return result;
}

const generateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10,
  message: { error: 'Too many meal generation requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

// --- Validation schemas ---

const generateSchema = z.object({
  calorie_target: z.number().int().min(1).max(10000).nullable().optional(),
  protein_target: z.number().int().min(0).max(1000).nullable().optional(),
  carb_target: z.number().int().min(0).max(1000).nullable().optional(),
  fat_target: z.number().int().min(0).max(1000).nullable().optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).nullable().optional(),
  partner_id: z.number().int().positive().nullable().optional(),
  preferences_override: z
    .object({
      cuisine: z.string().min(1).optional(),
      max_cook_time_minutes: z.number().int().positive().max(480).optional(),
    })
    .optional(),
});

const listSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  meal_type: z.enum(['breakfast', 'lunch', 'dinner', 'snack']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

const updateMealSchema = z.object({
  status: z.enum(['accepted', 'rejected']).optional(),
  on_shopping_list: z.boolean().optional(),
}).refine(
  (data) => data.status !== undefined || data.on_shopping_list !== undefined,
  { message: 'At least one of status or on_shopping_list is required' }
);

// GET /api/meals/pending
router.get('/pending', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const meal = await getPendingMeal(userId);
    if (!meal) {
      res.json({ meal: null });
      return;
    }
    try {
      res.json({
        meal: {
          ...meal,
          ingredients: parseJsonColumn(meal.ingredients),
          instructions: parseJsonColumn(meal.instructions),
        },
      });
    } catch {
      // Corrupt pending meal — discard it and return null
      await deletePendingMeals(userId);
      res.json({ meal: null });
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/meals/generate
router.post('/generate', generateLimiter, async (req, res, next) => {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured' });
      return;
    }

    const parsed = generateSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;

    const dailyCount = await countMealsByUserToday(userId);
    if (dailyCount >= 10) {
      res.status(429).json({ error: 'Daily meal generation limit reached (10/day). Resets at midnight UTC.' });
      return;
    }

    const profile = await getProfile(userId);
    if (!profile) {
      res.status(400).json({ error: 'Profile must be configured before generating meals' });
      return;
    }

    await deletePendingMeals(userId);
    await pruneOldRejectedMeals(userId);

    const restrictions = await getRestrictions(userId);
    const disliked = await getDislikedIngredients(userId);
    const recentTitles = await getRecentAcceptedMealTitles(userId, 10);
    const rejectedTitles = await getRecentRejectedMealTitles(userId, 10);

    const partnerId = parsed.data.partner_id;
    let servings = 1;

    let effectiveCalorie: number | null;
    let effectiveProtein: number | null;
    let effectiveCarb: number | null;
    let effectiveFat: number | null;
    let cuisinePrefs: string[];
    let effectiveMaxCookTime: number | null;
    let effectiveRestrictions: Array<{ category: string; value: string }>;
    let effectiveDisliked: string[];

    if (partnerId) {
      const partnerLinked = await isPartner(userId, partnerId);
      if (!partnerLinked) {
        res.status(403).json({ error: 'User is not in your cooking partners list' });
        return;
      }

      const partnerProfile = await getProfile(partnerId);
      if (!partnerProfile) {
        res.status(400).json({ error: 'Cooking partner has not set up their profile yet' });
        return;
      }

      const partnerRestrictions = await getRestrictions(partnerId);
      const partnerDisliked = await getDislikedIngredients(partnerId);

      const merged = mergeProfiles(
        profile, restrictions, disliked,
        partnerProfile, partnerRestrictions, partnerDisliked,
      );

      // Always use merged macros for partner meals — ignore per-request overrides
      effectiveCalorie = merged.calorie_target;
      effectiveProtein = merged.protein_target;
      effectiveCarb = merged.carb_target;
      effectiveFat = merged.fat_target;
      cuisinePrefs = merged.cuisine_preferences;
      effectiveMaxCookTime = merged.max_cook_time_minutes;
      effectiveRestrictions = merged.restrictions;
      effectiveDisliked = merged.disliked_ingredients;
      servings = 2;
    } else {
      effectiveCalorie = parsed.data.calorie_target !== undefined ? parsed.data.calorie_target : profile.calorie_target;
      effectiveProtein = parsed.data.protein_target !== undefined ? parsed.data.protein_target : profile.protein_target;
      effectiveCarb = parsed.data.carb_target !== undefined ? parsed.data.carb_target : profile.carb_target;
      effectiveFat = parsed.data.fat_target !== undefined ? parsed.data.fat_target : profile.fat_target;
      cuisinePrefs = JSON.parse(profile.cuisine_preferences || '[]');
      effectiveMaxCookTime = profile.max_cook_time_minutes;
      effectiveRestrictions = restrictions.map((r) => ({ category: r.category, value: r.value }));
      effectiveDisliked = disliked.map((d) => d.ingredient);
    }

    const { meal, warnings } = await generateMeal({
      calorie_target: effectiveCalorie,
      protein_target: effectiveProtein,
      carb_target: effectiveCarb,
      fat_target: effectiveFat,
      meal_type: parsed.data.meal_type ?? null,
      cuisine_preferences: cuisinePrefs,
      max_cook_time_minutes: effectiveMaxCookTime,
      restrictions: effectiveRestrictions,
      disliked_ingredients: effectiveDisliked,
      recent_meal_titles: recentTitles,
      recent_rejected_titles: rejectedTitles,
      preferences_override: parsed.data.preferences_override,
      servings,
    });

    const saved = await createMeal(userId, {
      title: meal.title,
      description: meal.description,
      ingredients: meal.ingredients,
      instructions: meal.instructions,
      calories: meal.calories,
      protein_g: meal.protein_g,
      carbs_g: meal.carbs_g,
      fat_g: meal.fat_g,
      cook_time_minutes: meal.cook_time_minutes,
      cuisine: meal.cuisine,
      meal_type: parsed.data.meal_type ?? null,
    });

    res.status(201).json({
      meal: {
        ...saved,
        ingredients: parseJsonColumn(saved.ingredients),
        instructions: parseJsonColumn(saved.instructions),
      },
      warnings,
    });
  } catch (err) {
    if (err instanceof AIServiceError) {
      res.status(err.statusCode).json({ error: err.message });
      return;
    }
    if (err instanceof Error && err.message.includes('failed validation')) {
      res.status(422).json({ error: 'Could not generate a valid meal. Please try again.' });
      return;
    }
    next(err);
  }
});

// GET /api/meals
router.get('/', async (req, res, next) => {
  try {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const { status, meal_type, limit, offset } = parsed.data;

    const filters: { status?: string; cuisine?: string; meal_type?: string; limit: number; offset: number } = { limit, offset };
    if (status) filters.status = status;
    if (meal_type) filters.meal_type = meal_type;

    const meals = await getMealsByUser(userId, filters);
    const countFilters: { status?: string; meal_type?: string } = {};
    if (status) countFilters.status = status;
    if (meal_type) countFilters.meal_type = meal_type;
    const total = await countMealsByUser(userId, Object.keys(countFilters).length > 0 ? countFilters : undefined);

    res.json({
      meals: meals.map((m) => ({
        ...m,
        ingredients: parseJsonColumn(m.ingredients),
        instructions: parseJsonColumn(m.instructions),
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals/shopping-list
router.get('/shopping-list', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const meals = await getShoppingListMeals(userId);
    res.json({
      meals: meals.map((m) => ({
        ...m,
        ingredients: parseJsonColumn(m.ingredients),
        instructions: parseJsonColumn(m.instructions),
      })),
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/meals/shopping-list
router.delete('/shopping-list', async (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const cleared = await clearShoppingList(userId);
    res.json({ cleared });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/meals/:id
router.patch('/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid meal ID' });
      return;
    }

    const parsed = updateMealSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;

    if (parsed.data.status) {
      const updated = await updateMealStatus(id, userId, parsed.data.status);
      if (!updated) {
        res.status(404).json({ error: 'Meal not found' });
        return;
      }
    }

    if (parsed.data.on_shopping_list !== undefined) {
      const updated = await updateMealShoppingList(id, userId, parsed.data.on_shopping_list);
      if (!updated && !parsed.data.status) {
        res.status(404).json({ error: 'Meal not found' });
        return;
      }
    }

    const meal = await getMealByIdAndUser(id, userId);
    if (!meal) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }
    res.json({
      meal: {
        ...meal,
        ingredients: parseJsonColumn(meal.ingredients),
        instructions: parseJsonColumn(meal.instructions),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
