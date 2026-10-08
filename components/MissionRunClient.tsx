 "use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { AnswerPayload, AnswersPayload, PublicQuestion } from "@/lib/types";

type Run={id:number,difficulty:string,level:string,scope_label:string,total:number,started_at:string,last_seen_at:string,blur_count:number,submitted_at:string|null,correct_count:number,exp_reward:number,gold_reward:number,questions:PublicQuestion[],result:any};

export default function MissionRunClient({id}:{id:number}){
  const [run,setRun]=useState<Run|null>(null);
  const [answers,setAnswers]=useState<AnswersPayload>({});
  const [error,setError]=useState("");
  const [submitting,setSubmitting]=useState(false);
  const [result,setResult]=useState<any>(null);
  const [elapsed,setElapsed]=useState(0);
  const router=useRouter();

  const load=useCallback(async()=>{
    const res=await fetch(`/api/missions/${id}`,{cache:"no-store"});
    const data=await res.json();
    if(!res.ok) throw new Error(data.error||"Không tải được lượt");
    setRun(data.run);
    if(data.run.result) setResult(data.run.result);
  },[id]);

  useEffect(()=>{load().catch(e=>setError(e.message));},[load]);

  useEffect(()=>{
    if(!run || run.submitted_at) return;
    const started=new Date(run.started_at).getTime();
    const timer=setInterval(()=>setElapsed(Math.max(0,Math.floor((Date.now()-started)/1000))),1000);
    const pulse=setInterval(()=>{fetch(`/luyen-nhiem-vu/${id}/nhip`,{method:"POST"}).catch(()=>{});},15000);
    const onVis=()=>{if(document.hidden) fetch(`/luyen-nhiem-vu/${id}/roi-man-hinh`,{method:"POST"}).catch(()=>{});};
    document.addEventListener("visibilitychange",onVis);
    return()=>{clearInterval(timer);clearInterval(pulse);document.removeEventListener("visibilitychange",onVis);};
  },[run,id]);

  function setAnswer(q:PublicQuestion,a:AnswerPayload){
    setAnswers(prev=>({...prev,[String(q.id)]:{...prev[String(q.id)],...a}}));
  }
  function toggleMultiple(q:PublicQuestion,opt:string){
    const current=answers[String(q.id)]?.selected_options??[];
    const next=current.includes(opt)?current.filter(x=>x!==opt):[...current,opt];
    setAnswer(q,{selected_options:next});
  }
  function setTF(q:PublicQuestion,statementId:string,value:boolean){
    setAnswer(q,{true_false_answers:{...(answers[String(q.id)]?.true_false_answers??{}),[statementId]:value}});
  }

  async function submit(){
    if(!run || submitting || run.submitted_at) return;
    setSubmitting(true); setError("");
    try{
      const res=await fetch(`/luyen-nhiem-vu/${id}/nop`,{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({answers})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Nộp bài lỗi");
      setResult(data);
      setRun(prev=>prev?({...prev,submitted_at:new Date().toISOString(),correct_count:data.score.correct,exp_reward:data.reward.exp,gold_reward:data.reward.gold}):prev);
    }catch(e){setError(e instanceof Error?e.message:"Nộp bài lỗi");}
    finally{setSubmitting(false);}
  }

  const mm=String(Math.floor(elapsed/60)).padStart(2,"0"), ss=String(elapsed%60).padStart(2,"0");

  if(!run) return <div className="card card-pad">{error? <span className="badge badge-red">{error}</span>:"Đang tải lượt…"}</div>;

  return <>
    <div className="card card-pad" style={{position:"sticky",top:80,zIndex:20}}>
      <div className="section-head" style={{marginBottom:0}}>
        <div><div className="kicker">{run.level}</div><div className="card-title">{run.scope_label}</div><div className="muted" style={{fontSize:12}}>{run.total} câu · thời gian {mm}:{ss}</div></div>
        <div className="toolbar">
          <span className="badge badge-blue">{run.submitted_at?`Điểm ${run.correct_count}/${run.total}`:`Đang làm ${Object.keys(answers).length}/${run.total}`}</span>
          {run.submitted_at && <button className="btn" onClick={()=>router.push("/luyen-nhiem-vu")}>Lượt mới</button>}
        </div>
      </div>
    </div>

    <div className="section" style={{display:"grid",gap:12}}>
      {run.questions.map((q,i)=>{
        const a=answers[String(q.id)]??{};
        const details=result?.details?.find((d:any)=>Number(d.questionId)===q.id);
        return <div className="card question-card" key={q.id}>
          <div className="question-meta">
            <span className="question-number">Câu {i+1} · {q.type==="single"?"TN":q.type==="multiple"?"TNK":q.type==="true_false"?"Đ/S":"TLN"}</span>
            {details && <span className={`badge ${details.correct?"badge-green":"badge-red"}`}>{details.correct?"Đúng":"Sai"} · +{details.exp} EXP</span>}
          </div>
          <div className="question-prompt">{q.title?`${q.title}\n`:""}{q.prompt}</div>

          {(q.type==="single" || q.type==="multiple") && <div>
            {q.options.map(opt=><label key={opt.id} className={`choice ${(a.selected_options??[]).includes(opt.id)?"selected":""}`}>
              <input type={q.type==="single"?"radio":"checkbox"} name={`q-${q.id}`} checked={(a.selected_options??[]).includes(opt.id)} onChange={()=>q.type==="single"?setAnswer(q,{selected_options:[opt.id]}):toggleMultiple(q,opt.id)} disabled={Boolean(run.submitted_at)} />
              <div><b>{opt.label}.</b> {opt.text}</div>
            </label>)}
          </div>}

          {q.type==="true_false" && <div>
            {q.true_false_items.map(s=><div className="tf-row" key={s.id}>
              <div>{s.text}</div>
              <button disabled={Boolean(run.submitted_at)} className={`tf-btn${a.true_false_answers?.[s.id]===true?" selected":""}`} onClick={()=>setTF(q,s.id,true)}>Đúng</button>
              <button disabled={Boolean(run.submitted_at)} className={`tf-btn${a.true_false_answers?.[s.id]===false?" selected":""}`} onClick={()=>setTF(q,s.id,false)}>Sai</button>
            </div>)}
          </div>}

          {q.type==="short_answer" && <input className="input" disabled={Boolean(run.submitted_at)} placeholder="Nhập câu trả lời…" value={a.text_answer??""} onChange={e=>setAnswer(q,{text_answer:e.target.value})} />}

          {details && <div style={{marginTop:12,padding:12,borderRadius:8,background:"var(--accent-soft)",fontSize:13}}>
            <b>Giải thích:</b> {details.explanation || "Chưa có giải thích."}
          </div>}
        </div>;
      })}
    </div>

    {error && <div className="badge badge-red section">{error}</div>}

    {!run.submitted_at && <div className="section" style={{display:"flex",justifyContent:"flex-end"}}>
      <button className="btn btn-primary" onClick={submit} disabled={submitting}>{submitting?"Đang chấm…":"Nộp bài"}</button>
    </div>}

    {result && run.submitted_at && (
      <div className="card card-pad section" style={{background:"var(--deep)",color:"#fff"}}>
        <div className="kicker" style={{color:"#c9dbe5"}}>KẾT QUẢ</div>
        <div style={{fontSize:28,fontWeight:800,marginTop:3}}>{result.score?.correct ?? run.correct_count}/{run.total} đúng</div>
        <div className="toolbar" style={{marginTop:8}}>
          <span className="badge badge-green">+{result.reward?.exp ?? run.exp_reward} EXP</span>
          <span className="badge badge-gold">+{result.reward?.gold ?? run.gold_reward} vàng</span>
        </div>
      </div>
    )}
  </>;
}
