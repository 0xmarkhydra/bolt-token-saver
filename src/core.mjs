import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';

export const AGENTS = [
  { id:'claude', name:'Claude Code', bin:'claude', pkg:'@anthropic-ai/claude-code' },
  { id:'codex', name:'OpenAI Codex', bin:'codex', pkg:'@openai/codex' }
];
export const TOOLS = [
  { id:'rtk', name:'RTK', about:'Nen output terminal: git, grep, test, logs' },
  { id:'headroom', name:'Headroom', about:'Proxy nen context, chay qua launcher rieng' },
  { id:'caveman', name:'Caveman', about:'Model tra loi ngan, bot van xuoi' },
  { id:'ponytail', name:'Ponytail', about:'Viet code gon, reuse truoc khi build moi' }
];
const dirs = () => {
  const home=os.homedir();
  return process.platform==='win32'
    ? [process.env.APPDATA && path.join(process.env.APPDATA,'npm'),
       process.env.LOCALAPPDATA && path.join(process.env.LOCALAPPDATA,'Microsoft','WinGet','Links'),
       path.join(home,'.local','bin'),path.join(home,'.cargo','bin'),
       path.join(process.env.ProgramFiles||'C:\\Program Files','nodejs')]
    : [path.join(home,'.local','bin'),path.join(home,'.cargo','bin'),'/opt/homebrew/bin','/usr/local/bin'];
};
export function which(bin) {
  const parts=[...(process.env.PATH||'').split(path.delimiter),...dirs()].filter(Boolean);
  const exts=process.platform==='win32'?['.exe','.cmd','.bat',''] : [''];
  for(const dir of new Set(parts))for(const ext of exts){
    const file=path.join(dir,bin+ext);
    try {const stat=fs.statSync(file);if(stat.isFile()&&(process.platform==='win32'||(stat.mode&0o111)))return file;} catch {}
  }
  return null;
}
export function detect(){
  const found=Object.fromEntries(['claude','codex','rtk','headroom','npm','npx','git','uv','winget','brew','cargo'].map(x=>[x,!!which(x)]));
  return { os:({win32:'Windows',darwin:'macOS',linux:'Linux'})[process.platform]||process.platform,platform:process.platform,arch:process.arch,found };
}
const step=(name,cmd,args,opts={})=>({name,cmd,args,...opts});
export function plan({agents,tools,system=detect()}){
  if(!agents.length||!tools.length)throw Error('Select at least one agent and one optimization');
  for(const a of agents)if(!AGENTS.some(x=>x.id===a))throw Error('Unsupported agent: '+a);
  for(const t of tools)if(!TOOLS.some(x=>x.id===t))throw Error('Unsupported optimization: '+t);
  const steps=[],warnings=[];
  const {platform,found}=system;
  for(const id of agents){
    const agent=AGENTS.find(a=>a.id===id);
    if(!found[agent.bin])steps.push(step('Install '+agent.name,'npm',['install','-g',agent.pkg],{needs:['npm'],skip:agent.bin}));
  }
  if(tools.includes('rtk')){
    if(!found.rtk){
      if(platform==='win32') steps.push(step('Install RTK','winget',['install','--id','rtk-ai.rtk','--exact','--accept-package-agreements','--accept-source-agreements'],{needs:['winget'],skip:'rtk'}));
      else if(found.brew)steps.push(step('Install RTK','brew',['install','rtk-ai/tap/rtk'],{needs:['brew'],skip:'rtk'}));
      else if(found.cargo)steps.push(step('Install RTK','cargo',['install','--git','https://github.com/rtk-ai/rtk','rtk'],{needs:['cargo'],skip:'rtk'}));
      else warnings.push('RTK requires WinGet, Homebrew or Rust Cargo.');
    }
    for(const id of agents){
      steps.push(step('Enable RTK for '+id,'rtk',id==='claude'?['init','-g','--auto-patch']:['init','-g','--codex'],{needs:['rtk',id==='claude'?'claude':'codex']}));
    }
    if(platform==='win32')warnings.push('RTK native Windows hook requires recent RTK (>=0.37.2).');
  }
  if(tools.includes('headroom')){
    if(!found.uv){
      if(platform==='win32')steps.push(step('Install uv','winget',['install','--id','astral-sh.uv','--exact','--accept-package-agreements','--accept-source-agreements'],{needs:['winget'],skip:'uv'}));
      else if(found.brew)steps.push(step('Install uv','brew',['install','uv'],{needs:['brew'],skip:'uv'}));
      else warnings.push('Install uv manually: https://docs.astral.sh/uv/ before Headroom.');
    }
    steps.push(step('Install Headroom','uv',['tool','install','--python','3.13','headroom-ai[proxy]'],{needs:['uv'],skip:'headroom'}));
    warnings.push('Headroom is enabled ONLY with BOLT-CLAUDE / BOLT-CODEX launcher.');
    warnings.push('Do not expose its local proxy port; review your upstream/API key settings.');
  }
  if(tools.includes('caveman')){
    if(agents.includes('claude')){
      steps.push(step('Caveman marketplace','claude',['plugin','marketplace','add','JuliusBrussee/caveman'],{needs:['claude'],optional:true}));
      steps.push(step('Caveman for Claude','claude',['plugin','install','caveman@caveman'],{needs:['claude']}));
    }
    if(agents.includes('codex')){
      if(!found.git&&platform==='win32')steps.push(step('Install Git','winget',['install','--id','Git.Git','--exact','--accept-package-agreements','--accept-source-agreements'],{needs:['winget'],skip:'git'}));
      steps.push(step('Caveman skill for Codex','npx',['--yes','skills','add','JuliusBrussee/caveman','--agent','codex','--global','--yes','--copy'],{needs:['npx','git']}));
      warnings.push('Caveman Codex is a skill; activate per-session when needed.');
    }
  }
  if(tools.includes('ponytail')){
    if(agents.includes('claude')){
      steps.push(step('Ponytail marketplace','claude',['plugin','marketplace','add','DietrichGebert/ponytail'],{needs:['claude'],optional:true}));
      steps.push(step('Ponytail for Claude','claude',['plugin','install','ponytail@ponytail'],{needs:['claude']}));
    }
    if(agents.includes('codex')){
      steps.push(step('Ponytail marketplace Codex','codex',['plugin','marketplace','add','DietrichGebert/ponytail'],{needs:['codex'],optional:true}));
      steps.push(step('Ponytail for Codex','codex',['plugin','add','ponytail@ponytail'],{needs:['codex']}));
      warnings.push('In Codex, inspect /hooks and trust Ponytail hooks.');
    }
  }
  return {steps,warnings};
}
export function printStep(s){return [s.cmd,...s.args.map(x=>/\s/.test(x)?JSON.stringify(x):x)].join(' ');}
export function execStep(s,onOutput=()=>{}){
  return new Promise((resolve,reject)=>{
    // Only allowlisted command names/arguments reach the shell (Windows .cmd shims).
    const child=spawn(s.cmd,s.args,{shell:process.platform==='win32',windowsHide:true,env:{...process.env,FORCE_COLOR:'0'},stdio:['ignore','pipe','pipe']});
    child.stdout?.on('data',b=>onOutput(b.toString()));
    child.stderr?.on('data',b=>onOutput(b.toString()));
    child.on('error',reject);
    child.on('close',code=>resolve(code??1));
  });
}
export async function run(plan,{lookup=which,execute=execStep,onState=()=>{},onOutput=()=>{}}={}){
  const results=[];
  for(const s of plan.steps){
    if(s.skip&&lookup(s.skip)){results.push({name:s.name,status:'skipped'});onState(s,'skipped');continue;}
    const missing=(s.needs||[]).filter(x=>!lookup(x));
    if(missing.length){results.push({name:s.name,status:'blocked',message:'Missing: '+missing.join(', ')});onState(s,'blocked');continue;}
    onState(s,'running');
    try {
      const code=await execute(s,onOutput);
      const status=code===0?'ok':s.optional?'warning':'failed';
      results.push({name:s.name,status,code});onState(s,status);
    } catch(e) {results.push({name:s.name,status:'failed',message:e.message});onState(s,'failed');}
  }
  return results;
}
