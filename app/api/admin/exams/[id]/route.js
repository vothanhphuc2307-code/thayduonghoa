import { NextResponse } from 'next/server';
import { getCurrentUser } from '../../../../../lib/session.js';
import { query } from '../../../../../lib/db.js';
export const runtime = 'nodejs';
export async function PATCH(request, context) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const { id } = await context.params;
  let body; try { body = await request.json(); } catch { return NextResponse.json({ error: 'Dữ liệu không hợp lệ.' }, { status: 400 }); }
  if (typeof body?.isPublished !== 'boolean') return NextResponse.json({ error: 'Thiếu trạng thái xuất bản.' }, { status: 400 });
  try {
    const r = await query('UPDATE exams SET is_published=$1, updated_at=NOW() WHERE id=$2 RETURNING id,slug,title,is_published', [body.isPublished,id]);
    if (!r.rowCount) return NextResponse.json({ error: 'Không tìm thấy đề.' }, { status: 404 });
    return NextResponse.json({ exam:r.rows[0] });
  } catch (e) { console.error('Update exam error:',e?.message); return NextResponse.json({ error:'Không cập nhật được đề.' },{status:503}); }
}
export async function DELETE(_request, context) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'admin') return NextResponse.json({ error: 'Bạn không có quyền quản trị.' }, { status: 403 });
  const { id } = await context.params;
  try {
    const r = await query('DELETE FROM exams WHERE id=$1 RETURNING id', [id]);
    if (!r.rowCount) return NextResponse.json({ error:'Không tìm thấy đề.' },{status:404});
    return NextResponse.json({ ok:true });
  } catch (e) { console.error('Delete exam error:',e?.message); return NextResponse.json({ error:'Không thể xóa đề; đề có thể đã có lịch sử bài làm. Hãy ẩn đề thay vì xóa.' },{status:409}); }
}
