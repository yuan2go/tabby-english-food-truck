import { expect, test } from '@playwright/test';
import { lesson, state, tap } from './helpers';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});
test('teaching fruit is the real ingredient; fresh endless explicitly introduces banana then juice', async ({
  page,
}, info) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续' }).tap();
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  await page.getByRole('button', { name: '来试一下 →', exact: true }).tap();
  await page.getByRole('button', { name: '苹果', exact: true }).tap();
  await expect.poll(async () => (await state(page)).items.map((i) => i.product)).toEqual(['apple']);
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toHaveCount(0);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  const growth = page.getByRole('dialog', { name: '今日新菜单' });
  await expect(growth).toBeVisible({ timeout: 18000 });
  expect((await state(page)).session.menu).toEqual(['apple']);
  await growth.getByRole('button', { name: '加入今日菜单', exact: true }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana']);
  // Only the visible request picture guides preparation here.
  await lesson(page);
  const picture = page.getByRole('button', { name: '点请求气泡重听' });
  const label = await picture.locator('img').getAttribute('alt');
  await tap(page, label?.includes('香蕉') ? 'supply-banana' : 'supply-apple');
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect(growth).toBeVisible({ timeout: 18000 });
  await growth.getByRole('button', { name: '加入今日菜单', exact: true }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana', 'juice']);
  await page.screenshot({ path: info.outputPath('menu-grown.png') });
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开始 / 继续' }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana', 'juice']);
});
