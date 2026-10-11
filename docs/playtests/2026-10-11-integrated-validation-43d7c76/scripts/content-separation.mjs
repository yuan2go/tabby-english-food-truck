import assert from 'node:assert/strict';
import {writeFile} from 'node:fs/promises';
import {createServer} from '/Users/dafangzi/.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/node_modules/vite/dist/node/index.js';
const server=await createServer({server:{middlewareMode:true},appType:'custom'});
try{
 const {VOCABULARY}=await server.ssrLoadModule('/src/content/vocabulary.ts');
 const {FOODS}=await server.ssrLoadModule('/src/content/foods.ts');
 const {REQUESTS}=await server.ssrLoadModule('/src/content/catalog.ts');
 const {RAW,RECIPES}=await server.ssrLoadModule('/src/content/recipes.ts');
 const {createGame,dispatch}=await server.ssrLoadModule('/src/rules/game.ts');
 const extra=VOCABULARY.filter(w=>w.group!=='food');
 const recipeInputs=new Set(RECIPES.flatMap(r=>r.inputs));
 const mealProducts=new Set(Object.values(REQUESTS).flatMap(r=>r.products));
 const rows=extra.map((w,i)=>{
  assert(!FOODS.some(f=>f.id===w.id));assert(!mealProducts.has(w.id));
  const legitimateContainer=w.id==='cup';
  if(legitimateContainer){assert(RAW.includes('cup'));assert(recipeInputs.has('cup'));}
  else{
   assert(!recipeInputs.has(w.id));
   const s=createGame(`negative-prop-${i}`);
   const r=dispatch(s,{id:'invalid-supply',runId:s.runId,command:{type:'move',source:{supply:w.id},destination:{tray:0}}});
   assert.equal(r.kind,'blocked');assert.deepEqual(r.state.items,[]);assert.equal(r.state.nextId,s.nextId);
  }
  return {id:w.id,chinese:w.chinese,legitimateContainer,notMeal:true,notFoodCatalog:true,unexpectedSupplyRejected:!legitimateContainer};
 });
 const result={concepts:VOCABULARY.length,foodCatalog:FOODS.length,extraConcepts:extra.length,rejectedNonSupply:rows.filter(x=>x.unexpectedSupplyRejected).length,exception:'cup is an existing real recipe container, not a new food or business order',rows};
 await writeFile(new URL('../engineering/content-separation.json',import.meta.url),JSON.stringify(result,null,2));console.log(JSON.stringify({...result,rows:undefined}));
}finally{await server.close();}
