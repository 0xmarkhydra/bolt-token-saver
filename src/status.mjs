import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {detect} from './core.mjs';
import {SKILL_CATALOG} from './skill-catalog.mjs';
import {detectHeadroom} from './headroom-status.mjs';

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
  // Known filesystem/registry evidence only. Absence is "not verified", never "not installed".
  const aliases={
    'addy-agent-skills':'agent-skills',
    'ui-ux-pro-max':'ui-ux-pro-max',
  };
  const entries=Object.keys(installed.plugins||installed);
  const skillStates={};
  for(const skill of SKILL_CATALOG){
    const key=aliases[skill.id]||skill.id;
    if(skill.type==='collection'){
      skillStates[skill.id]={claude:{installed:false,enabled:false},codex:{installed:false},installed:false,collection:true};
      continue;
    }
    const claudePlugin=entries.some(name=>pluginMentioned(name,key));
    const enabledEntry=Object.entries(enabled).some(([name,isOn])=>pluginMentioned(name,key)&&isOn===true);
    const claudeSkill=exists(path.join(claudeDir,'skills',key,'SKILL.md'));
    const codexSkill=exists(path.join(codexDir,'skills',key,'SKILL.md')) ||
      exists(path.join(home,'.agents','skills',key,'SKILL.md'));
    skillStates[skill.id]={
      claude:{installed:claudePlugin||claudeSkill,enabled:enabledEntry},
      codex:{installed:codexSkill},
      installed:claudePlugin||claudeSkill||codexSkill||enabledEntry
    };
  }
  const plugins={};
  for(const id of ['caveman','ponytail']) {
    const claudeEnabled=Object.entries(enabled).some(([name,on])=>pluginMentioned(name,id)&&on===true);
    const claudeInstalled=pluginMentioned(Object.keys(installed.plugins||installed),id);
    const codexConfigured=pluginMentioned(codexHooks,id) ||
      exists(path.join(codexDir,'skills',id,'SKILL.md')) ||
      exists(path.join(home,'.agents','skills',id,'SKILL.md'));
    plugins[id]={claudeInstalled,claudeEnabled,codexConfigured};
  }
  const headroom=detectHeadroom({found:sys.found,uvToolList:options.uvToolList,uvPath:options.uvPath,execute:options.uvExecute});
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
      headroom,
      caveman:{installed:skillStates.caveman.claude.installed||skillStates.caveman.codex.installed,
        configured:plugins.caveman.claudeEnabled,
        details:plugins.caveman.claudeEnabled?'Plugin được bật theo settings Claude; cài đặt thực tế cần xác minh trong plugin registry.':'Chưa xác minh; kiểm tra Claude plugin list hoặc skill.'},
      ponytail:{installed:skillStates.ponytail.claude.installed||skillStates.ponytail.codex.installed,
        configured:plugins.ponytail.claudeEnabled,
        details:plugins.ponytail.claudeEnabled?'Plugin được bật theo settings Claude; kiểm tra plugin registry để xác minh cài đặt.':'Chưa xác minh; kiểm tra Claude plugin list hoặc skill.'},
    },
    plugins,
    skillStates
  };
}
