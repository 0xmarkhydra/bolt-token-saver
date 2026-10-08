#!/usr/bin/env node
/**
 * Windows RTK fallback: official GitHub release binary when WinGet is missing.
 * Dependencies: Node.js 20+, built-in Windows PowerShell.
 * Does not run downloaded shell scripts or require admin privileges.
 */
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import crypto from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const RELEASE_API='https://api.github.com/repos/rtk-ai/rtk/releases/latest';
const ASSET='rtk-x86_64-pc-windows-msvc.zip';
const MAX_BYTES=50*1024*1024;
export function selectOfficialAsset(release){
  if(!/^v?\d+\.\d+\.\d+(?:[-+][a-zA-Z0-9.-]+)?$/.test(release?.tag_name||''))throw Error('Unexpected RTK release tag.');
  const asset=release.assets?.find(x=>x.name===ASSET);
  if(!asset)throw Error('This RTK release has no x64 Windows binary.');
  const expectedUrl='https://github.com/rtk-ai/rtk/releases/download/'+release.tag_name+'/'+ASSET;
  if(asset.browser_download_url!==expectedUrl)throw Error('Unexpected RTK asset download URL.');
  if(!/^sha256:[a-f0-9]{64}$/i.test(asset.digest||''))throw Error('RTK release is missing a valid SHA-256 digest.');
  if(!Number.isSafeInteger(asset.size)||asset.size<=0||asset.size>MAX_BYTES)throw Error('Unexpected RTK release archive size.');
  return {url:asset.browser_download_url,expectedSha256:asset.digest.split(':')[1].toLowerCase(),version:release.tag_name,size:asset.size};
}
export function verifyDigest(buffer,expectedSha256){
  if(!/^[a-f0-9]{64}$/i.test(expectedSha256||''))return false;
  const value=crypto.createHash('sha256').update(buffer).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(value,'hex'),Buffer.from(expectedSha256.toLowerCase(),'hex'));
}
export function psQuote(text){return "'"+String(text).replace(/'/g,"''")+"'";}
async function download(url,{json=false}={}){
  const res=await fetch(url,{headers:{'User-Agent':'BoltTokenSaver/0.5.1','Accept':json?'application/vnd.github+json':'application/octet-stream'},signal:AbortSignal.timeout(60000)});
  if(!res.ok)throw Error('GitHub download failed: HTTP '+res.status);
  if(json)return res.json();
  if(Number(res.headers.get('content-length')||0)>MAX_BYTES)throw Error('RTK archive too large.');
  const chunks=[];let size=0;
  if(!res.body)throw Error('Empty RTK download.');
  for await (const chunk of res.body){
    size+=chunk.byteLength;
    if(size>MAX_BYTES)throw Error('RTK archive exceeded size limit.');
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}
function powershell(script){
  const done=spawnSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',script],{encoding:'utf8',windowsHide:true,timeout:60000});
  if(done.error)throw done.error;
  if(done.status!==0)throw Error('PowerShell step failed: '+(done.stderr||done.stdout||'exit '+done.status).trim().slice(0,320));
}
function addUserPath(binDir){
  // EnvironmentVariableTarget.User; avoid setx, which may truncate a long PATH.
  const quoted=psQuote(binDir);
  const script='$target='+quoted+'; '+
  '$userPath=[Environment]::GetEnvironmentVariable("Path","User"); '+
  'if(-not $userPath){$userPath=""}; '+
  '$present=@($userPath -split ";" | Where-Object {$_.Trim().TrimEnd([char]92) -ieq $target.TrimEnd([char]92)}).Count -gt 0; '+
  'if(-not $present){ $value=if($userPath){$userPath.TrimEnd(";")+";"+$target}else{$target}; '+
  '[Environment]::SetEnvironmentVariable("Path",$value,"User") }';
  powershell(script);
}
async function main(){
  if(process.platform!=='win32')throw Error('This installer only supports Windows.');
  if(process.arch!=='x64')throw Error('Official x64 RTK fallback does not support this Windows CPU ('+process.arch+').');
  console.log('RTK: checking official GitHub release...');
  const release=await download(RELEASE_API,{json:true});
  const asset=selectOfficialAsset(release);
  console.log('RTK: downloading '+asset.version+' for Windows x64...');
  const archive=await download(asset.url);
  if(archive.byteLength!==asset.size)throw Error('RTK archive size mismatch.');
  if(!verifyDigest(archive,asset.expectedSha256))throw Error('RTK SHA-256 mismatch; refusing to install.');
  console.log('RTK: SHA-256 verified. Extracting...');
  const tmp=fs.mkdtempSync(path.join(os.tmpdir(),'bolt-rtk-'));
  try {
    const zip=path.join(tmp,'rtk.zip');
    const unpack=path.join(tmp,'extract');
    fs.writeFileSync(zip,archive,{flag:'wx'});
    fs.mkdirSync(unpack);
    powershell('Expand-Archive -LiteralPath '+psQuote(zip)+' -DestinationPath '+psQuote(unpack)+' -Force');
    const candidates=fs.readdirSync(unpack,{recursive:true}).filter(x=>path.basename(x).toLowerCase()==='rtk.exe');
    if(candidates.length!==1)throw Error('RTK archive must contain exactly one rtk.exe');
    const exe=path.resolve(unpack,candidates[0]);
    if(!exe.startsWith(unpack+path.sep)||!fs.statSync(exe).isFile())throw Error('Unsafe archive executable path.');
    const binDir=path.join(os.homedir(),'.local','bin');
    fs.mkdirSync(binDir,{recursive:true});
    const dest=path.join(binDir,'rtk.exe');
    if(fs.existsSync(dest))throw Error('An RTK executable already exists at '+dest+'; please check it before replacing.');
    fs.copyFileSync(exe,dest,fs.constants.COPYFILE_EXCL);
    // Persist the executable folder for future agent terminals without admin privileges.
    try{addUserPath(binDir);}
    catch(err){
      console.error('RTK copied but Windows user PATH update failed: '+err.message);
      console.error('Add this folder to your Windows User PATH manually: '+binDir);
      throw err;
    }
    const verify=spawnSync(dest,['gain'],{encoding:'utf8',windowsHide:true,timeout:15000});
    if(verify.error||verify.status!==0)throw Error('RTK installed but rtk gain did not verify. Check the executable and retry.');
    console.log('RTK verified via rtk gain. Reopen your terminal after setup to refresh PATH.');
  } finally {fs.rmSync(tmp,{recursive:true,force:true});}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url)){
  main().catch(e=>{console.error('RTK Windows installer: '+e.message);process.exitCode=1;});
}
