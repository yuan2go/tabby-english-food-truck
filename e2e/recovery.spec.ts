import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import { RAW } from '../src/content/recipes';
import {
  choosePrep,
  hot,
  lesson,
  make,
  serve,
  startEndless,
  startStory,
  state,
  tap,
} from './helpers';

test.use({
  viewport: { width: 1024, height: 768 },
  deviceScaleFactor: 2,
  hasTouch: true,
  video: { mode: 'on', size: { width: 1024, height: 768 } },
});
test('M2 Pad prologue and real processing restore in portrait and landscape', async ({
  page,
}, info) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '重听故事', exact: true }).tap();
  await page.getByRole('button', { name: '接着听', exact: true }).tap();
  await page.getByRole('button', { name: '接着听', exact: true }).tap();
  await page.screenshot({ path: info.outputPath('pad-handover.png') });
  await page.getByRole('button', { name: '拿起食谱，开店啦', exact: true }).tap();
  await lesson(page);
  await serve(page);
  await lesson(page);
  await choosePrep(page, '果汁机');
  await tap(page, 'supply-apple');
  await tap(page, 'supply-cup');
  await tap(page, 'start');
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  const before = await state(page);
  expect(before.machine.status).toBe('processing');
  await page.setViewportSize({ width: 768, height: 1024 });
  await page.reload();
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  expect((await state(page)).runId).toBe(before.runId);
  await expect
    .poll(async () => (await state(page)).machine.status, { timeout: 15000 })
    .toBe('ready');
  const item = (await state(page)).items.find((i) => i.product === 'juice');
  if (!item) throw Error('juice');
  await tap(page, `item-${item.id}`);
  await choosePrep(page, '● 1号盘');
  await page.screenshot({ path: info.outputPath('pad-portrait-collected.png') });
  await page.getByRole('button', { name: '送给客人 ↗', exact: true }).tap();
  await expect
    .poll(async () => (await state(page)).orders.filter((o) => o.status === 'done').length, {
      timeout: 15000,
    })
    .toBe(2);
  await page.setViewportSize({ width: 1024, height: 768 });
  await lesson(page);
  await page.screenshot({ path: info.outputPath('pad-landscape-after.png') });
  expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(
    true,
  );
});
test('M2 actual helper and delivery overlap, reload, cancellation and continued motion', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await startEndless(page);
  await lesson(page);
  const startPoint = await hot(page, 'start');
  expect(
    await page.evaluate(
      ({ x, y }) => document.elementFromPoint(x, y)?.closest('.delivery-actions') !== null,
      startPoint,
    ),
  ).toBe(false);
  const first = (await state(page)).orders.find((o) => o.status === 'waiting');
  if (!first) throw Error('order');
  for (const p of REQUESTS[first.request].products) {
    if (RAW.includes(p)) {
      await choosePrep(page, '● 1号盘');
      await make(page, p);
    } else {
      const id = await make(page, p);
      await tap(page, `item-${id}`);
      await choosePrep(page, '● 1号盘');
    }
  }
  await tap(page, 'note');
  await page.getByRole('button', { name: '2号盘', exact: true }).tap();
  await page.getByRole('button', { name: '看图请小猫', exact: true }).tap();
  await page.getByRole('button', { name: '图片 banana', exact: true }).tap();
  await page.getByRole('button', { name: '交给小猫', exact: true }).tap();
  await page
    .getByRole('button', {
      name: first.seat === 0 ? '送给左边客人 ↗' : '送给右边客人 ↗',
      exact: true,
    })
    .tap();
  let s = await state(page);
  expect(s.helper).not.toBeNull();
  expect(s.actor.queue.some((j) => j.kind === 'delivery')).toBe(true);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  s = await state(page);
  const jobs = [s.actor.current?.plan.id, ...s.actor.queue.map((j) => j.plan.id)];
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  expect([
    (await state(page)).actor.current?.plan.id,
    ...(await state(page)).actor.queue.map((j) => j.plan.id),
  ]).toEqual(jobs);
  await page.evaluate(() => {
    const read = () =>
      JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').actor.point;
    const relevant = (e: Event) =>
      e.target instanceof Element && e.target.closest('button')?.textContent?.includes('撤回便签');
    document.addEventListener(
      'click',
      (e) => {
        if (relevant(e)) Reflect.set(window, 'm2CancelBefore', read());
      },
      true,
    );
    document.addEventListener('click', (e) => {
      if (relevant(e)) Reflect.set(window, 'm2CancelAfter', read());
    });
  });
  await page.getByRole('button', { name: '撤回便签', exact: true }).tap();
  expect((await state(page)).helper).toBeNull();
  const boundary = await page.evaluate(() => ({
    before: Reflect.get(window, 'm2CancelBefore'),
    after: Reflect.get(window, 'm2CancelAfter'),
  }));
  // Compare the same native click, excluding Playwright's actionability delay.
  expect(
    Math.hypot(boundary.after.x - boundary.before.x, boundary.after.y - boundary.before.y),
  ).toBeLessThan(0.000001);
  await writeFile(info.outputPath('cancel-boundary.json'), JSON.stringify(boundary));
  const samples = await page.evaluate(async () => {
    const result = [];
    for (let i = 0; i < 150; i++) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const c = document.querySelector('canvas');
      result.push({ x: Number(c?.dataset.catX), y: Number(c?.dataset.catY) });
    }
    return result;
  });
  const deltas = samples
    .slice(1)
    .map((p, i) => Math.hypot(p.x - (samples[i]?.x ?? p.x), p.y - (samples[i]?.y ?? p.y)));
  expect(Math.max(...deltas)).toBeLessThan(0.08);
  expect(
    Math.max(...samples.map((p) => p.y)) - Math.min(...samples.map((p) => p.y)),
  ).toBeGreaterThan(0.04);
  await writeFile(info.outputPath('overlap-motion.json'), JSON.stringify(samples));
  await info.attach('overlap-motion', {
    body: JSON.stringify(samples),
    contentType: 'application/json',
  });
  await expect.poll(async () => (await state(page)).session.served, { timeout: 18000 }).toBe(1);
});
test('M2 touch cancellation and multi-pointer never add, remove or submit food', async ({
  page,
}) => {
  await startStory(page);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-apple');
  await page.waitForTimeout(350);
  const before = await state(page),
    item = before.items[0];
  if (!item) throw Error('item');
  const a = await hot(page, `item-${item.id}`),
    b = await hot(page, 'clear');
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  await c.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ ...b, id: 1 }] });
  await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  await c.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { ...a, id: 1 },
      { x: a.x + 55, y: a.y, id: 2 },
    ],
  });
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  await c.detach();
});
test('M2 unsupported snapshot is protected and exported before explicit reset', async ({
  page,
}) => {
  const bad = '{"schemaVersion":999,"keep":"do not overwrite"}';
  await page.addInitScript((raw) => {
    if (!sessionStorage.getItem('fault-installed')) {
      localStorage.setItem('tabby.foodtruck.save.m2', raw);
      sessionStorage.setItem('fault-installed', 'true');
    }
  }, bad);
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  await expect(page.getByRole('heading', { name: '存档需要处理' })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem('tabby.foodtruck.save.m2'))).toBe(bad);
  await page.getByRole('button', { name: '导出与设置', exact: true }).tap();
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出全部本地进度', exact: true }).tap();
  expect((await download).suggestedFilename()).toBe('tabby-m2-progress.json');
  expect(await page.evaluate(() => localStorage.getItem('tabby.foodtruck.save.m2'))).toBe(bad);
});

test('M2 native background freeze stops clock, helper, machine and audio', async () => {
  test.setTimeout(60000);
  execFileSync(process.execPath, ['scripts/check-lifecycle.mjs', 'http://127.0.0.1:4174/'], {
    timeout: 45000,
    stdio: 'pipe',
  });
});
