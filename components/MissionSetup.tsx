 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const cfg:any={
  basic:{label:"Cơ bản",desc:"Làm quen kiến thức",points:"Thiết lập lại theo config",gold:4},
  medium:{label:"Trung bình",desc:"Phân tích và liên kết",points:"Thiết lập lại theo config",gold:6},
  high_application:{label:"Siêu khó",desc:"Vận dụng cao · 5 câu",points:"TN 8 · Đ/S 15 · TLN 20 EXP",gold:8}
};

export default function MissionSetup(){
  const [chapter,setChapter]=useState("c12-1");
  const [difficulty,setDifficulty]=useState("high_application");
  const [loading,setLoading]=useState(false);
  const [error,setError]=useState("");
  const router=useRouter();

  async function start(){
    setLoading(true); setError("");
    try{
      const res=await fetch("/api/missions/start",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({chapter,difficulty})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Không bắt đầu được");
      router.push(`/luyen-nhiem-vu/${data.run.id}`);
    }catch(e){setError(e instanceof Error?e.message:"Không bắt đầu được");}
    finally{setLoading(false);}
  }

  return <>
    <div className="card card-pad">
      <div className="kicker">Luyện nhiệm vụ</div>
      <h1 className="h1" style={{marginTop:5}}>Chọn mức độ</h1>
      <p className="muted" style={{margin:"6px 0 16px"}}>5 câu mỗi lượt. Correct answer chỉ được chấm ở server khi nộp.</p>
      <div className="pill-tabs">
        <button className={`pill${chapter==="c12-1"?" active":""}`} onClick={()=>setChapter("c12-1")}>Chương 1 · Ester – Lipid</button>
        <button className={`pill${chapter==="c12-2"?" active":""}`} onClick={()=>setChapter("c12-2")}>Chương 2 · Carbohydrate</button>
      </div>
    </div>

    <div className="difficulty-grid section">
      {Object.entries(cfg).map(([key,c]:any)=>(
        <button key={key} className={`difficulty-card${key==="high_application"?" high":""}`} onClick={()=>setDifficulty(key)} style={{textAlign:"left",outline:difficulty===key?"2px solid color-mix(in srgb,var(--accent) 55%,transparent)":"none"}}>
          <div>
            <div className="difficulty-tag">{c.label}</div>
            <div className="h2" style={{marginTop:6}}>{c.desc}</div>
            <div className="muted" style={{fontSize:12,marginTop:6}}>{key==="high_application"?"5 câu / lượt · tối đa 30 câu đủ thưởng/ngày":"5 câu / lượt · reward config của rebuild"}</div>
          </div>
          <div>
            <div className="rewards">
              <span className="badge badge-blue">{c.points}</span>
              <span className="badge badge-gold">+{c.gold} vàng / câu đúng</span>
            </div>
            <div style={{marginTop:12,fontSize:12,fontWeight:800,color:difficulty===key?"var(--blue-700)":"var(--muted)"}}>
              {difficulty===key?"✓ Đang chọn":"Chọn mức này"}
            </div>
          </div>
        </button>
      ))}
    </div>

    {error && <div className="badge badge-red section">{error}</div>}
    <div className="section toolbar">
      <button className="btn btn-primary" onClick={start} disabled={loading}>{loading?"Đang tạo lượt…":"Bắt đầu nhiệm vụ"}</button>
      <span className="muted" style={{fontSize:12}}>Chapter: {chapter}</span>
    </div>
  </>;
}
