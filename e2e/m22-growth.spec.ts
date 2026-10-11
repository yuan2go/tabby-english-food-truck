import { expect, test } from '@playwright/test';
import { handOver, lesson, state, tap } from './helpers';

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
  await page.getByRole('button', { name: '开门 / 继续营业' }).tap();
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  await page.getByRole('button', { name: '来试一下 →', exact: true }).tap();
  await page.getByRole('button', { name: '苹果', exact: true }).tap();
  await expect.poll(async () => (await state(page)).items.map((i) => i.product)).toEqual(['apple']);
  expect((await state(page)).items[0]?.location).toMatch(/^tray:0:/);
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toHaveCount(0);
  await handOver(page);
  const growth = page.getByRole('dialog', { name: '今日新菜单' });
  await expect(growth).toBeVisible({ timeout: 18000 });
  expect((await state(page)).session.menu).toEqual(['apple']);
  await growth.getByRole('button', { name: '加入今日菜单', exact: true }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana']);
  // Ask for the existing picture support, then use only the visible picture.
  await lesson(page);
  await page.getByRole('button', { name: '图示帮助', exact: true }).tap();
  const picture = page.locator('.request-figures');
  const label = await picture.locator('img').getAttribute('alt');
  await tap(page, label?.includes('香蕉') ? 'supply-banana' : 'supply-apple');
  await handOver(page);
  await expect(growth).toBeVisible({ timeout: 18000 });
  await growth.getByRole('button', { name: '加入今日菜单', exact: true }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana', 'juice']);
  await page.screenshot({ path: info.outputPath('menu-grown.png') });
  await page.reload();
  await page.locator('.yard-endless .entry-main').tap();
  await page.getByRole('button', { name: '开门 / 继续营业' }).tap();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana', 'juice']);
});
