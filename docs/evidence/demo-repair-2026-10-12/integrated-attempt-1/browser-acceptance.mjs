import { chromium } from '@playwright/test';
import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
const out = process.env.ACCEPTANCE_DIR ?? '/tmp/tabby-demo-final-2026-10-12/manual';
const url = process.env.ACCEPTANCE_URL ?? 'http://127.0.0.1:4294';
mkdirSync(out, {recursive:true});
const browser = await chromium.launch({channel:'chromium',headless:false});
const samples=[];const failures=[];
// Trusted input -> observed DOM state -> next two paint opportunities. This is
// browser response latency, never mobile hardware performance or FPS evidence.
async function measure(page, trigger, expected, act) {
 await page.evaluate(({trigger,expected})=> {
   Reflect.set(window,'demoMeasure',null);
   const listen=e=> { if (!(e.target instanceof Element) || !e.target.closest(trigger)) return;
     document.removeEventListener('pointerdown',listen,true);
     const started=performance.now();
     const check=()=> { const el=document.querySelector(expected); if (!el || !el.getClientRects().length) return;
       observer.disconnect(); requestAnimationFrame(()=>requestAnimationFrame(()=>Reflect.set(window,'demoMeasure',{domAndPaintMs:performance.now()-started,eventTrusted:e.isTrusted})));
     };
     const observer=new MutationObserver(check);observer.observe(document.body,{childList:true,subtree:true,attributes:true});check();
   };document.addEventListener('pointerdown',listen,true);
 },{trigger,expected});
 await act();await page.waitForFunction(()=>Reflect.get(window,'demoMeasure')!==null);
 return await page.evaluate(()=>Reflect.get(window,'demoMeasure'));
}
for(const layout of [
 {name:'desktop',viewport:{width:1280,height:720},isMobile:false,hasTouch:false},
 {name:'phone-simulation',viewport:{width:393,height:665},isMobile:true,hasTouch:true},
 {name:'Pad-simulation',viewport:{width:768,height:1024},isMobile:true,hasTouch:true}
]) for(let run=0;run<3;run++) {
 const context=await browser.newContext({...layout, deviceScaleFactor:1});
 const page=await context.newPage();
 await page.goto(url);await page.locator('.yard-story .entry-main').waitFor();
 await page.locator('.yard-cat').evaluate(el=>el.decode());
 const startup=await page.evaluate(()=>({usableHomeMs:performance.now(),paints:performance.getEntriesByType('paint').map(e=>({name:e.name,startTime:e.startTime})),navigation:performance.getEntriesByType('navigation').map(e=>({domContentLoaded:e.domContentLoadedEventEnd,load:e.loadEventEnd,transferSize:e.transferSize}))}));
 const build=await page.locator('main').evaluate(el=>({...el.dataset}));
 const act=async loc=>layout.hasTouch?loc.tap():loc.click();
 const entrance=await measure(page,'.yard-story .entry-main','.adventure-scene',()=>act(page.getByRole('button',{name:'正在准备 · 晨光开门',exact:true})));
 await act(page.getByRole('button',{name:'先帮兔兔',exact:true}));
 await act(page.getByRole('button',{name:'去厨房备餐',exact:true}));
 await act(page.getByRole('button',{name:'我来试试',exact:true}));
 const q=await page.locator('[data-hotspot="supply-apple"]').boundingBox();
 const supply=await measure(page,'canvas','[data-hotspot="item-food-1"]',()=> layout.hasTouch?page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2):page.mouse.click(q.x+q.width/2,q.y+q.height/2));
 const lift=await measure(page,'[data-hotspot="lift-tray-0"]','[data-hotspot="lift-tray-0"][aria-pressed="true"]',()=>act(page.locator('[data-hotspot="lift-tray-0"]')));
 const back=await measure(page,'.activity-kitchen-link','.adventure-scene',()=>act(page.getByRole('button',{name:'到活动桌',exact:true})));
 samples.push({layout:layout.name,run,quality:'default no-preference; fresh context',browser:browser.version(),build:{sha:build.buildSha,dirty:build.buildDirty,content:build.contentVersion,assets:build.assetVersion},startup,entrance,supply,lift,kitchenToTable:back});
 await context.close();
}
const context=await browser.newContext({viewport:{width:393,height:665},isMobile:true,hasTouch:true});const page=await context.newPage();
await page.goto(url);await page.getByRole('button',{name:'正在准备 · 晨光开门',exact:true}).tap();await page.getByRole('button',{name:'先帮兔兔',exact:true}).tap();await page.getByRole('button',{name:'去厨房备餐',exact:true}).tap();await page.getByRole('button',{name:'我来试试',exact:true}).tap();
const hot=async(id)=>{const q=await page.locator(`[data-hotspot="${id}"]`).boundingBox();await page.touchscreen.tap(q.x+q.width/2,q.y+q.height/2);};
await hot('machine-apple');await hot('supply-apple');await hot('start');
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2')));
const foreground=await stored();
const other=await context.newPage();await other.goto('about:blank');await other.bringToFront();
await page.waitForTimeout(600);const visibility=await page.evaluate(()=>document.visibilityState);const hiddenFirst=await stored();await page.waitForTimeout(1200);const hiddenLast=await stored();
await page.bringToFront();await page.waitForTimeout(150);const resumed=await stored();
const background={visibility,foregroundTime:foreground.gameTime,hiddenFirstTime:hiddenFirst.gameTime,hiddenLastTime:hiddenLast.gameTime,resumedTime:resumed.gameTime,itemIdsPreserved:hiddenLast.items.map(i=>i.id).join(',')===hiddenFirst.items.map(i=>i.id).join(','),actualBackgroundState:visibility==='hidden'&&hiddenFirst.gameTime===hiddenLast.gameTime?'PASS':'NOT_CONFIRMED',sound:await page.locator('main').getAttribute('data-audio-state')};
if (visibility==='hidden' && hiddenFirst.gameTime!==hiddenLast.gameTime)failures.push('background kitchen clock advanced');
await page.getByRole('button',{name:'点请求气泡重听',exact:true}).tap();await page.waitForFunction(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2')).orders.find(o=>o.status==='waiting')?.heard===true);
const audioUnlock={requestHeard:true,diagnostics:await page.locator('main').getAttribute('data-audio-state'),humanListening:'NOT_RUN'};
await page.screenshot({path:join(out,'background-audio-recovery-phone.png')});
await context.close();await browser.close();
writeFileSync(join(out,'browser-measurements.json'),JSON.stringify({method:'Headful Chromium on actual macOS desktop; phone/Pad are browser layout/touch simulations, DPR1, no CPU/network throttling. Three cold contexts per layout. Trusted pointerdown to observed committed DOM plus two paint opportunities; no FPS inference. Playwright roundtrip not included in response interval. Startup includes real app, images and scripts; local host only.',samples,background,audioUnlock,failures},null,2)+'\n');console.log(JSON.stringify({samples:samples.length,background,audioUnlock,failures},null,2));if(failures.length)process.exitCode=1;
