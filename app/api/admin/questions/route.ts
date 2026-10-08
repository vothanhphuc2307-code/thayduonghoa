import { NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { requireDb } from "@/lib/db";
import { json } from "@/lib/utils";

export const runtime="nodejs";

function rowForClient(r:any){
  return {
    id:Number(r.id),type:r.type,chapter:r.chapter,difficulty:r.difficulty,title:r.title,prompt:r.prompt,
    options:r.options??[],true_false_items:r.true_false_items??[],
    correct_options:r.correct_options??[],correct_true_false:r.correct_true_false??{},
    accepted_texts:r.accepted_texts??[],explanation:r.explanation,published:Boolean(r.published)
  };
}

export async function GET(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return json({error:"Forbidden"},{status:403});
  const db=requireDb(); const rows=await db`SELECT * FROM questions ORDER BY id DESC LIMIT 500`;
  return json({questions:rows.map(rowForClient)});
}

export async function POST(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return json({error:"Forbidden"},{status:403});
  const b=await request.json(); const db=requireDb();
  const [row]=await db`
    INSERT INTO questions(type,chapter,difficulty,title,prompt,options,true_false_items,correct_options,correct_true_false,accepted_texts,explanation,published)
    VALUES(${b.type},${b.chapter},${b.difficulty},${b.title},${b.prompt},${JSON.stringify(b.options??[])}::jsonb,${JSON.stringify(b.true_false_items??[])}::jsonb,${JSON.stringify(b.correct_options??[])}::jsonb,${JSON.stringify(b.correct_true_false??{})}::jsonb,${JSON.stringify(b.accepted_texts??[])}::jsonb,${b.explanation??""},${b.published!==false})
    RETURNING *
  `;
  return json({question:rowForClient(row)},{status:201});
}

export async function PATCH(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return json({error:"Forbidden"},{status:403});
  const b=await request.json(); const db=requireDb();
  if(!b.id) return json({error:"Thiếu id"},{status:400});
  const [row]=await db`
    UPDATE questions SET
      type=${b.type},chapter=${b.chapter},difficulty=${b.difficulty},title=${b.title},prompt=${b.prompt},
      options=${JSON.stringify(b.options??[])}::jsonb,true_false_items=${JSON.stringify(b.true_false_items??[])}::jsonb,
      correct_options=${JSON.stringify(b.correct_options??[])}::jsonb,correct_true_false=${JSON.stringify(b.correct_true_false??{})}::jsonb,
      accepted_texts=${JSON.stringify(b.accepted_texts??[])}::jsonb,explanation=${b.explanation??""},published=${b.published!==false},updated_at=NOW()
    WHERE id=${b.id} RETURNING *
  `;
  if(!row) return json({error:"Không tìm thấy câu"},{status:404});
  return json({question:rowForClient(row)});
}

export async function DELETE(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return json({error:"Forbidden"},{status:403});
  const id=Number(new URL(request.url).searchParams.get("id")); if(!id) return json({error:"Thiếu id"},{status:400});
  const db=requireDb(); await db`DELETE FROM questions WHERE id=${id}`;
  return json({ok:true});
}
