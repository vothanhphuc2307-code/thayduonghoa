import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { DIFFICULTIES, CHAPTERS } from "@/lib/config";
import { json } from "@/lib/utils";

export const runtime="nodejs";

export async function GET(request: NextRequest){
  const user=await getRequestUser(request);
  if(!user) return json({error:"Unauthorized"},{status:401});
  const db=requireDb();
  const history=await db`
    SELECT id,chapter,difficulty,total,correct_count,exp_reward,gold_reward,started_at,last_seen_at,submitted_at,blur_count
    FROM mission_runs WHERE user_id=${user.id} ORDER BY id DESC LIMIT 50
  `;
  return json({config:{difficulties:DIFFICULTIES,chapters:CHAPTERS},history});
}
