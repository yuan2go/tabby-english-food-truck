import { expect, type Page, test } from '@playwright/test';
import type { GameState } from '../src/rules/types';

const snapshot = (page: Page): Promise<GameState> =>
  page.evaluate(
    () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.v1') ?? '{}') as GameState,
  );
async function point(page: Page, id: string, dy = 0) {
  const box = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  if (!box) throw new Error(`Missing ${id}`);
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 + dy };
}
async function tap(page: Page, id: string, dy = 0) {
  const p = await point(page, id, dy);
  await page.mouse.click(p.x, p.y);
}
async function drag(page: Page, from: string, to: string, dy = 0) {
  const a = await point(page, from);
  const b = await point(page, to, dy);
  await page.mouse.move(a.x, a.y);
  await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 12 });
  await page.mouse.up();
}
async function start(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '开摊啦', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '小食谱' })).toBeVisible();
  await page.getByRole('button', { name: '听 apple', exact: true }).click();
  await page.getByRole('button', { name: '明白了，继续' }).click();
  await page.getByRole('button', { name: '明白了，继续' }).click();
  await page.getByRole('button', { name: '开始接待' }).click();
  await expect(page.getByRole('dialog')).toHaveCount(0);
}
async function identify(page: Page) {
  await tap(page, 'guest-0');
  await page.getByRole('button', { name: '文字帮助', exact: true }).click();
  const juice = (await page.locator('.request-caption').innerText()).includes('Apple juice')
    ? 'guest-0'
    : 'guest-1';
  await page.getByRole('button', { name: '收起文字帮助' }).click();
  return { juice, fruit: juice === 'guest-0' ? 'guest-1' : 'guest-0' };
}
async function makeJuice(page: Page) {
  await drag(page, 'supply-apple', 'machine-apple');
  await drag(page, 'supply-cup', 'machine-cup');
  await tap(page, 'start');
}
async function takeJuice(page: Page) {
  await expect.poll(async () => (await snapshot(page)).machine.status).toBe('ready');
  const cup = (await snapshot(page)).items.find((i) => i.product === 'juice');
  if (!cup) throw new Error('missing juice');
  await drag(page, `item-${cup.id}`, 'tray-0', 22);
}
async function deliver(page: Page, tray: 0 | 1, guest: string) {
  await tap(page, `tray-${tray}`, 25);
  await tap(page, guest);
}
async function note(page: Page, words: string[]) {
  await tap(page, 'tray-1', 25);
  await tap(page, 'note');
  for (const word of words)
    await page
      .locator('.word-bank')
      .getByRole('button', { name: word, exact: true })
      .first()
      .click();
  await page.getByRole('button', { name: '交给小猫', exact: true }).click();
}
test('T06 phone Canvas interleaved full service, helper binding, visible ending', async ({
  page,
}, info) => {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await start(page);
  const guests = await identify(page);
  await page.screenshot({ path: info.outputPath('phone-start.png') });
  await note(page, ['an', 'apple']);
  await tap(page, 'tray-0', 25);
  await expect.poll(async () => (await snapshot(page)).helper).toBeNull();
  const brought = (await snapshot(page)).items;
  expect(brought).toHaveLength(1);
  expect(brought[0]?.location.startsWith('tray:1:')).toBe(true);
  const apple = brought[0];
  if (!apple) throw new Error('helper apple');
  await drag(page, `item-${apple.id}`, 'machine-apple');
  await drag(page, 'supply-cup', 'machine-cup');
  await tap(page, 'start');
  await tap(page, 'supply-banana');
  await tap(page, 'tray-1', 22);
  await tap(page, 'supply-apple');
  await tap(page, 'tray-1', 22);
  await deliver(page, 1, guests.fruit);
  expect((await snapshot(page)).machine.status).toBe('processing');
  await page.screenshot({ path: info.outputPath('phone-interleaved.png') });
  await takeJuice(page);
  await deliver(page, 0, guests.juice);
  await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
  await page.screenshot({ path: info.outputPath('phone-ending.png') });
  expect(errors).toEqual([]);
  expect((await snapshot(page)).orders.every((o) => o.status === 'done')).toBe(true);
});
test('T06 Pad serial complete path by keyboard, layout and rotation', async ({ page }, info) => {
  await page.setViewportSize({ width: 768, height: 1024 });
  await start(page);
  const guests = await identify(page);
  const key = async (id: string) => page.locator(`[data-hotspot="${id}"]`).press('Enter');
  await key('supply-apple');
  await key('machine-apple');
  await key('supply-cup');
  await key('machine-cup');
  await key('start');
  await expect.poll(async () => (await snapshot(page)).machine.status).toBe('ready');
  const cup = (await snapshot(page)).items.find((i) => i.product === 'juice');
  if (!cup) throw new Error('cup');
  await key(`item-${cup.id}`);
  await key('tray-0');
  await key('tray-0');
  await key(guests.juice);
  await key('supply-banana');
  await key('tray-1');
  await key('supply-apple');
  await key('tray-1');
  await page.screenshot({ path: info.outputPath('pad-portrait.png') });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('canvas')).toHaveJSProperty('width', 1024);
  await page.screenshot({ path: info.outputPath('pad-landscape.png') });
  await key('tray-1');
  await key(guests.fruit);
  await expect(page.getByRole('heading', { name: '谢谢款待！' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(
    true,
  );
});
test('T08/T09 small phone mismatch, full tray, cancellation and recovery', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await start(page);
  const guests = await identify(page);
  for (let i = 0; i < 3; i++) {
    await tap(page, 'supply-banana');
    await tap(page, 'tray-0', 22);
  }
  await tap(page, 'supply-apple');
  await tap(page, 'tray-0', 22);
  await expect(page.locator('.game-feedback')).toContainText('满了');
  await page.keyboard.press('Escape');
  await deliver(page, 0, guests.juice);
  await expect(page.locator('.game-feedback')).toContainText('苹果汁');
  let s = await snapshot(page);
  expect(s.items).toHaveLength(3);
  expect(s.orders.find((o) => o.id === guests.juice)?.support).toContain('mismatch-explanation');
  const item = s.items[0];
  if (!item) throw new Error('item');
  await tap(page, `item-${item.id}`);
  await tap(page, 'clear');
  expect((await snapshot(page)).items).toHaveLength(2);
  await drag(page, 'supply-apple', 'guest-0');
  expect((await snapshot(page)).items).toHaveLength(2);
  await note(page, ['two', 'apples']);
  await page.getByRole('button', { name: '撤回便签', exact: true }).click();
  expect((await snapshot(page)).helper).toBeNull();
  s = await snapshot(page);
  expect(s.items).toHaveLength(2);
  await page.screenshot({ path: info.outputPath('small-phone-recovery.png') });
});
test('T02/T10 refresh during machine/helper, pause, no offline catch-up', async ({ page }) => {
  await start(page);
  await makeJuice(page);
  await note(page, ['two', 'apples']);
  const before = await snapshot(page);
  expect(before.helper).not.toBeNull();
  await page.reload();
  await page.getByRole('button', { name: '继续摆摊', exact: true }).click();
  const loaded = await snapshot(page);
  expect(loaded.items.map((i) => i.id)).toEqual(before.items.map((i) => i.id));
  expect(loaded.helper?.tray).toBe(1);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const paused = await snapshot(page);
  await page.waitForTimeout(1400);
  expect((await snapshot(page)).machine.remaining).toBe(paused.machine.remaining);
  await page.getByRole('button', { name: '继续营业', exact: true }).click();
  await expect.poll(async () => (await snapshot(page)).helper).toBeNull();
  await expect.poll(async () => (await snapshot(page)).machine.status).toBe('ready');
  expect((await snapshot(page)).items).toHaveLength(3);
});
test('T10 future save is retained and can export before explicit restart', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('tabby.foodtruck.save.v1', '{"schemaVersion":99}');
  });
  await page.goto('/');
  await expect(page.getByRole('alert')).toContainText('版本');
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出存档', exact: true }).click();
  expect((await download).suggestedFilename()).toContain('tabby');
  await page.getByRole('button', { name: '开摊啦', exact: true }).click();
  await page.getByRole('button', { name: '确认重新开始' }).click();
  await expect(page.getByRole('dialog', { name: '小食谱' })).toBeVisible();
});
test('T11 missing assets/audio retry preserve world and independent DOM hides request', async ({
  page,
}) => {
  let deny = true;
  await page.route('**/assets/banana.webp', (route) => (deny ? route.abort() : route.continue()));
  await page.route('**/audio/request-*.wav', (route) => route.abort());
  await start(page);
  await expect(page.locator('.resource-alert')).toBeVisible();
  expect(await page.locator('.semantic-layer').innerText()).not.toMatch(
    /Apple juice|An apple and a banana/,
  );
  await tap(page, 'supply-apple');
  await tap(page, 'tray-1', 22);
  const before = await snapshot(page);
  deny = false;
  await page.getByRole('button', { name: '重试画面' }).click();
  await expect(page.locator('.resource-alert')).toHaveCount(0);
  expect((await snapshot(page)).items).toEqual(before.items);
  await expect(page.locator('.audio-alert')).toBeVisible();
  await page.getByRole('button', { name: '使用文字支持' }).click();
  expect((await snapshot(page)).orders.find((o) => o.id === 'guest-0')?.support).toContain(
    'text-request',
  );
});

