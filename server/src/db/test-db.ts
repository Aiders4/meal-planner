import dotenv from 'dotenv';
dotenv.config();

import { createUser, findUserByEmail, findUserById } from './queries/users.js';
import { upsertProfile, getProfile, setRestrictions, getRestrictions, setDislikedIngredients, getDislikedIngredients } from './queries/profiles.js';
import { createMeal, getMealsByUser, updateMealStatus } from './queries/meals.js';

console.log('=== Database Test Script ===\n');

// 1. Create a user
console.log('1. Creating user...');
const user = createUser('test@example.com', 'hashed_password_123');
console.log('   Created:', user);

// 2. Find user by email
console.log('\n2. Finding user by email...');
const foundByEmail = findUserByEmail('test@example.com');
console.log('   Found:', foundByEmail);

// 3. Find user by ID
console.log('\n3. Finding user by ID...');
const foundById = findUserById(user.id);
console.log('   Found:', foundById);

// 4. Create/update profile
console.log('\n4. Creating profile...');
const profile = upsertProfile(user.id, {
  calorie_target: 2000,
  protein_target: 150,
  carb_target: 200,
  fat_target: 70,
  cuisine_preferences: ['Italian', 'Mexican', 'Japanese'],
  max_cook_time_minutes: 45,
});
console.log('   Profile:', profile);

// 5. Update profile
console.log('\n5. Updating profile...');
const updatedProfile = upsertProfile(user.id, {
  calorie_target: 2200,
  protein_target: 160,
  carb_target: 220,
  fat_target: 75,
  cuisine_preferences: ['Italian', 'Mexican', 'Japanese', 'Thai'],
  max_cook_time_minutes: 60,
});
console.log('   Updated:', updatedProfile);

// 6. Set dietary restrictions
console.log('\n6. Setting dietary restrictions...');
const restrictions = setRestrictions(user.id, [
  { category: 'allergy', value: 'peanuts' },
  { category: 'allergy', value: 'shellfish' },
  { category: 'diet', value: 'gluten-free' },
]);
console.log('   Restrictions:', restrictions);

// 7. Set disliked ingredients
console.log('\n7. Setting disliked ingredients...');
const disliked = setDislikedIngredients(user.id, ['cilantro', 'olives', 'anchovies']);
console.log('   Disliked:', disliked);

// 8. Create meals
console.log('\n8. Creating meals...');
const meal1 = createMeal(user.id, {
  title: 'Chicken Stir Fry',
  description: 'Quick and healthy chicken stir fry with vegetables',
  ingredients: ['chicken breast', 'broccoli', 'soy sauce', 'garlic', 'rice'],
  instructions: ['Cut chicken into cubes', 'Stir fry vegetables', 'Add sauce', 'Serve over rice'],
  calories: 450,
  protein_g: 35,
  carbs_g: 40,
  fat_g: 12,
  cook_time_minutes: 25,
  cuisine: 'Japanese',
});
console.log('   Meal 1:', meal1);

const meal2 = createMeal(user.id, {
  title: 'Pasta Primavera',
  description: 'Vegetable pasta with light sauce',
  ingredients: ['penne', 'zucchini', 'bell pepper', 'tomato', 'olive oil'],
  instructions: ['Cook pasta', 'Saute vegetables', 'Combine and season'],
  calories: 520,
  protein_g: 18,
  carbs_g: 72,
  fat_g: 16,
  cook_time_minutes: 30,
  cuisine: 'Italian',
});
console.log('   Meal 2:', meal2);

// 9. Query meals (no filters)
console.log('\n9. Getting all meals for user...');
const allMeals = getMealsByUser(user.id);
console.log(`   Found ${allMeals.length} meals`);

// 10. Update meal status
console.log('\n10. Updating meal status...');
const updated = updateMealStatus(meal1.id, user.id, 'accepted');
console.log('   Status updated:', updated);

// 11. Filter by status
console.log('\n11. Filtering meals by status...');
const acceptedMeals = getMealsByUser(user.id, { status: 'accepted' });
console.log(`   Accepted meals: ${acceptedMeals.length}`);
const pendingMeals = getMealsByUser(user.id, { status: 'pending' });
console.log(`   Pending meals: ${pendingMeals.length}`);

// 12. Filter by cuisine
console.log('\n12. Filtering meals by cuisine...');
const italianMeals = getMealsByUser(user.id, { cuisine: 'Italian' });
console.log(`   Italian meals: ${italianMeals.length}`);

// 13. Test pagination
console.log('\n13. Testing pagination...');
const page1 = getMealsByUser(user.id, { limit: 1, offset: 0 });
console.log(`   Page 1 (limit=1): ${page1.length} meal(s) - "${page1[0]?.title}"`);
const page2 = getMealsByUser(user.id, { limit: 1, offset: 1 });
console.log(`   Page 2 (limit=1): ${page2.length} meal(s) - "${page2[0]?.title}"`);

// 14. Verify restrictions and disliked ingredients are still there
console.log('\n14. Verifying profile data...');
const finalProfile = getProfile(user.id);
console.log('   Profile:', finalProfile);
const finalRestrictions = getRestrictions(user.id);
console.log('   Restrictions:', finalRestrictions.length, 'items');
const finalDisliked = getDislikedIngredients(user.id);
console.log('   Disliked:', finalDisliked.length, 'items');

console.log('\n=== All tests passed! ===');
