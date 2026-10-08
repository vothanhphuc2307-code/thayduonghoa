import { NextRequest } from "next/server";
import { clearSession } from "@/lib/auth";
import { json } from "@/lib/utils";

export const runtime = "nodejs";

export async function POST(_request: NextRequest) {
  try { await clearSession(); return json({ok:true}); }
  catch (e) { return json({error:e instanceof Error?e.message:"Server error"},{status:500}); }
}
