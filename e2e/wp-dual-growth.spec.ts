import { expect, test } from '@playwright/test';
import { hot, state } from './helpers';

test('deferred menu introduction returns after another completed order', async ({ page }) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '开门 / 继续营业' }).click();
  const firstLesson = page.getByRole('dialog', { name: '场景小教学' });
  if (await firstLesson.count())
    await firstLesson.getByRole('button', { name: '我来试试', exact: true }).click();
  for (let served = 1; served <= 2; served++) {
    const tray = await hot(page, 'tray-0', 26);
    await page.mouse.click(tray.x, tray.y);
    const point = await hot(page, 'supply-apple');
    await page.mouse.click(point.x, point.y);
    await page.mouse.click(tray.x, tray.y);
    const order = (await state(page)).orders.find((guest) => guest.status === 'waiting');
    if (!order) throw Error('no waiting guest');
    const guest = await hot(page, order.id, 20);
    await page.mouse.click(guest.x, guest.y);
    await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({
      timeout: 20000,
    });
    if (served === 1) await page.getByRole('button', { name: '这次先不加 ↗' }).click();
    else await page.getByRole('button', { name: '加入今日菜单' }).click();
  }
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toContainText(
    'Can I have some apple juice, please?',
  );
  const menu = await page.evaluate(() => {
    const raw = localStorage.getItem('tabby.foodtruck.profile.m2');
    return raw ? JSON.parse(raw).presented : [];
  });
  expect(menu).toContain('menu:banana');
});
