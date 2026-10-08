import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import AppShell from "@/components/AppShell";
import MissionSetup from "@/components/MissionSetup";

export default async function MissionPage(){
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  const db=requireDb();
  const [today]=await db`
    SELECT COALESCE(SUM(total),0) AS n FROM mission_runs
    WHERE user_id=${user.id} AND difficulty='high_application' AND submitted_at IS NOT NULL
      AND (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;
  return <AppShell user={user} admin={user.role==="admin"}>
    <MissionSetup/>
    <section className="card card-pad section">
      <div className="section-head"><div><h2 className="h2">Siêu khó</h2><div className="muted" style={{fontSize:12}}>Vận dụng cao · 5 câu</div></div><span className="badge badge-gold">+8 vàng / câu đúng</span></div>
      <div className="muted" style={{fontSize:13}}>Mỗi câu đúng: TN 8 · Đ/S 15 · TLN 20 EXP. Cả lượt: 40–100 EXP · tối đa 40 vàng.</div>
      <div style={{marginTop:8,fontSize:13,fontWeight:800}}>Câu Vận dụng cao hôm nay: {Number(today?.n??0)}/30 đủ thưởng</div>
    </section>
  </AppShell>;
}
