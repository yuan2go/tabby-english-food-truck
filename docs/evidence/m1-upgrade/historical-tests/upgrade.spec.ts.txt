import { expect, type Page, test } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import type { GameState } from '../src/rules/types';

test.use({ video: { mode: 'on', size: { width: 393, height: 665 } } });
const state = (p: Page): Promise<GameState> =>
  p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.v1') ?? '{}'));
async function point(p: Page, id: string, dy = 0) {
  const b = await p.locator(`[data-hotspot="${id}"]`).boundingBox();
  if (!b) throw new Error(id);
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 + dy };
}
async function tap(p: Page, id: string, dy = 0) {
  const q = await point(p, id, dy);
  await p.touchscreen.tap(q.x, q.y);
}
async function lesson(p: Page) {
  if (await p.getByRole('button', { name: '我来试试' }).count())
    await p.getByRole('button', { name: '我来试试' }).tap();
}
async function start(p: Page, mode?: string) {
  await p.goto('/');
  if (mode) await p.getByRole('button', { name: mode, exact: false }).tap();
  await p.getByRole('button', { name: '开摊啦', exact: true }).tap();
  await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  await p.waitForTimeout(3700);
  await lesson(p);
}
async function deliver(p: Page, tray: number, order: string) {
  await tap(p, `tray-${tray}`, 25);
  await tap(p, order);
  await lesson(p);
}
async function dragTouch(p: Page, source: string, target: string, screenshot?: string) {
  const a = await point(p, source, source.startsWith('tray-') ? 25 : 0),
    b = await point(p, target);
  const c = await p.context().newCDPSession(p);
  await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  for (let i = 1; i <= 6; i++)
    await c.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: a.x + ((b.x - a.x) * i) / 6, y: a.y + ((b.y - a.y) * i) / 6, id: 1 }],
    });
  if (screenshot) await p.screenshot({ path: screenshot });
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await c.detach();
}

