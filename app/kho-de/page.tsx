import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import AppShell from "@/components/AppShell";
import Link from "next/link";

export default async function QuestionBankPage({searchParams}:{searchParams:Promise<Record<string,string|undefined>>}){
  const user=await getCurrentUser(); if(!user) redirect("/login");
  const p=await searchParams;
  const q=p.q?.trim()??"", chapter=p.chapter?.trim()??"", difficulty=p.difficulty?.trim()??"", type=p.type?.trim()??"";
  const db=requireDb();
  const rows=await db`
    SELECT id,type,chapter,difficulty,title,prompt,options,true_false_items,explanation
    FROM questions
    WHERE published=true
      AND (${q}='' OR title ILIKE ${`%${q}%`} OR prompt ILIKE ${`%${q}%`})
      AND (${chapter}='' OR chapter=${chapter})
      AND (${difficulty}='' OR difficulty=${difficulty})
      AND (${type}='' OR type=${type})
    ORDER BY id DESC LIMIT 100
  `;
  return <AppShell user={user} admin={user.role==="admin"}>
    <div className="section-head"><div><div className="kicker">Kho đề</div><h1 className="h1" style={{marginTop:4}}>Ngân hàng câu hỏi</h1></div>{user.role==="admin"&&<Link href="/admin/questions" className="btn btn-accent">Quản trị kho đề</Link>}</div>
    <form className="card card-pad grid grid-2" style={{marginTop:14}} method="get">
      <input className="input" name="q" value={q} placeholder="Tìm câu hỏi…" />
      <select className="input" name="chapter" defaultValue={chapter}><option value="">Tất cả chương</option><option value="c12-1">Chương 1 · Ester – Lipid</option><option value="c12-2">Chương 2 · Carbohydrate</option></select>
      <select className="input" name="difficulty" defaultValue={difficulty}><option value="">Tất cả mức</option><option value="basic">Cơ bản</option><option value="medium">Trung bình</option><option value="high_application">Siêu khó</option></select>
      <select className="input" name="type" defaultValue={type}><option value="">Tất cả loại</option><option value="single">TN</option><option value="multiple">TNK</option><option value="true_false">Đ/S</option><option value="short_answer">TLN</option></select>
    </form>
    <div className="section" style={{display:"grid",gap:10}}>
      {rows.map((r:any)=><div className="card card-pad" key={r.id}>
        <div className="toolbar"><span className="badge badge-blue">#{r.id}</span><span className="badge badge-gold">{r.difficulty}</span><span className="badge badge-green">{r.type}</span></div>
        <div className="card-title" style={{marginTop:10}}>{r.title}</div>
        <div className="question-prompt" style={{fontSize:15,margin:"8px 0 0"}}>{r.prompt}</div>
      </div>)}
      {rows.length===0&&<div className="card card-pad muted">Không có câu phù hợp.</div>}
    </div>
  </AppShell>;
}
