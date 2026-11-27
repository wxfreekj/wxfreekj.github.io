export const VERSION=1, W=5, D=5, H=12;
export const SHAPES={
 I:[[-1,0,0],[0,0,0],[1,0,0],[2,0,0]],
 O:[[0,0,0],[1,0,0],[0,0,1],[1,0,1]],
 T:[[-1,0,0],[0,0,0],[1,0,0],[0,0,1]],
 L:[[-1,0,0],[0,0,0],[1,0,0],[1,0,1]],
 J:[[-1,0,0],[0,0,0],[1,0,0],[-1,0,1]],
 S:[[-1,0,0],[0,0,0],[0,0,1],[1,0,1]],
 Z:[[-1,0,1],[0,0,1],[0,0,0],[1,0,0]]
};
export const TYPES=Object.keys(SHAPES);
export const normalizeSeed=s=>String(s).trim().normalize('NFKC').toLowerCase().slice(0,100);
export const index=(x,y,z)=>y*W*D+z*W+x;
const clone=x=>JSON.parse(JSON.stringify(x));
function hash(s){let n=2166136261;for(const c of s)n=Math.imul(n^c.charCodeAt(0),16777619);return n>>>0}
function random(g){g.rng=(Math.imul(g.rng,1664525)+1013904223)>>>0;return g.rng/4294967296}
function refill(g){while(g.queue.length<4){const bag=TYPES.slice();for(let i=bag.length-1;i>0;i--){const j=Math.floor(random(g)*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}g.queue.push(...bag)}}
export function cells(piece){return piece.offsets.map(p=>p.map((n,i)=>n+piece.pos[i]))}
export function fits(g,piece){return cells(piece).every(([x,y,z])=>Number.isInteger(x)&&Number.isInteger(y)&&Number.isInteger(z)&&x>=0&&x<W&&z>=0&&z<D&&y>=0&&y<H&&!g.board[index(x,y,z)])}
export function level(g){return 1+Math.floor(g.layers/5)}
export function interval(g){return Math.max(80,(1200-(g.difficulty-1)*100)*.85**(level(g)-1))}
function freshPiece(type){return {type,pos:[2,H-1,2],offsets:SHAPES[type].map(p=>p.slice())}}
function spawn(g,type){refill(g);g.active=freshPiece(type||g.queue.shift());refill(g);g.fallMs=0;g.lockMs=0;g.lockResets=0;g.canHold=true;if(!fits(g,g.active))g.over=true;return !g.over}
export function newGame({seed='orbit',difficulty=3,mode='endless'}={}){
 const normalized=normalizeSeed(seed)||'orbit';
 const g={version:VERSION,seed:normalized,difficulty:Math.max(1,Math.min(10,Math.round(Number(difficulty)||3))),mode:mode==='seeded'?'seeded':'endless',board:Array(W*D*H).fill(0),rng:0,queue:[],active:null,held:null,canHold:true,score:0,layers:0,pieces:0,elapsedMs:0,fallMs:0,lockMs:0,lockResets:0,over:false,startedAt:Date.now()};
 g.rng=hash(g.seed+'|'+g.difficulty);spawn(g);return g;
}
function resetLock(g){if(g.lockResets<15){g.lockMs=0;g.lockResets++}}
export function move(g,dx,dz){if(g.over)return false;const p={...g.active,pos:[g.active.pos[0]+dx,g.active.pos[1],g.active.pos[2]+dz]};if(!fits(g,p))return false;const wasGrounded=!fits(g,{...g.active,pos:[g.active.pos[0],g.active.pos[1]-1,g.active.pos[2]]});g.active=p;if(wasGrounded)resetLock(g);return true}
export function rotateOffset([x,y,z],axis,dir=1){if(axis==='x')return [x,-dir*z,dir*y];if(axis==='y')return [dir*z,y,-dir*x];if(axis==='z')return [-dir*y,dir*x,z];throw Error('Unknown rotation axis')}
export function rotate(g,axis,dir=1){if(g.over)return false;const p={...g.active,offsets:g.active.offsets.map(c=>rotateOffset(c,axis,dir))};if(!fits(g,p))return false;const wasGrounded=!fits(g,{...g.active,pos:[g.active.pos[0],g.active.pos[1]-1,g.active.pos[2]]});g.active=p;if(wasGrounded)resetLock(g);return true}
export function landing(g){let p={...g.active,pos:g.active.pos.slice()};while(fits(g,{...p,pos:[p.pos[0],p.pos[1]-1,p.pos[2]]}))p={...p,pos:[p.pos[0],p.pos[1]-1,p.pos[2]]};return p}
export function clearLayers(g){let kept=[],n=0;for(let y=0;y<H;y++){const layer=g.board.slice(y*W*D,(y+1)*W*D);if(layer.every(Boolean))n++;else kept.push(...layer)}while(kept.length<W*D*H)kept.push(0);g.board=kept;return n}
export function lock(g){if(g.over)return null;const oldLevel=level(g);for(const [x,y,z] of cells(g.active))g.board[index(x,y,z)]=TYPES.indexOf(g.active.type)+1;const n=clearLayers(g);g.layers+=n;g.score+=([0,100,300,500,800][n]??800+(n-4)*400)*oldLevel;g.pieces++;spawn(g);return {locked:true,cleared:n,over:g.over}}
export function softDrop(g){if(g.over)return false;const p={...g.active,pos:[g.active.pos[0],g.active.pos[1]-1,g.active.pos[2]]};if(!fits(g,p))return false;g.active=p;g.score++;g.fallMs=0;g.lockMs=0;return true}
export function hardDrop(g){if(g.over)return null;const p=landing(g);g.score+=(g.active.pos[1]-p.pos[1])*2;g.active=p;return lock(g)}
export function hold(g){if(g.over||!g.canHold)return false;const type=g.active.type,held=g.held;g.held=type;spawn(g,held);g.canHold=false;return true}
export function tick(g,ms){if(g.over)return null;ms=Math.max(0,Math.min(250,ms));g.elapsedMs+=ms;g.fallMs+=ms;let result=null;while(g.fallMs>=interval(g)){g.fallMs-=interval(g);const p={...g.active,pos:[g.active.pos[0],g.active.pos[1]-1,g.active.pos[2]]};if(fits(g,p)){g.active=p;g.lockMs=0}else break}if(!fits(g,{...g.active,pos:[g.active.pos[0],g.active.pos[1]-1,g.active.pos[2]]})){g.lockMs+=ms;if(g.lockMs>=500)result=lock(g)}else g.lockMs=0;return result}
function integer(n,min,max){return Number.isInteger(n)&&n>=min&&n<=max}
const orientations=new Map(TYPES.map(type=>{const seen=new Set(),pending=[SHAPES[type]];while(pending.length){const o=pending.pop(),key=o.map(p=>p.join(',')).sort().join(';');if(seen.has(key))continue;seen.add(key);for(const axis of ['x','y','z'])pending.push(o.map(p=>rotateOffset(p,axis)))}return [type,seen]}));
export function validateGame(input){
 const g=clone(input);
 if(!g||g.version!==VERSION||!['endless','seeded'].includes(g.mode)||typeof g.seed!=='string'||!g.seed.length||g.seed!==normalizeSeed(g.seed)||!integer(g.difficulty,1,10))throw Error('Unsupported save');
 if(!Array.isArray(g.board)||g.board.length!==W*D*H||!g.board.every(n=>integer(n,0,7)))throw Error('Invalid board');
 if(!integer(g.rng,0,4294967295)||!Array.isArray(g.queue)||g.queue.length<3||g.queue.length>10||!g.queue.every(t=>TYPES.includes(t))||g.held!==null&&!TYPES.includes(g.held))throw Error('Invalid piece queue');
 const p=g.active;if(!p||!TYPES.includes(p.type)||!Array.isArray(p.pos)||p.pos.length!==3||!p.pos.every(n=>integer(n,-4,H+4))||!Array.isArray(p.offsets)||p.offsets.length!==4||!p.offsets.every(p=>Array.isArray(p)&&p.length===3&&p.every(n=>integer(n,-3,3)))||!orientations.get(p.type).has(p.offsets.map(p=>p.join(',')).sort().join(';')))throw Error('Invalid active piece');
 for(const k of ['score','layers','pieces','elapsedMs','fallMs','lockMs','lockResets','startedAt'])if(!Number.isFinite(g[k])||g[k]<0||g[k]>Number.MAX_SAFE_INTEGER)throw Error('Invalid progress');
 for(const k of ['score','layers','pieces','lockResets','startedAt'])if(!Number.isInteger(g[k]))throw Error('Invalid progress');
 if(g.lockResets>15||g.lockMs>500||g.fallMs>1200||typeof g.over!=='boolean'||typeof g.canHold!=='boolean'||!g.over&&!fits(g,g.active))throw Error('Invalid game state');
 return g;
}
