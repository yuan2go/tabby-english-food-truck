import { expect, test } from '@playwright/test';
import { hot } from './helpers';

test('deferred menu introduction returns after another completed order', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '开始 / 继续' }).click();
  const firstLesson = page.getByRole('dialog', { name: '场景小教学' });
  if (await firstLesson.count())
    await firstLesson.getByRole('button', { name: '我来试试', exact: true }).click();
  for (let served = 1; served <= 2; served++) {
    await page.getByRole('button', { name: '食材直接放盘' }).click();
    const point = await hot(page, 'supply-apple');
    await page.mouse.click(point.x, point.y);
    await page.getByRole('button', { name: '送餐 ↗', exact: true }).click();
    await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({
      timeout: 20000,
    });
    if (served === 1) await page.getByRole('button', { name: '这次先不加 ↗' }).click();
    else await page.getByRole('button', { name: '加入今日菜单' }).click();
  }
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toContainText('Apple juice');
  const menu = await page.evaluate(() => {
    const raw = localStorage.getItem('tabby.foodtruck.profile.m2');
    return raw ? JSON.parse(raw).presented : [];
  });
  expect(menu).toContain('menu:banana');
});
