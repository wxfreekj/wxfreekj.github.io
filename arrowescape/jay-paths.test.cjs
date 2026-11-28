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
test('the heart has two lobes, a center notch, and a lower point made of playable strokes',()=>{
 const paths=c.heartJenPaths(31,15,'jay|shape'),x=paths[0].at(-1)[0],y=paths[0][0][1]-1;
 const heart=new Set(paths.slice(3,7).flatMap(p=>p.map(([a,b])=>[a-x,b-y].join(','))));
 for(const landmark of ['4,0','6,0','8,0','10,0','7,2','3,3','11,3','7,7'])assert.ok(heart.has(landmark),'missing heart landmark '+landmark);
 assert.ok(!heart.has('7,0'),'the lobes need a central notch');
 assert.ok(!heart.has('7,4'),'the heart outline must have an open center');
 assert.equal(paths.length,12);assert.equal(paths.slice(3,7).length,4);
});
function board(seed,d,style,level=0){return c.densePuzzle19(seed,d,style,level)}
test('v16, v17 and v18 saved arrow geometry stays byte-for-byte compatible',()=>{
 const crypto=require('node:crypto');
 const fixtures=[[16,1,"classic","dc8bdd12b1f12f708f11b07fe90d284f86039cac0a5bc50722a271b87a323f64"],[16,1,"mixed","870def793a30efb6e8972129b5e79c9908028859588a23892f83139f39041e06"],[16,1,"variety","dc8bdd12b1f12f708f11b07fe90d284f86039cac0a5bc50722a271b87a323f64"],[16,24,"classic","8d207efe9a4a5a9d3b85ffebd3a6cdda715b43c8946ac22baf362cfcae811a9a"],[16,24,"mixed","e64d39c0cc917f1d02fdb89121f43fe260d73bb806d19c705a0aa04e5294de6e"],[16,24,"variety","8d207efe9a4a5a9d3b85ffebd3a6cdda715b43c8946ac22baf362cfcae811a9a"],[16,80,"classic","c43d19b01e6babd7647e0a75e79b77d2914c572bcdf54a2b8d319d4a5a3ff385"],[16,80,"mixed","8523e45f4e461fd2cacdb5d2e8ca04e4640c125569a75bfbfb9f3a24af6b7b00"],[16,80,"variety","c43d19b01e6babd7647e0a75e79b77d2914c572bcdf54a2b8d319d4a5a3ff385"],[17,1,"classic","5b38493c5aa1339a67ecaea33644a8ce485e25b1ebb11bd066041edb8e03f558"],[17,1,"mixed","28f305b537ddbd6043b65cadf29aceada4cee8cfd66ca5e686927e726e42f589"],[17,1,"variety","5b38493c5aa1339a67ecaea33644a8ce485e25b1ebb11bd066041edb8e03f558"],[17,24,"classic","748b5d05843abdd83353071b7e6a2b29e6c2172e88c9f0a796fac92de60fb683"],[17,24,"mixed","f11bb4a21729336c97cd4b4be8647e03be48f45865407117ab3e51187767d985"],[17,24,"variety","748b5d05843abdd83353071b7e6a2b29e6c2172e88c9f0a796fac92de60fb683"],[17,80,"classic","19aef8059fcac46a094501019dfd98c39bac71158036c945863adb695524c905"],[17,80,"mixed","b53db8cb172d3cbfe1fedf66243b1d027139ff87e87c61a894d73786057b74cf"],[17,80,"variety","19aef8059fcac46a094501019dfd98c39bac71158036c945863adb695524c905"],[18,1,"classic","cabf8fdb057d2acf91d59be7d3559db4253bc861b302b294d14de8eeed071672"],[18,1,"mixed","6ff37120dcfd475409e7e45fcc77c3020bcd376fcb392c259ae73324d7f7639d"],[18,1,"variety","cabf8fdb057d2acf91d59be7d3559db4253bc861b302b294d14de8eeed071672"],[18,24,"classic","91d426be2c7225f87c8567260e001d386df367fc6a282282ef5b56d817ba4af4"],[18,24,"mixed","d9a57297f52dd785a5f998eabd3bd5b1edbdd7689913ffb187d89bb068a1e34e"],[18,24,"variety","91d426be2c7225f87c8567260e001d386df367fc6a282282ef5b56d817ba4af4"],[18,80,"classic","0fa329af7f143322d0211bc47cf53c04d3c5b76ab82e6973f91db8b5e1236992"],[18,80,"mixed","3af39bb2e45896be63e5e5558118ab952424f0812bcdf240698572451a37451d"],[18,80,"variety","0fa329af7f143322d0211bc47cf53c04d3c5b76ab82e6973f91db8b5e1236992"]];
 for(const [version,d,style,expected] of fixtures){const g=c['densePuzzle'+version]('jay|saved-layout',d,style);assert.equal(crypto.createHash('sha256').update(JSON.stringify(g.arrows)).digest('hex'),expected,'saved v'+version+' '+d+' '+style)}
});
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
 const paths=c.heartJenPaths(g.W,g.H,g.testSeed);
 assert.equal(paths.length,12);
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
test('load preserves legacy partial boards and uses I heart Jen v19 for new/reset puzzles',()=>{
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
 const densePuzzle19=()=>make(19),densePuzzle18=()=>make(18),densePuzzle17=()=>make(17),densePuzzle16=()=>make(16),densePuzzle15=()=>make(15),newPuzzle=()=>make(14),shortInterlock=()=>make(13),naturalPuzzle=()=>make(12),engine=()=>make(1),validateCleanBoard=()=>true;
 const $=()=>({textContent:''});
 ${line}
 globalThis.state=()=>({generatorVersion,live,lives,elapsed,wrong:[...markedWrong],gridActive,gridUnlocked});
 globalThis.setOld=old=>{saved[JSON.stringify(['custom','custom-jay',24])]=old};
 `,fake);
 fake.load();assert.equal(fake.state().generatorVersion,19);
 fake.setOld({generator:16,removed:[0],lives:2,elapsedMs:123,markedWrong:[1],style:'classic',gridActive:true,gridUnlocked:true});
 fake.load();assert.equal(fake.state().generatorVersion,16);assert.equal(fake.state().live.length,2);assert.equal(fake.state().lives,2);assert.equal(fake.state().elapsed,123);assert.equal(fake.state().wrong[0],1);assert.equal(fake.state().gridActive,true);
 fake.load(true);assert.equal(fake.state().generatorVersion,19);assert.equal(fake.state().live.length,3);assert.equal(fake.state().lives,3);
 fake.setOld({generator:16,removed:[],lives:2,markedWrong:[1],elapsedMs:123});fake.load();assert.equal(fake.state().generatorVersion,16);assert.equal(fake.state().wrong[0],1);
 fake.setOld({generator:17,removed:[1],lives:3,elapsedMs:456,style:'classic'});fake.load();assert.equal(fake.state().generatorVersion,17);assert.equal(fake.state().live.some(a=>a.id===1),false);assert.equal(fake.state().elapsed,456);
 fake.setOld({generator:18,removed:[1],lives:3,elapsedMs:456,style:'classic'});fake.load();assert.equal(fake.state().generatorVersion,18);assert.equal(fake.state().live.some(a=>a.id===1),false);
 fake.setOld({generator:19,removed:[1],lives:3,elapsedMs:456,style:'classic'});fake.load();assert.equal(fake.state().generatorVersion,19);assert.equal(fake.state().live.some(a=>a.id===1),false);
 vm.runInContext("S.seed='jays';S.games={}",fake);fake.load();assert.equal(fake.state().generatorVersion,16);
});
