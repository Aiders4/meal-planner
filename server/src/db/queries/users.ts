import db from '../connection.js';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export function createUser(email: string, passwordHash: string): User {
  const stmt = db.prepare(
    'INSERT INTO users (email, password_hash) VALUES (?, ?)'
  );
  const result = stmt.run(email, passwordHash);
  return findUserById(result.lastInsertRowid as number)!;
}

export function findUserByEmail(email: string): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE email = ?');
  return stmt.get(email) as User | undefined;
}

export function findUserById(id: number): User | undefined {
  const stmt = db.prepare('SELECT * FROM users WHERE id = ?');
  return stmt.get(id) as User | undefined;
}
