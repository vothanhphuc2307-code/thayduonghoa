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
  const name = safeString(body.name, 80);
  const password = typeof body.password === 'string' ? body.password : '';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return jsonError('Vui lòng nhập email hợp lệ.');
  if (name.length < 2) return jsonError('Tên hiển thị cần có ít nhất 2 ký tự.');
  if (password.length < 10 || password.length > 128) return jsonError('Mật khẩu phải dài từ 10 đến 128 ký tự.');
  try {
    const exists = await query('SELECT id FROM users WHERE email = $1 LIMIT 1', [email]);
    if (exists.rowCount) return jsonError('Email này đã có tài khoản.', 409);
    const hash = await bcrypt.hash(password, 12);
    const inserted = await query(
      `INSERT INTO users(email, display_name, password_hash, role)
       VALUES($1, $2, $3, 'student')
       RETURNING id, email, display_name, role, is_active, created_at`,
      [email, name, hash]
    );
    await createSession(inserted.rows[0]);
    return NextResponse.json({ user: inserted.rows[0] }, { status: 201 });
  } catch (e) {
    if (e?.code === '23505') return jsonError('Email này đã có tài khoản.', 409);
    console.error('Register error:', e?.message);
    return jsonError('Không thể tạo tài khoản lúc này. Hãy kiểm tra cấu hình database.', 503);
  }
}
