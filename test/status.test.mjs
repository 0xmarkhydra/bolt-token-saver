import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {inspect} from '../src/status.mjs';
const fake={os:'Windows',platform:'win32',arch:'x64',found:{claude:true,codex:true,rtk:true,headroom:false}};
function fixture(){
 const home=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-status-'));
 fs.mkdirSync(path.join(home,'.claude','plugins'),{recursive:true});
 fs.mkdirSync(path.join(home,'.codex'),{recursive:true});
 return {home,done:()=>fs.rmSync(home,{recursive:true,force:true})};
}
test('read-only status works without configs',()=>{
 const f=fixture();
 try{
   const result=inspect({home:f.home,env:{},system:fake});
   assert.equal(result.system.os,'Windows');
   assert.equal(result.configs.claude.filePresent,false);
   assert.equal(result.configs.codex.filePresent,false);
   assert.equal(result.tools.rtk.installed,true);
   assert.equal(result.tools.headroom.installed,false);
 }finally{f.done();}
});
test('status detects Claude plugins and RTK hook but never returns raw credentials',()=>{
 const f=fixture();
 try{
   const key='sk-test-this-must-never-appear-anywhere';
   const endpoint='https://private.example.internal/?token=should-not-appear';
   fs.writeFileSync(path.join(f.home,'.claude','settings.json'),JSON.stringify({
      model:'claude-opus-4-1',
      env:{ANTHROPIC_BASE_URL:endpoint,ANTHROPIC_API_KEY:key},
      enabledPlugins:{'caveman@caveman':true,'ponytail@ponytail':false},
      hooks:{PreToolUse:[{command:'rtk hook claude'}]}
   }));
   fs.writeFileSync(path.join(f.home,'.claude','plugins','installed_plugins.json'),
     JSON.stringify({plugins:{'caveman@caveman':[{}],'ponytail@ponytail':[{}]}}));
   const value=inspect({home:f.home,env:{},system:fake});
   assert.equal(value.configs.claude.model,'claude-opus-4-1');
   assert.equal(value.configs.claude.customEndpoint,true);
   assert.equal(value.configs.claude.credentialPresent,true);
   assert.equal(value.configs.claude.rtkHook,true);
   assert.equal(value.plugins.caveman.claudeInstalled,true);
   assert.equal(value.plugins.caveman.claudeEnabled,true);
   assert.equal(value.plugins.ponytail.claudeInstalled,true);
   assert.equal(value.plugins.ponytail.claudeEnabled,false);
   const printed=JSON.stringify(value);
   assert.equal(printed.includes(key),false);
   assert.equal(printed.includes(endpoint),false);
   assert.equal(printed.includes('should-not-appear'),false);
 }finally{f.done();}
});
test('Codex settings are summarized without disclosing base URL',()=>{
 const f=fixture();
 try{
   const endpoint='https://secret-host.example/api?secret=topsecret';
   fs.writeFileSync(path.join(f.home,'.codex','config.toml'),`model = "gpt-6"
[model_providers.private]
base_url = "${endpoint}"
`);
   fs.writeFileSync(path.join(f.home,'.codex','hooks.json'),'{"hooks":[{"command":"rtk hook codex"}]}');
   const summary=inspect({home:f.home,env:{OPENAI_API_KEY:'SECRET-VALUE'},system:fake});
   assert.equal(summary.configs.codex.model,'gpt-6');
   assert.equal(summary.configs.codex.customEndpoint,true);
   assert.equal(summary.configs.codex.rtkHook,true);
   assert.equal(summary.configs.codex.credentialPresent,true);
   assert.equal(JSON.stringify(summary).includes('topsecret'),false);
   assert.equal(JSON.stringify(summary).includes('SECRET-VALUE'),false);
 }finally{f.done();}
});
