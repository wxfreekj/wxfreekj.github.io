import {test} from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {webcrypto} from 'node:crypto';
import * as engine from './engine.mjs';
import * as storage from './storage.mjs';
const html=fs.readFileSync(new URL('./index.html',import.meta.url),'utf8');
const source=fs.readFileSync(new URL('./app.mjs',import.meta.url),'utf8').replace(/^import .*;$/gm,'');
function harness(initial=null){
 const elements=new Map();
 class Element{constructor(){this.hidden=false;this.open=false;this.value='';this.checked=false;this.files=[];this.style={};this.dataset={};this.classList={toggle(){}}}setAttribute(){}replaceChildren(){}append(){}remove(){}focus(){}select(){}click(){}matches(){return false}addEventListener(){}showModal(){this.open=true}close(){this.open=false}}
 for(const match of html.matchAll(/\bid="([^"]+)"/g))elements.set(match[1],new Element());
 const mem=new Map([['arrowescape-v1','other game']]);if(initial)mem.set(storage.KEY,JSON.stringify(initial));
 const local={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
 const document={getElementById:id=>{assert.ok(elements.has(id),'unknown DOM ID: '+id);return elements.get(id)},querySelector:()=>[...elements.values()].find(e=>e.open)||null,querySelectorAll:()=>[],addEventListener(){},createElement:()=>new Element(),body:new Element()};
 const context=vm.createContext({...storage,E:engine,createView:()=>({reset(){},render(){}}),drawPreview(){},drawMap(){},document,localStorage:local,window:{addEventListener(){}},navigator:{},location:{search:'',href:'https://example.com/blockfall3d/',pathname:'/blockfall3d/',hostname:'example.com'},history:{replaceState(){}},crypto:webcrypto,URL,URLSearchParams,Blob,performance:{now:()=>1234},matchMedia:()=>({matches:false}),requestAnimationFrame(){},setTimeout:()=>1,clearTimeout(){},console});
 vm.runInContext(source,context);
 return {context,elements,mem,state:()=>vm.runInContext('JSON.parse(JSON.stringify({g,data,running,started}))',context)};
}
test('real app startup, drop and pause persist a run and restore it paused',()=>{
 const a=harness();assert.equal(a.state().started,false);a.context.startNew();assert.equal(a.state().running,true);a.context.action('drop');a.context.pause();const state=a.state();assert.ok(state.g.score>=0);assert.equal(state.g.pieces,1);assert.equal(state.running,false);
 const b=harness(JSON.parse(a.mem.get(storage.KEY)));assert.equal(b.state().g.score,state.g.score);assert.equal(b.state().g.pieces,1);assert.equal(b.state().running,false);assert.equal(b.elements.get('overlay').hidden,false);
});
test('canceling real restart and full-reset handlers preserves current data',async()=>{
 const a=harness();a.context.startNew();a.context.action('drop');a.context.openSettings();const before=JSON.stringify(a.state());
 for(const id of ['restartButton','resetButton']){const task=a.elements.get(id).onclick();assert.equal(a.elements.get('confirmDialog').open,true);a.elements.get('confirmCancel').onclick();await task;assert.equal(JSON.stringify(a.state()),before)}
});
test('confirmed reset erases only this game, stops play, and restores default settings',async()=>{
 const a=harness();a.context.startNew();a.context.action('drop');a.context.openSettings();const task=a.elements.get('resetButton').onclick();a.elements.get('confirmAccept').onclick();await task;
 assert.equal(a.mem.has(storage.KEY),false);assert.equal(a.mem.get('arrowescape-v1'),'other game');assert.equal(a.state().g,null);assert.equal(a.state().running,false);assert.equal(a.state().started,false);assert.equal(a.state().data.settings.difficulty,3);assert.equal(a.elements.get('settings').open,false);
});
test('invalid imports preserve game and valid imports require explicit confirmation',async()=>{
 const a=harness();a.context.startNew();a.context.openSettings();const file=a.elements.get('importFile'),before=JSON.stringify(a.state());
 file.files=[{size:10,text:async()=>'{invalid'}];await file.onchange();assert.equal(JSON.stringify(a.state()),before);assert.match(a.elements.get('settingsFeedback').textContent,/Import failed/);
 const valid=storage.emptyData();valid.game=engine.newGame({seed:'saved',difficulty:7});file.files=[{size:200,text:async()=>JSON.stringify(valid)}];const task=file.onchange();await new Promise(resolve=>setImmediate(resolve));assert.equal(a.elements.get('confirmDialog').open,true);a.elements.get('confirmCancel').onclick();await task;assert.equal(JSON.stringify(a.state()),before);
});
test('corrupt stored data is not overwritten by startup or later play',()=>{
 const bad=storage.emptyData();bad.version=99;const a=harness(bad);const raw=a.mem.get(storage.KEY);a.context.startNew();a.context.action('drop');assert.equal(a.mem.get(storage.KEY),raw);assert.equal(a.elements.get('storageNotice').hidden,false);
});
