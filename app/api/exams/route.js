import { NextResponse } from 'next/server';
import { query } from '../../../lib/db.js';
export const runtime = 'nodejs';
export async function GET(request) {
  try {
    const subject = new URL(request.url).searchParams.get('subject');
    const result = await query(
      `SELECT e.id, e.slug, e.title, e.subject, e.description, e.duration_minutes, e.is_sample, e.created_at,
        (SELECT COUNT(*)::int FROM questions q WHERE q.exam_id = e.id) AS question_count
       FROM exams e WHERE e.is_published = TRUE AND ($1::text IS NULL OR e.subject = $1)
       ORDER BY e.subject, e.created_at DESC`,
      [subject || null]
    );
    return NextResponse.json({ exams: result.rows });
  } catch (e) {
    console.error('Exam list error:', e?.message);
    return NextResponse.json({ error: 'Chưa kết nối được database. Hãy cấu hình DATABASE_URL và chạy npm run db:init.' }, { status: 503 });
  }
}
