import client from '../connection.js';

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: string;
}

export async function createUser(email: string, passwordHash: string): Promise<User> {
  const result = await client.execute({
    sql: 'INSERT INTO users (email, password_hash) VALUES (?, ?)',
    args: [email, passwordHash],
  });
  const user = await findUserById(Number(result.lastInsertRowid));
  return user!;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE email = ?',
    args: [email],
  });
  return result.rows[0] as unknown as User | undefined;
}

export async function findUserById(id: number): Promise<User | undefined> {
  const result = await client.execute({
    sql: 'SELECT * FROM users WHERE id = ?',
    args: [id],
  });
  return result.rows[0] as unknown as User | undefined;
}
