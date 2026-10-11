import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createServer} from '/Users/dafangzi/.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/node_modules/vite/dist/node/index.js';
const out=new URL('../engineering/contract-probes.json',import.meta.url);
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
const results=[];
try {
 const {createGame,dispatch,advance}=await server.ssrLoadModule('/src/rules/game.ts');
 const {decodeSnapshot}=await server.ssrLoadModule('/src/rules/snapshot.ts');
 const {RECIPES}=await server.ssrLoadModule('/src/content/recipes.ts');
 const {createScene,sceneCommand}=await server.ssrLoadModule('/src/rules/scene-games.ts');
 const {SCENE_LEVELS}=await server.ssrLoadModule('/src/content/scene-levels.ts');
 let serial=0;
 const send=(s,command)=>dispatch(s,{id:`independent-${++serial}`,runId:s.runId,command});
 const put=(s,p,t=0)=>send(s,{type:'move',source:{supply:p},destination:{tray:t}}).state;
 const act=(s,action,extra={})=>send(s,{type:'adventure',action,...extra});
 const start=(chapter)=>send(createGame(`contract-${++serial}`,0,{},'practice'),{type:'adventure-start',chapter}).state;
 const make=(s,p,t=0)=>{
  const r=RECIPES.find(x=>x.output===p); if(!r)return put(s,p,t);
  s=send(s,{type:'family',family:r.family}).state;
  for(const input of r.inputs){
   if(input==='cooked-patty'){s=make(s,input,t);continue;}
   s=send(s,{type:'move',source:{supply:input},destination:r.station==='machine'?{machine:input==='cup'?'cup':'apple'}:{station:r.station}}).state;
  }
  const r0=send(s,r.station==='machine'?{type:'start-machine',tray:t}:{type:'start-station',station:r.station, tray:t});
  assert.equal(r0.kind,'ok');return advance(r0.state,30000);
 };
 // External contract examples: an apple+banana order rejects missing, extra,
 // and wrong fruit; accepts either spatial order. Inventory must remain whole.
 for(const [foods,expected] of [[['apple'],'mismatch'],[['banana'],'mismatch'],[['apple','banana','apple'],'mismatch'],[['banana','apple'],'ok'],[['apple','banana'],'ok']]){
  let s=createGame(`strict-${++serial}`);for(const p of foods)s=put(s,p);
  const r=send(s,{type:'deliver',tray:0,order:'guest-1'});
  assert.equal(r.kind,expected);
  if(expected==='mismatch')assert.deepEqual(r.state.items,s.items);
  else assert.equal(r.state.items.filter(x=>x.location.startsWith('delivery:')).length,2);
  results.push({probe:'strict-order',foods,expected,result:'PASS'});
 }
 // Open commission: independently enumerate the declared cool dessert family,
 // all normal recipe commands; no fabricated outputs or completed-state writes.
 for(const p of ['vanilla-cone','strawberry-cone','vanilla-cup','strawberry-cup','double-cream']){
  let s=make(start(1),p);let n=s.attempts.length;let r=act(s,'cool',{tray:0});
  assert.equal(r.kind,'ok');s=advance(r.state,30000);
  assert.equal(s.adventure.foods[0].product,p);assert.equal(s.attempts.length,n);
  results.push({probe:'open-cool',food:p,result:'PASS'});
 }
 let bad=make(start(1),'strawberry-cup');bad=put(bad,'apple');let rbad=act(bad,'cool',{tray:0});
 assert.equal(rbad.kind,'blocked');assert.deepEqual(rbad.state.items,bad.items);
 results.push({probe:'open-extra-food',result:'PASS'});
 let free=start(4);for(const p of ['apple','banana','apple'])free=put(free,p);
 free=advance(act(free,'create',{tray:0}).state,30000);
 const foodIds=free.adventure.foods.map(x=>x.id);assert.equal(foodIds.length,3);
 for(let i=0;i<3;i++)free=act(free,'place',{item:foodIds[i],seat:2-i}).state;
 free=act(free,'taste',{item:foodIds[0]}).state;
 free=act(free,'save-work').state;free=act(free,'save-work').state;
 assert.equal(free.items.length,0);assert.equal(free.adventure.works.length,1);assert.equal(free.attempts.length,0);
 results.push({probe:'free-creation-save-idempotent',actualFoods:foodIds,result:'PASS'});
 // All declared alternate sorting destinations, not only the first solution.
 let sortCount=0;
 for(const l of SCENE_LEVELS.filter(x=>x.kind==='sort'))for(let round=0;round<l.tasks.length;round++){
  const task=l.tasks[round];
  function* combinations(keys,at=0,chosen=[]){if(at===keys.length){yield chosen;return;}for(const place of task.legal[keys[at]])yield* combinations(keys,at+1,[...chosen,[keys[at],place]]);}
  for(const combo of combinations(Object.keys(task.legal))){
   let s=sceneCommand(createScene(l,`sort-${++serial}`,123),{type:'start'});
   // Advance previous tasks with real domain commands to the desired round.
   for(let j=0;j<round;j++){s=sceneCommand(s,{type:'play'});for(const [id,places]of Object.entries(l.tasks[j].legal)){s=sceneCommand(s,{type:'take',object:id});s=sceneCommand(s,{type:'place',place:places[0]});}s=sceneCommand(s,{type:'check'});assert.equal(s.phase,'feedback');s=sceneCommand(s,{type:'next'});}
   s=sceneCommand(s,{type:'play'});
   for(const [id,place]of combo){s=sceneCommand(s,{type:'take',object:id});s=sceneCommand(s,{type:'place',place});}
   s=sceneCommand(s,{type:'check'});assert.equal(s.phase,'feedback');sortCount++;
  }
 }
 results.push({probe:'all-declared-sort-solutions',solutions:sortCount,result:'PASS'});
 // Migration fixtures are generated from this repository's public commands.
 // They are engineering evidence, not natural player completion.
 let cooking=createGame('fixture');cooking=send(cooking,{type:'prepare-cup'}).state;
 cooking=send(cooking,{type:'move',source:{supply:'apple'},destination:{machine:'apple'}}).state;
 cooking=send(cooking,{type:'start-machine',tray:1}).state;
 for(const schema of [3,4,5,6,7]){
  const old=structuredClone(cooking);old.schemaVersion=schema;
  if(schema===3){old.contentVersion='m2.0';delete old.session.concurrency;delete old.session.menu;for(const o of old.orders)delete o.heard;}
  if(schema===4){old.contentVersion='m2.1';delete old.routing;}
  if(schema===5)delete old.session.language;
  if(schema===6)old.contentVersion='m2.4-adventure-1';
  const d=decodeSnapshot(JSON.stringify(old));assert.equal(d.ok,true,d.reason);
  assert.deepEqual(d.state.items,cooking.items);assert.equal(d.state.machine.remaining,cooking.machine.remaining);
  assert.equal(d.state.adventure,null);let done=advance(d.state,5000);assert.equal(done.items.length,1);assert.equal(done.items[0].product,'juice');
  results.push({probe:'migration',schema,foodIdentity:done.items[0].id,destination:done.items[0].location,result:'PASS'});
 }
 await writeFile(out,JSON.stringify({method:'public domain commands; external expected contract examples; no completion injection',results},null,2));
 console.log(JSON.stringify({passed:results.length,sortSolutions:sortCount}));
}finally{await server.close();}
