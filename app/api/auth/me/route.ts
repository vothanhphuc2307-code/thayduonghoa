import { getCurrentUser } from "@/lib/auth";
import { json } from "@/lib/utils";
export const runtime="nodejs";
export async function GET(){
  const user=await getCurrentUser();
  if(!user) return json({user:null},{status:401});
  return json({user});
}
