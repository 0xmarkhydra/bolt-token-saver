import {spawnSync} from 'node:child_process';
import {which} from './core.mjs';

/**
 * Check only package names returned by a read-only uv command. This does not
 * activate Headroom, load a proxy, or return any environment/config secrets.
 */
export function parseUvToolList(output=''){
  if(typeof output!=='string')return false;
  return /(?:^|\r?\n)\s*headroom-ai\s+v\d+(?:[.\w+-]*)?(?=\s|$)/im.test(output);
}
export function detectHeadroom(options={}){
  const binaryFound=!!options.found?.headroom;
  const uvExe=options.uvPath===undefined?which('uv'):options.uvPath;
  let uvRegistered=false;
  if(typeof options.uvToolList==='string')uvRegistered=parseUvToolList(options.uvToolList);
  else if(uvExe){
    const exec=options.execute||spawnSync;
    try{
      const result=exec(uvExe,['tool','list'],{
        encoding:'utf8',timeout:3000,maxBuffer:256*1024,windowsHide:true,
        env:{...process.env,NO_COLOR:'1'},
        shell:process.platform==='win32'&&/\.(?:cmd|bat)$/i.test(uvExe)
      });
      uvRegistered=result?.status===0&&parseUvToolList(result.stdout);
    }catch{
      uvRegistered=false;
    }
  }
  const installed=binaryFound||uvRegistered;
  return {
    installed,
    available:binaryFound,
    uvRegistered,
    active:false,
    details:!installed?'Chưa xác minh cài đặt. Có thể kiểm tra: uv tool list'
      :!binaryFound?'Đã tìm thấy trong uv, nhưng lệnh headroom chưa có trong PATH; chạy uv tool update-shell rồi mở terminal mới.'
      :'Đã thấy lệnh headroom; chỉ hoạt động khi chạy qua BOLT-CLAUDE / BOLT-CODEX, chưa xác minh proxy.'
  };
}
