import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
const require = createRequire(join(process.cwd(), 'package.json'));
const { chromium, expect } = require('@playwright/test');
const url = process.env.SITE_TEST_URL;
if (!url) throw Error('SITE_TEST_URL required');
const out = process.env.SITE_TEST_OUTPUT;
if (!out) throw Error('SITE_TEST_OUTPUT required');
mkdirSync(out, { recursive: true });
const browser = await chromium.launch({ channel: 'chromium' });
const context = await browser.newContext({ viewport: { width: 1280, height: 720 }, hasTouch: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', e => errors.push(e.message));
const initialCookies = (await context.cookies()).length;
const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
await expect(page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true })).toBeVisible({ timeout: 60000 });
const identity = await page.locator('main').evaluate(e => ({ ...e.dataset }));
expect(identity.buildSha).toBe(process.env.SITE_TEST_EXPECTED_SOURCE);
expect(identity.buildDirty).toBe('false');
const releaseResponse = await context.request.get(new URL('site-release.json', url).href);
expect(releaseResponse.status()).toBe(200);
const release = await releaseResponse.json();
expect(release.githubMainSha).toBe(process.env.SITE_TEST_EXPECTED_GITHUB);
const dist = process.env.SITE_TEST_DIST;
if (!dist) throw Error('SITE_TEST_DIST required for final deployed artifact comparison');
const staticBuildFiles = [];
for (const name of readdirSync(join(dist, 'assets')).filter(f => /\.(js|css)$/.test(f))) {
 const r = await context.request.get(new URL('assets/' + name, url).href);
 expect(r.status()).toBe(200);
 const sha = data => createHash('sha256').update(data).digest('hex');
 const localSha256 = sha(readFileSync(join(dist, 'assets', name)));
 const deployedSha256 = sha(await r.body());
 expect(deployedSha256).toBe(localSha256);
 staticBuildFiles.push({ file:'assets/'+name, status:r.status(), localSha256, deployedSha256 });
}
await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
await page.getByRole('button', { name: '我来试试', exact: true }).click({ timeout: 60000 });
await expect(page.locator('.loading-page')).toHaveCount(0);
await expect(page.locator('.conversation .sentence-text')).toHaveText('Can I have an apple, please?');
await page.screenshot({ path: join(out, '04-online-kitchen.png') });
const hot = async id => {
 const q = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
 if (!q) throw Error(id);
 await page.touchscreen.tap(q.x + q.width / 2, q.y + q.height / 2 + (id === 'guest-0' ? 20 : 0));
};
const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}'));
await hot('supply-apple');
await hot('lift-tray-0');
await hot('guest-0');
await expect.poll(async () => (await state()).orders[0]?.status, { timeout: 30000 }).toBe('done');
await page.getByRole('button', { name: '到活动桌', exact: true }).click();
const received = await state();
expect(received.adventure?.foods[0]?.product).toBe('apple');
const layouts = [];
for (const [width, height] of [[1280,720],[393,665],[852,300],[768,1024]]) {
 await page.setViewportSize({ width, height });
 await expect(page.locator('canvas')).toHaveAttribute('data-world-width', String(width));
 await expect(page.locator('canvas')).toHaveAttribute('data-world-height', String(height));
 const controls = [];
 for (const name of ['重看朋友使用','跳过朋友演出','低动态表现']) {
  const button = page.getByRole('button', { name, exact: true });
  await expect(button).toBeInViewport({ ratio: 1 });
  const fact = await button.evaluate(el => {
   const r = el.getBoundingClientRect();
   return { x:r.x,y:r.y,width:r.width,height:r.height,reachable:[0.25,0.5,0.75].every(n => {const hit=document.elementFromPoint(r.x+r.width*n,r.y+r.height/2);return hit===el || (hit!==null&&el.contains(hit));})};
  });
  expect(fact.width).toBeGreaterThanOrEqual(48);expect(fact.height).toBeGreaterThanOrEqual(48);expect(fact.reachable).toBe(true);
  controls.push({ name, ...fact });
 }
 const guide = await page.locator('.activity-world > .goal-guide').evaluate(el => {
  const picture = el.querySelector('.goal-pictures');if (!picture) return { valid:false };
  const p = picture.getBoundingClientRect();const b=el.getBoundingClientRect();
  const visible = child => getComputedStyle(child).display !== 'none';
  const picturesContained = [...picture.children].filter(visible).every(child => {const r=child.getBoundingClientRect();return r.left>=p.left-1&&r.right<=p.right+1;});
  const children=[...el.children].filter(visible);
  const separated = children.every((child,n) => {const r=child.getBoundingClientRect();const next=children[n+1]?.getBoundingClientRect();return r.left>=b.left-1&&r.right<=b.right+1&&(!next||r.right<=next.left+1||r.bottom<=next.top+1);});
  return { valid:picturesContained&&separated,picturesContained,separated,width:b.width,captionVisible:visible(el.querySelector('.guide-caption')) };
 });
 expect(guide.valid).toBe(true);
 const sentence = await page.locator('.conversation .sentence-text').innerText();
 const image = `online-table-${width}x${height}.png`;
 await page.screenshot({ path: join(out, image) });
 layouts.push({ width, height, controls, guide, sentence, image });
}
expect(errors).toEqual([]);
const files = ['04-online-kitchen.png', ...layouts.map(l => l.image)];
const result = { checkedAt:new Date().toISOString(), url, actualUrl:page.url(), htmlStatus:response.status(), initialCookies, freshAnonymousContext:true, browser:browser.version(), identity, release, staticBuildFiles, normalPath:'fresh homepage -> morning -> welcome rabbit -> picture lesson -> complete English apple request -> supply apple -> lift whole tray -> explicit delivery -> actual receipt -> activity table', receivedFoods:received.adventure.foods, attempts:received.attempts, layouts, pageErrors:errors, screenshots:Object.fromEntries(files.map(f=>[f,createHash('sha256').update(readFileSync(join(out,f))).digest('hex')])) };
writeFileSync(join(out,'live-verification.json'),JSON.stringify(result,null,2)+'\n');
await browser.close();
console.log(JSON.stringify({ htmlStatus:result.htmlStatus, anonymous:true, identity, layouts:layouts.length, staticBuildFilesMatched:staticBuildFiles.length, guideBounds:true, pageErrors:errors }));
