import { chromium } from '@playwright/test';
import {writeFileSync,mkdirSync} from 'node:fs';
const out='/tmp/tabby-demo-final-5-2026-10-12/native-background';mkdirSync(out,{recursive:true});
const browser=await chromium.launch({channel:'chromium',headless:false,ignoreDefaultArgs:['--disable-backgrounding-occluded-windows','--disable-renderer-backgrounding']});
const context=await browser.newContext({viewport:{width:393,height:665},hasTouch:true,isMobile:false});const page=await context.newPage();
await page.goto('http://127.0.0.1:4295/build/');await page.getByRole('button',{name:'正在准备 · 晨光开门',exact:true}).tap();await page.getByRole('button',{name:'先帮兔兔',exact:true}).tap();await page.getByRole('button',{name:'去厨房备餐',exact:true}).tap();await page.getByRole('button',{name:'我来试试',exact:true}).tap();
const hot=async id=>{const b=await page.locator(`[data-hotspot="${id}"]`).boundingBox();await page.touchscreen.tap(b.x+b.width/2,b.y+b.height/2);};
await hot('machine-apple');await hot('supply-apple');await hot('start');
const stored=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2')));
const record={method:'Headful desktop Chromium phone layout with touch; normal native new tab and return, default Playwright background-disabling flags removed. No synthetic visibility events or clock advancement.',build:await page.locator('main').evaluate(el=>({...el.dataset})),initial:await stored()};
console.log('READY_FOR_NATIVE_HIDE');
try {
 await page.waitForFunction(()=>document.visibilityState==='hidden',null,{timeout:60000,polling:100});record.visibility=await page.evaluate(()=>document.visibilityState);record.hiddenFirst=await stored();record.hiddenSound=await page.locator('main').getAttribute('data-audio-state');await page.waitForTimeout(3200);record.hiddenLast=await stored();
 console.log('HIDDEN_RECORDED_RESTORE_WINDOW');await page.waitForFunction(()=>document.visibilityState==='visible',null,{timeout:45000,polling:100});await page.waitForTimeout(2400);record.resumed=await stored();record.status=record.hiddenFirst.gameTime===record.hiddenLast.gameTime&&record.resumed.gameTime>record.hiddenLast.gameTime?'PASS':'FAIL';
} catch(e){record.status='NOT_CONFIRMED';record.error=String(e);}
writeFileSync(out+'/result.json',JSON.stringify(record,null,2));console.log(record.status);await browser.close();if(record.status==='FAIL')process.exitCode=1;
