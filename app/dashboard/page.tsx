import { redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { levelFromExp, chapterLabel } from "@/lib/config";
import AppShell from "@/components/AppShell";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const db = requireDb();
  const { level, inLevelExp, nextThreshold } = levelFromExp(user.exp);
  const percent = Math.min(100, Math.round((inLevelExp / nextThreshold) * 100));
  const [classRow] = await db`
    SELECT c.id,c.code,c.name FROM class_members cm JOIN classes c ON c.id=cm.class_id
    WHERE cm.user_id=${user.id} ORDER BY c.id LIMIT 1
  `;
  const leaderboard = await db`SELECT id,name,level,exp,gold FROM users ORDER BY exp DESC,id ASC LIMIT 3`;
  const runs = await db`
    SELECT id,difficulty,chapter,total,correct_count,exp_reward,gold_reward,submitted_at
    FROM mission_runs WHERE user_id=${user.id} ORDER BY id DESC LIMIT 5
  `;
  const missionTotal = await db`
    SELECT COALESCE(SUM(total),0) AS n FROM mission_runs
    WHERE user_id=${user.id} AND difficulty='high_application'
      AND submitted_at IS NOT NULL
      AND (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
  `;

  return <AppShell user={user} admin={user.role === "admin"}>
    <section className="hero">
      <div className="hero-grid">
        <div className="hero-primary">
          <div className="eyebrow">Cả năm học 2026–2027</div>
          <div className="hero-name">Chào em {user.name}</div>
          <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:9}}>
            <span className="badge badge-gold">Bậc Đồng</span>
            <span className="badge badge-blue">Sức mạnh {user.exp}</span>
            <span className="badge badge-green">Chuỗi học 1 ngày</span>
          </div>
          <div style={{marginTop:17}}>
            <div style={{display:"flex",justifyContent:"space-between",fontSize:11,color:"#d6bea5"}}>
              <span>Cấp {level}</span><span>{inLevelExp} / {nextThreshold} EXP</span>
            </div>
            <div className="progress" style={{marginTop:5}}><span style={{width:`${percent}%`}} /></div>
            <div style={{fontSize:10,color:"#bba58d",marginTop:5}}>còn {Math.max(0,nextThreshold-inLevelExp)} EXP → cấp {level+1}</div>
          </div>
        </div>
        <div className="hero-rewards">
          <div className="reward-box"><b>HP</b><span>Bài học · +0% EXP</span></div>
          <div className="reward-box" style={{marginTop:8}}><b>MP</b><span>Kiểm tra · +0% quà</span></div>
          <div className="reward-box" style={{marginTop:8}}><b>DAME</b><span>Luyện đề · +0% vàng</span></div>
          <div className="reward-strip">
            <div className="reward-box"><b>◇ {user.diamonds}</b><span>kim cương</span></div>
            <div className="reward-box"><b>● {user.gold}</b><span>vàng</span></div>
            <div className="reward-box"><b>★ {user.exp}</b><span>EXP</span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="grid grid-3 section">
      <div className="card stat-card"><div className="kicker">Cấp</div><div className="stat-value">{level}</div><div className="stat-meta">Bậc Đồng · {user.exp} EXP</div></div>
      <div className="card stat-card"><div className="kicker">Vàng</div><div className="stat-value">{user.gold.toLocaleString("vi-VN")}</div><div className="stat-meta">Dùng để đổi trang phục</div></div>
      <div className="card stat-card"><div className="kicker">Kim cương</div><div className="stat-value">{user.diamonds}</div><div className="stat-meta">Kho báu / cửa hàng</div></div>
    </section>

    <section className="grid grid-main section">
      <div>
        <div className="card card-pad">
          <div className="section-head">
            <div><h2 className="h2">Nhiệm vụ</h2><div className="muted" style={{fontSize:11}}>Cày vàng mua trang phục</div></div>
            <Link href="/luyen-nhiem-vu" className="btn btn-accent">Luyện nhiệm vụ</Link>
          </div>
          <div className="task"><div><div className="task-title">Xem 1 video bài giảng</div><div className="task-sub">+5 vàng · +10 EXP</div></div><span className="badge badge-gold">Làm ›</span></div>
          <div className="task"><div><div className="task-title">Làm 1 lượt luyện nhiệm vụ</div><div className="task-sub">+5 vàng · +10 EXP</div></div><Link className="badge badge-gold" href="/luyen-nhiem-vu">Làm ›</Link></div>
          <div className="task"><div><div className="task-title">Ôn 5 câu đến hạn</div><div className="task-sub">+5 vàng · +10 EXP</div></div><span className="badge badge-gold">0/5</span></div>
          <div className="task"><div><div className="task-title">Làm đúng 8 câu hôm nay</div><div className="task-sub">+5 vàng · +10 EXP</div></div><span className="badge badge-green">Hôm nay</span></div>
          <div style={{marginTop:10,paddingTop:10,borderTop:"1px solid #ffffff0b",fontSize:11,color:"var(--muted)"}}>Vận dụng cao hôm nay: <b>{Number(missionTotal[0]?.n ?? 0)}/30</b> câu đủ thưởng</div>
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Lịch của em</h2><div className="muted" style={{fontSize:11}}>05/10 – 11/10</div></div><span className="muted" style={{fontSize:11}}>Cả tháng ›</span></div>
          <div className="calendar">{["T2","T3","T4","T5","T6","T7","CN"].map((d,i)=><div key={d} className={`day${i===1?" today":""}`}><small>{d}</small><strong>{5+i}</strong></div>)}</div>
          <div style={{paddingTop:11,color:"var(--muted)",fontSize:12}}>Bữa học tiếp theo · Chương 1 · Ester – Lipid</div>
        </div>
      </div>

      <div>
        <div className="card card-pad">
          <div className="section-head"><div><h2 className="h2">Lớp học của em</h2><div className="muted" style={{fontSize:11}}>Đang học</div></div><span className="badge badge-gold">{classRow?.code ?? "LUX2K9"}</span></div>
          <div style={{padding:12,borderRadius:10,border:"1px solid var(--border-normal)",background:"linear-gradient(160deg,var(--accent-soft),var(--panel-bg))"}}>
            <div className="kicker">Lớp</div>
            <div className="card-title" style={{marginTop:2}}>{classRow?.name ?? "HOÁ 12 TTV"}</div>
            <div className="muted" style={{fontSize:11,marginTop:3}}>Học sinh · Xem lịch · Xem bài giao</div>
          </div>
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Bảng vàng toàn trường</h2><div className="muted" style={{fontSize:11}}>EXP tuần này</div></div></div>
          {leaderboard.map((r:any,i:number)=><div key={r.id} className="rank-row"><div className="rank-no">#{i+1}</div><div><div className="task-title">{r.name}</div><div className="task-sub">Cấp {r.level}</div></div><span className="badge badge-gold">+{r.exp} EXP</span></div>)}
        </div>

        <div className="card card-pad section">
          <div className="section-head"><div><h2 className="h2">Lượt gần đây</h2></div><Link href="/lich-su" className="muted" style={{fontSize:11,fontWeight:800}}>Xem lịch sử ›</Link></div>
          {runs.length===0 && <div className="muted">Chưa có lượt nào.</div>}
          {runs.map((r:any)=><div key={r.id} className="rank-row"><div className="rank-no">#{r.id}</div><div><div className="task-title">{r.correct_count}/{r.total} · {r.difficulty}</div><div className="task-sub">{chapterLabel(r.chapter)}</div></div><span className="badge badge-green">+{r.exp_reward} EXP</span></div>)}
        </div>
      </div>
    </section>
  </AppShell>;
}
