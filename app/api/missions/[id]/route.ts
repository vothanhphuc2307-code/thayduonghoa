import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { serializeQuestion } from "@/lib/questions";
import { chapterLabel, difficultyConfig } from "@/lib/config";
import { json, toId } from "@/lib/utils";

export const runtime="nodejs";

export async function GET(request: NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await getRequestUser(request);
    if(!user) return json({error:"Unauthorized"},{status:401});
    const id=toId((await params).id);
    const db=requireDb();
    const [run]=await db`
      SELECT id,user_id,chapter,difficulty,total,question_ids,started_at,last_seen_at,blur_count,submitted_at,correct_count,exp_reward,gold_reward,result
      FROM mission_runs WHERE id=${id} AND user_id=${user.id} LIMIT 1
    `;
    if(!run) return json({error:"Không tìm thấy lượt"},{status:404});
    const rows=await db`
      SELECT id,type,chapter,difficulty,title,prompt,options,true_false_items,explanation
      FROM questions WHERE id=ANY(${run.question_ids}::int[]) ORDER BY array_position(${run.question_ids}::int[],id)
    `;
    const submitted=Boolean(run.submitted_at);
    return json({
      run:{
        id:Number(run.id),difficulty:run.difficulty,level:difficultyConfig(run.difficulty).level,
        scope_label:chapterLabel(run.chapter),total:Number(run.total),
        started_at:run.started_at,last_seen_at:run.last_seen_at,blur_count:Number(run.blur_count),
        submitted_at:run.submitted_at,correct_count:Number(run.correct_count),
        exp_reward:Number(run.exp_reward),gold_reward:Number(run.gold_reward),
        questions:rows.map(serializeQuestion),
        result:submitted ? {
          score:{correct:Number(run.correct_count),total:Number(run.total)},
          reward:{exp:Number(run.exp_reward),gold:Number(run.gold_reward)},
          details:Array.isArray(run.result) ? run.result : []
        } : null
      }
    });
  }catch(e){return json({error:e instanceof Error?e.message:"Server error"},{status:500});}
}
