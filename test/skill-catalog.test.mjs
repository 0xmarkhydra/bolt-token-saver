import {test} from 'node:test';
import assert from 'node:assert/strict';
import {SKILL_CATALOG,getSkill,planSkill,skillUrl} from '../src/skill-catalog.mjs';
const sys=(found={})=>({platform:'darwin',arch:'arm64',found:{claude:true,codex:true,git:true,npx:true,uvx:true,...found}});
test('catalog contains exactly 10 unique repos from the list',()=>{
  assert.equal(SKILL_CATALOG.length,10);
  assert.equal(new Set(SKILL_CATALOG.map(s=>s.id)).size,10);
  assert.equal(new Set(SKILL_CATALOG.map(s=>s.repo)).size,10);
  assert.equal(getSkill('archify').repo,'tt-a1i/archify');
});
test('existing Ponytail and Caveman are referenced, not installed twice',()=>{
  for(const id of ['ponytail','caveman']){
    const p=planSkill(id,['claude'],sys());
    assert.equal(p.steps.length,0);
    assert.ok(p.notes.some(n=>n.includes('Dashboard')));
  }
});
test('Awesome Claude Skills is directory only; never batch-installed',()=>{
  const p=planSkill('awesome-claude-skills',['claude','codex'],sys());
  assert.equal(p.steps.length,0);
  assert.ok(p.notes.some(n=>n.includes('tham khảo')));
});
test('Superpowers Claude plugin is installable; Codex uses official manual plugin UI',()=>{
  const p=planSkill('superpowers',['claude','codex'],sys());
  assert.equal(p.steps.length,1);
  assert.deepEqual(p.steps[0].args,['plugin','install','superpowers@claude-plugins-official']);
  assert.ok(p.notes.some(n=>n.includes('/plugins')));
});
test('UI UX skill has Claude plugin and Codex universal skill',()=>{
  const p=planSkill('ui-ux-pro-max',['claude','codex'],sys());
  assert.equal(p.steps.length,3);
  assert.ok(p.steps.some(s=>s.cmd==='npx'&&s.args.includes('--ai')&&s.args.includes('universal')));
});
test('Graphify uses official graphifyy PyPI distribution and uvx',()=>{
  const p=planSkill('graphify',['claude','codex'],sys());
  assert.equal(p.steps.length,2);
  assert.ok(p.steps.every(s=>s.cmd==='uvx'&&s.args.includes('graphifyy')));
});
test('Graphify without uvx only provides prerequisite message',()=>{
  const p=planSkill('graphify',['claude'],sys({uvx:false}));
  assert.equal(p.steps.length,0);
  assert.ok(p.notes.some(n=>n.includes('uv')));
});
test('Addy agent skills native commands registered for both agents',()=>{
  const p=planSkill('addy-agent-skills',['claude','codex'],sys());
  assert.equal(p.steps.length,4);
  assert.ok(p.steps.some(s=>s.cmd==='codex'&&s.args.includes('agent-skills@agent-skills')));
});
test('Understand Anything does not pipe shell/PowerShell installer in Codex',()=>{
  const p=planSkill('understand-anything',['codex'],sys());
  assert.equal(p.steps.length,0);
  assert.ok(p.notes.some(n=>n.includes('script')));
});
test('Archify uses correct repo + explicit agents',()=>{
  const p=planSkill('archify',['claude','codex'],sys());
  assert.equal(p.steps.length,2);
  assert.ok(p.steps.every(s=>s.args.includes('tt-a1i/archify')));
  assert.ok(p.steps.some(s=>s.args.includes('claude-code')));
  assert.ok(p.steps.some(s=>s.args.includes('codex')));
});
test('Impeccable installs as one command for both selected agents',()=>{
  const p=planSkill('impeccable',['claude','codex'],sys());
  assert.equal(p.steps.length,1);
  assert.ok(p.steps[0].args.includes('--providers=claude,codex'));
  assert.ok(p.steps[0].args.includes('--scope=global'));
});
test('new skills do not try to install for absent agent',()=>{
  const p=planSkill('impeccable',['claude','codex'],sys({claude:false,codex:false}));
  assert.equal(p.steps.length,0);
  assert.ok(p.notes.some(n=>n.includes('chưa được phát hiện')));
});
test('the catalog uses only allowlisted commands without shell expressions',()=>{
  const commands=new Set(['npx','claude','codex','uvx']);
  for(const skill of SKILL_CATALOG)for(const agent of ['claude','codex']){
    const p=planSkill(skill.id,[agent],sys());
    for(const step of p.steps){
      assert.ok(commands.has(step.cmd),skill.id+': '+step.cmd);
      assert.ok(step.args.every(arg=>typeof arg==='string'));
      assert.ok(!step.args.some(arg=>/[\r\n;&|><]/.test(arg)));
      assert.ok(skillUrl(skill).startsWith('https://github.com/'));
    }
  }
});
test('unknown skill and unknown agent are rejected',()=>{
  assert.throws(()=>planSkill('not-a-skill',['claude'],sys()));
  assert.throws(()=>planSkill('archify',['random'],sys()));
});
