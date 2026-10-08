import {test} from 'node:test';
import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {plan} from '../src/core.mjs';
import {selectOfficialAsset,verifyDigest,psQuote} from '../src/install-rtk-windows.mjs';

const archive='rtk-x86_64-pc-windows-msvc.zip';
const data=Buffer.from('test-only archive bytes');
const digest=crypto.createHash('sha256').update(data).digest('hex');

test('WinGet absent on Windows x64: use official Windows RTK fallback',()=>{
 const p=plan({agents:['claude'],tools:['rtk'],system:{
  platform:'win32',arch:'x64',found:{claude:true,rtk:false,winget:false}
 }});
 assert.equal(p.steps.length,2);
 assert.equal(p.steps[0].cmd,process.execPath);
 assert.ok(p.steps[0].args[0].endsWith('install-rtk-windows.mjs'));
 assert.equal(p.steps[1].cmd,'rtk');
 assert.ok(!p.steps.some(s=>s.needs?.includes('winget')));
});

test('WinGet present: original official package route',()=>{
 const p=plan({agents:['claude'],tools:['rtk'],system:{
  platform:'win32',arch:'x64',found:{claude:true,rtk:false,winget:true}
 }});
 assert.equal(p.steps[0].cmd,'winget');
 assert.ok(p.steps[0].args.includes('rtk-ai.rtk'));
});

test('RTK fallback does not attempt x64 binary on Windows ARM64',()=>{
 const p=plan({agents:['claude'],tools:['rtk'],system:{
  platform:'win32',arch:'arm64',found:{claude:true,rtk:false,winget:false}
 }});
 assert.equal(p.steps[0].cmd,'rtk');
 assert.ok(p.warnings.some(w=>w.includes('Windows x64')));
});

test('release verification only accepts official GitHub URL, exact name, SHA256',()=>{
 const release={tag_name:'v0.51.0',assets:[{
  name:archive, size:data.length,digest:'sha256:'+digest,
  browser_download_url:'https://github.com/rtk-ai/rtk/releases/download/v0.51.0/'+archive
 }]};
 const result=selectOfficialAsset(release);
 assert.equal(result.expectedSha256,digest);
 assert.ok(verifyDigest(data,result.expectedSha256));
 assert.equal(verifyDigest(Buffer.from('wrong bytes'),result.expectedSha256),false);
 assert.throws(()=>selectOfficialAsset({...release,assets:[{...release.assets[0],browser_download_url:'https://attacker.example/rtk.zip'}]}));
 assert.throws(()=>selectOfficialAsset({...release,assets:[{...release.assets[0],digest:undefined}]}));
 assert.throws(()=>selectOfficialAsset({...release,tag_name:'not-a-tag'}));
});

test('PowerShell path literal escapes apostrophes (non-English usernames)',()=>{
 assert.equal(psQuote("C:\\Users\\O'Brian\\.local\\bin"),"'C:\\Users\\O''Brian\\.local\\bin'");
});
