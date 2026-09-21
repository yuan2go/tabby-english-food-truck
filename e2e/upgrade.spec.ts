import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { choosePrep, drag, lesson, serve, startEndless, startStory, state, tap } from './helpers';

test.use({ hasTouch: true });
test('M2 actor continuity teaching exit, helper-delivery overlap, cancel, pause, rotation', async ({
  page,
}, info) => {
  test.setTimeout(90000);
  await startStory(page);
  await page.getByRole('button', { name: '打开小食谱', exact: true }).tap();
  const teachingMotion = page.evaluate(async () => {
    const points = [];
    for (let n = 0; n < 150; n++) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const c = document.querySelector('canvas');
      points.push({ x: Number(c?.dataset.catX), y: Number(c?.dataset.catY) });
    }
    return points;
  });
  await page.waitForTimeout(600);
  await lesson(page);
  const teachingPoints = await teachingMotion;
  expect(
    Math.max(
      ...teachingPoints
        .slice(1)
        .map((p, i) =>
          Math.hypot(p.x - (teachingPoints[i]?.x ?? p.x), p.y - (teachingPoints[i]?.y ?? p.y)),
        ),
    ),
  ).toBeLessThan(0.08);
  await writeFile(info.outputPath('teaching-exit-motion.json'), JSON.stringify(teachingPoints));
  await info.attach('teaching-exit-motion', {
    body: JSON.stringify(teachingPoints),
    contentType: 'application/json',
  });
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-apple');
  await tap(page, 'note');
  await page.getByRole('button', { name: '图片 banana', exact: true }).tap();
  await page.getByRole('button', { name: '交给小猫', exact: true }).tap();
  await page.getByRole('button', { name: '送给客人 ↗' }).tap(); // blocked by this tray reservation, not a language error
  expect((await state(page)).attempts).toHaveLength(0);
  const samples = await page.evaluate(async () => {
    const values: { x: number; y: number }[] = [];
    for (let i = 0; i < 120; i++) {
      await new Promise<void>((r) => requestAnimationFrame(() => r()));
      const c = document.querySelector('canvas');
      values.push({ x: Number(c?.dataset.catX), y: Number(c?.dataset.catY) });
    }
    return values;
  });
  let max = 0;
  for (let i = 1; i < samples.length; i++) {
    const a = samples[i],
      b = samples[i - 1];
    if (a && b) max = Math.max(max, Math.hypot(a.x - b.x, a.y - b.y));
  }
  expect(max).toBeLessThan(0.08);
  await writeFile(info.outputPath('continuous-actor-samples.json'), JSON.stringify(samples));
  await info.attach('continuous-actor-samples', {
    body: JSON.stringify(samples),
    contentType: 'application/json',
  });
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  const before = await state(page);
  await page.waitForTimeout(400);
  expect((await state(page)).helper?.remaining).toBe(before.helper?.remaining);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: info.outputPath('pad-paused.png') });
  await page.getByRole('button', { name: '继续营业' }).tap();
  await expect.poll(async () => (await state(page)).helper, { timeout: 15000 }).toBeNull();
});
test('M2 endless replenishes, restores seed/cursor and bounds active state', async ({
  page,
}, info) => {
  test.setTimeout(200000);
  await startEndless(page);
  for (let n = 0; n < 8; n++) {
    await serve(page);
    await lesson(page);
  }
  const before = await state(page);
  expect(before.session.served).toBe(8);
  expect(before.orders).toHaveLength(2);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  await page.getByRole('button', { name: '保存并回到首页' }).tap();
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续' }).tap();
  const after = await state(page);
  expect(after.session.seed).toBe(before.session.seed);
  expect(after.session.cursor).toBe(before.session.cursor);
  expect(after.orders).toEqual(before.orders);
  await page.screenshot({ path: info.outputPath('endless-continued.png') });
});
test('M2 drag and keyboard equivalent; selected guest never changes to correct answer', async ({
  page,
}) => {
  await startEndless(page);
  await choosePrep(page, '● 1号盘');
  await drag(page, 'supply-apple', 'tray-0');
  expect(
    (await state(page)).items.some((i) => i.product === 'apple' && i.location.startsWith('tray:0')),
  ).toBe(true);
  await page.locator('[data-hotspot="supply-banana"]').press('Enter');
  expect((await state(page)).items).toHaveLength(2);
  const before = await state(page);
  await tap(page, 'guest-1');
  expect((await state(page)).attempts.length).toBe(before.attempts.length);
  await drag(page, 'tray-0', 'guest-1');
  expect((await state(page)).orders[0]?.status).toBe('waiting');
});
test('M2 phone DPR and Pad composition, failed asset/audio retry keeps progress', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  let deny = true;
  await page.route('**/assets/banana.webp*', (r) => (deny ? r.abort() : r.continue()));
  await page.route('**/audio/request-*.wav*', (r) => r.abort());
  await startStory(page);
  await expect(page.locator('.resource-alert')).toBeVisible();
  const before = await state(page);
  deny = false;
  await page.getByRole('button', { name: '重试画面' }).tap();
  await expect(page.locator('.resource-alert')).toHaveCount(0);
  expect((await state(page)).runId).toBe(before.runId);
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.screenshot({ path: info.outputPath('pad-landscape.png') });
  expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(
    true,
  );
});

test('M2 teaching practice starts at the courtyard and completes its own five-request session', async ({
  page,
}, info) => {
  test.setTimeout(160000);
  await page.goto('/');
  await page.locator('.yard-training .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  await lesson(page);
  expect((await state(page)).session.activity).toBe('training');
  const total = (await state(page)).orders.length;
  expect(total).toBe(5);
  for (let n = 0; n < total; n++) await serve(page);
  await expect(page.locator('.ending')).toBeVisible();
  const profile = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  );
  expect(profile.completed).toEqual([]);
  await page.screenshot({ path: info.outputPath('training-ending.png') });
  await page.getByRole('button', { name: '回小院', exact: true }).tap();
  await expect(page.locator('.yard-story')).toBeVisible();
});
