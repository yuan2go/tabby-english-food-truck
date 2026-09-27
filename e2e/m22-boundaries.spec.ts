import { expect, test } from '@playwright/test';
import { layoutFor } from '../src/game/layout';
import { hot, lesson, startEndless, startStory, state, tap } from './helpers';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});
test('phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory', async ({
  page,
}, info) => {
  await startEndless(page, false);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  await page.getByRole('button', { name: '设置', exact: true }).tap();
  await page.getByRole('button', { name: '两位一起招呼' }).tap();
  await page.getByRole('button', { name: '← 返回', exact: true }).tap();
  await expect
    .poll(
      async () => (await state(page)).orders.filter((order) => order.status === 'waiting').length,
      {
        timeout: 15000,
      },
    )
    .toBe(2);
  await tap(page, 'tray-0');
  await page.getByRole('button', { name: '放盘', exact: true }).tap();
  await tap(page, 'supply-banana');
  await expect
    .poll(async () => (await state(page)).items.find((item) => item.product === 'banana')?.location)
    .toMatch(/^tray:0:/);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  const banana = (await state(page)).items[0];
  if (!banana) throw Error('banana');
  await page.waitForTimeout(300);
  await tap(page, `item-${banana.id}`);
  await page.getByRole('button', { name: '↩ 放回这份', exact: true }).tap();
  expect((await state(page)).items).toHaveLength(0);
  await tap(page, 'machine-apple');
  await tap(page, 'supply-apple');
  await tap(page, 'start');
  await tap(page, 'tray-0');
  await tap(page, 'supply-banana');
  await tap(page, 'supply-apple');
  const full = await state(page);
  expect(full.routing.machine).not.toBeNull();
  await tap(page, 'supply-apple');
  const stillFull = await state(page);
  expect(stillFull.nextId).toBe(full.nextId);
  expect(stillFull.items.every((item) => full.items.some((prior) => prior.id === item.id))).toBe(
    true,
  );
  if (stillFull.machine.status === 'empty') {
    const cup = full.items.find((item) => item.location === 'machine:cup');
    const apple = full.items.find((item) => item.location === 'machine:apple');
    expect(stillFull.items.find((item) => item.id === cup?.id)).toMatchObject({
      product: 'juice',
      location: 'tray:0:0',
    });
    expect(stillFull.items.some((item) => item.id === apple?.id)).toBe(false);
  } else expect(stillFull.items).toEqual(full.items);
  const attempts = (await state(page)).attempts.length;
  await page.getByRole('button', { name: '送给左边客人 ↗', exact: true }).tap();
  expect((await state(page)).attempts).toHaveLength(attempts);
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  const frozen = await state(page);
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续' }).tap();
  await lesson(page);
  const restored = await state(page);
  const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  const vessel = frozen.items.find((i) => i.location === 'machine:cup' || i.product === 'juice');
  const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  expect(restored.items.map((i) => i.id)).toEqual(
    frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  );
  for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
    expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  if (alreadyFinished)
    expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
  await expect
    .poll(
      async () =>
        (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
      { timeout: 15000 },
    )
    .toBe(true);
  const juice = (await state(page)).items.find((i) => i.product === 'juice');
  if (!juice) throw Error('juice');
  await tap(page, `item-${juice.id}`);
  await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  expect((await state(page)).recycle?.id).toBe(juice.id);
  await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  const before = await state(page);
  const point = await hot(page, 'supply-apple');
  if (test.info().project.use.browserName !== 'webkit') {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ ...point, id: 1 }],
    });
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { ...point, id: 1 },
        { x: point.x + 30, y: point.y, id: 2 },
      ],
    });
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    await cdp.detach();
    expect((await state(page)).items).toEqual(before.items);
  }
  for (const height of [300, 342, 393]) {
    await page.setViewportSize({ width: 852, height });
    const helper = layoutFor(852, height, 'service').helper;
    await expect
      .poll(async () => {
        const point = await hot(page, 'note');
        return [Math.round(point.x), Math.round(point.y)];
      })
      .toEqual([Math.round(helper.x), Math.round(helper.y - 20)]);
    await expect
      .poll(async () => {
        const p = await hot(page, 'note');
        return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
      })
      .toBe('CANVAS');
    await tap(page, 'note');
    await expect(page.getByRole('heading', { name: '大咪陪你一起做' })).toBeVisible();
    await page.getByRole('button', { name: '继续营业', exact: true }).tap();
    await tap(page, 'tray-1', 25);
    await tap(page, 'supply-apple');
    const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
    expect(added?.product).toBe('apple');
    if (!added) throw Error('second tray');
    await page.waitForTimeout(300);
    await tap(page, `item-${added.id}`);
    await page.getByRole('button', { name: '↩ 放回这份' }).tap();
    await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  }
});
test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  page,
}, info) => {
  await page.route('**/audio/*.wav*', (r) => r.abort());
  await startStory(page);
  await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  const before = (await state(page)).attempts.length;
  const supply = await hot(page, 'supply-apple');
  expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
    'CANVAS',
  );
  await tap(page, 'supply-apple');
  expect((await state(page)).items).toHaveLength(1);
  expect((await state(page)).attempts).toHaveLength(before);
  await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  const failed = await page.locator('main').getAttribute('data-audio-state');
  expect(failed).toContain('failure');
  await page.unroute('**/audio/*.wav*');
  await page.getByRole('button', { name: '重试声音', exact: true }).tap();
  await expect(page.getByRole('button', { name: '声音状态', exact: true })).toHaveCount(0);
  await page.screenshot({ path: info.outputPath('audio-recovered.png') });
});