test.describe('M1 true mobile touch and DPR', () => {
  test.setTimeout(120000);
  test.use({
    viewport: { width: 393, height: 665 },
    deviceScaleFactor: 3,
    isMobile: true,
    hasTouch: true,
  });
  test('guided from normal home through teaching and whole tray touch delivery', async ({
    page,
  }, info) => {
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await start(page);
    expect((await state(page)).mode).toBe('guided');
    expect(await page.locator('[data-hotspot="tray-1"]').count()).toBe(0);
    const measurement = await page.locator('canvas').evaluate((c: HTMLCanvasElement) => ({
      width: c.width,
      height: c.height,
      cssWidth: c.clientWidth,
      cssHeight: c.clientHeight,
      dpr: devicePixelRatio,
      renderScale: c.dataset.renderScale,
    }));
    expect(measurement.width).toBeGreaterThan(393 * 2);
    expect(measurement.width * measurement.height).toBeLessThan(2_400_001);
    await info.attach('DPR measurement', {
      body: JSON.stringify(measurement),
      contentType: 'application/json',
    });
    await page.screenshot({ path: info.outputPath('after-393x665-dpr3.png') });
    await tap(page, 'supply-apple');
    await tap(page, 'tray-0', 22);
    await expect.poll(async () => (await state(page)).items.length).toBe(1);
    await page.waitForTimeout(260);
    await dragTouch(page, 'tray-0', 'guest-0', info.outputPath('whole-tray-with-food-touch.png'));
    await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
    expect((await state(page)).attempts[0]?.support).toContain('guided');
    expect(errors).toEqual([]);
    await page.getByRole('button', { name: '再开一次小摊' }).tap();
    await page.getByRole('button', { name: '确认重新开始' }).tap();
    await lesson(page);
    expect((await state(page)).items[0]?.product).toBe('cup');
    expect((await state(page)).orders[0]?.support).toContain('guided-preparation');
    await tap(page, 'supply-apple');
    await tap(page, 'machine-apple');
    await tap(page, 'start');
    // Five seconds of active game time; DPR-3 video capture may exceed that in wall time.
    await expect
      .poll(async () => (await state(page)).machine.status, { timeout: 10000 })
      .toBe('ready');
    const cup = (await state(page)).items.find((i) => i.product === 'juice');
    if (!cup) throw Error('juice');
    await tap(page, `item-${cup.id}`);
    await tap(page, 'tray-0', 22);
    await page.waitForTimeout(260);
    await deliver(page, 0, 'guest-0');
    await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
  });
  test('double service touch path, banana source and combination binding, interleaved delivery', async ({
    page,
  }, info) => {
    await start(page, '小小餐车营业中');
    await page.screenshot({ path: info.outputPath('after-service-393x665-dpr3.png') });
    await tap(page, 'tray-1', 25);
    await tap(page, 'note');
    for (const word of ['a', 'banana', 'and', 'an', 'apple'])
      await page
        .locator('.word-bank')
        .getByRole('button', { name: word, exact: true })
        .first()
        .tap();
    await page.getByRole('button', { name: '交给小猫', exact: true }).tap();
    expect((await state(page)).items.map((i) => i.product)).toEqual(['banana', 'apple']);
    await page.waitForFunction(() => document.querySelector('canvas')?.dataset.catPose === 'reach');
    await page.screenshot({ path: info.outputPath('banana-source-touch.png') });
    await tap(page, 'tray-0', 25);
    await expect.poll(async () => (await state(page)).helper).toBeNull();
    expect((await state(page)).items.every((i) => i.location.startsWith('tray:1:'))).toBe(true);
    await tap(page, 'supply-apple');
    await tap(page, 'machine-apple');
    await tap(page, 'supply-cup');
    await tap(page, 'machine-cup');
    await tap(page, 'start');
    let s = await state(page);
    const fruit = s.orders.find((o) => o.request === 'fruit'),
      juice = s.orders.find((o) => o.request === 'juice');
    if (!fruit || !juice) throw Error('orders');
    await dragTouch(page, 'tray-1', fruit.id, info.outputPath('service-drag-food-touch.png'));
    await lesson(page);
    expect((await state(page)).machine.status).toBe('processing');
    // Five seconds of active game time; DPR-3 video capture may exceed that in wall time.
    await expect
      .poll(async () => (await state(page)).machine.status, { timeout: 10000 })
      .toBe('ready');
    s = await state(page);
    const cup = s.items.find((i) => i.product === 'juice');
    if (!cup) throw Error('juice');
    await tap(page, `item-${cup.id}`);
    await tap(page, 'tray-0', 22);
    await page.waitForTimeout(260);
    await deliver(page, 0, juice.id);
    await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
    await page.screenshot({ path: info.outputPath('service-touch-ending.png') });
  });
  test('continuous commands retain live item motion and stable scene entities', async ({
    page,
  }) => {
    await start(page, '小小餐车营业中');
    // DOM semantic controls dispatch the same public commands, within one frame so
    // this regression cannot accidentally wait for the 240 ms flight to finish.
    const measured = await page.evaluate(async () => {
      const canvas = document.querySelector('canvas');
      const click = (id: string) =>
        document.querySelector<HTMLButtonElement>(`[data-hotspot="${id}"]`)?.click();
      const frame = () => new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
      const initial = Number(canvas?.dataset.createdEntities);
      click('supply-apple');
      click('tray-0');
      await frame();
      await frame();
      const first = Number(canvas?.dataset.motionCount);
      click('guest-1');
      click('supply-banana');
      click('tray-1');
      await frame();
      await frame();
      return {
        first,
        both: Number(canvas?.dataset.motionCount),
        added: Number(canvas?.dataset.createdEntities) - initial,
      };
    });
    expect(measured.first).toBe(1);
    expect(measured.both).toBe(2);
    expect(measured.added).toBe(2);
    await page.waitForTimeout(300);
    expect(await page.locator('canvas').getAttribute('data-motion-count')).toBe('0');
    expect((await state(page)).items.map((i) => i.location).sort()).toEqual([
      'tray:0:0',
      'tray:1:0',
    ]);
  });
  test('practice single-customer variety finishes all five requests and keeps hints on mode switch', async ({
    page,
  }) => {
    await start(page, '帮客人准备食物');
    for (let n = 0; n < 5; n++) {
      await lesson(page);
      const s = await state(page),
        order = s.orders.find((o) => o.status === 'waiting');
      if (!order) throw Error('waiting');
      await page.getByRole('button', { name: '图示帮助', exact: true }).tap();
      await page.getByRole('button', { name: '收起文字帮助' }).tap();
      for (const product of REQUESTS[order.request].products) {
        if (product === 'juice') {
          await tap(page, 'supply-apple');
          await tap(page, 'machine-apple');
          await tap(page, 'supply-cup');
          await tap(page, 'machine-cup');
          await tap(page, 'start');
          // Five seconds of active game time; DPR-3 video capture may exceed that in wall time.
          await expect
            .poll(async () => (await state(page)).machine.status, { timeout: 10000 })
            .toBe('ready');
          const cup = (await state(page)).items.find((i) => i.product === 'juice');
          if (!cup) throw Error('cup');
          await tap(page, `item-${cup.id}`);
        } else await tap(page, `supply-${product}`);
        await tap(page, 'tray-0', 22);
      }
      await page.waitForTimeout(260);
      await deliver(page, 0, order.id);
      await expect
        .poll(async () => (await state(page)).orders.filter((o) => o.status === 'done').length)
        .toBe(n + 1);
    }
    await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
    await page.getByRole('button', { name: '保存与换玩法' }).tap();
    await page.getByRole('button', { name: '小小餐车营业中' }).tap();
    await lesson(page);
    await tap(page, 'supply-banana');
    await tap(page, 'tray-1', 22);
    await page.getByRole('button', { name: '暂停', exact: true }).tap();
    await page.getByRole('button', { name: '帮客人准备食物' }).tap();
    expect((await state(page)).orders.every((o) => o.status === 'done')).toBe(true);
    expect((await state(page)).items).toHaveLength(0);
    await page.reload();
    await page.getByRole('button', { name: '继续摆摊', exact: true }).tap();
    expect((await state(page)).orders.every((o) => o.support.includes('text-request'))).toBe(true);
  });
  test('note touch reorder distinct duplicate tokens, return, cancel, multi-touch and rotation', async ({
    page,
  }) => {
    await start(page, '小小餐车营业中');
    await tap(page, 'note');
    for (const word of ['an', 'apple', 'and', 'an', 'apple'])
      await page
        .locator('.word-bank button:not(:disabled)')
        .filter({ hasText: new RegExp(`^${word}$`) })
        .first()
        .tap();
    const before = await page.locator('.draft button').allTextContents();
    expect(before).toEqual(['an', 'apple', 'and', 'an', 'apple']);
    const client = await page.context().newCDPSession(page);
    const move = async (from: number, to: number, side: 'left' | 'right') => {
      const a = await page.locator('.draft button').nth(from).boundingBox(),
        b = await page.locator('.draft button').nth(to).boundingBox();
      if (!a || !b) throw Error('token');
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchStart',
        touchPoints: [{ x: a.x + a.width / 2, y: a.y + a.height / 2, id: 1 }],
      });
      await client.send('Input.dispatchTouchEvent', {
        type: 'touchMove',
        touchPoints: [
          { x: b.x + (side === 'left' ? 2 : b.width - 2), y: b.y + b.height / 2, id: 1 },
        ],
      });
      await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    };
    await move(0, 4, 'right');
    expect(await page.locator('.draft button').allTextContents()).toEqual([
      'apple',
      'and',
      'an',
      'apple',
      'an',
    ]);
    await move(4, 0, 'left');
    expect(await page.locator('.draft button').allTextContents()).toEqual(before);
    const a = await page.locator('.draft button').first().boundingBox();
    if (!a) throw Error('a');
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: a.x + 10, y: a.y + 10, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: a.x + 50, y: a.y + 10, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    expect(await page.locator('.draft button').allTextContents()).toEqual(before);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: a.x + 10, y: a.y + 10, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: a.x + 10, y: a.y + 10, id: 1 },
        { x: a.x + 50, y: a.y + 10, id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect(await page.locator('.draft button').allTextContents()).toEqual(before);
    await page.setViewportSize({ width: 844, height: 390 });
    expect(await page.locator('.draft button').allTextContents()).toEqual(before);
    await page.locator('.draft button').first().tap();
    expect(await page.locator('.draft button').count()).toBe(4);
    expect((await state(page)).attempts).toHaveLength(0);
    await client.detach();
  });
});

