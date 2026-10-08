#!/usr/bin/env node
import readline from 'node:readline';
import {AGENTS, TOOLS, detect, plan, run, printStep} from './core.mjs';
import {inspect} from './status.mjs';
import {backup} from './backup.mjs';

const VERSION='0.4.0';
const args=process.argv.slice(2);
const tty=!!(process.stdin.isTTY&&process.stdout.isTTY);
const tint=(s,n)=>tty?'\x1b['+n+'m'+s+'\x1b[0m':s;
const accent=s=>tint(s,96),good=s=>tint(s,92),warn=s=>tint(s,93),strong=s=>tint(s,1);
const clear=()=>{if(tty)process.stdout.write('\x1b[2J\x1b[H');};
const system=detect();
const agentNames={claude:'Claude Code',codex:'OpenAI Codex'};
const toolNames=Object.fromEntries(TOOLS.map(t=>[t.id,t.name]));
const toolDescriptions={
  rtk:'Rút gọn kết quả Git, tìm kiếm và kiểm thử',
  headroom:'Nén ngữ cảnh qua proxy riêng (nâng cao)',
  caveman:'Giảm phần giải thích dài dòng của AI',
  ponytail:'Ưu tiên sửa code gọn, tránh làm quá mức'
};
const selectedAgents=new Set(AGENTS.filter(x=>system.found[x.bin]).map(x=>x.id));
if(!selectedAgents.size)selectedAgents.add('claude');
const selectedTools=new Set(['rtk','ponytail']);

function line(text=''){console.log(text);}
function header(title,subtitle=''){
  line(accent('╭────────────────────────────────────────────────────╮'));
  line(accent('│')+'  ⚡ '+strong('BOLT TOKEN SAVER')+'  ·  v'+VERSION+'                     '+accent('│'));
  line(accent('╰────────────────────────────────────────────────────╯'));
  line(' '+title);
  if(subtitle)line(tint(' '+subtitle,90));
  line();
}
function detectionLabel(found){return found?good('✓ Đã nhận diện'):warn('○ Chưa tìm thấy');}
function statusLabel(tool){
  return tool.installed?good('✓ Có dấu hiệu đã cài'):warn('○ Chưa xác nhận cài đặt');
}
function menuFooter(){line('\n '+accent('↑ ↓')+' Di chuyển  '+accent('Enter')+' Chọn  '+accent('Q')+' Thoát');}
function doctor(){
  const s=inspect();
  line('Bolt Token Saver v'+VERSION+' | '+s.system.os+' '+s.system.arch);
  for(const a of AGENTS)line(a.name.padEnd(14)+(s.system.found[a.bin]?'FOUND':'not found'));
  for(const t of TOOLS)line(t.name.padEnd(14)+(s.tools[t.id].installed?'detected':'not verified'));
  line('Configuration: '+(s.configs.claude.filePresent?'Claude settings found; ':'')+(s.configs.codex.filePresent?'Codex config found':''));
}
if(args.includes('--version')){line(VERSION);process.exit(0);}
if(args.includes('--help')){
  line('Bolt Token Saver '+VERSION+' — interactive token optimizer');
  line('Usage: npx -y github:0xmarkhydra/bolt-token-saver [--doctor|--status|--plan|--help]');
  line('Keyboard: ↑/↓ to move, Space to select, Enter to confirm, Esc to go back.');
  process.exit(0);
}
if(args.includes('--doctor')||args.includes('--status')){doctor();process.exit(0);}
if(args.includes('--plan')){
  doctor();
  const p=plan({agents:[...selectedAgents],tools:[...selectedTools],system});
  line('\nPreview only (no changes):');
  p.steps.forEach((s,i)=>line((i+1)+'. '+printStep(s)));
  p.warnings.forEach(w=>line('NOTE: '+w));
  process.exit(0);
}
if(Number(process.versions.node.split('.')[0])<20){console.error('Node.js 20+ is required');process.exit(1);}
if(!tty){console.error('Open a real terminal to use the menu. For information use --doctor or --plan.');process.exit(2);}

