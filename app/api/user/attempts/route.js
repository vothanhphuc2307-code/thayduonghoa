import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { getCurrentUser } from '../../../../lib/session.js';
export const runtime = 'nodejs';
export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập.' }, { status: 401 });
  try {
    const result = await query(
      `SELECT a.id, a.score, a.max_score, a.submitted_at, e.title, e.subject, e.slug
       FROM attempts a JOIN exams e ON e.id = a.exam_id
       WHERE a.user_id = $1 ORDER BY a.submitted_at DESC LIMIT 100`, [user.id]
    );
    return NextResponse.json({ attempts: result.rows });
  } catch (e) {
    console.error('Attempts error:', e?.message);
    return NextResponse.json({ error: 'Không tải được lịch sử.' }, { status: 503 });
  }
}
