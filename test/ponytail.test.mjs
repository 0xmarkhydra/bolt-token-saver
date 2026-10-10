import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspect} from '../src/status.mjs';
import {plan} from '../src/core.mjs';
import {PONYTAIL_SKILLS,ponytailCommand} from '../src/ponytail.mjs';

const system={os:'macOS',platform:'darwin',arch:'arm64',found:{claude:true,codex:true}};
function fixture(){const home=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-ponytail-'));return {home,close:()=>fs.rmSync(home,{recursive:true,force:true})};}
function put(home,file,text=''){const location=path.join(home,file);fs.mkdirSync(path.dirname(location),{recursive:true});fs.writeFileSync(location,text);}
function skillFiles(home,root,ids=PONYTAIL_SKILLS.map(s=>s.id)){
 for(const id of ids)put(home,root+'/skills/'+id+'/SKILL.md','# '+id);
}
test('six official skills map to Claude and namespaced Codex commands',()=>{
 assert.equal(PONYTAIL_SKILLS.length,6);
 assert.equal(new Set(PONYTAIL_SKILLS.map(s=>s.id)).size,6);
 assert.equal(ponytailCommand('claude','ponytail-review'),'/ponytail-review');
 assert.equal(ponytailCommand('codex','ponytail-review'),'$ponytail:ponytail-review');
});
test('reports 6/6 separately from Claude and Codex plugin caches, without reading config secrets',()=>{
 const f=fixture();try{
  skillFiles(f.home,'.claude/plugins/cache/ponytail/ponytail/5.1.0');
  skillFiles(f.home,'.codex/plugins/cache/ponytail/ponytail/5.1.0');
  put(f.home,'.claude/plugins/installed_plugins.json',JSON.stringify({plugins:{'ponytail@ponytail':[{}]}}));
  put(f.home,'.claude/settings.json',JSON.stringify({enabledPlugins:{'ponytail@ponytail':true},env:{ANTHROPIC_API_KEY:'TOP-SECRET'}}));
  put(f.home,'.codex/config.toml','[plugins."ponytail@ponytail"]\nenabled = true\n[model_providers.internal]\nbase_url = "https://secret-host"\n');
  const r=inspect({home:f.home,env:{},system});
  assert.equal(r.ponytail.total,6);
  assert.equal(r.ponytail.claude.available,6);
  assert.equal(r.ponytail.codex.available,6);
  assert.equal(r.ponytail.claude.registered,true);
  assert.equal(r.ponytail.codex.registered,true);
  assert.equal(r.ponytail.codex.enabled,true);
  assert.equal(r.plugins.ponytail.codexConfigured,true);
  assert.equal(JSON.stringify(r).includes('TOP-SECRET'),false);
  assert.equal(JSON.stringify(r).includes('secret-host'),false);
 }finally{f.close();}
});
test('disabled Codex plugin and partial skill files never report active/6 of 6',()=>{
 const f=fixture();try{
  skillFiles(f.home,'.codex/plugins/cache/ponytail/ponytail/5.1.0',['ponytail']);
  put(f.home,'.codex/config.toml','[plugins."ponytail@ponytail"]\nenabled = false\n');
  const r=inspect({home:f.home,env:{},system});
  assert.equal(r.ponytail.codex.available,1);
  assert.equal(r.ponytail.codex.enabled,false);
  assert.equal(r.ponytail.claude.available,0);
  assert.equal(r.ponytail.skills['ponytail-audit'].codex,false);
 }finally{f.close();}
});
test('Claude registry installPath is supported without revealing paths',()=>{
 const f=fixture();try{
  const plugin=path.join(f.home,'plugin-cache');
  skillFiles(f.home,'plugin-cache');
  put(f.home,'.claude/plugins/installed_plugins.json',JSON.stringify({plugins:{'ponytail@ponytail':[{installPath:plugin}]}}));
  const r=inspect({home:f.home,env:{},system});
  assert.equal(r.ponytail.claude.available,6);
  assert.equal(JSON.stringify(r).includes(plugin),false);
 }finally{f.close();}
});
test('standalone Codex skills are detected even without a plugin registry',()=>{
 const f=fixture();try{
  put(f.home,'.agents/skills/ponytail-review/SKILL.md','# ponytail-review');
  const r=inspect({home:f.home,env:{},system});
  assert.equal(r.ponytail.codex.registered,false);
  assert.equal(r.ponytail.codex.available,1);
  assert.equal(r.ponytail.claude.available,0);
 }finally{f.close();}
});
test('planner only installs Ponytail on agent where plugin is not registered',()=>{
 const p=plan({system,agents:['claude','codex'],tools:['ponytail'],
  ponytailStatus:{claude:{registered:true},codex:{registered:false}}});
 assert.equal(p.steps.some(s=>s.cmd==='claude'&&s.args.includes('ponytail@ponytail')),false);
 assert.equal(p.steps.some(s=>s.cmd==='codex'&&s.args.includes('ponytail@ponytail')),true);
 assert.ok(p.warnings.some(s=>s.includes('bỏ qua cài trùng')));
});
test('malformed registries never pretend Ponytail is installed',()=>{
 const f=fixture();try{
  put(f.home,'.claude/plugins/installed_plugins.json','{not json');
  const r=inspect({home:f.home,env:{},system});
  assert.equal(r.ponytail.claude.available,0);
  assert.equal(r.ponytail.codex.available,0);
  assert.equal(r.ponytail.claude.registered,false);
 }finally{f.close();}
});
