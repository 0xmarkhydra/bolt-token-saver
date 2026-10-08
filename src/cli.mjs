#!/usr/bin/env node
import readline from 'node:readline';
import {AGENTS,TOOLS,detect,plan,run,printStep} from './core.mjs';
import {backup} from './backup.mjs';

const sys=detect();
const color=(s,n)=>process.stdout.isTTY?'\x1b['+n+'m'+s+'\x1b[0m':s;
const cyan=s=>color(s,96),green=s=>color(s,92),yellow=s=>color(s,93),bold=s=>color(s,1);
const args=process.argv.slice(2);
function doctor(){
  console.log('Bolt Token Saver v0.3 | '+sys.os+' '+sys.arch);
  for(const key of ['claude','codex','rtk','headroom','npm','npx','git','uv','winget','brew','cargo'])
    console.log(key.padEnd(11),sys.found[key]?'FOUND':'not installed');
}
const selectedAgents=new Set(AGENTS.filter(x=>sys.found[x.bin]).map(x=>x.id));
if(!selectedAgents.size)selectedAgents.add('claude');
const selectedTools=new Set(TOOLS.map(x=>x.id));
if(args.includes('--version')){console.log('0.3.0');process.exit(0);}
if(args.includes('--doctor')){doctor();process.exit(0);}
if(args.includes('--help')){
  console.log('Usage: node src/cli.mjs [--doctor|--plan|--help]');
  console.log('Navigation: Up/Down, Space toggle, Enter next, Esc previous, Q quit.');
  process.exit(0);
}
if(args.includes('--plan')){
  doctor();
  const p=plan({system:sys,agents:[...selectedAgents],tools:[...selectedTools]});
  console.log('\nPreview only (no changes):');
  p.steps.forEach((s,i)=>console.log((i+1)+'. '+printStep(s)));
  p.warnings.forEach(w=>console.log('NOTE:',w));
  process.exit(0);
}
if(Number(process.versions.node.split('.')[0])<20)throw Error('Requires Node.js 20+');
if(!process.stdin.isTTY){console.error('Interactive UI requires a terminal. Use --doctor/--plan for non-TTY.');process.exit(2);}

