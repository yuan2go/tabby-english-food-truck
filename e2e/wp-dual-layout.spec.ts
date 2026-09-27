import { expect, type Page, test } from '@playwright/test';
import { state } from './helpers';

test.use({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
async function mouseHot(page: Page, id: string) {
  const box = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  if (!box) throw Error(`missing ${id}`);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
async function begin(page: Page) {
  const opening = page.getByRole('dialog', { name: '章节开场' });
  if (await opening.count()) await opening.getByRole('button', { name: '跳过开场' }).click();
  const lesson = page.getByRole('dialog', { name: '场景小教学' });
  if (await lesson.count())
    await lesson.getByRole('button', { name: '我来试试', exact: true }).click();
  await expect(page.locator('.loading-page')).toHaveCount(0);
}
async function send(page: Page) {
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).click();
  await expect(page.locator('.ending')).toBeVisible({ timeout: 18000 });
}
async function start(page: Page, family: 'juice' | 'ice') {
  await page
    .getByRole('button', { name: family === 'juice' ? '▶ 榨成果汁' : '▶ 接好冰淇淋' })
    .click();
  const output = family === 'juice' ? '苹果汁' : '香草冰淇淋杯';
  await expect
    .poll(
      async () =>
        page
          .locator('[data-hotspot^="item-"]')
          .evaluateAll(
            (nodes, name) =>
              nodes.some((node) =>
                (node.getAttribute('aria-label') ?? '').startsWith(name as string),
              ),
            output,
          ),
      { timeout: 15000 },
    )
    .toBe(true);
}
test('desktop mouse opens first story services and makes cup ice cream', async ({ page }) => {
  test.setTimeout(180000);
  await page.goto('/');
  await expect(page.locator('main')).toHaveAttribute('data-build-sha', /^[0-9a-f]{40}$/);
  await page.locator('.yard-story .entry-main').click();
  await page.getByRole('button', { name: '跳过序章' }).click();
  await page.getByRole('button', { name: '帮朋友完成这关' }).click();
  await begin(page);
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/after-desktop-1440x900.png' });
  await page.setViewportSize({ width: 1920, height: 1080 });
  await expect(page.locator('[data-hotspot="tray-0"]')).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/wide-desktop-1920x1080.png' });
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(page.locator('[data-hotspot="tray-0"]')).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/narrow-desktop-1024x768.png' });
  await page.setViewportSize({ width: 1440, height: 900 });
  await mouseHot(page, 'supply-apple');
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'machine-apple');
  await mouseHot(page, 'supply-apple');
  await start(page, 'juice');
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-banana');
  await send(page);
  await page.getByRole('button', { name: '先帮兔兔准备水果' }).click();
  await begin(page);
  await mouseHot(page, 'supply-apple');
  await mouseHot(page, 'supply-banana');
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).click();
  await expect
    .poll(async () => page.locator('.service-count b').innerText(), { timeout: 12000 })
    .toContain('1 / 2');
  await begin(page);
  await mouseHot(page, 'machine-apple');
  await mouseHot(page, 'supply-banana');
  await page.getByRole('button', { name: '▶ 榨成果汁' }).click();
  await expect
    .poll(
      async () =>
        page
          .locator('[data-hotspot^="item-"]')
          .evaluateAll((nodes) =>
            nodes.some((node) => (node.getAttribute('aria-label') ?? '').startsWith('香蕉汁')),
          ),
      { timeout: 15000 },
    )
    .toBe(true);
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-apple');
  await mouseHot(page, 'supply-apple');
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).click();
  await expect
    .poll(async () => page.locator('.service-count b').innerText(), { timeout: 12000 })
    .toContain('1 / 2');
  await begin(page);
  await mouseHot(page, 'machine-apple');
  await mouseHot(page, 'supply-apple');
  await start(page, 'juice');
  await send(page);
  await page.getByRole('button', { name: '翻开下一页' }).click();
  await begin(page);
  await expect(page.locator('.station-action')).toContainText('接好冰淇淋');
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-vanilla');
  await start(page, 'ice');
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/ice-desktop-1440x900.png' });
  await send(page);
  await page.context().storageState({ path: 'test-results/after-first-ice.storage.json' });
});

