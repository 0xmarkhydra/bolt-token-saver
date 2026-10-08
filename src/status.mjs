import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {detect} from './core.mjs';

function readText(file) {
  try {
    if (fs.statSync(file).size > 1024 * 1024) return '';
    return fs.readFileSync(file, 'utf8');
  } catch { return ''; }
}
function readJson(file) {
  try { return JSON.parse(readText(file)); } catch { return {}; }
}
function exists(file) {
  try { return fs.statSync(file).isFile(); } catch { return false; }
}
function safeModel(value) {
  if (typeof value !== 'string') return 'Chưa xác định';
  // Whitelist characters only. Never echo URLs, credentials or free-form config.
  return value.length <= 60 && /^[\w./:-]+$/.test(value) && !value.includes('://')
    ? value : 'Đã thiết lập (ẩn nội dung)';
}
function pluginMentioned(value, plugin) {
  return !!value && new RegExp('(?:^|[^a-z])' + plugin + '(?:@|[^a-z]|$)','i')
    .test(typeof value === 'string' ? value : JSON.stringify(value));
}
function containsRtk(value) {
  return !!value && /(?:\brtk(?:\s|[-/\\])|rtk-rewrite)/i.test(
    typeof value === 'string' ? value : JSON.stringify(value));
}
/** Read-only, deliberately whitelisted config summary. Never expose raw settings. */
export function inspect(options={}) {
  const home=options.home||os.homedir();
  const env=options.env||process.env;
  const sys=options.system||detect();
  const claudeDir=env.CLAUDE_CONFIG_DIR||path.join(home,'.claude');
  const codexDir=env.CODEX_HOME||path.join(home,'.codex');
  const claudeFile=path.join(claudeDir,'settings.json');
  const codexFile=path.join(codexDir,'config.toml');
  const claude=readJson(claudeFile);
  const installed=readJson(path.join(claudeDir,'plugins','installed_plugins.json'));
  const enabled=claude.enabledPlugins||{};
  const codexToml=readText(codexFile);
  const codexHooks=readJson(path.join(codexDir,'hooks.json'));
  const codexModel=(codexToml.match(/^\s*model\s*=\s*"([^"\n]+)"/m)||[])[1];
  const plugins={};
  for(const id of ['caveman','ponytail']) {
    const claudeEnabled=Object.entries(enabled).some(([name,on])=>pluginMentioned(name,id)&&on===true);
    const claudeInstalled=pluginMentioned(Object.keys(installed.plugins||installed),id);
    const codexConfigured=pluginMentioned(codexHooks,id) ||
      exists(path.join(codexDir,'skills',id,'SKILL.md')) ||
      exists(path.join(home,'.agents','skills',id,'SKILL.md'));
    plugins[id]={claudeInstalled,claudeEnabled,codexConfigured};
  }
  return {
    system: sys,
    configs:{
      claude:{
        filePresent:exists(claudeFile),
        model:safeModel(claude.model||env.ANTHROPIC_MODEL),
        customEndpoint:!!(env.ANTHROPIC_BASE_URL||claude.env?.ANTHROPIC_BASE_URL),
        credentialPresent:!!(env.ANTHROPIC_API_KEY||env.ANTHROPIC_AUTH_TOKEN||claude.env?.ANTHROPIC_API_KEY||claude.env?.ANTHROPIC_AUTH_TOKEN),
        rtkHook:containsRtk(claude.hooks),
      },
      codex:{
        filePresent:exists(codexFile),
        model:safeModel(codexModel||env.OPENAI_MODEL),
        customEndpoint:!!(env.OPENAI_BASE_URL||/\bbase_url\s*=/i.test(codexToml)),
        credentialPresent:!!(env.OPENAI_API_KEY),
        rtkHook:containsRtk(codexHooks),
      }
    },
    tools:{
      rtk:{installed:!!sys.found.rtk,details:'Cần kiểm tra hook riêng trong phần cấu hình'},
      headroom:{installed:!!sys.found.headroom,details:'Chỉ hoạt động khi chạy qua BOLT-CLAUDE / BOLT-CODEX'},
      caveman:{installed:plugins.caveman.claudeInstalled||plugins.caveman.codexConfigured,
        details:plugins.caveman.claudeEnabled?'Claude: plugin bật':'Cần xác minh plugin/skill trong agent'},
      ponytail:{installed:plugins.ponytail.claudeInstalled||plugins.ponytail.codexConfigured,
        details:plugins.ponytail.claudeEnabled?'Claude: plugin bật':'Cần xác minh plugin/skill trong agent'},
    },
    plugins
  };
}
