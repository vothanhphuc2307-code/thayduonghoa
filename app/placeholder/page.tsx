import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";

export default async function PlaceholderPage({searchParams}:{searchParams:Promise<{name?:string}>}){
  const user=await getCurrentUser(); if(!user) redirect("/login");
  const p=await searchParams; const name=p.name||"Tính năng";
  return <AppShell user={user} admin={user.role==="admin"}>
    <div className="card card-pad">
      <div className="kicker">Module</div>
      <h1 className="h1" style={{marginTop:4}}>{name}</h1>
      <p className="muted">Module này đã có slot trong shell. Contract/backend gốc của phần này chưa được xác định đầy đủ nên bản rebuild chưa giả vờ triển khai nó.</p>
      <div className="badge badge-blue" style={{marginTop:12}}>Chưa xác định từ browser</div>
    </div>
  </AppShell>;
}
