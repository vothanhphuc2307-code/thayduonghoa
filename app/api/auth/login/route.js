import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { query } from '../../../../lib/db.js';
import { createSession } from '../../../../lib/session.js';
import { readJson, safeString, jsonError } from '../../../../lib/http.js';

export const runtime = 'nodejs';
export async function POST(request) {
  const body = await readJson(request);
  if (!body) return jsonError('Dữ liệu gửi lên không hợp lệ.');
  const email = safeString(body.email, 254).toLowerCase();
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password || password.length > 128) return jsonError('Email hoặc mật khẩu không đúng.', 401);
  try {
    const result = await query('SELECT id, email, display_name, password_hash, role, is_active, created_at FROM users WHERE email = $1 LIMIT 1', [email]);
    const user = result.rows[0];
    const valid = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!user || !valid || !user.is_active) return jsonError('Email hoặc mật khẩu không đúng.', 401);
    await createSession(user);
    return NextResponse.json({ user: { id: user.id, email: user.email, display_name: user.display_name, role: user.role } });
  } catch (e) {
    console.error('Login error:', e?.message);
    return jsonError('Không thể đăng nhập lúc này. Hãy kiểm tra cấu hình máy chủ.', 503);
  }
}
