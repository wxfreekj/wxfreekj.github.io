import {validateGame} from './engine.mjs';
export const KEY='blockfall3d-v1';
export const defaultSettings=()=>({difficulty:3,mode:'endless',seed:'orbit',sound:true,reducedMotion:false});
export const emptyData=()=>({version:1,settings:defaultSettings(),game:null,best:{},history:[]});
export function validateData(raw){
 if(!raw||raw.version!==1||!raw.settings||!raw.best||typeof raw.best!=='object'||Array.isArray(raw.best)||!Array.isArray(raw.history)||raw.history.length>50)throw Error('Unsupported save file');
 const s=raw.settings;if(!Number.isInteger(s.difficulty)||s.difficulty<1||s.difficulty>10||!['endless','seeded'].includes(s.mode)||typeof s.seed!=='string'||s.seed.length>100||typeof s.sound!=='boolean'||typeof s.reducedMotion!=='boolean')throw Error('Invalid settings');
 const best={};for(const [k,v] of Object.entries(raw.best)){if(!/^(?:[1-9]|10)$/.test(k)||!Number.isSafeInteger(v)||v<0)throw Error('Invalid record');best[k]=v}
 const history=raw.history.map(r=>{if(!r||typeof r.id!=='string'||r.id.length>160||typeof r.seed!=='string'||r.seed.length>100||!['endless','seeded'].includes(r.mode)||!Number.isInteger(r.difficulty)||r.difficulty<1||r.difficulty>10||!['score','layers','pieces','elapsedMs','endedAt'].every(k=>Number.isSafeInteger(r[k])&&r[k]>=0))throw Error('Invalid history');return {...r}});
 return {version:1,settings:{...s},game:raw.game===null?null:validateGame(raw.game),best,history};
}
export function loadData(storage){const raw=storage.getItem(KEY);return raw?validateData(JSON.parse(raw)):emptyData()}
export function saveData(storage,data){storage.setItem(KEY,JSON.stringify(data))}
export function resetData(storage){storage.removeItem(KEY);return emptyData()}
