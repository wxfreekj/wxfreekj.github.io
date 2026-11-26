// Run with: node --test arrowescape/jay-paths.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script); // Syntax-check the complete game, including load/save integration.
const source=script.slice(0,script.indexOf('const $=id=>'));
function context(){const c=vm.createContext({window:{}});vm.runInContext(source+`\nconst seedWord=s=>String(s).trim().normalize('NFKC').toLowerCase();\n${script.match(/function hashUnit\(s\)\{[^\n]+/)[0]}`,c);return c}
const c=context();
function board(seed,d,style,level=0){return c.densePuzzle17(seed,d,style,level)}
function independentGraph(g){
 const pt=p=>p.map(x=>x*2).join(':'),mid=(a,b)=>[a[0]+b[0],a[1]+b[1]].join(':');
 const occ=new Map();
 for(const a of g.arrows){assert.equal(a.id,g.arrows.indexOf(a));for(let i=0;i<a.p.length;i++){
  const p=a.p[i];assert.ok(p[0]>=1&&p[0]<g.W-1&&p[1]>=1&&p[1]<g.H-1);
  const keys=i?[pt(p),mid(a.p[i-1],p)]:[pt(p)];
  for(const k of keys){assert.ok(!occ.has(k),'overlap at '+k);occ.set(k,a.id)}
 }}
 return g.arrows.map(a=>{const out=new Set();let [x,y]=a.p.at(-1);while(true){const q=[x+a.v[0],y+a.v[1]];if(q[0]<0||q[0]>=g.W||q[1]<0||q[1]>=g.H)break;
  for(const k of [mid([x,y],q),pt(q)])if(occ.has(k)){assert.notEqual(occ.get(k),a.id,'self-blocking arrow');out.add(occ.get(k))}[x,y]=q;
 }return out});
}
function verify(g,classic){
 assert.ok(c.validateCleanBoard(g,classic));
 const graph=independentGraph(g),live=new Set(g.arrows.map(a=>a.id));
 for(const a of g.arrows)assert.deepEqual([...g.blockers(a,g.arrows)].sort((a,b)=>a-b),[...graph[a.id]].sort((a,b)=>a-b));
 while(live.size){const ready=[...live].filter(i=>![...graph[i]].some(j=>live.has(j)));assert.ok(ready.length,'unsolvable dependency cycle');ready.forEach(i=>live.delete(i))}
 const paths=c.jayLetterPaths(g.W,g.H,g.testSeed);
 assert.equal(paths.length,11);
 paths.forEach((p,i)=>assert.equal(JSON.stringify(g.arrows[i].p),JSON.stringify(p),'reserved letter lost'));
 assert.ok(g.arrows.length>paths.length,'surrounding arrows missing');
 assert.ok(g.coverage>.70,'insufficient surrounding fill');
}
test('normalized exact jay trigger, web modes and Android exclusion',()=>{
 for(const seed of ['jay','Jay',' JAY ','Ｊａｙ'])for(const mode of ['campaign','custom','timed'])assert.equal(c.usesJayPaths(seed,mode),true);
 for(const seed of ['jays','jay-1','hi jay','jen',''])assert.equal(c.usesJayPaths(seed,'custom'),false);
 for(const mode of ['daily','training'])assert.equal(c.usesJayPaths('jay',mode),false);
 c.window.ArrowEscapeApp={};assert.equal(c.usesJayPaths('jay','custom'),false);delete c.window.ArrowEscapeApp;
 assert.ok(!/jayMosaic|JAY_MOSAIC|drawJayMosaic/.test(html));
});
test('letter geometry, independent solvability and fill across difficulties and styles',()=>{
 for(const d of [1,6,12,24,41,58,80,100])for(const style of ['classic','mixed','variety'])for(const mode of ['campaign','custom','timed']){
  const seed=JSON.stringify([mode,'jay',style,d,37])+'|'+d;
  const g=board(seed,d,style);g.testSeed=seed;verify(g,style==='classic');
 }
});
test('deterministic generation and early-level transition',()=>{
 for(const level of [0,1,4,10,11,15,20,21,1000]){
  const seed='jay|level:'+level,g=board(seed,50,'classic',level);g.testSeed=seed;verify(g,true);
  assert.equal(JSON.stringify(g.arrows),JSON.stringify(board(seed,50,'classic',level).arrows));
 }
});
test('load preserves legacy partial boards and resumes/reset v17 safely',()=>{
 const line=script.match(/let markedWrong=new Set\(\);function load\(reset=false\)\{[^\n]+/)[0];
 const fake=vm.createContext({window:{},performance:{now:()=>0},clearTimeout(){},Set,Number,Math});
 vm.runInContext(`
 const calls=[];const saved={};let generatorVersion,G,live,game,lives,loadedStyle,gridActive,gridUnlocked,animation,flash,locked,hinted,zoom,pan,elapsed,clockStart,idleTimer,keyArrow,lastEscapeAt;
 let S={mode:'custom',seed:'Jay',format:3,puzzleStyle:'classic',games:saved};
 const seedWord=s=>s.trim().normalize('NFKC').toLowerCase();
 ${script.match(/function usesJayPaths[^\n]+/)[0]}
 ${script.match(/function preservePuzzleLayout[^\n]+/)[0]}
 const cancelBoardGesture=()=>{},difficulty=()=>24,identity=()=> 'custom-jay',persist=()=>{},draw=()=>{},armIdle=()=>{},competitionExpired=()=>false,resumeClock=()=>{},finish=()=>{},clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const make=(v)=>{calls.push(v);return {arrows:[{id:0},{id:1},{id:2}]}};
 const densePuzzle17=()=>make(17),densePuzzle16=()=>make(16),densePuzzle15=()=>make(15),newPuzzle=()=>make(14),shortInterlock=()=>make(13),naturalPuzzle=()=>make(12),engine=()=>make(1),validateCleanBoard=()=>true;
 const $=()=>({textContent:''});
 ${line}
 globalThis.state=()=>({generatorVersion,live,lives,elapsed,wrong:[...markedWrong],gridActive,gridUnlocked});
 globalThis.setOld=old=>{saved[JSON.stringify(['custom','custom-jay',24])]=old};
 `,fake);
 fake.load();assert.equal(fake.state().generatorVersion,17);
 fake.setOld({generator:16,removed:[0],lives:2,elapsedMs:123,markedWrong:[1],style:'classic',gridActive:true,gridUnlocked:true});
 fake.load();assert.equal(fake.state().generatorVersion,16);assert.equal(fake.state().live.length,2);assert.equal(fake.state().lives,2);assert.equal(fake.state().elapsed,123);assert.equal(fake.state().wrong[0],1);assert.equal(fake.state().gridActive,true);
 fake.load(true);assert.equal(fake.state().generatorVersion,17);assert.equal(fake.state().live.length,3);assert.equal(fake.state().lives,3);
 fake.setOld({generator:16,removed:[],lives:2,markedWrong:[1],elapsedMs:123});fake.load();assert.equal(fake.state().generatorVersion,16);assert.equal(fake.state().wrong[0],1);
 fake.setOld({generator:17,removed:[1],lives:3,elapsedMs:456,style:'classic'});fake.load();assert.equal(fake.state().generatorVersion,17);assert.equal(fake.state().live.some(a=>a.id===1),false);assert.equal(fake.state().elapsed,456);
 vm.runInContext("S.seed='jays';S.games={}",fake);fake.load();assert.equal(fake.state().generatorVersion,16);
});
