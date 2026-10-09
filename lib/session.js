import { cookies } from 'next/headers';
import { SignJWT, jwtVerify } from 'jose';
import { query } from './db.js';

const COOKIE_NAME = 'dolthpt_session';

function secretBytes() {
  const value = process.env.SESSION_SECRET || '';
  if (value.length < 32 || value.includes('replace-this-with-a-random-secret')) throw new Error('SESSION_SECRET must be a unique random secret of at least 32 characters; do not use the example placeholder.');
  return new TextEncoder().encode(value);
}

export async function createSession(user) {
  const token = await new SignJWT({ sub: user.id, role: user.role })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretBytes());
  const jar = await cookies();
  jar.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7
  });
}

export async function destroySession() {
  const jar = await cookies();
  jar.set(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
}

export async function getCurrentUser() {
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE_NAME)?.value;
    if (!token) return null;
    const { payload } = await jwtVerify(token, secretBytes(), { algorithms: ['HS256'] });
    if (!payload.sub) return null;
    const result = await query(
      'SELECT id, email, display_name, role, is_active, created_at FROM users WHERE id = $1 LIMIT 1',
      [payload.sub]
    );
    const user = result.rows[0];
    if (!user || !user.is_active) return null;
    return user;
  } catch {
    return null;
  }
}

export async function requireUser() {
  return getCurrentUser();
}
