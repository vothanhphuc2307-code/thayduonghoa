import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { chapterLabel } from "@/lib/config";
import AppShell from "@/components/AppShell";

export default async function HistoryPage(){
  const user=await getCurrentUser(); if(!user) redirect("/login");
  const db=requireDb();
  const rows=await db`
    SELECT id,chapter,difficulty,total,correct_count,exp_reward,gold_reward,started_at,submitted_at,blur_count
    FROM mission_runs WHERE user_id=${user.id} ORDER BY id DESC LIMIT 100
  `;
  return <AppShell user={user} admin={user.role==="admin"}>
    <div className="kicker">Lịch sử</div>
    <h1 className="h1" style={{marginTop:4}}>Lịch sử luyện nhiệm vụ</h1>
    <div className="table-wrap section">
      <table className="table"><thead><tr><th>#</th><th>Chương</th><th>Mức</th><th>Kết quả</th><th>EXP</th><th>Vàng</th><th>Rời màn hình</th><th>Thời gian</th></tr></thead>
      <tbody>{rows.map((r:any)=><tr key={r.id}><td>{r.id}</td><td>{chapterLabel(r.chapter)}</td><td>{r.difficulty}</td><td>{r.correct_count}/{r.total}</td><td>+{r.exp_reward}</td><td>+{r.gold_reward}</td><td>{r.blur_count}</td><td>{r.submitted_at?new Date(r.submitted_at).toLocaleString("vi-VN"):"Đang làm"}</td></tr>)}</tbody></table>
    </div>
  </AppShell>;
}
