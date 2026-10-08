 "use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");
  const [error,setError]=useState("");
  const [loading,setLoading]=useState(false);
  const router=useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res=await fetch("/api/auth/login",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email,password})});
      const data=await res.json();
      if(!res.ok) throw new Error(data.error||"Đăng nhập thất bại");
      router.push("/dashboard");
      router.refresh();
    } catch(err) {
      setError(err instanceof Error ? err.message : "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card card-pad" style={{ width:"min(420px,100%)", boxShadow:"var(--shadow-panel)" }}>
      <div className="kicker">Lớp Hóa Thầy Dương</div>
      <h1 className="h1" style={{marginTop:6}}>Đăng nhập</h1>
      <p className="muted" style={{marginTop:6}}>Bản rebuild Vercel-native.</p>
      <label style={{display:"block",marginTop:18,fontWeight:700,fontSize:13}}>Email</label>
      <input className="input" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" />
      <label style={{display:"block",marginTop:12,fontWeight:700,fontSize:13}}>Mật khẩu</label>
      <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" />
      {error && <div className="badge badge-red" style={{marginTop:12}}>{error}</div>}
      <button className="btn btn-primary" disabled={loading} style={{width:"100%",marginTop:16}}>
        {loading ? "Đang đăng nhập…" : "Đăng nhập"}
      </button>
    </form>
  );
}
