import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';

const out = path.dirname(new URL(import.meta.url).pathname);
const url = 'https://tabby-english-food-truck.aw9923299.chatgpt.site';
const sha = '829bb7ffe68d2110cf4a9165f85d45febf25e2bd';
const browser = await chromium.launch({ headless: true, proxy: { server: 'http://127.0.0.1:1082' } });
const result = { url, expectedSha: sha, started: new Date().toISOString(), sessions: [] };
try {
  for (const viewport of [{ width: 393, height: 665 }, { width: 1280, height: 720 }]) {
    const context = await browser.newContext({ viewport, hasTouch: true });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push(String(e)));
    const response = await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60000 });
    await page.locator('.yard-story .entry-main').waitFor({ timeout: 30000 });
    const build = await page.locator('[data-build-sha]').evaluate(n => ({ sha: n.dataset.buildSha, dirty: n.dataset.buildDirty, content: n.dataset.contentVersion, assets: n.dataset.assetVersion }));
    if (response.status() !== 200 || build.sha !== sha || build.dirty !== 'false' || build.content !== 'continuous-gameplay-1') throw Error('HTTP or build identity differs');
    const initialStorage = await page.evaluate(() => Object.keys(localStorage));
    const releaseResponse = await context.request.get(url + '/site-release.json');
    const release = await releaseResponse.json();
    if (release.github_main_sha !== sha) throw Error('Public release metadata differs');
    await page.locator('.yard-story .entry-main').tap();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') || '{}').orders?.some(o => o.status === 'waiting'));
    const state = () => page.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') || '{}'));
    await page.locator('[data-hotspot="supply-banana"]').tap();
    await page.getByRole('button', { name: '交给兔兔', exact: true }).tap();
    const wrong = await state();
    if (wrong.adventure.foods.length !== 0 || !wrong.items.some(i => i.product === 'banana')) throw Error('Wrong delivery lost food or advanced');
    await page.getByRole('button', { name: '放回手中食品', exact: true }).tap();
    await page.locator('[data-hotspot="supply-apple"]').tap();
    await page.getByRole('button', { name: '交给兔兔', exact: true }).tap();
    await page.waitForFunction(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') || '{}').adventure?.foods?.length === 1);
    const delivered = await state();
    if (delivered.adventure.foods[0].product !== 'apple') throw Error('Actual receipt differs');
    const screenshot = `public-${viewport.width}x${viewport.height}.png`;
    await page.screenshot({ path: path.join(out, screenshot) });
    if (errors.length) throw Error('Page errors: ' + errors.join('; '));
    result.sessions.push({ viewport, httpStatus: response.status(), build, initialStorage, publicMetadata: release, wrongDeliveryFoodRetained: true, actualAppleReceipt: true, errors, screenshot });
    await context.close();
  }
  result.status = 'PASS';
} catch (error) {
  result.status = 'FAIL';
  result.failure = String(error);
  process.exitCode = 1;
} finally {
  result.finished = new Date().toISOString();
  fs.writeFileSync(path.join(out, 'anonymous-verification.json'), JSON.stringify(result, null, 2) + '\n');
  await browser.close();
}
console.log(JSON.stringify(result));
