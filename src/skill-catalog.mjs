/**
 * Curated, opt-in external skill catalog.
 * Compatibility describes upstream published instructions, NOT a tested installation.
 * All commands are literal allowlisted descriptors; nothing is executed on import.
 */
export const SKILL_CATALOG = [
  {
    id:'superpowers',name:'Superpowers',repo:'obra/superpowers',
    about:'Lập kế hoạch, TDD, review và quy trình lập trình',
    type:'plugin',agents:['claude','codex'],automated:['claude'],
    note:'Codex: cài trong /plugins (marketplace chính thức); không tự chạy qua TUI.',
    risk:'Có thể thay đổi quy trình/hook của agent.'
  },
  {
    id:'ponytail',name:'Ponytail',repo:'DietrichGebert/ponytail',
    about:'Viết code gọn, hạn chế làm quá mức',
    type:'core',agents:['claude','codex'],automated:[],
    note:'Đã có tại mục Cài đặt tối ưu token.'
  },
  {
    id:'ui-ux-pro-max',name:'UI UX Pro Max',repo:'nextlevelbuilder/ui-ux-pro-max-skill',
    about:'Thiết kế UI/UX và hệ thống design',
    type:'skill',agents:['claude','codex'],automated:['claude','codex'],
    risk:'Có thể cài skill phạm vi toàn user.'
  },
  {
    id:'graphify',name:'Graphify',repo:'Graphify-Labs/graphify',
    about:'Đồ thị mã nguồn; tìm quan hệ và hiểu project',
    type:'skill',agents:['claude','codex'],automated:['claude','codex'],
    note:'Cần uv; gói PyPI đúng là graphifyy (2 chữ y).'
  },
  {
    id:'caveman',name:'Caveman',repo:'JuliusBrussee/caveman',
    about:'AI phản hồi ngắn gọn hơn',
    type:'core',agents:['claude','codex'],automated:[],
    note:'Đã có tại mục Cài đặt tối ưu token.'
  },
  {
    id:'addy-agent-skills',name:'Addy Osmani Skills',repo:'addyosmani/agent-skills',
    about:'Quy trình spec → code → test → review → ship',
    type:'plugin',agents:['claude','codex'],automated:['claude','codex'],
    risk:'Gói nhiều kỹ năng; có thể bổ sung lệnh và thay đổi hành vi agent.'
  },
  {
    id:'understand-anything',name:'Understand Anything',repo:'Egonex-AI/Understand-Anything',
    about:'Phân tích codebase và tạo bản đồ kiến thức',
    type:'plugin',agents:['claude','codex'],automated:['claude'],
    note:'Codex cần installer riêng cần xem script trước khi chạy.',
    risk:'Lần phân tích codebase đầu tiên có thể tiêu thụ nhiều token.'
  },
  {
    id:'awesome-claude-skills',name:'Awesome Claude Skills',repo:'ComposioHQ/awesome-claude-skills',
    about:'Danh sách tổng hợp hàng nghìn skill bên thứ ba',
    type:'collection',agents:['claude','codex'],automated:[],
    note:'Chỉ là catalog, không phải một plugin để cài toàn bộ.'
  },
  {
    id:'archify',name:'Archify',repo:'tt-a1i/archify',
    about:'Vẽ sơ đồ tương tác từ code và mô tả',
    type:'skill',agents:['claude','codex'],automated:['claude','codex'],
    note:'Chủ repo đúng là tt-a1i (số 1), không phải tt-ali.'
  },
  {
    id:'impeccable',name:'Impeccable',repo:'pbakaus/impeccable',
    about:'Review giao diện, polish UI và quy tắc thiết kế',
    type:'skill',agents:['claude','codex'],automated:['claude','codex'],
    risk:'Có thể đăng ký hook và tải binary khi sử dụng; cần xác nhận.'
  },
];

export const getSkill=id=>SKILL_CATALOG.find(x=>x.id===id)||null;
export const skillUrl=skill=>'https://github.com/'+skill.repo;
const cmd=(name,exec,args,needs=[],opts={})=>({name,cmd:exec,args,needs,...opts});
/**
 * Return a safe preview; manual actions are instructions, not executable commands.
 * Tool install commands have no user-controlled text arguments.
 */
