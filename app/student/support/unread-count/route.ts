import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
import { json } from "@/lib/utils";
export const runtime="nodejs";
export async function GET(request:NextRequest){
  const user=await getRequestUser(request);
  return user ? json({count:0}) : json({error:"Unauthorized"},{status:401});
}
