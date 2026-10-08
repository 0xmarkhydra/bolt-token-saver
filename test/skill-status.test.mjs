import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspect} from '../src/status.mjs';
const system={os:'Windows',platform:'win32',arch:'x64',found:{claude:true,codex:true,rtk:false,headroom:false}};
function sandbox(){
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-skill-state-'));
 return {home,cleanup:()=>fs.rmSync(home,{recursive:true,force:true})};
}
function write(home,name,value){
 const file=path.join(home,name);
 fs.mkdirSync(path.dirname(file),{recursive:true});
 fs.writeFileSync(file,typeof value==='string'?value:JSON.stringify(value));
}
test('Claude UI UX Pro Max existing plugin shows installed even if command says already installed',()=>{
 const f=sandbox();
 try{
  write(f.home,'.claude/plugins/installed_plugins.json',{version:2,plugins:{
   'ui-ux-pro-max@ui-ux-pro-max-skill':[{
      scope:'user',installPath:'C:/Users/HH/.claude/plugins/cache/private',version:'1.1.0'
   }]
  }});
  const result=inspect({home:f.home,env:{},system});
  assert.equal(result.skillStates['ui-ux-pro-max'].claude.installed,true);
  assert.equal(result.skillStates['ui-ux-pro-max'].claude.enabled,false);
  assert.equal(result.skillStates['ui-ux-pro-max'].installed,true);
  assert.equal(result.skillStates.graphify.installed,false);
  assert.ok(!JSON.stringify(result).includes('C:/Users/HH'));
 }finally{f.cleanup();}
});
test('Claude UI UX Pro Max enabled flag is displayed as enabled, without leaking config',()=>{
 const f=sandbox();
 try{
  const apiKey='SECRET-NEVER-PRINT';
  write(f.home,'.claude/settings.json',{enabledPlugins:{
   'ui-ux-pro-max@ui-ux-pro-max-skill':true
  },env:{ANTHROPIC_API_KEY:apiKey}});
  write(f.home,'.claude/plugins/installed_plugins.json',{plugins:{
   'ui-ux-pro-max@ui-ux-pro-max-skill':[{}]
  }});
  const result=inspect({home:f.home,env:{},system});
  assert.equal(result.skillStates['ui-ux-pro-max'].claude.enabled,true);
  assert.equal(JSON.stringify(result).includes(apiKey),false);
 }finally{f.cleanup();}
});
test('Codex skill uses explicit SKILL.md, not any similarly-named directory',()=>{
 const f=sandbox();
 try{
  write(f.home,'.agents/skills/ui-ux-pro-max/SKILL.md','# UI UX Pro Max');
  const result=inspect({home:f.home,env:{},system});
  assert.equal(result.skillStates['ui-ux-pro-max'].codex.installed,true);
  assert.equal(result.skillStates['ui-ux-pro-max'].claude.installed,false);
  assert.equal(result.skillStates.impeccable.installed,false);
 }finally{f.cleanup();}
});
test('Skill collection never pretends to be installed',()=>{
 const f=sandbox();
 try {
  write(f.home,'.claude/plugins/installed_plugins.json',{plugins:{
    'awesome-claude-skills@marketplace':[{}]
  }});
  const result=inspect({home:f.home,env:{},system});
  assert.equal(result.skillStates['awesome-claude-skills'].installed,false);
  assert.equal(result.skillStates['awesome-claude-skills'].collection,true);
 }finally {f.cleanup();}
});
test('Malformed plugin data stays unverified and does not crash',()=>{
 const f=sandbox();
 try {
  write(f.home,'.claude/plugins/installed_plugins.json','{not-json');
  const result=inspect({home:f.home,env:{},system});
  assert.equal(result.skillStates['ui-ux-pro-max'].installed,false);
 }finally {f.cleanup();}
});