export function planSkill(id,agents,system){
  const skill=getSkill(id);
  if(!skill)throw Error('Skill không hợp lệ');
  if(!Array.isArray(agents)||!agents.length||agents.some(x=>!['claude','codex'].includes(x)))
    throw Error('Hãy chọn Claude Code hoặc Codex');
  const steps=[],notes=[],warnings=[];
  if(skill.type==='core'){
    notes.push('Công cụ này đã nằm trong luồng tối ưu token ở Dashboard. Chọn mục 1.');
    return {skill,steps,notes,warnings};
  }
  if(skill.type==='collection'){
    notes.push('Đây là danh sách tham khảo. Mở '+skillUrl(skill)+' để chọn từng skill, không cài hàng loạt.');
    return {skill,steps,notes,warnings};
  }
  const selected=agents.filter(x=>skill.agents.includes(x));
  if(!selected.length)throw Error('Skill không hỗ trợ agent đã chọn');
  const has=system?.found||{};
  if(skill.risk)warnings.push(skill.risk);
  for(const agent of selected){
    if(!has[agent]){
      notes.push((agent==='claude'?'Claude Code':'Codex')+' chưa được phát hiện; hãy cài agent trước.');
      continue;
    }
    if(!skill.automated.includes(agent)){
      if(id==='superpowers')
        notes.push('Codex: mở Codex CLI, nhập /plugins, tìm Superpowers rồi chọn Install Plugin.');
      else if(id==='understand-anything')
        notes.push('Codex: xem install.sh/install.ps1 ở repo chính thức, kiểm tra script và xin phép trước khi cài.');
      else
        notes.push('Agent này cần cài thủ công theo '+skillUrl(skill));
      continue;
    }
    switch(id){
      case 'superpowers':
        steps.push(cmd('Cài Superpowers cho Claude','claude',['plugin','install','superpowers@claude-plugins-official'],['claude']));
        break;
      case 'ui-ux-pro-max':
        if(agent==='claude'){
          steps.push(cmd('Thêm UI UX marketplace','claude',['plugin','marketplace','add','nextlevelbuilder/ui-ux-pro-max-skill'],['claude']));
          steps.push(cmd('Cài UI UX Pro Max cho Claude','claude',['plugin','install','ui-ux-pro-max@ui-ux-pro-max-skill'],['claude']));
        }else{
          steps.push(cmd('Cài UI UX Pro Max cho Codex (global)','npx',['--yes','--package=ui-ux-pro-max-cli','uipro','init','--ai','universal','--global'],['npx']));
          notes.push('Codex đọc skill universal ở ~/.agents/skills; kiểm tra lại sau cài.');
        }
        break;
      case 'graphify':
        if(!has.uvx){
          notes.push('Graphify cần uv/uvx; cài uv từ https://docs.astral.sh/uv/getting-started/installation/ rồi chạy lại.');
        }else{
          steps.push(cmd('Cài Graphify skill cho '+(agent==='claude'?'Claude':'Codex'),
            'uvx',['--from','graphifyy','graphify',agent,'install'],['uvx']));
        }
        break;
      case 'addy-agent-skills':
        if(agent==='claude'){
          steps.push(cmd('Thêm Addy Skills marketplace Claude','claude',['plugin','marketplace','add','addyosmani/agent-skills'],['claude']));
          steps.push(cmd('Cài Addy Skills cho Claude','claude',['plugin','install','agent-skills@addy-agent-skills'],['claude']));
        }else{
          steps.push(cmd('Thêm Addy Skills marketplace Codex','codex',['plugin','marketplace','add','addyosmani/agent-skills'],['codex']));
          steps.push(cmd('Cài Addy Skills cho Codex','codex',['plugin','add','agent-skills@agent-skills'],['codex']));
        }
        break;
      case 'understand-anything':
        steps.push(cmd('Thêm Understand Anything marketplace','claude',['plugin','marketplace','add','Egonex-AI/Understand-Anything'],['claude']));
        steps.push(cmd('Cài Understand Anything cho Claude','claude',['plugin','install','understand-anything'],['claude']));
        break;
      case 'archify':
        steps.push(cmd('Cài Archify skill cho '+(agent==='claude'?'Claude':'Codex'),
          'npx',['--yes','skills','add','tt-a1i/archify','--skill','archify','--agent',agent==='claude'?'claude-code':'codex','--global','--copy','--yes'],['npx','git']));
        break;
      case 'impeccable':
        // Install once for all selected supported agents, outside per-agent loop.
        break;
      default: throw Error('Không có kế hoạch cài tự động cho '+id);
    }
  }
  if(id==='impeccable'){
    const candidates=selected.filter(a=>has[a]);
    if(candidates.length){
      steps.push(cmd('Cài Impeccable cho '+candidates.join(' và '),'npx',
        ['--yes','impeccable','install','--providers='+candidates.join(','),'--scope=global'],['npx']));
      notes.push('Impeccable có thể cài hooks vào project; Codex có thể cần duyệt /hooks.');
    }
  }
  if(!steps.length)notes.push('Không có lệnh nào được thực hiện tự động cho lựa chọn này.');
  return {skill,steps,notes,warnings};
}
