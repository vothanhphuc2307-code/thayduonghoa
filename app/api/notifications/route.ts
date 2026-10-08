import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { json } from "@/lib/utils";
export const runtime="nodejs";
export async function GET(request:NextRequest){
  const user=await getRequestUser(request);
  if(!user) return json({data:[],meta:{total:0}},{status:401});
  return json({data:[],meta:{total:0}});
}
