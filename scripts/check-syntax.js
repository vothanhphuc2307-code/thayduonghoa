import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
const root=path.resolve(process.cwd());
const files=[];
function visit(dir){for(const ent of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,ent.name);if(ent.isDirectory()){if(!['node_modules','.next','.git'].includes(ent.name))visit(file);}else if(ent.isFile()&&ent.name.endsWith('.js')&&!ent.name.endsWith('.jsx')&&(file.includes(`${path.sep}lib${path.sep}`)||file.includes(`${path.sep}scripts${path.sep}`)||file.includes(`${path.sep}tools${path.sep}`)||file.includes(`${path.sep}api${path.sep}`)))files.push(file);}}
visit(root);
let failed=0;
for(const file of files){const r=spawnSync(process.execPath,['--check',file],{encoding:'utf8'});if(r.status!==0){console.error('Syntax error:',path.relative(root,file),r.stderr||r.stdout);failed++;}}
if(failed)process.exit(1);
console.log(`Node syntax check passed for ${files.length} server/crawler JavaScript modules. JSX and full framework build must be checked with npm run build.`);
