'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';

const labels = {toan:'Toán học','ngu-van':'Ngữ văn','vat-ly':'Vật lý','hoa-hoc':'Hóa học','lich-su':'Lịch sử','dia-ly':'Địa lý','sinh-hoc':'Sinh học','tieng-anh':'Tiếng Anh'};
export default function ExamsClient() {
 const [exams,setExams]=useState([]); const [subject,setSubject]=useState(''); const [loading,setLoading]=useState(true); const [error,setError]=useState('');
 useEffect(()=>{ const initial = new URLSearchParams(window.location.search).get('mon'); if(initial && Object.prototype.hasOwnProperty.call(labels, initial)) setSubject(initial); },[]);
 useEffect(()=>{ let active=true; setLoading(true); fetch('/api/exams'+(subject?'?subject='+encodeURIComponent(subject):''),{cache:'no-store'}).then(async r=>{const d=await r.json(); if(!r.ok)throw new Error(d.error||'Không tải được kho đề.'); return d;}).then(d=>{if(active){setExams(d.exams||[]);setError('');}}).catch(e=>{if(active)setError(e.message);}).finally(()=>{if(active)setLoading(false);}); return ()=>{active=false}; },[subject]);
 return <><div className="filter-row"><label className="filter-label">Môn học<select value={subject} onChange={e=>setSubject(e.target.value)}><option value="">Tất cả môn</option>{Object.entries(labels).map(([k,v])=><option key={k} value={k}>{v}</option>)}</select></label><span className="count-label">{loading?'Đang tải…':`${exams.length} đề thi`}</span></div>
 {error && <div className="alert alert-warning"><strong>Chưa kết nối kho đề.</strong><br/>{error}<p>Trên máy chủ mới cần cấu hình DATABASE_URL và chạy bước khởi tạo database; không có dữ liệu DOL gốc được tự tạo.</p></div>}
 {!loading && !error && exams.length===0 && <div className="empty-state"><span>✳</span><h3>Chưa có đề được xuất bản</h3><p>Thiết lập database và thêm đề từ khu vực quản trị. Đề mẫu chỉ xuất hiện sau khi chạy bước khởi tạo.</p><Link href="/dang-nhap" className="button button-primary">Đăng nhập quản trị</Link></div>}
 <div className="exam-grid">{exams.map((exam,i)=><article className="exam-card" key={exam.id}><div className="exam-card-top"><span className={`subject-pill color-${i%5}`}>{labels[exam.subject]||exam.subject}</span>{exam.is_sample && <span className="sample-pill">Đề minh họa</span>}</div><h3>{exam.title}</h3><p>{exam.description||'Luyện tập và xem kết quả sau khi nộp bài.'}</p><div className="exam-meta"><span>◷ {exam.duration_minutes} phút</span><span>▤ {exam.question_count} câu</span></div><Link href={`/lam-bai/${exam.slug}`} className="button button-outline button-full">Vào làm bài <span>→</span></Link></article>)}</div></>;
}
