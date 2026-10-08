import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {plan,run,detect,printStep,AGENTS,TOOLS} from '../src/core.mjs';
import {backup} from '../src/backup.mjs';
const fake=(platform,found={})=>({platform,found});
test('agents and tools exposed',()=>{assert.equal(AGENTS.length,2);assert.equal(TOOLS.length,4);});
test('detect current OS',()=>{assert.ok(detect().os);});
test('reject empty selections',()=>{assert.throws(()=>plan({agents:[],tools:['rtk']}));});
test('reject unsupported tools',()=>{assert.throws(()=>plan({agents:['claude'],tools:['malicious']}));});
test('claude RTK hook and WinGet binary',()=>{
 const p=plan({agents:['claude'],tools:['rtk'],system:fake('win32',{claude:true,winget:true})});
 assert.ok(p.steps.some(s=>s.cmd==='rtk'&&s.args.includes('--auto-patch')));
 assert.ok(p.steps.some(s=>s.cmd==='winget'&&s.args.includes('rtk-ai.rtk')));
});
test('Codex Ponytail uses plugin',()=>{
 const p=plan({agents:['codex'],tools:['ponytail'],system:fake('darwin',{codex:true})});
 assert.ok(p.steps.some(s=>s.cmd==='codex'&&s.args.includes('ponytail@ponytail')));
});
test('Claude Caveman uses plugin',()=>{
 const p=plan({agents:['claude'],tools:['caveman'],system:fake('darwin',{claude:true})});
 assert.ok(p.steps.some(s=>s.args.includes('caveman@caveman')));
});
test('Codex Caveman uses skills CLI',()=>{
 const p=plan({agents:['codex'],tools:['caveman'],system:fake('linux',{codex:true,npx:true,git:true})});
 assert.ok(p.steps.some(s=>s.cmd==='npx'&&s.args.includes('skills')));
});
test('Headroom invokes uv install and warns launcher required',()=>{
 const p=plan({agents:['claude'],tools:['headroom'],system:fake('darwin',{claude:true,uv:true})});
 assert.ok(p.steps.some(s=>s.args.includes('headroom-ai[proxy]')));
 assert.ok(p.warnings.some(w=>w.includes('BOLT-CLAUDE')));
});
test('command preview does not shell-execute',()=>{
 const p=plan({agents:['claude'],tools:['rtk'],system:fake('win32',{claude:true,winget:true})});
 assert.ok(printStep(p.steps[0]).includes('winget'));
});
test('runner skips installed tool and blocks missing dependencies',async()=>{
 const steps=[{name:'skipped',cmd:'npm',args:[],skip:'rtk'},{name:'blocked',cmd:'rtk',args:[],needs:['bad']}];
 let ran=0;
 const results=await run({steps},{lookup:x=>x==='rtk'?'present':null,execute:async()=>{ran++;return 0;}});
 assert.deepEqual(results.map(x=>x.status),['skipped','blocked']);assert.equal(ran,0);
});
test('runner processes executor failures',async()=>{
 const results=await run({steps:[{name:'fail',cmd:'npm',args:[]}]},{lookup:()=>'/bin/npm',execute:async()=>1});
 assert.equal(results[0].status,'failed');
});
test('backs up settings without changing them',()=>{
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-test-'));
 try{
  fs.mkdirSync(path.join(home,'.claude'));
  fs.writeFileSync(path.join(home,'.claude','settings.json'),'{"hooks":[]}');
  const result=backup(['claude'],{home,stamp:'test'});
  assert.equal(result.files.length,1);
  assert.equal(fs.readFileSync(result.files[0],'utf8'),'{"hooks":[]}');
  assert.equal(fs.readFileSync(path.join(home,'.claude','settings.json'),'utf8'),'{"hooks":[]}');
 }finally{fs.rmSync(home,{recursive:true,force:true});}
});
