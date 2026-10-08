import { NextRequest } from "next/server";
import { requireDb } from "@/lib/db";
import { createSession, verifyPassword } from "@/lib/auth";
import { json } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (typeof email !== "string" || typeof password !== "string") return json({ error:"Thiếu email/mật khẩu" }, { status:400 });
    const db = requireDb();
    const [user] = await db`SELECT id, password_hash FROM users WHERE lower(email)=lower(${email.trim()}) LIMIT 1`;
    if (!user || !verifyPassword(password, user.password_hash)) return json({ error:"Email hoặc mật khẩu không đúng" }, { status:401 });
    await createSession(Number(user.id));
    return json({ ok:true });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Server error" }, { status:500 });
  }
}
