import { requireDb } from "@/lib/db";
import { json } from "@/lib/utils";

export const runtime = "nodejs";

export async function GET() {
  try {
    const db = requireDb();
    const [row] = await db`SELECT NOW() AS now`;
    return json({ ok:true, database:true, now:row?.now ?? null });
  } catch (e) {
    return json({ ok:false, error:e instanceof Error?e.message:"Server error" }, {status:500});
  }
}
