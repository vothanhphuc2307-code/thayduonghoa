import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { json } from "@/lib/utils";
import { levelFromExp } from "@/lib/config";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const user = await getRequestUser(request);
  if (!user) return json({error:"Unauthorized"},{status:401});
  const db=requireDb();
  const [classRow]=await db`
    SELECT c.id,c.code,c.name
    FROM class_members cm JOIN classes c ON c.id=cm.class_id
    WHERE cm.user_id=${user.id}
    ORDER BY c.id LIMIT 1
  `;
  const ranks=await db`
    SELECT id,name,level,exp,gold FROM users
    ORDER BY exp DESC, id ASC
    LIMIT 5
  `;
  const progress=levelFromExp(user.exp);
  return json({user,progress,class:classRow??null,leaderboard:ranks});
}