test('T05 support cannot leak across guests and demonstration persists', async ({ page }) => {
  await start(page);
  expect((await snapshot(page)).noteSupport).toContain('demonstration');
  await tap(page, 'guest-0');
  await page.getByRole('button', { name: '文字帮助', exact: true }).click();
  await expect(page.locator('.request-caption')).toBeVisible();
  // Click the other customer's lower receiving area, outside the help bubble.
  await tap(page, 'guest-1', 45);
  await expect(page.locator('.request-caption')).toHaveCount(0);
  await page.reload();
  await page.getByRole('button', { name: '继续摆摊', exact: true }).click();
  expect((await snapshot(page)).orders.find((o) => o.id === 'guest-0')?.support).toContain(
    'text-request',
  );
  expect((await snapshot(page)).orders.find((o) => o.id === 'guest-1')?.support).not.toContain(
    'text-request',
  );
});
test('T10 rejected storage keeps game playable and exports in-memory snapshot', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException('Denied', 'SecurityError');
    };
  });
  await start(page);
  await expect(page.locator('.storage-alert')).toContainText('保存失败');
  await tap(page, 'supply-apple');
  await tap(page, 'tray-1', 22);
  await expect(page.locator('[data-hotspot^="item-"]')).toHaveCount(1);
  const download = page.waitForEvent('download');
  await page.getByRole('button', { name: '导出存档', exact: true }).click();
  expect((await download).suggestedFilename()).toBe('tabby-foodtruck-save.json');
});
test.describe('touch and lifecycle', () => {
  test.use({ hasTouch: true, isMobile: true });
  test('T09 true touch placement, pointer cancellation, multi-touch and rotate', async ({
    page,
  }, info) => {
    await start(page);
    const client = await page.context().newCDPSession(page);
    const a = await point(page, 'supply-apple'),
      b = await point(page, 'tray-0', 22);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: a.x, y: a.y, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [{ x: b.x, y: b.y, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
    expect((await snapshot(page)).items).toHaveLength(0);
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: a.x, y: a.y, id: 1 }],
    });
    await client.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [
        { x: a.x, y: a.y, id: 1 },
        { x: b.x, y: b.y, id: 2 },
      ],
    });
    await client.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    expect((await snapshot(page)).items).toHaveLength(0);
    await page.touchscreen.tap(a.x, a.y);
    await page.touchscreen.tap(b.x, b.y);
    expect((await snapshot(page)).items).toHaveLength(1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 844, height: 390 });
    await expect(page.locator('canvas')).toHaveJSProperty('width', 844);
    expect((await snapshot(page)).items).toHaveLength(1);
    await page.screenshot({ path: info.outputPath('phone-landscape-touch.png') });
    await client.detach();
  });
});

