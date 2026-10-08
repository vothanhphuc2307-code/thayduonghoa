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
    <section className="section">
      <div className="muted" style={{fontSize:12}}>Kho demo đã seed · 35 câu mẫu để kiểm thử luồng. Bộ lớn hơn sẽ import qua Admin.</div>
    </section>
  </AppShell>;
}
