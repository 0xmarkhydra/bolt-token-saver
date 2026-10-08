import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=f=>fs.readFileSync(path.join(root,f),'utf8');
const mustHave=['AI_SETUP.md','AGENTS.md','CLAUDE.md','docs/PRODUCT.md','docs/ARCHITECTURE.md','docs/CONFIGURATION.md','docs/DEVELOPMENT.md','docs/AI-HANDOFF.md','docs/FEATURE-SPEC-TEMPLATE.md','docs/SKILL-CATALOG.md'];

test('AI entrypoints and referenced project documents exist',()=>{
  for(const file of mustHave) assert.ok(fs.statSync(path.join(root,file)).isFile(),file);
  assert.match(read('CLAUDE.md'),/^@AGENTS\.md$/m,'Claude must import shared instructions');
  assert.match(read('AGENTS.md'),/npm run check/);
});

test('relative Markdown document links resolve',()=>{
  const docs=['README.md','AGENTS.md',...mustHave];
  for (const file of new Set(docs)){
    const markdown=read(file);
    for(const match of markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g)){
      const link=match[1].split('#')[0];
      if(!link||/^(?:https?:|mailto:|#)/i.test(link))continue;
      const resolved=path.resolve(root,path.dirname(file),decodeURIComponent(link));
      assert.ok(fs.existsSync(resolved),file+' -> '+link);
    }
  }
});

test('agent instructions map matches actual source/test files',()=>{
  const content=read('AGENTS.md');
  const paths=['src/cli.mjs','src/core.mjs','src/status.mjs','src/backup.mjs','src/skill-catalog.mjs',
  'run-macos-linux.sh','RUN-WINDOWS.cmd','test/core.test.mjs','test/status.test.mjs'];
  for(const file of paths){
    assert.ok(fs.existsSync(path.join(root,file)),file);
    assert.ok(content.includes(file)||file.startsWith('test/'),file);
  }
});

test('documentation explicitly avoids false verification claims',()=>{
  assert.match(read('docs/CONFIGURATION.md'),/not equivalent|not proof|not implemented/i);
  assert.match(read('docs/PRODUCT.md'),/Not implemented/i);
  assert.match(read('docs/AI-HANDOFF.md'),/Do not push or publish without permission/);
});
