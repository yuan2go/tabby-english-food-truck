import {createRequire} from 'node:module';
import fs from 'node:fs';
import path from 'node:path';
const wt=process.env.TABBY_WT;
const require=createRequire(path.join(wt,'package.json'));
const {chromium}=require('playwright');
const base=process.env.TABBY_URL||'http://127.0.0.1:4294/';
const out=process.env.TABBY_OUT||'/tmp/tabby-continuous-play';
const first=process.env.TABBY_FIRST||'rabbit';
fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true,...(process.env.TABBY_PROXY?{proxy:{server:process.env.TABBY_PROXY}}:{})});
const context=await browser.newContext({viewport:{width:393,height:665},hasTouch:true});
const page=await context.newPage();
const log={base,first,started:new Date().toISOString(),actions:[],waits:[],screenshots:[],errors:[]};
page.on('pageerror',e=>log.errors.push(String(e)));
const state=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2')||'{}'));
const save=()=>fs.writeFileSync(path.join(out,'trajectory.json'),JSON.stringify(log,null,2)+'\n');
const now=()=>Date.now();
async function wait(label,pred,timeout=20000){const t=now();for(;;){let s=await state();if(pred(s)){log.waits.push({label,ms:now()-t,chapter:s.session?.chapter,wave:s.adventure?.flow?.wave});return s;}if(now()-t>timeout)throw Error('wait '+label);await page.waitForTimeout(100);}}
async function tap(locator,label){await locator.waitFor({state:'visible'});const box=await locator.boundingBox();if(!box)throw Error('no box '+label);const s=await state();const t=now();const cx=box.x+box.width/2,cy=box.y+box.height/2;if(cx<0||cy<0||cx>page.viewportSize().width||cy>page.viewportSize().height)throw Error('offscreen '+label);await page.touchscreen.tap(cx,cy);await page.waitForTimeout(100);const after=await state();log.actions.push({label,at:t,chapter:s.session?.chapter,wave:s.adventure?.flow?.wave,bounds:box,revisionBefore:s.revision,revisionAfter:after.revision});save();}
const button=name=>tap(page.getByRole('button',{name,exact:true}),name);
const hit=id=>tap(page.locator(`[data-hotspot="${id}"]`),id);
const names={apple:'苹果',banana:'香蕉',cup:'空杯',cone:'蛋筒',vanilla:'香草球',strawberry:'草莓球',bread:'面包',cheese:'芝士',lettuce:'生菜',tomato:'番茄',bun:'圆面包',patty:'生饼'};
const recipe={
 'vanilla-cone':['ice',['cone','vanilla']], 'strawberry-cup':['ice',['cup','strawberry']], 'vanilla-cup':['ice',['cup','vanilla']],
 'double-cream':['ice',['cup','vanilla','strawberry']], 'banana-cream':['ice',['cup','vanilla','banana']],
 sandwich:['board',['bread','cheese','bread']], 'salad-sandwich':['board',['bread','lettuce','tomato','bread']],
 'cooked-patty':['grill',['patty']], burger:['board',['bun','cooked-patty','lettuce','tomato']], 'cheese-burger':['board',['bun','cooked-patty','cheese']],
 juice:['machine',['apple','cup']], 'banana-juice':['machine',['banana','cup']]
};
const requests={apple:['apple'],banana:['banana'],two:['apple','apple'],fruit:['apple','banana'],'vanilla-cone':['vanilla-cone'],'strawberry-cup':['strawberry-cup'],'double-cream':['double-cream'],'banana-cream':['banana-cream'],sandwich:['sandwich'],'salad-sandwich':['salad-sandwich'],burger:['burger'],'cheese-burger':['cheese-burger'],juice:['juice'],'banana-juice':['banana-juice']};
async function made(product,station){const s=await wait('real prepared '+product,s=>s.items?.some(i=>i.product===product&&(station==='machine'?i.location==='machine:cup':i.location.startsWith(`station:${station}:`))));const item=s.items.find(i=>i.product===product&&(station==='machine'?i.location==='machine:cup':i.location.startsWith(`station:${station}:`)));await hit('item-'+item.id);}
async function ingredient(p,station){if(!names[p]){await make(p);await button('放到组合板');}else await button(`${station==='ice'?'冰淇淋':station==='grill'?'煎锅':station==='machine'?'果汁机':'组合板'}：${names[p]}`);}
async function make(product){if(!recipe[product])return hit('supply-'+product);const [station,inputs]=recipe[product];for(const p of inputs)await ingredient(p,station);if(station==='machine'||station==='grill')await button(station==='machine'?'启动果汁机':'启动煎台');await made(product,station);}
async function snap(name,views=false){const originals=page.viewportSize();for(const view of views?[originals,{width:665,height:393},{width:1280,height:720},{width:820,height:1180}]:[originals]){await page.setViewportSize(view);await page.waitForTimeout(150);const file=`${name}-${view.width}x${view.height}.png`;await page.screenshot({path:path.join(out,file)});log.screenshots.push(file);const geometry=await page.locator('.direct-kitchen button:visible,[data-actor]:visible').evaluateAll(nodes=>nodes.map(n=>({label:n.getAttribute('aria-label'),rect:n.getBoundingClientRect().toJSON(),hit:document.elementFromPoint(n.getBoundingClientRect().x+n.getBoundingClientRect().width/2,n.getBoundingClientRect().y+n.getBoundingClientRect().height/2)?.closest('button')===n})));log.geometry??=[];log.geometry.push({name,view,targets:geometry});}await page.setViewportSize(originals);save();}
async function serve(o){const products=requests[o.request];if(!products)throw Error('unknown order '+o.request);for(const p of products)await make(p);await tap(page.locator(`[data-actor="${o.visitor}"]`),'receive '+o.visitor);await wait('receive '+o.id,s=>s.orders.find(x=>x.id===o.id)?.status==='done');}
async function parallel(ch){await ingredient('patty','grill');await button('启动煎台');await ingredient('apple','machine');await ingredient('cup','machine');await button('启动果汁机');await ingredient('bun','board');await ingredient('cheese','board');await snap('04-parallel',true);await button('暂停');const frozen=await state();await page.reload();await tap(page.locator('.yard-story .entry-main'),'resume processing');const restored=await state();if(restored.runId!==frozen.runId||restored.machine.remaining>frozen.machine.remaining||frozen.machine.remaining-restored.machine.remaining>300||JSON.stringify(restored.items)!==JSON.stringify(frozen.items))throw Error('processing restore differs');await made('cooked-patty','grill');await button('放到组合板');await made('cheese-burger','board');const s=await state();await tap(page.locator('[data-actor="rabbit"]'),'parallel rabbit');await wait('parallel rabbit receive',s=>s.orders[0].status==='done');await made('juice','machine');await tap(page.locator('[data-actor="hedgehog"]'),'parallel hedgehog');await wait('parallel hedgehog receive',s=>s.orders[1].status==='done');}
try{
 await page.goto(base,{waitUntil:'networkidle',timeout:60000});
 log.build=await page.locator('[data-build-sha]').evaluate(n=>({sha:n.dataset.buildSha,dirty:n.dataset.buildDirty,assets:n.dataset.assetVersion}));
 if(process.env.TABBY_EXPECT_SHA&&(log.build.sha!==process.env.TABBY_EXPECT_SHA||log.build.dirty!=='false'))throw Error('wrong live build');
 log.initialStorage=await page.evaluate(()=>Object.keys(localStorage));
 await snap('00-home');
 await tap(page.locator('.yard-story .entry-main'),'main entrance');
 await wait('first natural guest',s=>s.orders?.some(o=>o.status==='waiting'));
 await snap('01-first-goal');
 await hit('supply-banana');await button('交给兔兔');
 const wrong=await state();if(wrong.adventure.foods.length!==0)throw Error('wrong food advanced');
 await snap('01-wrong-recover');await button('放回手中食品');
 for(let ch=0;ch<5;ch++){
   await wait('natural chapter '+ch,s=>s.session?.chapter===ch);
   await snap(`chapter-${ch+1}-start`);
   if(ch===3)await parallel(ch);
   for(;;){const s=await state();if(s.orders.every(o=>o.status==='done'))break;const ready=await wait('next natural guest',s=>s.orders.some(o=>o.status==='waiting'));const o=ready.orders.find(o=>o.status==='waiting'&&o.visitor===first)||ready.orders.find(o=>o.status==='waiting');await serve(o);if(ch===0&&o.id==='guest-0')await snap('01-first-reward');}
   if(ch===1){await wait('open dessert wave',s=>s.adventure.flow.wave===2);await make('strawberry-cup');await button('交给刺刺');await wait('actual open dessert',s=>s.adventure.foods.length===5);await snap('02-dessert-taste');}
   if(ch===2&&first==='rabbit'){await make('sandwich');await button('把食品放进野餐篮');await wait('pack sandwich',s=>s.adventure.foods.some(f=>f.place==='basket'));await hit('supply-banana');await button('把食品放进野餐篮');await wait('unpack actual food',s=>s.adventure.foods.length===4);await snap('03-picnic-route');}
   if(ch===4){for(const [visitor,product]of [['rabbit',first==='rabbit'?'sandwich':'juice'],['hedgehog','strawberry-cup']]){await make(product);await tap(page.locator(`[data-actor="${visitor}"]`),'share '+visitor);await wait('actual share '+visitor,s=>s.adventure.experience.needs.find(n=>n.visitor===visitor)?.fulfilled.length===1);}await wait('actual celebration',s=>s.adventure.flow.phase==='complete');await snap('05-celebration',true);await page.locator('.chapter-reward').waitFor({state:'hidden',timeout:6000});await snap('05-after-celebration');}
 }
 log.completedState=await state();
 await button('暂停');await button('收摊回小院');await snap('06-completed-yard');
 await tap(page.locator('.yard-endless .entry-main'),'free kitchen entrance');
 await button('暂停');await button('停止接客，做作品');
 await hit('supply-apple');await button('放到作品区');await wait('free actual work',s=>s.adventure.foods.length===1);await button('保存到食谱');await snap('07-free-kitchen');
 await button('暂停');await button('收摊回小院');await tap(page.locator('.yard-mini .entry-main'),'mini entrance');await snap('08-ten-mini');
 log.result='PASS';log.ended=new Date().toISOString();save();
 console.log(JSON.stringify({result:log.result,build:log.build,actions:log.actions.length,waits:log.waits.length,errors:log.errors,screenshots:log.screenshots.length,out}));
}catch(e){log.result='FAIL';log.failure=String(e);log.failureState=await state().catch(()=>null);await page.screenshot({path:path.join(out,'failure.png')}).catch(()=>{});save();console.error(e);process.exitCode=1;}finally{await context.close();await browser.close();}
