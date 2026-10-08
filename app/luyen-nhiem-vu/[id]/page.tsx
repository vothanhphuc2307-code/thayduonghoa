import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import MissionRunClient from "@/components/MissionRunClient";
import { toId } from "@/lib/utils";

export default async function MissionRunPage({params}:{params:Promise<{id:string}>}){
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  const id=toId((await params).id);
  return <AppShell user={user} admin={user.role==="admin"}>
    <MissionRunClient id={id}/>
  </AppShell>;
}
