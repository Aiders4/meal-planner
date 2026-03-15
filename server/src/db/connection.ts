import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';

const isProduction = process.env.NODE_ENV === 'production';

const client = isProduction
  ? createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN!,
    })
  : createClient({
      url: `file:${process.env.DATABASE_PATH || './data/meal-planner.db'}`,
    });

// Ensure data directory exists for local development
if (!isProduction) {
  const dbPath = process.env.DATABASE_PATH || './data/meal-planner.db';
  const dir = path.dirname(path.resolve(dbPath));
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export async function initializeDatabase(): Promise<void> {
  // Enable foreign key enforcement
  await client.execute('PRAGMA foreign_keys = ON');

  // Read and execute the schema
  const schemaPath = path.join(__dirname, 'schema.sql');
  const schema = fs.readFileSync(schemaPath, 'utf-8');
  await client.executeMultiple(schema);

  // Migration: add meal_type column to existing meals table
  try {
    await client.execute('ALTER TABLE meals ADD COLUMN meal_type TEXT');
  } catch {
    // Column already exists — ignore
  }

  // Migration: add on_shopping_list column to meals table
  try {
    await client.execute('ALTER TABLE meals ADD COLUMN on_shopping_list INTEGER NOT NULL DEFAULT 0');
  } catch {
    // Column already exists — ignore
  }
}

export default client;