const clear=()=>process.stdout.write('\x1b[2J\x1b[H');
function header(heading){
  console.log(cyan('╭────────────────────────────────────────────────────╮'));
  console.log(cyan('│')+'  ⚡ '+bold('BOLT TOKEN SAVER')+'  ·  Interactive Setup             '+cyan('│'));
  console.log(cyan('╰────────────────────────────────────────────────────╯'));
  console.log('\n'+bold(heading)+'\n'+sys.os+' '+sys.arch+'\n');
}
async function choose(items,set,heading){
  let cursor=0;
  return new Promise(resolve=>{
    function paint(){
      clear();header(heading);
      for(const [i,item] of items.entries()){
        const flag=set.has(item.id)?green('[x]'):'[ ]';
        const pointer=i===cursor?cyan('❯'):' ';
        const installed=item.bin?(sys.found[item.bin]?'  ✓ detected':'  · will install'):'';
        console.log(' '+pointer+' '+flag+' '+bold(item.name)+installed);
        if(item.about)console.log('       '+item.about);
      }
      console.log('\n'+cyan('↑ ↓')+' Move    '+cyan('Space')+' Toggle    '+cyan('Enter')+' Next    '+cyan('Esc')+' Back    '+cyan('Q')+' Exit');
    }
    function finish(result){process.stdin.off('keypress',handle);resolve(result);}
    function handle(str,key={}){
      if(key.ctrl&&key.name==='c')return finish('quit');
      if(key.name==='up'||str==='k'){cursor=(cursor+items.length-1)%items.length;paint();}
      else if(key.name==='down'||str==='j'){cursor=(cursor+1)%items.length;paint();}
      else if(key.name==='space'){const id=items[cursor].id;set.has(id)?set.delete(id):set.add(id);paint();}
      else if(key.name==='return'){if(set.size)finish('next');else process.stdout.write('\x07');}
      else if(key.name==='escape')finish('back');
      else if(str==='q'||str==='Q')finish('quit');
    }
    process.stdin.on('keypress',handle);paint();
  });
}
async function confirm(p){
  let yes=false;
  return new Promise(resolve=>{
    function paint(){
      clear();header('Step 3/3 · Confirm installation');
      console.log('Agents: '+[...selectedAgents].join(', '));
      console.log('Optimizations: '+[...selectedTools].join(', '));
      console.log('\n'+bold('Commands that will run:'));
      p.steps.forEach((s,i)=>console.log(' '+String(i+1).padStart(2)+'. '+s.name+'\n     '+printStep(s)));
      p.warnings.forEach(w=>console.log(yellow('\n ! '+w)));
      console.log('\nDownloads from third-party package registries/GitHub require internet.');
      console.log('\n '+(yes?green('❯ [YES] Install'):'  [YES] Install'));
      console.log(' '+(!yes?cyan('❯ [NO] Go back'):'  [NO] Go back'));
      console.log('\nArrow keys to select, Enter confirm, Esc back');
    }
    function finish(x){process.stdin.off('keypress',handle);resolve(x);}
    function handle(str,key={}){
      if(['up','down','left','right','tab'].includes(key.name)){yes=!yes;paint();}
      else if(str==='y'||str==='Y')finish(true);
      else if(str==='n'||str==='N'||key.name==='escape'||key.ctrl&&key.name==='c')finish(false);
      else if(key.name==='return')finish(yes);
    }
    process.stdin.on('keypress',handle);paint();
  });
}
async function waitKey(){
  return new Promise(resolve=>{
    console.log('\nPress Enter to finish');
    const key=(_s,k={})=>{if(['return','escape'].includes(k.name)){process.stdin.off('keypress',key);resolve();}};
    process.stdin.on('keypress',key);
  });
}
async function main(){
  readline.emitKeypressEvents(process.stdin);
  process.stdin.resume();
  process.stdin.setRawMode(true);
  try{
    for(;;){
      const a=await choose(AGENTS,selectedAgents,'Step 1/3 · Choose coding agents');
      if(a==='quit')break;
      const t=await choose(TOOLS,selectedTools,'Step 2/3 · Choose optimizations');
      if(t==='quit')break;if(t==='back')continue;
      const p=plan({agents:[...selectedAgents],tools:[...selectedTools],system:sys});
      if(!await confirm(p))continue;
      clear();header('Installing...');
      process.stdin.setRawMode(false);
      let saved;
      try{saved=backup([...selectedAgents]);}
      catch(e){console.log('Configuration backup failed: '+e.message);process.stdin.setRawMode(true);await waitKey();break;}
      console.log(saved.directory?'Backup: '+saved.directory:'No existing config needs backup');
      const results=await run(p,{
        onState:(s,status)=>console.log((status==='ok'?green('✓'):status==='running'?cyan('→'):yellow('!'))+' '+s.name+': '+status),
        onOutput:data=>data.split(/\r?\n/).forEach(line=>{if(line.trim())console.log('    '+line.slice(0,400));})
      });
      console.log('\n'+bold('Summary:'));
      for(const s of ['ok','skipped','failed','blocked','warning'])console.log(' '+s+': '+results.filter(r=>r.status===s).length);
      console.log('\nRestart agent to activate hooks/plugins.');
      if(selectedTools.has('headroom')){
        console.log('Use BOLT-CLAUDE.cmd / BOLT-CODEX.cmd on Windows');
        console.log('Use ./bolt-claude.sh / ./bolt-codex.sh on Mac/Linux');
      }
      if(results.some(r=>r.status==='blocked'))console.log(yellow('Some installs blocked: restart terminal so PATH can refresh, then retry.'));
      process.stdin.setRawMode(true);await waitKey();break;
    }
  } finally {process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\x1b[0m');}
}
main().catch(e=>{process.stdin.setRawMode(false);console.error(e);process.exitCode=1;});
