import { expect, test } from '@playwright/test';
import { finishChapter, serve, state } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
test('breakfast starts with two meaningful actions with a real held item and optional exploration', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 早餐派对', exact: true }).click();
  const stage = page.getByRole('region', { name: '同桌厨房', exact: true });
  await expect(stage).toBeVisible();
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['apple']);
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[1]?.status).toBe('done');
  await finishChapter(page, 0);
  expect((await state(page)).adventure?.flow?.archives[0]?.rewards).toEqual(['flower-page']);
  expect((await state(page)).adventure?.flow?.archives[0]?.steps).not.toContain('plant');
  for (const label of ['去厨房备餐', '到活动桌', '端盘', '选盘'])
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveCount(0);
});

test('visible device targets make real juice and wrong delivery leaves hand ownership recoverable', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  const before = (await state(page)).items;
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  expect((await state(page)).items).toEqual(before);
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  expect((await state(page)).items).toEqual([]);
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  await page.getByRole('button', { name: '放入果汁机水果口', exact: true }).click();
  await page.getByRole('button', { name: '果汁机：空杯', exact: true }).click();
  await page.getByRole('button', { name: '启动果汁机', exact: true }).click();
  expect((await state(page)).machine.status).toBe('processing');
  await expect(page.getByRole('button', { name: '拿起苹果汁', exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole('button', { name: '拿起苹果汁', exact: true }).click();
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['juice']);
  await page.reload();
  await page.locator('.yard-endless .entry-main').click();
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['juice']);
});

test('speaker meaning pictures and same-stage demonstration are usable assistance without inventory or language submission', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 早餐派对', exact: true }).click();
  await expect(
    page.getByRole('button', { name: '看图理解兔兔的请求', exact: true }).locator('img'),
  ).toBeVisible();
  await page.getByRole('button', { name: '看图理解兔兔的请求', exact: true }).click();
  const before = await state(page);
  expect(before.orders[0]?.support).toContain('meaning-picture');
  expect(before.orders[0]?.support).toContain('picture-request');
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '看兔兔的同场示范', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '同场动作示范' })).toBeVisible();
  await page.getByRole('button', { name: '下一步示范', exact: true }).click();
  await page.getByRole('button', { name: '我来动手', exact: true }).click();
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  expect((await state(page)).orders[0]?.support).toContain('demonstration');
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  await page.getByRole('button', { name: '交给兔兔的餐盘', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  expect((await state(page)).attempts[0]?.support).toContain('demonstration');
});
test('occupied receiving plate still matches the friend and preparation uses the remaining real capacity', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  for (let i = 0; i < 3; i++) {
    await page.locator('[data-hotspot="supply-apple"]').click();
    await page.getByRole('button', { name: '放到制作承放区', exact: true }).click();
  }
  await page.locator('[data-hotspot="supply-banana"]').click();
  await page.getByRole('button', { name: '放到制作承放区', exact: true }).click();
  expect(
    (await state(page)).items.some(
      (i) => i.product === 'banana' && i.location.startsWith('tray:1:'),
    ),
  ).toBe(true);
  const apple = (await state(page)).items.find((i) => i.product === 'apple');
  if (!apple) throw Error('apple');
  await page.locator(`[data-hotspot="item-${apple.id}"]`).click();
  await page.getByRole('button', { name: '交给兔兔的餐盘', exact: true }).click();
  await expect.poll(async () => (await state(page)).session.served).toBe(1);
  // No menu popup while actual preparation food remains. Choose another actual apple.
  const next = (await state(page)).items.find((i) => i.product === 'apple');
  if (!next) throw Error('next');
  await page.locator(`[data-hotspot="item-${next.id}"]`).click();
  const plate = page.getByRole('button', { name: '交给兔兔的餐盘', exact: true });
  const box = await plate.boundingBox();
  if (!box) throw Error('plate');
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  await expect.poll(async () => (await state(page)).session.served).toBe(2);
  expect((await state(page)).attempts.filter((a) => a.activity === 'delivery')).toHaveLength(2);
});
test('open request remains at its actual speaker after another conversation and cannot thank before receipt', async ({
  page,
}) => {
  test.setTimeout(120000);
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  await finishChapter(page, 0);
  for (let i = 0; i < 4; i++) {
    await expect
      .poll(async () => (await state(page)).orders.some((o) => o.status === 'waiting'))
      .toBe(true);
    await serve(page);
  }
  await expect.poll(async () => (await state(page)).adventure?.flow?.wave).toBe(2);
  const open = page.getByRole('button', { name: /重听刺刺：.*ice cream/ });
  await expect(open).toBeVisible();
  await page.waitForTimeout(1200);
  const before = await state(page);
  await open.click();
  await page.locator('[data-actor="rabbit"]').click();
  expect((await state(page)).adventure?.foods).toEqual(before.adventure?.foods);
  expect((await state(page)).attempts).toEqual(before.attempts);
  await expect(open).toBeVisible();
  expect((await state(page)).adventure?.steps).not.toContain('cool');
});
