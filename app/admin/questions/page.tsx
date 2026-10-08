import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import AppShell from "@/components/AppShell";
import AdminQuestionsClient from "@/components/AdminQuestionsClient";

export default async function AdminQuestionsPage(){
  const user=await getCurrentUser();
  if(!user) redirect("/login");
  if(user.role!=="admin") redirect("/dashboard");
  return <AppShell user={user} admin><AdminQuestionsClient/></AppShell>;
}
