import { neon } from "@neondatabase/serverless";
import { readFile } from "node:fs/promises";

const url=process.env.DATABASE_URL;
if(!url){console.error("DATABASE_URL is missing");process.exit(1);}
const sql=neon(url);
const schema=await readFile(new URL("../schema.sql", import.meta.url),"utf8");

// Neon SQL tag is intentionally used statement-by-statement because schema.sql contains many statements.
const statements=schema.split(/;\s*(?:\r?\n|$)/).map(x=>x.trim()).filter(Boolean);
for(const statement of statements){
  try{ await sql.query(statement); }
  catch(err){ console.error("Failed statement:", statement.slice(0,160), err); process.exit(1); }
}
console.log(`Applied ${statements.length} statements.`);
