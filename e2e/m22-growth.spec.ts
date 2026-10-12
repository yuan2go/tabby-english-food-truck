import { expect, test } from '@playwright/test';
import { serve, startEndless, state } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
test('actual picked fruit introduces meaning and fresh endless explicitly introduces banana then juice', async ({
  page,
}) => {
  test.setTimeout(90000);
  await startEndless(page, false);
  expect((await state(page)).session.menu).toEqual(['apple']);
  for (const menu of [
    ['apple', 'banana'],
    ['apple', 'banana', 'juice'],
  ]) {
    await serve(page);
    expect((await state(page)).attempts.at(-1)?.support).toContain('caption-visible');
    const growth = page.getByRole('dialog', { name: '今日新菜单' });
    await expect(growth).toBeVisible({ timeout: 18000 });
    await expect(growth.locator('.food-art')).not.toHaveCount(0);
    await growth.getByRole('button', { name: '加入今日菜单', exact: true }).click();
    expect((await state(page)).session.menu).toEqual(menu);
  }
  const s = await state(page);
  await page.reload();
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '开门 / 继续营业' }).click();
  expect((await state(page)).session.menu).toEqual(s.session.menu);
  expect((await state(page)).attempts).toEqual(s.attempts);
});
