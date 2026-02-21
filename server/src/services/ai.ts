import Anthropic from '@anthropic-ai/sdk';

let _anthropic: Anthropic | null = null;
function getClient(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic();
  }
  return _anthropic;
}

export interface GenerateMealInput {
  calorie_target: number | null;
  protein_target: number | null;
  carb_target: number | null;
  fat_target: number | null;
  cuisine_preferences: string[];
  max_cook_time_minutes: number | null;
  restrictions: Array<{ category: string; value: string }>;
  disliked_ingredients: string[];
  recent_meal_titles: string[];
  preferences_override?: {
    cuisine?: string;
    max_cook_time_minutes?: number;
  };
}

export interface GeneratedMeal {
  title: string;
  description: string;
  ingredients: Array<{ name: string; quantity: number; unit: string }>;
  instructions: string[];
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  cook_time_minutes: number;
  cuisine: string;
}

export interface GenerateMealResult {
  meal: GeneratedMeal;
  warnings: string[];
}

const SYSTEM_PROMPT = `You are a creative meal planning assistant. Your job is to generate delicious, varied meals that match the user's dietary profile and preferences.

Guidelines:
- Be creative and suggest diverse meals across different cuisines
- Ensure macronutrient values are realistic and internally consistent
- Provide clear, actionable cooking instructions
- Use common, accessible ingredients unless the user prefers otherwise
- Respect all dietary restrictions and avoid disliked ingredients completely
- If given recent meal titles, avoid repeating similar meals`;

const CREATE_MEAL_TOOL: Anthropic.Tool = {
  name: 'create_meal',
  description: 'Create a structured meal plan with nutritional information',
  input_schema: {
    type: 'object' as const,
    properties: {
      title: { type: 'string', description: 'Name of the meal' },
      description: { type: 'string', description: 'Brief description of the meal' },
      ingredients: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            quantity: { type: 'number' },
            unit: { type: 'string' },
          },
          required: ['name', 'quantity', 'unit'],
        },
        description: 'List of ingredients with quantities',
      },
      instructions: {
        type: 'array',
        items: { type: 'string' },
        description: 'Step-by-step cooking instructions',
      },
      calories: { type: 'number', description: 'Total calories' },
      protein_g: { type: 'number', description: 'Grams of protein' },
      carbs_g: { type: 'number', description: 'Grams of carbohydrates' },
      fat_g: { type: 'number', description: 'Grams of fat' },
      cook_time_minutes: { type: 'number', description: 'Total cook time in minutes' },
      cuisine: { type: 'string', description: 'Cuisine type (e.g., Italian, Mexican, Japanese)' },
    },
    required: ['title', 'description', 'ingredients', 'instructions', 'calories', 'protein_g', 'carbs_g', 'fat_g', 'cook_time_minutes', 'cuisine'],
  },
};

function buildUserMessage(input: GenerateMealInput): string {
  const parts: string[] = ['Generate a meal with the following requirements:'];

  if (input.calorie_target) {
    parts.push(`- Target calories: ${input.calorie_target} kcal`);
  }
  if (input.protein_target) {
    parts.push(`- Target protein: ${input.protein_target}g`);
  }
  if (input.carb_target) {
    parts.push(`- Target carbs: ${input.carb_target}g`);
  }
  if (input.fat_target) {
    parts.push(`- Target fat: ${input.fat_target}g`);
  }

  const cuisine = input.preferences_override?.cuisine;
  if (cuisine) {
    parts.push(`- Cuisine: ${cuisine}`);
  } else if (input.cuisine_preferences.length > 0) {
    parts.push(`- Preferred cuisines: ${input.cuisine_preferences.join(', ')}`);
  }

  const maxCook = input.preferences_override?.max_cook_time_minutes ?? input.max_cook_time_minutes;
  if (maxCook) {
    parts.push(`- Maximum cook time: ${maxCook} minutes`);
  }

  if (input.restrictions.length > 0) {
    const grouped: Record<string, string[]> = {};
    for (const r of input.restrictions) {
      (grouped[r.category] ??= []).push(r.value);
    }
    for (const [category, values] of Object.entries(grouped)) {
      parts.push(`- Dietary restriction (${category}): ${values.join(', ')}`);
    }
  }

  if (input.disliked_ingredients.length > 0) {
    parts.push(`- Avoid these ingredients: ${input.disliked_ingredients.join(', ')}`);
  }

  if (input.recent_meal_titles.length > 0) {
    parts.push(`- Recently accepted meals (avoid repeating): ${input.recent_meal_titles.join(', ')}`);
  }

  return parts.join('\n');
}

interface ValidationResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

function validateMeal(meal: GeneratedMeal, maxCookTime: number | null): ValidationResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  // Macro consistency check
  const calculatedCalories = meal.protein_g * 4 + meal.carbs_g * 4 + meal.fat_g * 9;
  const ratio = Math.abs(calculatedCalories - meal.calories) / meal.calories;
  if (ratio > 0.15) {
    warnings.push(
      `Macro-calorie mismatch: calculated ${Math.round(calculatedCalories)} kcal from macros vs stated ${meal.calories} kcal`
    );
  }

  // Calorie range
  if (meal.calories < 100 || meal.calories > 3000) {
    errors.push(`Calories out of range: ${meal.calories} (must be 100-3000)`);
  }

  // Non-empty check
  if (!meal.ingredients || meal.ingredients.length === 0) {
    errors.push('Meal has no ingredients');
  }
  if (!meal.instructions || meal.instructions.length === 0) {
    errors.push('Meal has no instructions');
  }

  // Cook time check
  if (maxCookTime && meal.cook_time_minutes > maxCookTime + 10) {
    errors.push(
      `Cook time ${meal.cook_time_minutes} min exceeds max ${maxCookTime} min (with 10 min tolerance)`
    );
  }

  return { valid: errors.length === 0, warnings, errors };
}

async function callClaudeAPI(userMessage: string): Promise<GeneratedMeal> {
  const response = await getClient().messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    tools: [CREATE_MEAL_TOOL],
    tool_choice: { type: 'tool', name: 'create_meal' },
    messages: [{ role: 'user', content: userMessage }],
  });

  const toolUse = response.content.find((block) => block.type === 'tool_use');
  if (!toolUse || toolUse.type !== 'tool_use') {
    throw new Error('AI did not return a tool_use response');
  }

  return toolUse.input as GeneratedMeal;
}

export async function generateMeal(input: GenerateMealInput): Promise<GenerateMealResult> {
  const userMessage = buildUserMessage(input);
  const effectiveMaxCook =
    input.preferences_override?.max_cook_time_minutes ?? input.max_cook_time_minutes;

  let meal = await callClaudeAPI(userMessage);
  let validation = validateMeal(meal, effectiveMaxCook);

  // Retry once on hard failure
  if (!validation.valid) {
    console.warn('First AI attempt failed validation, retrying...', validation.errors);
    meal = await callClaudeAPI(userMessage);
    validation = validateMeal(meal, effectiveMaxCook);

    if (!validation.valid) {
      throw new Error(`AI-generated meal failed validation: ${validation.errors.join('; ')}`);
    }
  }

  return { meal, warnings: validation.warnings };
}
