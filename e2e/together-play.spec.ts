import { expect, test } from '@playwright/test';
import { state } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
test('breakfast is three meaningful actions with a real held item and optional exploration', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  const stage = page.getByRole('region', { name: '同桌厨房', exact: true });
  await expect(stage).toBeVisible();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['apple']);
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[1]?.status).toBe('done');
  await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  expect((await state(page)).adventure?.rewards).toEqual(['flower-page']);
  expect((await state(page)).adventure?.steps).not.toContain('plant');
  for (const label of ['去厨房备餐', '到活动桌', '端盘', '选盘'])
    await expect(page.getByRole('button', { name: label, exact: true })).toHaveCount(0);
});

test('visible device targets make real juice and wrong delivery leaves hand ownership recoverable', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  const before = (await state(page)).items;
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  expect((await state(page)).items).toEqual(before);
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  expect((await state(page)).items).toEqual([]);
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  await page.getByRole('button', { name: '放入果汁机水果口', exact: true }).click();
  await page.getByRole('button', { name: '拿起空杯', exact: true }).click();
  await page.getByRole('button', { name: '放到果汁机杯座', exact: true }).click();
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
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['juice']);
});
