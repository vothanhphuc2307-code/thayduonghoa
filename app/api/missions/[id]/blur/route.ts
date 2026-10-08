import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { json, toId } from "@/lib/utils";

export const runtime="nodejs";

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await getRequestUser(request); if(!user) return json({error:"Unauthorized"},{status:401});
    const id=toId((await params).id); const db=requireDb();
    const [row]=await db`
      UPDATE mission_runs SET blur_count=blur_count+1,last_seen_at=NOW()
      WHERE id=${id} AND user_id=${user.id} AND submitted_at IS NULL
      RETURNING blur_count
    `;
    return json({ok:true,blur_count:Number(row?.blur_count??0)});
  }catch(e){return json({error:e instanceof Error?e.message:"Server error"},{status:500});}
}
