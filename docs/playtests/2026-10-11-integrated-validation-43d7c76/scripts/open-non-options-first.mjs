import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createServer} from '/Users/dafangzi/.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/node_modules/vite/dist/node/index.js';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {createGame,dispatch,advance}=await server.ssrLoadModule('/src/rules/game.ts');
 const {RECIPES}=await server.ssrLoadModule('/src/content/recipes.ts');
 let serial=0;const send=(s,c)=>dispatch(s,{id:String(++serial),runId:s.runId,command:c});const rows=[];
 for(const product of ['vanilla-cone','strawberry-cone']){
  let s=send(createGame(`not-open-${product}`,0,{},'practice'),{type:'adventure-start',chapter:1}).state;
  const recipe=RECIPES.find(r=>r.output===product);assert(recipe);
  s=send(s,{type:'family',family:'ice'}).state;
  for(const input of recipe.inputs)s=send(s,{type:'move',source:{supply:input},destination:{station:'ice'}}).state;
  const started=send(s,{type:'start-station',station:'ice',tray:0});assert.equal(started.kind,'ok');s=advance(started.state,30000);
  const r=send(s,{type:'adventure',action:'cool',tray:0});assert.equal(r.kind,'blocked');assert.deepEqual(r.state.items,s.items);
  rows.push({product,result:'PASS',reason:r.message,inventoryPreserved:true});
 }
 await writeFile(new URL('../engineering/open-non-options.json',import.meta.url),JSON.stringify(rows,null,2));console.log('PASS 2 non-declared cones rejected without inventory loss');
}finally{await server.close();}
