import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {detect} from './core.mjs';
import {SKILL_CATALOG} from './skill-catalog.mjs';
import {detectHeadroom} from './headroom-status.mjs';
import {PONYTAIL_SKILLS} from './ponytail.mjs';

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

// Restrict filesystem probing to known plugin cache locations and six exact files.
function childDirs(dir) {
  try { return fs.readdirSync(dir,{withFileTypes:true})
    .filter(e=>e.isDirectory()&&!e.isSymbolicLink()).slice(0,64)
    .map(e=>path.join(dir,e.name)); }
  catch { return []; }
}
function ponytailCacheRoots(agentDir) {
  const roots=[];
  for(const marketplace of childDirs(path.join(agentDir,'plugins','cache'))) {
    for(const plugin of childDirs(marketplace)) {
      if(path.basename(plugin)==='ponytail') roots.push(plugin,...childDirs(plugin));
    }
  }
  return roots;
}
function ponytailSkillsState({home,claudeDir,codexDir,installed,enabled,codexToml}) {
  const registry=installed.plugins&&typeof installed.plugins==='object'?installed.plugins:{};
  const registeredEntries=Object.entries(registry).filter(([key])=>key.toLowerCase().startsWith('ponytail@'));
  const claudeRegistered=registeredEntries.length>0;
  const claudeEnabled=Object.entries(enabled).some(([key,v])=>key.toLowerCase().startsWith('ponytail@')&&v===true);
  const claudeDisabled=Object.entries(enabled).some(([key,v])=>key.toLowerCase().startsWith('ponytail@')&&v===false);
  const claudeRoots=[...ponytailCacheRoots(claudeDir),path.join(claudeDir,'plugins','ponytail')];
  for(const [,versions] of registeredEntries) {
    for(const entry of Array.isArray(versions)?versions:[versions]) {
      if(typeof entry?.installPath==='string'&&path.isAbsolute(entry.installPath))
        claudeRoots.push(entry.installPath);
    }
  }
  const codexRoots=[...ponytailCacheRoots(codexDir),path.join(codexDir,'plugins','ponytail')];
  const codexSection=codexToml.match(/^\s*\[plugins\.(?:"ponytail@ponytail"|'ponytail@ponytail')\]([^]*?)(?=^\s*\[|$(?![\s\S]))/m);
  const codexRegistered=!!codexSection;
  const codexEnabled=codexRegistered&&!/^\s*enabled\s*=\s*false\b/m.test(codexSection[1]);
  const skills={};
  for(const {id} of PONYTAIL_SKILLS) {
    const claudeAvailable=exists(path.join(claudeDir,'skills',id,'SKILL.md'))||
      claudeRoots.some(root=>exists(path.join(root,'skills',id,'SKILL.md')));
    const codexAvailable=exists(path.join(codexDir,'skills',id,'SKILL.md'))||
      exists(path.join(home,'.agents','skills',id,'SKILL.md'))||
      codexRoots.some(root=>exists(path.join(root,'skills',id,'SKILL.md')));
    skills[id]={claude:claudeAvailable,codex:codexAvailable};
  }
  const count=agent=>PONYTAIL_SKILLS.filter(x=>skills[x.id][agent]).length;
  return {
    claude:{registered:claudeRegistered,enabled:claudeEnabled,disabled:claudeDisabled,available:count('claude')},
    codex:{registered:codexRegistered,enabled:codexEnabled,available:count('codex')},
    skills,
    total:PONYTAIL_SKILLS.length
  };
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
  const ponytail=ponytailSkillsState({home,claudeDir,codexDir,installed,enabled,codexToml});
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
  // Ponytail catalog status requires the bundled files, not a registry entry alone.
  skillStates.ponytail={
    claude:{installed:ponytail.claude.available===ponytail.total,enabled:ponytail.claude.enabled},
    codex:{installed:ponytail.codex.available===ponytail.total},
    installed:ponytail.claude.available===ponytail.total||ponytail.codex.available===ponytail.total
  };
  const plugins={};
  for(const id of ['caveman','ponytail']) {
    const claudeEnabled=Object.entries(enabled).some(([name,on])=>pluginMentioned(name,id)&&on===true);
    const claudeInstalled=pluginMentioned(Object.keys(installed.plugins||installed),id);
    const codexConfigured=(id==='ponytail'&&ponytail.codex.registered) || pluginMentioned(codexHooks,id) ||
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
      ponytail:{installed:skillStates.ponytail.installed,
        registered:ponytail.claude.registered||ponytail.codex.registered,
        configured:plugins.ponytail.claudeEnabled||ponytail.codex.registered||ponytail.claude.available>0||ponytail.codex.available>0,
        details:plugins.ponytail.claudeEnabled?'Plugin được bật theo settings Claude; kiểm tra plugin registry để xác minh cài đặt.':'Chưa xác minh; kiểm tra Claude plugin list hoặc skill.'},
    },
    plugins,
    ponytail,
    skillStates
  };
}