function listen(render,handler){
  return new Promise(resolve=>{
    let finished=false;
    const finish=value=>{
      if(finished)return;
      finished=true;
      process.stdin.off('keypress',keyListener);
      resolve(value);
    };
    const keyListener=(str,key={})=>{
      if(key.ctrl&&key.name==='c')return finish('quit');
      handler(str,key,finish);
    };
    process.stdin.on('keypress',keyListener);
    render();
  });
}
function menu({title,subtitle,options,footer=menuFooter}){
  let cursor=0;
  const render=()=>{
    clear();header(title,subtitle);
    options.forEach((o,i)=>{
      const current=i===cursor;
      line(' '+(current?accent('❯'):' ')+' '+(current?strong(o.name):o.name)+(o.detail?'  '+o.detail:''));
      if(o.description)line('     '+tint(o.description,90));
    });
    footer();
  };
  return listen(render,(str,key,finish)=>{
    if(key.name==='up'||str==='k'){cursor=(cursor-1+options.length)%options.length;render();}
    else if(key.name==='down'||str==='j'){cursor=(cursor+1)%options.length;render();}
    else if(key.name==='return')finish(options[cursor].id);
    else if(key.name==='escape')finish('back');
    else if(str==='q'||str==='Q')finish('quit');
    else if(/^[1-9]$/.test(str)){
      const index=Number(str)-1;
      if(index<options.length)finish(options[index].id);
    }
  });
}
function checklist({title,subtitle,items,selected}){
  let cursor=0;
  const render=()=>{
    clear();header(title,subtitle);
    items.forEach((o,i)=>{
      const mark=selected.has(o.id)?good('[✓]'):'[ ]';
      line(' '+(i===cursor?accent('❯'):' ')+' '+mark+' '+(i===cursor?strong(o.name):o.name)
       +(o.note?'  '+o.note:''));
      if(o.description)line('       '+tint(o.description,90));
    });
    line('\n '+accent('↑ ↓')+' Di chuyển  '+accent('Space')+' Bật/tắt  '+accent('Enter')+' Tiếp theo');
    line(' '+accent('Esc')+' Quay lại  '+accent('Q')+' Thoát');
    line(' '+tint('Chọn ít nhất một mục để tiếp tục.',90));
  };
  return listen(render,(str,key,finish)=>{
    if(key.name==='up'||str==='k'){cursor=(cursor-1+items.length)%items.length;render();}
    else if(key.name==='down'||str==='j'){cursor=(cursor+1)%items.length;render();}
    else if(key.name==='space'){
      const id=items[cursor].id;
      selected.has(id)?selected.delete(id):selected.add(id);
      render();
    } else if(key.name==='return'){
      if(selected.size)finish('next');else process.stdout.write('\x07');
    } else if(key.name==='escape')finish('back');
    else if(str==='q'||str==='Q')finish('quit');
  });
}
function waitBack(){
  line('\n '+accent('Enter / Esc')+' Quay về menu  '+accent('Q')+' Thoát');
  return listen(()=>{},(str,key,finish)=>{
    if(['return','escape'].includes(key.name))finish('back');
    else if(str==='q'||str==='Q')finish('quit');
  });
}
async function dashboard(){
  const s=inspect();
  const options=[
    {id:'setup',name:'1. Cài đặt tối ưu token',description:'Được hướng dẫn chọn Claude/Codex và công cụ phù hợp'},
    {id:'config',name:'2. Xem trạng thái & cấu hình',description:'Chỉ xem; tự động ẩn khóa API và endpoint'},
    {id:'help',name:'3. Hướng dẫn sử dụng',description:'Phím bấm, quyền truy cập và cách chạy AI'},
    {id:'quit',name:'4. Thoát'}
  ];
  let cursor=0;
  const render=()=>{
    clear();header('BẢNG ĐIỀU KHIỂN','Máy của bạn: '+s.system.os+' · '+s.system.arch);
    line(' TRỢ LÝ LẬP TRÌNH');
    for(const a of AGENTS)line('   '+a.name.padEnd(15)+' '+detectionLabel(s.system.found[a.bin]));
    line('\n CÔNG CỤ TỐI ƯU');
    for(const t of TOOLS){
      line('   '+t.name.padEnd(15)+' '+statusLabel(s.tools[t.id]));
    }
    line('\n '+strong('BẠN MUỐN LÀM GÌ?'));
    options.forEach((o,i)=>{
      line(' '+(i===cursor?accent('❯'):' ')+' '+(i===cursor?strong(o.name):o.name));
      if(i===cursor)line('     '+tint(o.description,90));
    });
    menuFooter();
    line(' '+tint('Ghi chú: "Đã cài" không đảm bảo công cụ đang hoạt động.',90));
  };
  return listen(render,(str,key,finish)=>{
    if(key.name==='up'||str==='k'){cursor=(cursor-1+options.length)%options.length;render();}
    else if(key.name==='down'||str==='j'){cursor=(cursor+1)%options.length;render();}
    else if(key.name==='return')finish(options[cursor].id);
    else if(key.name==='escape'||str==='q'||str==='Q')finish('quit');
    else if('1234'.includes(str)&&str?.length===1)finish(options[Number(str)-1].id);
  });
}
async function configScreen(){
  const s=inspect();
  clear();header('TRẠNG THÁI & CẤU HÌNH','Chỉ xem thông tin an toàn — không chỉnh file hoặc hiển thị API key');
  for(const a of AGENTS){
    const conf=s.configs[a.id];
    const label=a.id==='claude'?'CLAUDE CODE':'OPENAI CODEX';
    line(strong(' '+label)+'  '+detectionLabel(s.system.found[a.bin]));
    line('   Tệp cấu hình: '+(conf.filePresent?'Đã tìm thấy':'Chưa tìm thấy'));
    line('   Model:         '+conf.model);
    line('   Endpoint:      '+(conf.customEndpoint?'Có tùy chỉnh (ẩn địa chỉ)':'Mặc định hoặc chưa phát hiện'));
    line('   Khóa truy cập: '+(conf.credentialPresent?'Có thiết lập (đã ẩn)':'Không phát hiện từ biến môi trường'));
    line('   RTK hook:      '+(conf.rtkHook?'Có cấu hình liên quan RTK':'Chưa tìm thấy trong cấu hình'));
    if(a.id==='claude'){
      for(const t of ['caveman','ponytail']){
        const st=s.plugins[t];
        line('   '+toolNames[t]+': '+(st.claudeEnabled?'Đang bật trong settings'
          :st.claudeInstalled?'Đã tìm thấy plugin (chưa xác minh hoạt động)':'Chưa phát hiện plugin'));
      }
    } else {
      for(const t of ['caveman','ponytail'])
        line('   '+toolNames[t]+': '+(s.plugins[t].codexConfigured?'Có dấu hiệu cấu hình':'Chưa xác minh'));
    }
    line();
  }
  line(strong(' CÔNG CỤ CÀI ĐẶT TRÊN MÁY'));
  for(const t of TOOLS)line('   '+t.name.padEnd(13)+(s.tools[t.id].installed?'Đã nhận diện / tìm thấy cấu hình':'Chưa xác minh'));
  line('\n '+tint('Lưu ý: Đây là kiểm tra cấu hình tĩnh, không gửi yêu cầu AI và không đo token.',90));
  return waitBack();
}
async function helpScreen(){
  clear();header('HƯỚNG DẪN DỄ DÙNG');
  [
    ' 1. Chọn "Cài đặt tối ưu token" ở trang chủ.',
    ' 2. Chọn Claude Code, Codex hoặc cả hai.',
    ' 3. Mặc định RTK + Ponytail. Có thể chọn thêm 2 công cụ còn lại.',
    ' 4. Xem bản tóm tắt; nhấn X để xem các lệnh chi tiết.',
    ' 5. Chỉ khi đồng ý, chương trình mới tải/cài các công cụ.',
    ' 6. Khởi động lại Claude/Codex sau khi cài.',
    '',
    ' PHÍM BẤM',
    ' ↑↓: di chuyển     Space: chọn/bỏ chọn',
    ' Enter: xác nhận    Esc: quay lại    Q: thoát',
    '',
    ' Headroom cần chạy qua launcher riêng; không tự thay đổi proxy mặc định.',
    ' Backup nằm trong ~/.bolt-token-saver/backups/ nếu có cấu hình cần sao lưu.',
    ' Phần "Xem cấu hình" không hiện API key hay giá trị endpoint.'
  ].forEach(line);
  return waitBack();
}
async function confirmSetup(p){
  let yes=false,showDetail=false;
  const render=()=>{
    clear();header('XÁC NHẬN TRƯỚC KHI CÀI','Không thay đổi hệ thống cho đến khi bạn đồng ý');
    line(' Agent:    '+[...selectedAgents].map(x=>agentNames[x]).join(', '));
    line(' Công cụ:  '+[...selectedTools].map(x=>toolNames[x]).join(', '));
    line('\n SẮP THỰC HIỆN');
    line(' ✓ Tạo bản sao dự phòng cấu hình hiện tại (nếu có)');
    line(' ✓ Cài plugin / tool từ nhà phát triển tương ứng');
    line(' ✓ Thử kích hoạt tích hợp được hỗ trợ');
    line('\n '+(showDetail?accent('[D] Ẩn các lệnh kỹ thuật'):accent('[D] Xem các lệnh kỹ thuật (tùy chọn)')));
    if(showDetail){
      for(const [i,s] of p.steps.entries()){
        line('   '+String(i+1).padStart(2)+'. '+s.name);
        line('       '+tint(printStep(s),90));
      }
    }
    for(const w of p.warnings)line(' '+warn('! '+w));
    line('\n '+(yes?good('❯ [ĐỒNG Ý] Bắt đầu cài'):'  [ĐỒNG Ý] Bắt đầu cài'));
    line(' '+(!yes?accent('❯ [QUAY LẠI] Chỉnh lựa chọn'):'  [QUAY LẠI] Chỉnh lựa chọn'));
    line('\n '+accent('↑ ↓')+' Chọn  '+accent('Enter')+' Xác nhận  '+accent('D')+' Chi tiết  '+accent('Esc')+' Quay lại');
  };
  return listen(render,(str,key,finish)=>{
    if(['up','down','left','right','tab'].includes(key.name)){yes=!yes;render();}
    else if(str==='d'||str==='D'){showDetail=!showDetail;render();}
    else if(str==='y'||str==='Y')finish('install');
    else if(str==='n'||str==='N'||key.name==='escape')finish('back');
    else if(str==='q'||str==='Q')finish('quit');
    else if(key.name==='return')finish(yes?'install':'back');
  });
}
function sanitizeOutput(input){
  // Logs are third-party output. Mask likely credentials and never print env/config bodies.
  return input.replace(/\b(?:sk-[A-Za-z0-9_-]{10,}|gh[pousr]_[A-Za-z0-9_]{12,})\b/g,'[ĐÃ ẨN]')
    .replace(/((?:api[_-]?key|auth(?:orization)?|secret|token)\s*[:=]\s*)\S+/gi,'$1[ĐÃ ẨN]');
}
async function installScreen(p){
  clear();header('ĐANG CÀI ĐẶT','Quá trình có thể yêu cầu xác nhận quyền từ hệ điều hành');
  process.stdin.setRawMode(false);
  let summary;
  try {
    const saved=backup([...selectedAgents]);
    line(saved.directory?' ✓ Đã backup: '+saved.directory:' • Không có tệp cấu hình cần backup');
    summary=await run(p,{
      onState:(s,status)=>line(' '+(status==='ok'?good('✓'):status==='running'?accent('→'):warn('!'))+' '+s.name+': '+status),
      onOutput:data=>data.split(/\r?\n/).filter(Boolean).forEach(t=>line('   '+sanitizeOutput(t).slice(0,300)))
    });
  } catch(e){
    line(warn('\n Không thể sao lưu / chạy cài đặt: '+e.message));
    summary=[];
  } finally {process.stdin.setRawMode(true);}
  line('\n '+strong('KẾT QUẢ'));
  const ok=summary.filter(x=>['ok','skipped'].includes(x.status)).length;
  const incomplete=summary.filter(x=>!['ok','skipped'].includes(x.status));
  line(' '+good(ok+' bước hoàn tất hoặc đã có sẵn')+', '+(incomplete.length?warn(incomplete.length+' bước cần xử lý'):good('không có lỗi được báo')));
  for(const x of incomplete)line(' ! '+x.name+' — '+x.status+(x.message?': '+x.message:''));
  line('\n Khởi động lại Claude/Codex để các tích hợp mới có hiệu lực.');
  if(selectedTools.has('headroom')){
    line(' Headroom: dùng BOLT-CLAUDE / BOLT-CODEX launcher thay vì chạy agent trực tiếp.');
  }
  line(' Bạn có thể quay về trang chủ để kiểm tra lại cấu hình.');
  return waitBack();
}
async function setupWizard(){
  for(;;){
    const s=detect();
    const a=await checklist({
      title:'BƯỚC 1/2 — CHỌN TRỢ LÝ AI',
      subtitle:'Nếu đã cài Claude hoặc Codex, hệ thống tự đánh dấu giúp bạn',
      selected:selectedAgents,
      items:AGENTS.map(x=>({...x,note:s.found[x.bin]?good('Đã cài'):warn('Chưa cài — sẽ hướng dẫn/cài qua npm'),description:x.id==='claude'?'Dành cho Claude Code':'Dành cho OpenAI Codex'}))
    });
    if(a==='quit'||a==='back')return a;
    for(;;){
      const b=await checklist({
        title:'BƯỚC 2/2 — CHỌN CÔNG CỤ TỐI ƯU',
        subtitle:'Gợi ý: RTK + Ponytail; Headroom dành cho người có kinh nghiệm',
        selected:selectedTools,
        items:TOOLS.map(t=>({...t,description:toolDescriptions[t.id]}))
      });
      if(b==='quit')return 'quit';
      if(b==='back')break;
      const p=plan({system:s,agents:[...selectedAgents],tools:[...selectedTools]});
      const c=await confirmSetup(p);
      if(c==='quit')return 'quit';
      if(c==='back')continue;
      return installScreen(p);
    }
  }
}
async function main(){
  readline.emitKeypressEvents(process.stdin);
  process.stdin.resume();
  process.stdin.setRawMode(true);
  try {
    for(;;){
      const action=await dashboard();
      if(action==='quit')break;
      const result=action==='setup'?await setupWizard()
        :action==='config'?await configScreen():await helpScreen();
      if(result==='quit')break;
    }
  } finally {process.stdin.setRawMode(false);process.stdin.pause();process.stdout.write('\x1b[0m');}
}
main().catch(e=>{process.stdin.setRawMode(false);console.error(e);process.exitCode=1;});
