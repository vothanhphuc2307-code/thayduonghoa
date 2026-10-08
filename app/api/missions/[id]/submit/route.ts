import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { scoreRun } from "@/lib/scoring";
import { levelFromExp } from "@/lib/config";
import type { AnswersPayload } from "@/lib/types";
import { json, toId } from "@/lib/utils";

export const runtime="nodejs";

export async function POST(request:NextRequest,{params}:{params:Promise<{id:string}>}){
  try{
    const user=await getRequestUser(request); if(!user) return json({error:"Unauthorized"},{status:401});
    const id=toId((await params).id);
    const body=await request.json();
    const answers=(body?.answers ?? {}) as AnswersPayload;
    const db=requireDb();

    const [run]=await db`
      SELECT id,user_id,chapter,difficulty,total,question_ids,submitted_at
      FROM mission_runs WHERE id=${id} AND user_id=${user.id} LIMIT 1
    `;
    if(!run) return json({error:"Không tìm thấy lượt"},{status:404});
    if(run.submitted_at){
      const [existing]=await db`SELECT result,exp_reward,gold_reward,correct_count,total FROM mission_runs WHERE id=${id} AND user_id=${user.id}`;
      return json({ok:true,alreadySubmitted:true,result:existing?.result ?? null,reward:{exp:Number(existing?.exp_reward??0),gold:Number(existing?.gold_reward??0)},score:{correct:Number(existing?.correct_count??0),total:Number(existing?.total??0)}});
    }

    const questions=await db`
      SELECT id,type,correct_options,correct_true_false,accepted_texts,explanation
      FROM questions WHERE id=ANY(${run.question_ids}::int[]) ORDER BY array_position(${run.question_ids}::int[],id)
    `;
    const score=scoreRun(questions as any, answers, run.difficulty);
    const resultJson=JSON.stringify(score.details);
    const newLevel=levelFromExp(user.exp+score.expReward).level;

    const [claimed]=await db`
      WITH claimed AS (
        UPDATE mission_runs
        SET submitted_at=NOW(), correct_count=${score.correctCount}, exp_reward=${score.expReward}, gold_reward=${score.goldReward}, result=${resultJson}::jsonb
        WHERE id=${id} AND user_id=${user.id} AND submitted_at IS NULL
        RETURNING id,exp_reward,gold_reward
      ),
      user_update AS (
        UPDATE users u
        SET exp=u.exp+(SELECT exp_reward FROM claimed),
            gold=u.gold+(SELECT gold_reward FROM claimed),
            level=${newLevel},
            updated_at=NOW()
        WHERE u.id=${user.id} AND EXISTS(SELECT 1 FROM claimed)
        RETURNING u.exp,u.gold,u.level
      ),
      ledger AS (
        INSERT INTO reward_ledger(user_id,source,reference,exp_delta,gold_delta)
        SELECT ${user.id},'mission',${`run:${id}`},exp_reward,gold_reward FROM claimed
        ON CONFLICT(source,reference) DO NOTHING
        RETURNING id
      )
      SELECT claimed.id,claimed.exp_reward,claimed.gold_reward,user_update.exp AS user_exp,user_update.gold AS user_gold
      FROM claimed LEFT JOIN user_update ON TRUE
    `;
    if(!claimed){
      return json({error:"Lượt này vừa được submit ở request khác."},{status:409});
    }
    return json({
      ok:true,
      alreadySubmitted:false,
      score:{correct:score.correctCount,total:score.total},
      reward:{exp:score.expReward,gold:score.goldReward},
      economy:{exp:Number(claimed.user_exp??user.exp),gold:Number(claimed.user_gold??user.gold)},
      details:score.details
    });
  }catch(e){return json({error:e instanceof Error?e.message:"Server error"},{status:500});}
}
