import { NextResponse } from 'next/server';
import { query } from '../../../../lib/db.js';
import { publicQuestion } from '../../../../lib/exams.js';
export const runtime = 'nodejs';
export async function GET(_request, context) {
  const { slug } = await context.params;
  try {
    const result = await query('SELECT id, slug, title, subject, description, duration_minutes, is_sample FROM exams WHERE slug = $1 AND is_published = TRUE LIMIT 1', [slug]);
    const exam = result.rows[0];
    if (!exam) return NextResponse.json({ error: 'Không tìm thấy đề thi.' }, { status: 404 });
    const q = await query('SELECT id, sort_order, prompt, question_type, points, options, explanation FROM questions WHERE exam_id = $1 ORDER BY sort_order', [exam.id]);
    return NextResponse.json({ exam, questions: q.rows.map(publicQuestion) });
  } catch (e) {
    console.error('Exam detail error:', e?.message);
    return NextResponse.json({ error: 'Không tải được đề thi. Hãy kiểm tra cấu hình database.' }, { status: 503 });
  }
}
