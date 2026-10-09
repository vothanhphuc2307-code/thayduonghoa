import dotenv from 'dotenv';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcryptjs';
import pg from 'pg';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const { Pool } = pg;
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config({ path: path.join(__dirname, '../.env') });
if (!process.env.DATABASE_URL) { console.error('Missing DATABASE_URL. Copy .env.example to .env and configure PostgreSQL.'); process.exit(1); }
if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || /@example\.com$/i.test(process.env.ADMIN_EMAIL)) { console.error('Set a real ADMIN_EMAIL you control and ADMIN_PASSWORD before creating the first admin; do not use example.com.'); process.exit(1); }
if (String(process.env.ADMIN_PASSWORD).length < 14 || process.env.ADMIN_PASSWORD === 'ChangeThisAdminPasswordBeforeRunning123!') { console.error('ADMIN_PASSWORD must be a unique password of at least 14 characters; do not use the example placeholder.'); process.exit(1); }
if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32 || process.env.SESSION_SECRET.includes('replace-this-with-a-random-secret')) { console.error('SESSION_SECRET must be a unique random secret of at least 32 characters; do not use the example placeholder.'); process.exit(1); }
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL);
const pool = new Pool({ connectionString: process.env.DATABASE_URL, ssl: isLocal ? false : true, max:1 });
const q = (text, params=[]) => pool.query(text, params);
try {
  const schema = await fs.readFile(path.join(__dirname,'../db/schema.sql'),'utf8');
  await q(schema);
  const email = String(process.env.ADMIN_EMAIL).trim().toLowerCase();
  const name = String(process.env.ADMIN_NAME || 'Quản trị viên').trim().slice(0,80) || 'Quản trị viên';
  const hash = await bcrypt.hash(String(process.env.ADMIN_PASSWORD), 12);
  const old = await q('SELECT id, role FROM users WHERE email=$1', [email]);
  if (old.rowCount && old.rows[0].role !== 'admin') {
    // This explicit setup script may promote the configured ADMIN_EMAIL. The password is
    // reset to ADMIN_PASSWORD so that an earlier student registration cannot lock out setup.
    await q("UPDATE users SET role='admin', password_hash=$1, display_name=$2, is_active=TRUE WHERE id=$3", [hash,name,old.rows[0].id]);
    console.log(`Promoted configured account ${email} to admin and set its password from ADMIN_PASSWORD.`);
  } else if (old.rowCount) {
    console.log(`Schema ready. Admin ${email} already exists; password was not changed.`);
  } else {
    await q("INSERT INTO users(email,display_name,password_hash,role) VALUES($1,$2,$3,'admin')", [email,name,hash]);
    console.log(`Created admin ${email}. Keep its password private.`);
  }
  const admin = await q("SELECT id FROM users WHERE email=$1 LIMIT 1", [email]);
  const userId = admin.rows[0]?.id;
  const demos = [
    {slug:'toan-minh-hoa-01',title:'Toán học — Đề minh họa 01',subject:'toan',description:'Bộ câu hỏi mẫu do dự án tạo để kiểm tra luồng làm bài, không phải đề gốc DOL THPT.',duration:25,questions:[
      {prompt:'Với hàm số f(x) = 2x + 1, giá trị f(3) bằng bao nhiêu?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'5'},{id:'B',label:'B',text:'6'},{id:'C',label:'C',text:'7'},{id:'D',label:'D',text:'8'}],answer:['C'],explanation:'Thay x = 3: f(3) = 2·3 + 1 = 7.'},
      {prompt:'Nghiệm của phương trình x² = 9 là?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'x = 3'},{id:'B',label:'B',text:'x = −3'},{id:'C',label:'C',text:'x = ±3'},{id:'D',label:'D',text:'x = 9'}],answer:['C'],explanation:'Bình phương của cả 3 và −3 đều bằng 9.'},
      {prompt:'Tính đạo hàm của f(x) = x².',type:'short_answer',points:1,options:[],answer:[],accepted:['2x','2*x'],explanation:'Theo quy tắc lũy thừa, (x²)′ = 2x.'}
    ]},
    {slug:'ngu-van-minh-hoa-01',title:'Ngữ văn — Bài luyện đọc hiểu',subject:'ngu-van',description:'Câu hỏi minh họa ngắn để thử cách lưu đáp án và điểm số.',duration:20,questions:[
      {prompt:'Trong một bài nghị luận xã hội, luận điểm có vai trò chính là gì?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'Nêu ý kiến trung tâm cần làm sáng tỏ'},{id:'B',label:'B',text:'Thay thế toàn bộ dẫn chứng'},{id:'C',label:'C',text:'Chỉ dùng để kết bài'},{id:'D',label:'D',text:'Trang trí hình thức văn bản'}],answer:['A'],explanation:'Luận điểm là ý kiến, quan điểm chính của bài nghị luận.'},
      {prompt:'Nêu tên một thao tác lập luận thường gặp.',type:'short_answer',points:1,options:[],answer:[],accepted:['giải thích','chứng minh','phân tích','bình luận','so sánh','bác bỏ'],explanation:'Ví dụ: giải thích, phân tích, chứng minh, bình luận, so sánh hoặc bác bỏ.'}
    ]},
    {slug:'vat-ly-minh-hoa-01',title:'Vật lý — Kiểm tra kiến thức cơ bản',subject:'vat-ly',description:'Đề mẫu không đại diện cho ngân hàng câu hỏi chính thức.',duration:15,questions:[
      {prompt:'Đơn vị SI của cường độ dòng điện là gì?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'Vôn (V)'},{id:'B',label:'B',text:'Ampe (A)'},{id:'C',label:'C',text:'Ôm (Ω)'},{id:'D',label:'D',text:'Oát (W)'}],answer:['B'],explanation:'Cường độ dòng điện có đơn vị SI là ampe (A).'},
      {prompt:'Viết công thức định luật Ôm cho đoạn mạch chỉ có điện trở.',type:'short_answer',points:1,options:[],answer:[],accepted:['i=u/r','i = u/r','u=ir','u = i*r','i=u:r'],explanation:'Định luật Ôm: I = U/R, tương đương U = IR.'}
    ]},
    {slug:'hoa-hoc-minh-hoa-01',title:'Hóa học — Luyện tập nhanh',subject:'hoa-hoc',description:'Dữ liệu hư cấu có lời giải, dùng kiểm thử chức năng.',duration:15,questions:[
      {prompt:'Công thức hóa học của nước là gì?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'CO₂'},{id:'B',label:'B',text:'H₂O'},{id:'C',label:'C',text:'O₂'},{id:'D',label:'D',text:'NaCl'}],answer:['B'],explanation:'Một phân tử nước gồm hai nguyên tử hiđro và một nguyên tử oxi.'},
      {prompt:'Ở điều kiện thích hợp, axit tác dụng với bazơ thường tạo ra muối và gì?',type:'single_choice',points:1,options:[{id:'A',label:'A',text:'Oxi'},{id:'B',label:'B',text:'Hiđro'},{id:'C',label:'C',text:'Nước'},{id:'D',label:'D',text:'Kim loại'}],answer:['C'],explanation:'Phản ứng trung hòa: axit + bazơ → muối + nước.'}
    ]}
  ];
  for (const demo of demos) {
    const existing = await q('SELECT id FROM exams WHERE slug=$1 LIMIT 1',[demo.slug]);
    if (existing.rowCount) continue;
    const inserted = await q(`INSERT INTO exams(slug,title,subject,description,duration_minutes,is_published,is_sample,created_by)
      VALUES($1,$2,$3,$4,$5,TRUE,TRUE,$6) RETURNING id`,[demo.slug,demo.title,demo.subject,demo.description,demo.duration,userId]);
    for (let i=0;i<demo.questions.length;i++) {
      const item=demo.questions[i];
      await q(`INSERT INTO questions(exam_id,sort_order,prompt,question_type,points,options,answer_key,accepted_answers,explanation)
        VALUES($1,$2,$3,$4,$5,$6::jsonb,$7::jsonb,$8::jsonb,$9)`,[inserted.rows[0].id,i+1,item.prompt,item.type,item.points,JSON.stringify(item.options),JSON.stringify(item.answer),JSON.stringify(item.accepted||[]),item.explanation]);
    }
  }
  console.log('Database initialized. Added only clearly labelled sample exams if missing.');
} catch (e) {
  console.error('DB initialization failed:',e.message);
  process.exitCode=1;
} finally { await pool.end(); }
