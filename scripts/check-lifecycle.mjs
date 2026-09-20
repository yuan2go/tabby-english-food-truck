import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { chromium } from '@playwright/test';

const directory = await mkdtemp(join(tmpdir(), 'tabby-lifecycle-'));
const child = spawn(
  chromium.executablePath(),
  [
    '--headless=new',
    '--remote-debugging-port=0',
    `--user-data-dir=${directory}`,
    '--no-first-run',
    '--no-default-browser-check',
    'about:blank',
  ],
  { stdio: 'ignore' },
);
let browser;
try {
  let port;
  for (let i = 0; i < 100; i++) {
    try {
      port = (await readFile(join(directory, 'DevToolsActivePort'), 'utf8')).split('\n')[0];
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert(port, 'Native browser startup');
  browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`, { noDefaults: true });
  const context = browser.contexts()[0],
    page = context?.pages()[0];
  assert(page, 'Native page');
  page.setDefaultTimeout(8000);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(process.argv[2] ?? 'http://127.0.0.1:4173/');
  await page.getByRole('button', { name: '小小餐车营业中' }).click();
  await page.getByRole('button', { name: '开摊啦', exact: true }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  const key = async (id) => page.locator(`[data-hotspot="${id}"]`).press('Enter');
  await key('supply-apple');
  await key('machine-apple');
  await key('supply-cup');
  await key('machine-cup');
  await key('start');
  await key('tray-1');
  await key('note');
  await page.locator('.word-bank').getByRole('button', { name: 'two', exact: true }).click();
  await page.locator('.word-bank').getByRole('button', { name: 'apples', exact: true }).click();
  await page.getByRole('button', { name: '交给小猫', exact: true }).click();
  const state = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.v1')));
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const before = await state();
  assert(before.helper, 'helper before freeze');
  await page.getByRole('button', { name: '继续营业', exact: true }).click();
  await page.evaluate(() => {
    const events = [];
    Object.defineProperty(window, 'lifecycleEvidence', { value: events });
    for (const name of ['freeze', 'resume', 'visibilitychange'])
      document.addEventListener(name, () => events.push(`${name}:${document.visibilityState}`));
  });
  const client = await context.newCDPSession(page);
  await client.send('Page.setWebLifecycleState', { state: 'frozen' });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await client.send('Page.setWebLifecycleState', { state: 'active' });
  // CDP resume keeps the prior hidden visibility; explicitly restore active focus.
  await client.send('Emulation.setFocusEmulationEnabled', { enabled: true });
  await page.bringToFront();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const after = await state();
  const events = await page.evaluate(() => Reflect.get(window, 'lifecycleEvidence'));
  assert(events.includes('freeze:hidden'), 'actual freeze event');
  assert(
    events.some((e) => e.startsWith('resume:')),
    'actual resume event',
  );
  assert(after.helper, 'helper still active');
  assert(
    before.helper.remaining - after.helper.remaining < 600,
    'helper must not accrue 1800 ms offline',
  );
  assert(
    before.machine.remaining - after.machine.remaining < 600,
    'machine must not accrue 1800 ms offline',
  );
  const report = {
    events,
    offlineMilliseconds: 1800,
    beforeHelper: before.helper.remaining,
    afterHelper: after.helper.remaining,
    beforeMachine: before.machine.remaining,
    afterMachine: after.machine.remaining,
  };
  await writeFile(
    'docs/evidence/m1-upgrade/native-lifecycle.json',
    JSON.stringify(report, null, 2),
  );
  await page.screenshot({ path: 'docs/evidence/m1-upgrade/native-resume.png', timeout: 5000 });
  console.log(JSON.stringify(report));
  await client.detach();
} finally {
  await browser?.close();
  child.kill();
  await new Promise((resolve) =>
    child.exitCode !== null ? resolve() : child.once('exit', resolve),
  );
  await rm(directory, { recursive: true, force: true });
}
