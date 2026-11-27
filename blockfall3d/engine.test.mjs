import {test} from 'node:test';
import assert from 'node:assert/strict';
import * as E from './engine.mjs';
import {KEY,emptyData,loadData,saveData,resetData,validateData} from './storage.mjs';
const copy=g=>JSON.parse(JSON.stringify(g));
test('normalized seeded bags and restored random state produce identical sequences',()=>{
 const a=E.newGame({seed:' Jay ',mode:'seeded',difficulty:3}),b=E.newGame({seed:'ＪＡＹ',mode:'seeded',difficulty:3});
 assert.equal(a.seed,'jay');assert.equal(a.active.type,b.active.type);assert.deepEqual(a.queue,b.queue);assert.equal(a.rng,b.rng);
 const first=[a.active.type,...a.queue.slice(0,6)];assert.equal(new Set(first).size,7);
 const restored=E.validateGame(copy(a));for(let i=0;i<7;i++){a.board.fill(0);restored.board.fill(0);E.hardDrop(a);E.hardDrop(restored);assert.deepEqual(a.queue,restored.queue);assert.deepEqual(a.active,restored.active);assert.equal(a.rng,restored.rng)}
});
test('quarter-turns preserve cubes, invert, and return to origin after four turns',()=>{
 for(const shape of Object.values(E.SHAPES))for(const axis of ['x','y','z']){
  let p=copy(shape);for(let n=0;n<4;n++)p=p.map(o=>E.rotateOffset(o,axis,1));assert.deepEqual(p,shape);
  assert.deepEqual(shape.map(p=>E.rotateOffset(E.rotateOffset(p,axis,1),axis,-1)),shape);
 }
});
test('movement and rotation reject walls, floor, ceiling and occupied cells atomically',()=>{
 const g=E.newGame();g.active={type:'I',pos:[2,5,2],offsets:copy(E.SHAPES.I)};
 assert.equal(E.move(g,1,0),false);assert.equal(E.move(g,-1,0),true);
 const at=copy(g.active);g.board[E.index(1,6,2)]=1;assert.equal(E.rotate(g,'z'),false);assert.deepEqual(g.active,at);
 g.board.fill(0);g.active.pos=[2,11,2];assert.equal(E.rotate(g,'z'),false);
 g.active.pos=[2,0,2];assert.equal(E.softDrop(g),false);assert.equal(E.fits(g,{...g.active,pos:[2,-1,2]}),false);
});
test('landing, soft drop, hard drop and locking agree on the collision geometry',()=>{
 const g=E.newGame();g.active={type:'O',pos:[2,8,2],offsets:copy(E.SHAPES.O)};g.board[E.index(2,2,2)]=3;
 assert.equal(E.landing(g).pos[1],3);assert.equal(E.softDrop(g),true);assert.equal(g.score,1);
 const result=E.hardDrop(g);assert.equal(result.cleared,0);assert.equal(g.score,9);assert.equal(g.pieces,1);
 for(const [x,z] of [[2,2],[3,2],[2,3],[3,3]])assert.equal(g.board[E.index(x,3,z)],2);
});
test('simultaneous layers clear together and surviving layers retain their order',()=>{
 const g=E.newGame();for(const y of [0,2])for(let z=0;z<5;z++)for(let x=0;x<5;x++)g.board[E.index(x,y,z)]=1;
 g.board[E.index(1,1,2)]=4;g.board[E.index(3,3,4)]=5;
 assert.equal(E.clearLayers(g),2);assert.equal(g.board[E.index(1,0,2)],4);assert.equal(g.board[E.index(3,1,4)],5);assert.equal(g.board.filter(Boolean).length,2);
});
test('layer scores use the level before clearing and gravity advances every five layers',()=>{
 const g=E.newGame({difficulty:1});g.layers=4;
 for(let z=0;z<5;z++)for(let x=0;x<5;x++)if(z!==2||x<1||x>4)g.board[E.index(x,0,z)]=1;
 g.active={type:'I',pos:[2,0,2],offsets:copy(E.SHAPES.I)};
 const out=E.lock(g);assert.equal(out.cleared,1);assert.equal(g.score,100);assert.equal(E.level(g),2);assert.equal(E.interval(g),1020);
 g.layers=1000;assert.equal(E.interval(g),80);
});
test('hold is limited to once per turn and resets after a lock',()=>{
 const g=E.newGame(),first=g.active.type;assert.equal(E.hold(g),true);assert.equal(g.held,first);const second=g.active.type;assert.equal(E.hold(g),false);assert.equal(g.active.type,second);E.hardDrop(g);assert.equal(g.canHold,true);assert.equal(E.hold(g),true);assert.equal(g.active.type,first);
});
test('spawn blockage ends the run and further actions cannot change it',()=>{
 const g=E.newGame();g.board.fill(1);g.active={type:'I',pos:[2,0,2],offsets:copy(E.SHAPES.I)};
 // Test a blocked hold spawn without clearing the prepared board.
 E.hold(g);assert.equal(g.over,true);const before=copy(g);assert.equal(E.move(g,1,0),false);assert.equal(E.rotate(g,'y'),false);assert.equal(E.hardDrop(g),null);assert.deepEqual(g,before);
});
test('gravity and bounded lock-delay resets behave independently of rendering',()=>{
 const g=E.newGame({difficulty:10});g.active={type:'O',pos:[2,1,2],offsets:copy(E.SHAPES.O)};
 E.tick(g,250);assert.equal(g.active.pos[1],1);E.tick(g,50);assert.equal(g.active.pos[1],0);E.tick(g,250);assert.equal(g.pieces,0);E.move(g,-1,0);assert.equal(g.lockMs,0);
 for(let i=0;i<40;i++)E.move(g,i%2?1:-1,0);assert.equal(g.lockResets,15);
 E.tick(g,250);E.tick(g,250);assert.equal(g.pieces,1);assert.ok(g.elapsedMs>0);
});
test('randomized legal play preserves valid save geometry and resumes exactly',()=>{
 let state=2026;const rand=()=>{state=(Math.imul(state,1664525)+1013904223)>>>0;return state/4294967296};
 for(let n=0;n<45;n++){let g=E.newGame({seed:'well-'+n,difficulty:1+n%10});for(let t=0;t<35&&!g.over;t++){
  for(let j=0;j<12;j++){const op=Math.floor(rand()*4);if(op===0)E.move(g,rand()<.5?-1:1,0);else if(op===1)E.move(g,0,rand()<.5?-1:1);else if(op===2)E.softDrop(g);else E.rotate(g,['x','y','z'][Math.floor(rand()*3)],rand()<.5?-1:1)}
  E.hardDrop(g);const restored=E.validateGame(copy(g));assert.deepEqual(restored,g);g=restored;
 }}
});
test('save round trip, own-key reset and invalid-import isolation',()=>{
 const mem=new Map([['arrowescape-v1','untouched']]),storage={getItem:k=>mem.get(k)||null,setItem:(k,v)=>mem.set(k,v),removeItem:k=>mem.delete(k)};
 const data=emptyData();data.game=E.newGame();E.softDrop(data.game);saveData(storage,data);assert.deepEqual(loadData(storage),data);
 const invalid=copy(data);invalid.game.board[0]=99;assert.throws(()=>validateData(invalid));assert.deepEqual(loadData(storage),data);
 const invalidShape=copy(data);invalidShape.game.active.offsets[0]=[3,3,3];assert.throws(()=>validateData(invalidShape));
 const version=copy(data);version.version=9;assert.throws(()=>validateData(version));
 assert.deepEqual(resetData(storage),emptyData());assert.equal(mem.has(KEY),false);assert.equal(mem.get('arrowescape-v1'),'untouched');
});
test('storage failures are propagated for visible UI handling',()=>{
 const blocked={getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}};
 assert.throws(()=>loadData(blocked));assert.throws(()=>saveData(blocked,emptyData()));assert.throws(()=>resetData(blocked));
});
