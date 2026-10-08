import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
export function backup(agents,options={}){
 const home=options.home||os.homedir();
 const stamp=options.stamp||new Date().toISOString().replace(/[:.]/g,'-');
 const base=options.output||path.join(home,'.bolt-token-saver','backups',stamp);
 const claude=process.env.CLAUDE_CONFIG_DIR||path.join(home,'.claude');
 const codex=process.env.CODEX_HOME||path.join(home,'.codex');
 const inputs=[];
 if(agents.includes('claude'))inputs.push(['claude-settings.json',path.join(claude,'settings.json')],['claude-CLAUDE.md',path.join(claude,'CLAUDE.md')]);
 if(agents.includes('codex'))inputs.push(['codex-config.toml',path.join(codex,'config.toml')],['codex-AGENTS.md',path.join(codex,'AGENTS.md')],['codex-hooks.json',path.join(codex,'hooks.json')]);
 const present=inputs.filter(([,source])=>fs.existsSync(source));
 if(!present.length)return {directory:null,files:[]};
 fs.mkdirSync(base,{recursive:true,mode:0o700});
 const files=[];
 for(const [name,source] of present){
  const dest=path.join(base,name);fs.copyFileSync(source,dest);
  try{fs.chmodSync(dest,0o600);}catch{}
  files.push(dest);
 }
 return {directory:base,files};
}
