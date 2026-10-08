import { NextRequest } from "next/server";
import { getRequestUser } from "@/lib/auth";
export const runtime="nodejs";
export async function POST(_request:NextRequest){
  const user=await getRequestUser(_request);
  return new Response(null,{status:user?204:401});
}
