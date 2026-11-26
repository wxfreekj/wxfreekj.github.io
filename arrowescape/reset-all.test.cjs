// Run with: node --test arrowescape/*.test.cjs
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const html=fs.readFileSync(__dirname+'/index.html','utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
new vm.Script(script);
const reset=script.slice(script.indexOf('function resetEverything(){'),script.indexOf("$('resetAll').hidden="));
function harness({approve=true,android=false,storageFails=false}={}){
 const stored=new Map([['arrowescape-v1','old save'],['arrowescape-setup-v2','1'],['ae-tutorial-done','1'],['other-game','keep']]);
 const events=[];
 const c=vm.createContext({window:android?{ArrowEscapeApp:{}}:{},confirm:text=>{events.push(['confirm',text]);return approve},alert:text=>events.push(['alert',text]),localStorage:{removeItem:key=>{if(storageFails)throw Error('blocked');stored.delete(key)}},clearTimeout:id=>events.push(['timeout',id]),cancelAnimationFrame:id=>events.push(['frame',id]),location:{pathname:'/arrowescape/',replace:url=>events.push(['navigate',url])}});
 vm.runInContext(`
 const KEY='arrowescape-v1';
 // Nested defaults may already be shared with a played game; they must be replaced.
 const defaults={seed:'ArrowEscape',level:1,hints:3,gridCredits:3,theme:'light',mode:'campaign',timed:null,completed:0,games:{old:{}},bestTimes:{old:1},campaignPositions:{old:10},gridRewarded:{old:true},timedBest:{old:5}};
 let S={mode:'timed',timed:{finished:false},games:{old:{elapsedMs:999}}},advanceTimer=10,idleTimer=20,frame=30,animation={},flash={},locked=false,clockStart=100,elapsed=999,game='old',practiceReturn={};
 const normalize=v=>v,cancelBoardGesture=()=>{};
 function pageExit(){if(game&&S.games[game])localStorage.removeItem('other-game')}
 ${reset}
 globalThis.state=()=>({S,animation,flash,locked,clockStart,elapsed,game,practiceReturn});
 `,c);
 return {c,stored,events};
}
test('cancel leaves all games, settings, records and history untouched',()=>{
 const {c,stored,events}=harness({approve:false});const before=JSON.stringify(c.state());c.resetEverything();assert.equal(JSON.stringify(c.state()),before);assert.equal(stored.size,4);assert.equal(events.length,1);assert.equal(events[0][0],'confirm');
});
test('confirmed reset erases only Arrow Escape data and stops stale saves',()=>{
 const {c,stored,events}=harness();c.resetEverything();c.pageExit();
 assert.deepEqual([...stored],[['other-game','keep']]);
 const state=c.state();assert.equal(state.locked,true);assert.equal(state.game,null);assert.equal(state.clockStart,null);assert.equal(state.animation,null);assert.equal(state.practiceReturn,null);
 for(const key of ['games','bestTimes','campaignPositions','gridRewarded','timedBest'])assert.equal(Object.keys(state.S[key]).length,0);
 assert.equal(state.S.level,1);assert.equal(state.S.hints,3);assert.equal(state.S.theme,'light');assert.equal(state.S.timed,null);
 assert.deepEqual(events.filter(e=>e[0]==='navigate'),[['navigate','/arrowescape/']]);
 assert.match(events[0][1],/cannot be undone/);
});
test('storage failure explains the failure without navigating or stopping the game',()=>{
 const {c,stored,events}=harness({storageFails:true});const before=JSON.stringify(c.state());c.resetEverything();assert.equal(JSON.stringify(c.state()),before);assert.equal(stored.size,4);assert.ok(events.some(e=>e[0]==='alert'));assert.ok(!events.some(e=>e[0]==='navigate'));
});
test('Android bridge cannot invoke the web reset',()=>{
 const {c,stored,events}=harness({android:true});c.resetEverything();assert.equal(stored.size,4);assert.equal(events.length,0);
 assert.match(script,/\$\('resetAll'\)\.hidden=!!window\.ArrowEscapeApp/);
 assert.match(html,/id="resetAll" type="button" aria-describedby="resetAllHelp"/);
});
