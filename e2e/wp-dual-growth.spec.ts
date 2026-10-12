import { expect, test } from '@playwright/test';
import { serve, startEndless, state } from './helpers';

test('deferred menu introduction returns after another actual completed order', async ({
  page,
}) => {
  test.setTimeout(90000);
  await startEndless(page, false);
  await serve(page);
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({ timeout: 18000 });
  await page.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  expect((await state(page)).session.menu).toEqual(['apple']);
  await serve(page);
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({ timeout: 18000 });
  await page.getByRole('button', { name: '加入今日菜单', exact: true }).click();
  expect((await state(page)).session.menu).toEqual(['apple', 'banana']);
});
