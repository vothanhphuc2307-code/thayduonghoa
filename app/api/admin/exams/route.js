import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../lib/session.js';
import { getPool, query } from '../../../../lib/db.js';
import { readJson, safeString } from '../../../../lib/http.js';

export const runtime = 'nodejs';
export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  try {
    const result = await query(`SELECT e.id, e.slug, e.title, e.subject, e.description, e.duration_minutes, e.is_published, e.is_sample, e.created_at,
      (SELECT COUNT(*)::int FROM questions q WHERE q.exam_id=e.id) AS question_count FROM exams e ORDER BY e.created_at DESC`);
    return NextResponse.json({ exams: result.rows });
  } catch (e) {
    console.error('Admin exam list error:', e?.message);
    return NextResponse.json({ error: 'Không tải được danh sách đề.' }, { status: 503 });
  }
}

export async function POST(request) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const body = await readJson(request);
  const title = safeString(body?.title, 200);
  const slug = safeString(body?.slug, 100).toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
  const subject = safeString(body?.subject, 80);
  const description = safeString(body?.description, 1000);
  const duration = Number(body?.durationMinutes || 45);
  const questions = body?.questions;
  if (!title || !slug || !subject) return NextResponse.json({ error: 'Cần nhập tiêu đề, slug và môn học.' }, { status: 400 });
  if (!Number.isInteger(duration) || duration < 1 || duration > 360) return NextResponse.json({ error: 'Thời lượng phải từ 1 đến 360 phút.' }, { status: 400 });
  if (!Array.isArray(questions) || questions.length < 1 || questions.length > 200) return NextResponse.json({ error: 'Đề cần có từ 1 đến 200 câu hỏi hợp lệ.' }, { status: 400 });
  for (const q of questions) {
    if (!safeString(q?.prompt, 10000) || !['single_choice','multi_choice','short_answer'].includes(q?.type)) return NextResponse.json({ error: 'Câu hỏi hoặc dạng câu hỏi không hợp lệ.' }, { status: 400 });
    if (!Array.isArray(q.options) || (q.type !== 'short_answer' && q.options.length < 2)) return NextResponse.json({ error: 'Câu trắc nghiệm cần ít nhất 2 lựa chọn.' }, { status: 400 });
    if (!Array.isArray(q.answerKey) || (q.type !== 'short_answer' && q.answerKey.length < 1)) return NextResponse.json({ error: 'Cần khai báo đáp án cho từng câu.' }, { status: 400 });
  }
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const inserted = await client.query(
      `INSERT INTO exams(slug,title,subject,description,duration_minutes,is_published,is_sample,created_by)
       VALUES($1,$2,$3,$4,$5,$6,FALSE,$7) RETURNING id, slug, title`,
      [slug,title,subject,description,duration,Boolean(body.published),user.id]
    );
    const exam = inserted.rows[0];
    for (let index=0; index<questions.length; index++) {
      const q = questions[index];
      const options = (q.options || []).slice(0,20).map((o,i)=>({
        id: safeString(o?.id || String.fromCharCode(65+i), 24),
        label: safeString(o?.label || o?.id || String.fromCharCode(65+i), 24),
        text: safeString(o?.text, 2000)
      }));
      const answerKey = q.type === 'short_answer' ? [] : q.answerKey.map(v=>String(v).trim()).filter(Boolean).slice(0,20);
      const accepted = Array.isArray(q.acceptedAnswers) ? q.acceptedAnswers.map(v=>safeString(v,200)).filter(Boolean).slice(0,50) : [];
      await client.query(
        `INSERT INTO questions(exam_id,sort_order,prompt,question_type,points,options,answer_key,accepted_answers,explanation)
         VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9)`,
        [exam.id,index+1,safeString(q.prompt,10000),q.type,Math.max(0,Math.min(100,Number(q.points)||1)),JSON.stringify(options),JSON.stringify(answerKey),JSON.stringify(accepted),safeString(q.explanation,5000)]
      );
    }
    await client.query('COMMIT');
    return NextResponse.json({ exam, message: 'Đã tạo đề. Dữ liệu mới do quản trị viên nhập.' }, { status: 201 });
  } catch (e) {
    await client.query('ROLLBACK').catch(()=>{});
    if (e?.code === '23505') return NextResponse.json({ error: 'Slug này đã được sử dụng.' }, { status: 409 });
    console.error('Create exam error:', e?.message);
    return NextResponse.json({ error: 'Không tạo được đề. Kiểm tra dữ liệu nhập.' }, { status: 400 });
  } finally {
    client.release();
  }
}
