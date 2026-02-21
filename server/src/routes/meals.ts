import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  createMeal,
  getMealById,
  getMealsByUser,
  countMealsByUser,
  updateMealStatus,
  getRecentAcceptedMealTitles,
} from '../db/queries/meals.js';
import { getProfile, getRestrictions, getDislikedIngredients } from '../db/queries/profiles.js';
import { generateMeal } from '../services/ai.js';

const router = Router();

router.use(requireAuth);

// --- Validation schemas ---

const generateSchema = z.object({
  preferences_override: z
    .object({
      cuisine: z.string().min(1).optional(),
      max_cook_time_minutes: z.number().int().positive().max(480).optional(),
    })
    .optional(),
});

const listSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected']).optional(),
  limit: z.coerce.number().int().positive().max(100).default(20),
  offset: z.coerce.number().int().nonnegative().default(0),
});

const updateStatusSchema = z.object({
  status: z.enum(['accepted', 'rejected']),
});

// POST /api/meals/generate
router.post('/generate', async (req, res, next) => {
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
    const profile = getProfile(userId);
    if (!profile) {
      res.status(400).json({ error: 'Profile must be configured before generating meals' });
      return;
    }

    const restrictions = getRestrictions(userId);
    const disliked = getDislikedIngredients(userId);
    const recentTitles = getRecentAcceptedMealTitles(userId, 10);
    const cuisinePrefs: string[] = JSON.parse(profile.cuisine_preferences || '[]');

    const { meal, warnings } = await generateMeal({
      calorie_target: profile.calorie_target,
      protein_target: profile.protein_target,
      carb_target: profile.carb_target,
      fat_target: profile.fat_target,
      cuisine_preferences: cuisinePrefs,
      max_cook_time_minutes: profile.max_cook_time_minutes,
      restrictions: restrictions.map((r) => ({ category: r.category, value: r.value })),
      disliked_ingredients: disliked.map((d) => d.ingredient),
      recent_meal_titles: recentTitles,
      preferences_override: parsed.data.preferences_override,
    });

    const saved = createMeal(userId, {
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
    });

    res.status(201).json({
      meal: {
        ...saved,
        ingredients: JSON.parse(saved.ingredients),
        instructions: JSON.parse(saved.instructions),
      },
      warnings,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/meals
router.get('/', (req, res, next) => {
  try {
    const parsed = listSchema.safeParse(req.query);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const { status, limit, offset } = parsed.data;

    const meals = getMealsByUser(userId, { status, limit, offset });
    const total = countMealsByUser(userId, status ? { status } : undefined);

    res.json({
      meals: meals.map((m) => ({
        ...m,
        ingredients: JSON.parse(m.ingredients),
        instructions: JSON.parse(m.instructions),
      })),
      total,
    });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/meals/:id
router.patch('/:id', (req, res, next) => {
  try {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) {
      res.status(400).json({ error: 'Invalid meal ID' });
      return;
    }

    const parsed = updateStatusSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const updated = updateMealStatus(id, userId, parsed.data.status);
    if (!updated) {
      res.status(404).json({ error: 'Meal not found' });
      return;
    }

    const meal = getMealById(id)!;
    res.json({
      meal: {
        ...meal,
        ingredients: JSON.parse(meal.ingredients),
        instructions: JSON.parse(meal.instructions),
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
