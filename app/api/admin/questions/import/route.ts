import { NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { json } from "@/lib/utils";

export const runtime="nodejs";

export async function POST(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return json({error:"Forbidden"},{status:403});
  try{
    const body=await request.json();
    const list=Array.isArray(body)?body:(Array.isArray(body.questions)?body.questions:[]);
    if(!list.length) return json({error:"Không có questions để import"},{status:400});
    const db=requireDb();
    let count=0;
    for(const b of list){
      const values = [
        b.type,b.chapter,b.difficulty,b.title,b.prompt,
        JSON.stringify(b.options??[]),JSON.stringify(b.true_false_items??[]),
        JSON.stringify(b.correct_options??[]),JSON.stringify(b.correct_true_false??{}),
        JSON.stringify(b.accepted_texts??[]),b.explanation??"",b.published!==false
      ];
      if (b.id) {
        await db`
          UPDATE questions SET
            type=${values[0]},chapter=${values[1]},difficulty=${values[2]},title=${values[3]},prompt=${values[4]},
            options=${values[5]}::jsonb,true_false_items=${values[6]}::jsonb,correct_options=${values[7]}::jsonb,
            correct_true_false=${values[8]}::jsonb,accepted_texts=${values[9]}::jsonb,explanation=${values[10]},
            published=${values[11]},updated_at=NOW()
          WHERE id=${Number(b.id)}
        `;
      } else {
        await db`
          INSERT INTO questions(type,chapter,difficulty,title,prompt,options,true_false_items,correct_options,correct_true_false,accepted_texts,explanation,published)
          VALUES(${values[0]},${values[1]},${values[2]},${values[3]},${values[4]},${values[5]}::jsonb,${values[6]}::jsonb,${values[7]}::jsonb,${values[8]}::jsonb,${values[9]}::jsonb,${values[10]},${values[11]})
        `;
      }
      count++;
    }
    return json({ok:true,count});
  }catch(e){return json({error:e instanceof Error?e.message:"Import error"},{status:400});}
}