test('audio layers duck, machine lifecycle, muted settings and voice failure recovery', async ({
  page,
}) => {
  const sound = () =>
    page
      .locator('.game-shell')
      .getAttribute('data-audio-state')
      .then(
        (raw) =>
          JSON.parse(raw ?? '{}') as {
            active: string | null;
            loops: string[];
            settings: Record<string, boolean>;
            musicGain: number;
            machineGain: number;
          },
      );
  await page.goto('/');
  await page.getByRole('button', { name: '小小餐车营业中' }).click();
  await page.getByRole('button', { name: '开摊啦', exact: true }).click();
  await page.getByRole('button', { name: '我来试试' }).click();
  const click = async (id: string, dy = 0) => {
    const q = await point(page, id, dy);
    await page.mouse.click(q.x, q.y);
  };
  await click('supply-apple');
  await click('machine-apple');
  await click('supply-cup');
  await click('machine-cup');
  await click('start');
  await expect.poll(async () => (await sound()).loops).toContain('machine');
  await page.getByRole('button', { name: '重听当前客人请求' }).click();
  await expect.poll(async () => Boolean((await sound()).active)).toBe(true);
  expect((await sound()).musicGain).toBeLessThan(0.09);
  expect((await sound()).machineGain).toBeLessThan(0.09);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await expect.poll(async () => (await sound()).loops).toEqual([]);
  await page.getByLabel('全部声音', { exact: true }).uncheck();
  await page.getByRole('button', { name: '继续营业' }).click();
  expect((await sound()).loops).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: '继续摆摊', exact: true }).click();
  expect((await sound()).settings.master).toBe(false);
  expect((await sound()).loops).toEqual([]);
  await page.getByRole('button', { name: '打开声音', exact: true }).click();
  await page.getByRole('button', { name: '重听当前客人请求' }).click();
  // Five seconds of active game time; DPR-3 video capture may exceed that in wall time.
  await expect
    .poll(async () => (await state(page)).machine.status, { timeout: 10000 })
    .toBe('ready');
  await expect.poll(async () => (await sound()).loops.includes('machine')).toBe(false);
});
