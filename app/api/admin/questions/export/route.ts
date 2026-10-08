import { NextRequest } from "next/server";
import { requireAdminRequest } from "@/lib/auth";
import { requireDb } from "@/lib/db";

export const runtime="nodejs";

export async function GET(request:NextRequest){
  const admin=await requireAdminRequest(request); if(!admin) return new Response("Forbidden",{status:403});
  const db=requireDb(); const rows=await db`
    SELECT id,type,chapter,difficulty,title,prompt,options,true_false_items,correct_options,correct_true_false,accepted_texts,explanation,published
    FROM questions ORDER BY id ASC
  `;
  return new Response(JSON.stringify({questions:rows},null,2),{
    status:200,
    headers:{
      "content-type":"application/json; charset=utf-8",
      "content-disposition":"attachment; filename=tdh-question-bank.json"
    }
  });
}
