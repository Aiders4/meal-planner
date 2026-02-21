import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../middleware/auth.js';
import {
  getProfile,
  upsertProfile,
  getRestrictions,
  setRestrictions,
  getDislikedIngredients,
  setDislikedIngredients,
} from '../db/queries/profiles.js';

const router = Router();

// All profile routes require authentication
router.use(requireAuth);

// --- Validation schemas ---

const profileSchema = z.object({
  calorie_target: z.number().int().positive().max(10000).nullable().optional(),
  protein_target: z.number().nonnegative().max(1000).nullable().optional(),
  carb_target: z.number().nonnegative().max(1000).nullable().optional(),
  fat_target: z.number().nonnegative().max(1000).nullable().optional(),
  cuisine_preferences: z.array(z.string().min(1)).optional(),
  max_cook_time_minutes: z.number().int().positive().max(480).nullable().optional(),
});

const allowedRestrictions: Record<string, string[]> = {
  lifestyle: ['vegetarian', 'vegan', 'pescatarian', 'flexitarian'],
  allergy: ['gluten', 'dairy', 'nuts', 'peanuts', 'tree-nuts', 'eggs', 'shellfish', 'fish', 'soy', 'sesame', 'celery', 'mustard', 'lupin', 'molluscs'],
  religious: ['halal', 'kosher'],
  medical: ['low-sodium', 'low-sugar', 'diabetic-friendly', 'low-fodmap'],
};

const restrictionSchema = z.object({
  restrictions: z.array(
    z.object({
      category: z.enum(['lifestyle', 'allergy', 'religious', 'medical']),
      value: z.string().min(1),
    }).refine(
      (r) => allowedRestrictions[r.category]?.includes(r.value),
      (r) => ({ message: `Invalid value "${r.value}" for category "${r.category}"` })
    )
  ),
});

const dislikedIngredientsSchema = z.object({
  ingredients: z.array(z.string().min(1).max(100)),
});

// GET /api/profile
router.get('/', (req, res, next) => {
  try {
    const userId = req.user!.userId;
    const profile = getProfile(userId);
    const dietary_restrictions = getRestrictions(userId);
    const disliked_ingredients = getDislikedIngredients(userId);

    res.json({
      profile: profile || null,
      dietary_restrictions,
      disliked_ingredients,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile
router.put('/', (req, res, next) => {
  try {
    const parsed = profileSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const profile = upsertProfile(userId, parsed.data);

    res.json({ profile });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile/restrictions
router.put('/restrictions', (req, res, next) => {
  try {
    const parsed = restrictionSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const dietary_restrictions = setRestrictions(userId, parsed.data.restrictions);

    res.json({ dietary_restrictions });
  } catch (err) {
    next(err);
  }
});

// PUT /api/profile/disliked-ingredients
router.put('/disliked-ingredients', (req, res, next) => {
  try {
    const parsed = dislikedIngredientsSchema.safeParse(req.body);
    if (!parsed.success) {
      res.status(400).json({ error: parsed.error.issues[0].message });
      return;
    }

    const userId = req.user!.userId;
    const disliked_ingredients = setDislikedIngredients(userId, parsed.data.ingredients);

    res.json({ disliked_ingredients });
  } catch (err) {
    next(err);
  }
});

export default router;
