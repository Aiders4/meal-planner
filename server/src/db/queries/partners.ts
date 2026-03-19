import client from '../connection.js';

export interface Partner {
  id: number;
  username: string;
}

export async function getPartners(userId: number): Promise<Partner[]> {
  const result = await client.execute({
    sql: `SELECT u.id, u.username FROM cooking_partners cp
          JOIN users u ON u.id = cp.partner_id
          WHERE cp.user_id = ?
          ORDER BY cp.created_at DESC`,
    args: [userId],
  });
  return result.rows as unknown as Partner[];
}

export async function addPartner(userId: number, partnerId: number): Promise<void> {
  await client.execute({
    sql: 'INSERT INTO cooking_partners (user_id, partner_id) VALUES (?, ?)',
    args: [userId, partnerId],
  });
}

export async function removePartner(userId: number, partnerId: number): Promise<boolean> {
  const result = await client.execute({
    sql: 'DELETE FROM cooking_partners WHERE user_id = ? AND partner_id = ?',
    args: [userId, partnerId],
  });
  return result.rowsAffected > 0;
}

export async function isPartner(userId: number, partnerId: number): Promise<boolean> {
  const result = await client.execute({
    sql: 'SELECT 1 FROM cooking_partners WHERE user_id = ? AND partner_id = ?',
    args: [userId, partnerId],
  });
  return result.rows.length > 0;
}
