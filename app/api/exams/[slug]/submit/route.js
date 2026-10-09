import { NextResponse } from 'next/server';
import { query } from '../../../../../lib/db.js';
import { getCurrentUser } from '../../../../../lib/session.js';
import { gradeQuestion, publicQuestion } from '../../../../../lib/exams.js';
import { readJson } from '../../../../../lib/http.js';
export const runtime = 'nodejs';
export async function POST(request, context) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: 'Vui lòng đăng nhập để nộp bài và lưu kết quả.' }, { status: 401 });
  const body = await readJson(request);
  if (!body || !body.answers || typeof body.answers !== 'object' || Array.isArray(body.answers)) {
    return NextResponse.json({ error: 'Phiếu trả lời không hợp lệ.' }, { status: 400 });
  }
  const answerEntries = Object.entries(body.answers);
  if (answerEntries.length > 200) return NextResponse.json({ error: 'Phiếu trả lời vượt quá giới hạn.' }, { status: 400 });
  for (const [, value] of answerEntries) {
    if (typeof value === 'string' && value.length > 2000) return NextResponse.json({ error: 'Một đáp án quá dài.' }, { status: 400 });
    if (Array.isArray(value) && (value.length > 20 || value.some(v => typeof v !== 'string' || v.length > 100))) return NextResponse.json({ error: 'Lựa chọn trả lời không hợp lệ.' }, { status: 400 });
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) return NextResponse.json({ error: 'Dạng đáp án không hợp lệ.' }, { status: 400 });
  }
  const { slug } = await context.params;
  const clientPool = await import('../../../../../lib/db.js');
  let client;
  try {
    const pool = clientPool.getPool();
    client = await pool.connect();
    await client.query('BEGIN');
    const ex = await client.query('SELECT id, slug, title FROM exams WHERE slug = $1 AND is_published = TRUE LIMIT 1', [slug]);
    const exam = ex.rows[0];
    if (!exam) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Không tìm thấy đề thi.' }, { status: 404 }); }
    const qs = await client.query('SELECT id, sort_order, prompt, question_type, points, options, answer_key, accepted_answers, explanation FROM questions WHERE exam_id = $1 ORDER BY sort_order', [exam.id]);
    if (!qs.rowCount) { await client.query('ROLLBACK'); return NextResponse.json({ error: 'Đề thi chưa có câu hỏi.' }, { status: 409 }); }
    let score = 0;
    let maxScore = 0;
    const review = [];
    for (const q of qs.rows) {
      const point = Number(q.points);
      maxScore += point;
      const given = body.answers[q.id];
      const graded = gradeQuestion(q, given);
      score += graded.earned;
      review.push({ ...publicQuestion(q, true), answerKey: q.question_type === 'short_answer' ? (q.accepted_answers || []) : (q.answer_key || []), given: given ?? null, correct: graded.correct, earned: graded.earned });
    }
    const questionIds = new Set(qs.rows.map(q => q.id));
    const savedAnswers = Object.fromEntries(Object.entries(body.answers).filter(([questionId]) => questionIds.has(questionId))); 
    const saved = await client.query(
      'INSERT INTO attempts(user_id, exam_id, score, max_score, answers) VALUES($1,$2,$3,$4,$5::jsonb) RETURNING id, score, max_score, submitted_at',
      [user.id, exam.id, score, maxScore, JSON.stringify(savedAnswers)]
    );
    await client.query('COMMIT');
    const attempt = saved.rows[0];
    return NextResponse.json({ attempt, exam, percentage: maxScore ? Math.round(score / maxScore * 1000) / 10 : 0, questions: review });
  } catch (e) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Submit exam error:', e?.message);
    return NextResponse.json({ error: 'Nộp bài thất bại. Kết quả chưa được lưu.' }, { status: 503 });
  } finally {
    client?.release();
  }
}