test('T02 Chromium freeze/resume does not award offline machine or helper time', async ({
  page,
}) => {
  await start(page);
  await makeJuice(page);
  await note(page, ['two', 'apples']);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const before = await snapshot(page);
  expect(before.helper).not.toBeNull();
  await page.getByRole('button', { name: '继续营业', exact: true }).click();
  const client = await page.context().newCDPSession(page);
  await client.send('Page.setWebLifecycleState', { state: 'frozen' });
  await new Promise((resolve) => setTimeout(resolve, 1800));
  await client.send('Page.setWebLifecycleState', { state: 'active' });
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const after = await snapshot(page);
  expect(after.helper).not.toBeNull();
  expect((before.helper?.remaining ?? 0) - (after.helper?.remaining ?? 0)).toBeLessThan(600);
  expect(before.machine.remaining - after.machine.remaining).toBeLessThan(600);
  await client.detach();
});

test('T08 both trays full and wrong juice can recover without an empty tray', async ({ page }) => {
  await start(page);
  for (const tray of [0, 1])
    for (let n = 0; n < 3; n++) {
      await tap(page, 'supply-banana');
      await tap(page, `tray-${tray}`, 22);
    }
  await makeJuice(page);
  await expect.poll(async () => (await snapshot(page)).machine.status).toBe('ready');
  const juice = (await snapshot(page)).items.find((i) => i.product === 'juice');
  if (!juice) throw new Error('juice');
  await tap(page, `item-${juice.id}`);
  await tap(page, 'tray-0', 22);
  await expect(page.locator('.game-feedback')).toContainText('满了');
  await tap(page, 'clear');
  await expect(page.getByRole('dialog', { name: '确认操作' })).toBeVisible();
  await page.getByRole('button', { name: '保留果汁' }).click();
  expect((await snapshot(page)).items).toHaveLength(7);
  await tap(page, 'clear');
  await page.getByRole('button', { name: '确认清理' }).click();
  const s = await snapshot(page);
  expect(s.items).toHaveLength(6);
  expect(s.machine.status).toBe('empty');
  const fruit = s.items[0];
  if (!fruit) throw new Error('fruit');
  await tap(page, `item-${fruit.id}`);
  await tap(page, 'clear');
  expect((await snapshot(page)).items).toHaveLength(5);
});
