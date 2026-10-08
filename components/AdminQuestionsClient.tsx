 "use client";

import { useEffect, useState } from "react";

type Row={id?:number,type:string,chapter:string,difficulty:string,title:string,prompt:string,options:any[],true_false_items:any[],correct_options:any[],correct_true_false:Record<string,boolean>,accepted_texts:string[],explanation:string,published:boolean};

const empty:Row={type:"single",chapter:"c12-1",difficulty:"high_application",title:"",prompt:"",options:[{id:"A",label:"A",text:""},{id:"B",label:"B",text:""},{id:"C",label:"C",text:""},{id:"D",label:"D",text:""}],true_false_items:[],correct_options:["A"],correct_true_false:{},accepted_texts:[],explanation:"",published:true};

export default function AdminQuestionsClient(){
  const [rows,setRows]=useState<Row[]>([]);
  const [form,setForm]=useState<Row>({...empty});
  const [editing,setEditing]=useState<number|null>(null);
  const [q,setQ]=useState("");
  const [status,setStatus]=useState("");

  async function load(){
    const res=await fetch("/api/admin/questions",{cache:"no-store"});
    const data=await res.json(); if(res.ok) setRows(data.questions);
  }
  useEffect(()=>{load();},[]);

  async function save(){
    setStatus("");
    const res=await fetch("/api/admin/questions",{method:editing?"PATCH":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(editing?{...form,id:editing}:form)});
    const data=await res.json();
    if(!res.ok){setStatus(data.error||"Lỗi");return;}
    setStatus(editing?"Đã cập nhật":"Đã tạo");
    setEditing(null); setForm({...empty}); load();
  }
  async function remove(id:number){
    if(!confirm(`Xóa câu #${id}?`)) return;
    const res=await fetch(`/api/admin/questions?id=${id}`,{method:"DELETE"});
    const data=await res.json(); setStatus(res.ok?"Đã xóa":(data.error||"Lỗi")); load();
  }
  async function exportJson(){
    const res=await fetch("/api/admin/questions/export"); const blob=await res.blob();
    const url=URL.createObjectURL(blob); const a=document.createElement("a"); a.href=url; a.download="tdh-question-bank.json"; a.click(); URL.revokeObjectURL(url);
  }
  async function importJson(file:File){
    const text=await file.text();
    try{
      const parsed=JSON.parse(text);
      const res=await fetch("/api/admin/questions/import",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(parsed)});
      const data=await res.json(); setStatus(res.ok?`Đã import ${data.count} câu`:data.error||"Import lỗi"); load();
    }catch(e){setStatus("JSON không hợp lệ");}
  }
  const filtered=rows.filter(r=>(`${r.id} ${r.title} ${r.prompt}`).toLowerCase().includes(q.toLowerCase()));
  function addOption(){ setForm(f=>({...f,options:[...f.options,{id:String.fromCharCode(65+f.options.length),label:String.fromCharCode(65+f.options.length),text:""}]})); }
  function addStatement(){ setForm(f=>({...f,true_false_items:[...f.true_false_items,{id:`s${f.true_false_items.length+1}`,text:""}]})); }

  return <>
    <div className="card card-pad">
      <div className="section-head"><div><div className="kicker">Admin</div><h1 className="h1" style={{marginTop:4}}>Quản lý kho đề</h1></div><div className="toolbar"><button className="btn" onClick={exportJson}>Export JSON</button><label className="btn">Import JSON<input type="file" accept=".json,application/json" hidden onChange={e=>{const f=e.target.files?.[0];if(f)importJson(f)}} /></label></div></div>
      {status&&<div className="badge badge-blue" style={{marginTop:10}}>{status}</div>}
    </div>

    <div className="grid grid-main section">
      <div className="card card-pad">
        <div className="section-head"><h2 className="h2">{editing?`Sửa câu #${editing}`:"Thêm câu hỏi"}</h2><button className="btn" onClick={()=>{setEditing(null);setForm({...empty})}}>Mới</button></div>
        <div className="grid grid-2">
          <select className="input" value={form.type} onChange={e=>setForm({...form,type:e.target.value})}><option value="single">TN</option><option value="multiple">TNK</option><option value="true_false">Đ/S</option><option value="short_answer">TLN</option></select>
          <select className="input" value={form.difficulty} onChange={e=>setForm({...form,difficulty:e.target.value})}><option value="basic">Cơ bản</option><option value="medium">Trung bình</option><option value="high_application">Siêu khó</option></select>
          <input className="input" value={form.chapter} onChange={e=>setForm({...form,chapter:e.target.value})} placeholder="chapter" />
          <input className="input" value={form.title} onChange={e=>setForm({...form,title:e.target.value})} placeholder="Tiêu đề câu" />
        </div>
        <textarea className="input" rows={5} style={{marginTop:8}} value={form.prompt} onChange={e=>setForm({...form,prompt:e.target.value})} placeholder="Nội dung câu hỏi" />
        {(form.type==="single" || form.type==="multiple") && <div style={{marginTop:10}}>
          <div className="kicker">Options</div>
          {form.options.map((o:any,i:number)=><div key={i} className="grid" style={{gridTemplateColumns:"70px 1fr",marginTop:6}}><input className="input" value={o.label} onChange={e=>{const a=[...form.options];a[i]={...o,label:e.target.value};setForm({...form,options:a})}}/><input className="input" value={o.text} onChange={e=>{const a=[...form.options];a[i]={...o,text:e.target.value};setForm({...form,options:a})}}/></div>)}
          <button className="btn" style={{marginTop:8}} type="button" onClick={addOption}>+ Thêm lựa chọn</button>
          <input className="input" style={{marginTop:6}} value={form.correct_options.join(",")} onChange={e=>setForm({...form,correct_options:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} placeholder="correct_options: A,B" />
        </div>}
        {form.type==="true_false" && <div style={{marginTop:10}}>
          <div className="kicker">Statements</div>
          {form.true_false_items.map((o:any,i:number)=><div key={i} className="grid" style={{gridTemplateColumns:"100px 1fr",marginTop:6}}><input className="input" value={o.id} onChange={e=>{const a=[...form.true_false_items];a[i]={...o,id:e.target.value};setForm({...form,true_false_items:a})}}/><input className="input" value={o.text} onChange={e=>{const a=[...form.true_false_items];a[i]={...o,text:e.target.value};setForm({...form,true_false_items:a})}}/></div>)}
          <button className="btn" style={{marginTop:8}} type="button" onClick={addStatement}>+ Thêm phát biểu</button>
          <textarea className="input" style={{marginTop:6}} rows={3} value={JSON.stringify(form.correct_true_false)} onChange={e=>{try{setForm({...form,correct_true_false:JSON.parse(e.target.value)})}catch{}}} placeholder='{"s1":true,"s2":false}' />
        </div>}
        {form.type==="short_answer" && <input className="input" style={{marginTop:10}} value={form.accepted_texts.join(", ")} onChange={e=>setForm({...form,accepted_texts:e.target.value.split(",").map(s=>s.trim()).filter(Boolean)})} placeholder="accepted_texts, ngăn cách bằng dấu phẩy" />}
        <textarea className="input" rows={4} style={{marginTop:10}} value={form.explanation} onChange={e=>setForm({...form,explanation:e.target.value})} placeholder="Giải thích sau submit" />
        <div className="toolbar" style={{marginTop:10}}><button className="btn btn-primary" onClick={save}>Lưu</button><span className="muted" style={{fontSize:12}}>Correct answer chỉ lưu server-side.</span></div>
      </div>

      <div className="card card-pad">
        <div className="section-head"><h2 className="h2">Danh sách</h2><input className="input" style={{maxWidth:220}} value={q} onChange={e=>setQ(e.target.value)} placeholder="Lọc nhanh…" /></div>
        <div className="table-wrap"><table className="table"><thead><tr><th>#</th><th>Câu</th><th>Mức</th><th>Loại</th><th></th></tr></thead>
        <tbody>{filtered.map(r=><tr key={r.id}><td>{r.id}</td><td><b>{r.title}</b><div className="muted">{r.prompt.slice(0,100)}</div></td><td>{r.difficulty}</td><td>{r.type}</td><td><div className="toolbar"><button className="btn" onClick={()=>{setEditing(r.id!);setForm(r)}}>Sửa</button><button className="btn btn-danger" onClick={()=>remove(r.id!)}>Xóa</button></div></td></tr>)}</tbody></table></div>
      </div>
    </div>
  </>;
}