test('phone touch makes a cone after desktop progress and survives layout changes', async ({
  browser,
}) => {
  test.setTimeout(90000);
  const context = await browser.newContext({
    viewport: { width: 393, height: 665 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
    storageState: 'test-results/after-first-ice.storage.json',
    recordVideo: { dir: 'test-results/phone-ice-video', size: { width: 393, height: 665 } },
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '帮朋友完成这关' }).tap();
  await begin(page);
  const touch = async (id: string) => {
    const box = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
    if (!box) throw Error(`missing ${id}`);
    await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  };
  await touch('supply-cone');
  await touch('supply-vanilla');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).tap();
  await expect
    .poll(
      async () =>
        page
          .locator('[data-hotspot^="item-"]')
          .evaluateAll((nodes) =>
            nodes.some((node) => (node.getAttribute('aria-label') ?? '').startsWith('香草蛋筒')),
          ),
      { timeout: 15000 },
    )
    .toBe(true);
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/ice-phone-393x665.png' });
  await page.setViewportSize({ width: 844, height: 390 });
  await expect(page.locator('[data-hotspot="tray-0"]')).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/short-landscape-844x390.png' });
  await page.setViewportSize({ width: 768, height: 1024 });
  await expect(page.locator('[data-hotspot="tray-0"]')).toBeVisible();
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/tablet-768x1024.png' });
  await page.setViewportSize({ width: 393, height: 665 });
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect(page.locator('.ending')).toBeVisible({ timeout: 16000 });
  await context.close();
});

test('phone first service uses the same viewport as its baseline screenshot', async ({
  browser,
}) => {
  test.setTimeout(60000);
  const context = await browser.newContext({
    viewport: { width: 393, height: 665 },
    deviceScaleFactor: 3,
    hasTouch: true,
    isMobile: true,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '帮朋友完成这关' }).tap();
  await begin(page);
  await page.screenshot({ path: 'docs/evidence/dual-layout-playflow/after-phone-393x665.png' });
  const box = await page.locator('[data-hotspot="supply-apple"]').boundingBox();
  if (!box) throw Error('apple hotspot missing');
  await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect(page.locator('.ending')).toBeVisible({ timeout: 16000 });
  await context.close();
});

test('desktop mouse corrects a wrong cone order, withdraws ingredients and makes two scoops and topping', async ({
  browser,
}) => {
  test.setTimeout(180000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: 'test-results/after-first-ice.storage.json',
    recordVideo: { dir: 'test-results/desktop-ice-video', size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  await page.getByRole('button', { name: '帮朋友完成这关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-vanilla');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'vanilla-cup'))
    .toBe(true);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('waiting');
  const wrong = (await state(page)).items.find((i) => i.product === 'vanilla-cup');
  if (!wrong) throw Error('wrong cup disappeared');
  await mouseHot(page, `item-${wrong.id}`);
  await page.getByRole('button', { name: '收起成品', exact: true }).click();
  await page.getByRole('button', { name: '确认收起', exact: true }).click();
  await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).click();
  expect((await state(page)).items.find((i) => i.id === wrong.id)?.product).toBe('vanilla-cup');
  await mouseHot(page, `item-${wrong.id}`);
  await page.getByRole('button', { name: '收起成品', exact: true }).click();
  await page.getByRole('button', { name: '确认收起', exact: true }).click();
  await mouseHot(page, 'station-ice');
  await mouseHot(page, 'supply-cone');
  const raw = (await state(page)).items.find((i) => i.product === 'cone');
  if (!raw) throw Error('cone not placed');
  await mouseHot(page, `item-${raw.id}`);
  await page.getByRole('button', { name: '↩', exact: true }).click();
  expect((await state(page)).items.some((i) => i.id === raw.id)).toBe(false);
  await mouseHot(page, 'supply-cone');
  await mouseHot(page, 'supply-vanilla');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'vanilla-cone'))
    .toBe(true);
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-strawberry');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'strawberry-cup'))
    .toBe(true);
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-vanilla');
  await mouseHot(page, 'supply-strawberry');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'double-cream'))
    .toBe(true);
  await send(page);
  await page.getByRole('button', { name: '继续下一小关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-vanilla');
  await mouseHot(page, 'supply-banana');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-cream'))
    .toBe(true);
  await page.screenshot({
    path: 'docs/evidence/dual-layout-playflow/ice-topping-desktop-1440x900.png',
  });
  await context.close();
});

test('completed level replay resumes its live ice job after refresh', async ({ browser }) => {
  test.setTimeout(90000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    storageState: 'test-results/after-first-ice.storage.json',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  const card = page.locator('.story-level').filter({ hasText: '树荫下的杯子' });
  await card.getByRole('button', { name: '重玩这一关' }).click();
  await begin(page);
  await mouseHot(page, 'supply-cup');
  await mouseHot(page, 'supply-vanilla');
  await page.getByRole('button', { name: '▶ 接好冰淇淋' }).click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const before = await state(page);
  expect(['processing', 'ready']).toContain(before.stations.ice.status);
  await page.reload();
  await page.locator('.yard-story .entry-main').click();
  await card.getByRole('button', { name: '继续这一关' }).click();
  await begin(page);
  const after = await state(page);
  expect(after.runId).toBe(before.runId);
  expect(after.session.levelId).toBe('c2-cup');
  expect(after.orders).toEqual(before.orders);
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'vanilla-cup'), {
      timeout: 15000,
    })
    .toBe(true);
  await send(page);
  await context.close();
});
