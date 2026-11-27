import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
test('offline shell includes every local runtime asset and retains other games caches',async()=>{
 const listeners={},removed=[],cached=[],responses=[];
 const ctx=vm.createContext({URL,fetch:()=>{throw Error('offline')},self:{location:{href:'https://example.com/blockfall3d/sw.js'},addEventListener:(type,fn)=>listeners[type]=fn},caches:{open:async()=>({addAll:async assets=>cached.push(...assets),match:async request=>{responses.push(request);return {offline:true}}}),keys:async()=>['arrowescape-v18','blockfall3d-old','other-game'],delete:async k=>removed.push(k)}});
 vm.runInContext(fs.readFileSync(new URL('./sw.js',import.meta.url),'utf8'),ctx);
 let work;listeners.install({waitUntil:p=>work=p});await work;assert.ok(cached.includes('./vendor/three.min.js'));for(const p of cached)assert.ok(fs.existsSync(new URL(p==='./'?'./index.html':p,import.meta.url)),p+' missing');
 listeners.activate({waitUntil:p=>work=p});await work;assert.deepEqual(removed,['blockfall3d-old']);
 listeners.fetch({request:{method:'GET',url:'https://example.com/blockfall3d/?seed=orbit',mode:'navigate'},respondWith:p=>work=p});assert.equal((await work).offline,true);assert.equal(responses.at(-1),'./index.html');
 let intercepted=false;listeners.fetch({request:{method:'GET',url:'https://example.com/arrowescape/',mode:'navigate'},respondWith:()=>intercepted=true});assert.equal(intercepted,false);
});
