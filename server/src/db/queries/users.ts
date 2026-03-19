import client from '../connection.js';

export interface User {
  id: number;
  email: string;
  username: string;
  password_hash: string;
  created_at: string;
}

export async function createUser(email: string, username: string, passwordHash: string): Promise<User> {
  const result = await client.execute({
    sql: 'INSERT INTO users (email, username, password_hash) VALUES (?, ?, ?)',
    args: [email, username, passwordHash],
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

export async function findUserByUsername(username: string): Promise<Omit<User, 'password_hash'> | undefined> {
  const result = await client.execute({
    sql: 'SELECT id, email, username, created_at FROM users WHERE username = ?',
    args: [username],
  });
  return result.rows[0] as unknown as Omit<User, 'password_hash'> | undefined;
}
