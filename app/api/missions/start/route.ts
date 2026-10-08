import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { difficultyConfig, DifficultyKey, chapterLabel } from "@/lib/config";
import { serializeQuestion } from "@/lib/questions";
import { json } from "@/lib/utils";

export const runtime="nodejs";

export async function POST(request: NextRequest){
  try{
    const user=await getRequestUser(request);
    if(!user) return json({error:"Unauthorized"},{status:401});
    const body=await request.json();
    const chapter=typeof body.chapter==="string" ? body.chapter.trim() : "c12-1";
    const difficulty=body.difficulty as DifficultyKey;
    if(!(difficulty in {basic:1,medium:1,high_application:1})) return json({error:"Difficulty không hợp lệ"},{status:400});
    const cfg=difficultyConfig(difficulty);
    const db=requireDb();

    if(cfg.dailyCap){
      const [cap]=await db`
        SELECT COALESCE(SUM(total),0) AS n
        FROM mission_runs
        WHERE user_id=${user.id}
          AND difficulty=${difficulty}
          AND submitted_at IS NOT NULL
          AND (submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh')::date=(NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')::date
      `;
      const used=Number(cap?.n??0);
      if(used>=cfg.dailyCap) return json({error:`Đã đủ ${cfg.dailyCap} câu thưởng hôm nay.`},{status:429});
    }

    const rows=await db`
      SELECT id,type,chapter,difficulty,title,prompt,options,true_false_items
      FROM questions
      WHERE published=true AND difficulty=${difficulty} AND chapter=${chapter}
      ORDER BY RANDOM()
      LIMIT ${cfg.total}
    `;
    if(rows.length<cfg.total) return json({error:"Kho đề chưa đủ câu cho cấu hình này/chapter này."},{status:409});

    const ids=rows.map((r:any)=>Number(r.id));
    const [run]=await db`
      INSERT INTO mission_runs(user_id,chapter,difficulty,total,question_ids)
      VALUES(${user.id},${chapter},${difficulty},${cfg.total},${ids})
      RETURNING id,started_at,last_seen_at,total
    `;
    return json({
      run:{
        id:Number(run.id),
        difficulty,
        level:cfg.level,
        scope_label:chapterLabel(chapter),
        total:cfg.total,
        requested:cfg.total,
        questions:rows.map(serializeQuestion)
      }
    },{status:201});
  }catch(e){
    return json({error:e instanceof Error?e.message:"Server error"},{status:500});
  }
}
