import { createClient } from '@libsql/client';
import path from 'path';
import fs from 'fs';
import { logger } from '../lib/logger.js';

const isProduction = process.env.NODE_ENV === 'production';

const client = isProduction
  ? (() => {
      const url = process.env.TURSO_DATABASE_URL;
      const authToken = process.env.TURSO_AUTH_TOKEN;
      if (!url || !authToken) {
        logger.fatal('TURSO_DATABASE_URL and TURSO_AUTH_TOKEN are required in production');
        process.exit(1);
      }
      return createClient({ url, authToken });
    })()
  : createClient({
      url: `file:${process.env.DATABASE_PATH || './data/carte.db'}`,
    });

// Ensure data directory exists for local development
if (!isProduction) {
  const dbPath = process.env.DATABASE_PATH || './data/carte.db';
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

  // Migration: add username column to users table
  try {
    await client.execute("ALTER TABLE users ADD COLUMN username TEXT NOT NULL DEFAULT ''");
    // Backfill existing users with unique placeholder usernames
    const existing = await client.execute("SELECT id FROM users WHERE username = ''");
    for (const row of existing.rows) {
      await client.execute({
        sql: "UPDATE users SET username = ? WHERE id = ?",
        args: [`user_${row.id}`, row.id],
      });
    }
    // Now add the unique index
    await client.execute("CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username ON users(username)");
  } catch {
    // Column already exists — ignore
  }

  // Migration: create cooking_partners table
  await client.execute(`
    CREATE TABLE IF NOT EXISTS cooking_partners (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      partner_id INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (partner_id) REFERENCES users(id) ON DELETE CASCADE,
      UNIQUE(user_id, partner_id)
    )
  `);

  // Migration: indexes for cascade-delete scans and dominant meals query shape
  await client.execute('CREATE INDEX IF NOT EXISTS idx_cooking_partners_partner_id ON cooking_partners(partner_id)');
  await client.execute('CREATE INDEX IF NOT EXISTS idx_meals_user_status_created ON meals(user_id, status, created_at DESC)');
}

export default client;
