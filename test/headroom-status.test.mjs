import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {detectHeadroom,parseUvToolList} from '../src/headroom-status.mjs';
import {inspect} from '../src/status.mjs';

const sys={os:'Windows',platform:'win32',arch:'x64',
 found:{claude:true,codex:false,rtk:true,headroom:false,uv:true}};
const fixture=()=>{
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-headroom-'));
 return {home,remove:()=>fs.rmSync(home,{recursive:true,force:true})};
};
test('uv tool list parser accepts actual headroom-ai package only',()=>{
 assert.ok(parseUvToolList('headroom-ai v0.40.0\n- headroom\n'));
 assert.ok(parseUvToolList('other v1\nheadroom-ai v0.10.1\n- headroom\n'));
 assert.equal(parseUvToolList('not-headroom-ai v0.40.0\n- headroom'),false);
 assert.equal(parseUvToolList('headroom-ai-sdk v1.0.0'),false);
 assert.equal(parseUvToolList(''),false);
});
test('Headroom installed with uv but missing PATH is detected without calling a model or installer',()=>{
 const s=detectHeadroom({found:sys.found,uvToolList:'headroom-ai v0.40.0\n- headroom'});
 assert.equal(s.installed,true);
 assert.equal(s.available,false);
 assert.equal(s.uvRegistered,true);
 assert.equal(s.active,false);
 assert.ok(s.details.includes('uv tool update-shell'));
});
test('Headroom native command found remains detected when uv list fails',()=>{
 const s=detectHeadroom({found:{headroom:true},uvToolList:'garbage'});
 assert.equal(s.installed,true);assert.equal(s.available,true);assert.equal(s.active,false);
});
test('read-only uv probe is bounded and only parses package name, never returns stdout',()=>{
 let called=0;
 const s=detectHeadroom({found:sys.found,uvPath:'C:\\Users\\test\\.local\\bin\\uv.exe',
  execute:(cmd,args,opts)=>{
   called++;assert.deepEqual(args,['tool','list']);
   assert.equal(opts.timeout,3000);
   return {status:0,stdout:'headroom-ai v0.40.0\n- headroom\nkey=SECRET-BLOCK\n'};
  }});
 assert.equal(called,1);
 assert.equal(s.installed,true);
 assert.ok(!JSON.stringify(s).includes('SECRET-BLOCK'));
});
test('failed uv probe yields unverified, not false green',()=>{
 const s=detectHeadroom({found:sys.found,uvPath:'uv.exe',execute:()=>({status:1,stdout:'headroom-ai v0.40.0'})});
 assert.equal(s.installed,false);
});
test('Caveman enabledPlugins alone is configured, not falsely verified as installed',()=>{
 const f=fixture();
 try{
  const claude=path.join(f.home,'.claude');
  fs.mkdirSync(claude,{recursive:true});
  fs.writeFileSync(path.join(claude,'settings.json'),JSON.stringify({
   enabledPlugins:{'caveman@caveman':true},
   env:{ANTHROPIC_API_KEY:'TOP-SECRET'}
  }));
  const s=inspect({home:f.home,system:sys,env:{},uvToolList:''});
  assert.equal(s.tools.caveman.configured,true);
  assert.equal(s.tools.caveman.installed,false);
  assert.equal(JSON.stringify(s).includes('TOP-SECRET'),false);
 }finally{f.remove();}
});
test('Caveman global skill or registry detected, including Windows fixture',()=>{
 const f=fixture();
 try{
  const home=f.home;
  const base=path.join(home,'.claude','plugins');
  fs.mkdirSync(base,{recursive:true});
  fs.writeFileSync(path.join(base,'installed_plugins.json'),JSON.stringify({plugins:{'caveman@caveman':[{
   installPath:'C:\\Users\\someone\\.claude\\plugins\\cache\\caveman'
  }]}}));
  const s=inspect({home,system:sys,env:{},uvToolList:''});
  assert.equal(s.tools.caveman.installed,true);
  assert.ok(!JSON.stringify(s).includes('C:\\Users\\someone'));
 }finally{f.remove();}
});
test('inspect marks Headroom installed from uv list without active proxy claim',()=>{
 const f=fixture();
 try{
  const s=inspect({home:f.home,system:sys,env:{},uvToolList:'headroom-ai v0.40.0\n- headroom'});
  assert.equal(s.tools.headroom.installed,true);
  assert.equal(s.tools.headroom.active,false);
 }finally{f.remove();}
});
