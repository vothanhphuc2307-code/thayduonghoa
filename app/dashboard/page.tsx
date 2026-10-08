import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { levelFromExp, chapterLabel } from "@/lib/config";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  const db=requireDb();
  const { level,inLevelExp,nextThreshold }=levelFromExp(user.exp);
  const percent=Math.min(100,Math.round(inLevelExp/nextThreshold*100));
  const [classRow]=await db`
    SELECT c.id,c.code,c.name FROM class_members cm JOIN classes c ON c.id=cm.class_id
    WHERE cm.user_id=${user.id} ORDER BY c.id LIMIT 1
  `;
  const leaderboard=await db`SELECT id,name,level,exp,gold FROM users ORDER BY exp DESC,id ASC LIMIT 3`;
  const runs=await db`
    SELECT id,difficulty,chapter,total,correct_count,exp_reward,gold_reward,submitted_at
    FROM mission_runs WHERE user_id=${user.id} ORDER BY id DESC LIMIT 4
  `;
  const missionTotal=await db`
    SELECT COALESCE(SUM(total),0) AS n FROM mission_runs
    WHERE user_id=${user.id} AND difficulty='high_application'
      AND submitted_at IS NOT NULL
      AND (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;

  return <AppShell user={user} admin={user.role==="admin"}>
    <section className="hero">
      <div className="hero-grid">
        <div>
          <div className="eyebrow">Cả năm học · 2026–2027</div>
          <div className="hero-name">Chào em {user.name}</div>
          <div style={{display:"flex",gap:8,flexWrap:"wrap",marginTop:8}}>
            <span className="badge badge-gold">Bậc Đồng</span>
            <span className="badge badge-blue">Sức mạnh {user.exp}</span>
            <span className="badge badge-green">Chuyên cần 0% · Chuỗi 1 ngày</span>
          </div>
        </div>
        <div style={{minWidth:190}}>
          <div className="kicker" style={{color:"#cfe0e9"}}>Cấp</div>
          <div className="hero-stat">{level}</div>
          <div style={{fontSize:12,color:"#d6e0e7"}}>{inLevelExp} / {nextThreshold} EXP</div>
          <div className="progress" style={{marginTop:7}}><span style={{width:`${percent}%`}}/></div>
          <div style={{fontSize:11,color:"#b8c9d3",marginTop:5}}>còn {Math.max(0,nextThreshold-inLevelExp)} EXP → cấp {level+1}</div>
        </div>
      </div>
    </section>

    <section className="grid grid-3 section">
      <div className="card stat-card"><div className="kicker">EXP</div><div className="stat-value">{user.exp}</div><div className="stat-meta">Điểm kinh nghiệm</div></div>
      <div className="card stat-card"><div className="kicker">Vàng</div><div className="stat-value">{user.gold}</div><div className="stat-meta">Hôm nay +{runs[0]?.gold_reward ?? 0}</div></div>
      <div className="card stat-card"><div className="kicker">Kim cương</div><div className="stat-value">{user.diamonds}</div><div className="stat-meta">Tuần này +0</div></div>
    </section>

    <section className="grid grid-main section">
      <div>
        <div className="card card-pad">
          <div className="section-head"><div><h2 className="h2">Nhiệm vụ</h2><div className="muted" style={{fontSize:12}}>Cày vàng mua trang phục</div></div><Link href="/luyen-nhiem-vu" className="btn btn-accent">Luyện nhiệm vụ</Link></div>
          <div className="task"><div className="task-main"><div className="task-title">Luyện 5 câu đến hạn</div><div className="task-sub">+5 vàng · +10 EXP</div></div><Link className="btn btn-ghost" href="/luyen-nhiem-vu">Làm ›</Link></div>
          <div className="task"><div className="task-main"><div className="task-title">Làm đúng 8 câu hôm nay</div><div className="task-sub">+5 vàng · +10 EXP</div></div><Link className="btn btn-ghost" href="/luyen-nhiem-vu">Làm ›</Link></div>
          <div className="task"><div className="task-main"><div className="task-title">Làm 1 lượt luyện nhiệm vụ · xong</div><div className="task-sub">+5 vàng · +10 EXP</div></div><span className="badge badge-green">✓ Đã nhận</span></div>
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid var(--border-normal)",fontSize:12,color:"var(--muted)"}}>Vận dụng cao hôm nay: <b>{missionTotal[0]?.n ?? 0}/30</b> câu đủ thưởng</div>
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Lịch của em</h2><div className="muted" style={{fontSize:12}}>05/10 – 11/10</div></div><span className="muted" style={{fontSize:12}}>Cả tháng ›</span></div>
          <div className="calendar">
            {["T2","T3","T4","T5","T6","T7","CN"].map((d,i)=><div key={d} className="day"><small>{d}</small><strong>{5+i}</strong></div>)}
          </div>
          <div style={{paddingTop:12,color:"var(--muted)",fontSize:13}}>Hôm nay trống lịch.</div>
        </div>
      </div>

      <div>
        <div className="card card-pad">
          <div className="section-head"><div><h2 className="h2">Lớp học của em</h2><div className="muted" style={{fontSize:12}}>Đang học</div></div><span className="badge badge-blue">{classRow?.code ?? "DEMO"}</span></div>
          <div className="card" style={{padding:12,background:"var(--accent-soft)",boxShadow:"none"}}>
            <div className="kicker">Lớp</div>
            <div className="card-title" style={{marginTop:2}}>{classRow?.name ?? "HOÁ 12 TTV"}</div>
            <div className="muted" style={{fontSize:12,marginTop:4}}>Em: hạng 5 · {user.exp} EXP</div>
          </div>
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Bảng xếp hạng</h2><div className="muted" style={{fontSize:12}}>EXP tổng</div></div></div>
          {leaderboard.map((r:any,i:number)=><div key={r.id} className="rank-row"><div className="rank-no">{i+1}</div><div><div className="task-title">{r.name}</div><div className="task-sub">Cấp {r.level}</div></div><span className="badge badge-gold">+{r.exp} EXP</span></div>)}
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Lượt gần đây</h2></div><Link href="/lich-su" className="muted" style={{fontSize:12,fontWeight:800}}>Xem lịch sử ›</Link></div>
          {runs.length===0 && <div className="muted">Chưa có lượt nào.</div>}
          {runs.map((r:any)=><div key={r.id} className="rank-row"><div className="rank-no">#{r.id}</div><div><div className="task-title">{r.correct_count}/{r.total} · {r.difficulty}</div><div className="task-sub">{chapterLabel(r.chapter)}</div></div><span className="badge badge-green">+{r.exp_reward} EXP</span></div>)}
        </div>
      </div>
    </section>
  </AppShell>;
}
