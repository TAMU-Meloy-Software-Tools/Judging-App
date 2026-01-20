import { query, queryOne } from '../connection';
import { User } from '../../types';

/**
 * User-related database queries
 */

export async function findByNetId(netId: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE netid = $1',
    [netId]
  );
}

export async function findById(userId: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE id = $1',
    [userId]
  );
}

export async function findByEmail(email: string): Promise<User | null> {
  return queryOne<User>(
    'SELECT * FROM users WHERE email = $1',
    [email]
  );
}

export async function updateLastLogin(userId: string): Promise<void> {
  await query(
    'UPDATE users SET last_login = NOW(), updated_at = NOW() WHERE id = $1',
    [userId]
  );
}

export async function createUser(data: {
  netId: string;
  email: string;
  name: string;
  role: 'judge' | 'admin' | 'moderator';
  isActive?: boolean;
}): Promise<User> {
  const result = await queryOne<User>(
    `INSERT INTO users (netid, email, name, role, is_active)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING *`,
    [data.netId, data.email, data.name, data.role, data.isActive ?? true]
  );
  
  if (!result) {
    throw new Error('Failed to create user');
  }
  
  return result;
}

export async function listUsers(filters: {
  role?: string;
  isActive?: boolean;
  limit?: number;
  offset?: number;
}): Promise<{ users: User[]; total: number }> {
  const conditions: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (filters.role) {
    conditions.push(`role = $${paramIndex++}`);
    params.push(filters.role);
  }

  if (filters.isActive !== undefined) {
    conditions.push(`is_active = $${paramIndex++}`);
    params.push(filters.isActive);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  // Get total count
  const countResult = await queryOne<{ count: string }>(
    `SELECT COUNT(*) as count FROM users ${whereClause}`,
    params
  );
  const total = parseInt(countResult?.count || '0', 10);

  // Get users with pagination
  const limit = filters.limit || 50;
  const offset = filters.offset || 0;
  
  params.push(limit, offset);
  const users = await query<User>(
    `SELECT * FROM users ${whereClause} ORDER BY name LIMIT $${paramIndex++} OFFSET $${paramIndex++}`,
    params
  );

  return { users, total };
}

export async function updateUser(
  userId: string,
  updates: Partial<Pick<User, 'name' | 'email' | 'role' | 'is_active'>>
): Promise<User> {
  const fields: string[] = [];
  const params: any[] = [];
  let paramIndex = 1;

  if (updates.name !== undefined) {
    fields.push(`name = $${paramIndex++}`);
    params.push(updates.name);
  }
  if (updates.email !== undefined) {
    fields.push(`email = $${paramIndex++}`);
    params.push(updates.email);
  }
  if (updates.role !== undefined) {
    fields.push(`role = $${paramIndex++}`);
    params.push(updates.role);
  }
  if (updates.is_active !== undefined) {
    fields.push(`is_active = $${paramIndex++}`);
    params.push(updates.is_active);
  }

  if (fields.length === 0) {
    const user = await findById(userId);
    if (!user) throw new Error('User not found');
    return user;
  }

  fields.push(`updated_at = NOW()`);
  params.push(userId);

  const result = await queryOne<User>(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramIndex} RETURNING *`,
    params
  );

  if (!result) {
    throw new Error('User not found');
  }

  return result;
}
