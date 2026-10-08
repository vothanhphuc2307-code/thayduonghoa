import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import LoginForm from "@/components/LoginForm";

export default async function LoginPage() {
  const user = await getCurrentUser();
  if (user) redirect("/dashboard");
  return (
    <main style={{minHeight:"100vh",display:"grid",placeItems:"center",padding:20,background:"var(--app-bg)"}}>
      <div style={{width:"100%",display:"grid",placeItems:"center"}}>
        <LoginForm />
      </div>
    </main>
  );
}
