import { expect, test } from '@playwright/test';
import { state } from './helpers';

test('scene pause and restart isolate background, trap focus and restore the trigger', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  await page.getByRole('button', { name: /朋友的两份心意/ }).click();
  await page.getByRole('button', { name: '先认识今天的物件' }).click();
  await page.getByRole('button', { name: '我来动手' }).click();
  await page.getByRole('button', { name: '拿起杯子', exact: true }).click();
  const before = await page.evaluate(() => localStorage.getItem('tabby.foodtruck.scene-games.v1'));
  const pause = page.getByRole('button', { name: '暂停小游戏' });
  await pause.click();
  const dialog = page.getByRole('dialog', { name: '小游戏已暂停' });
  await expect(dialog.getByRole('button', { name: '继续玩' })).toBeFocused();
  for (let i = 0; i < 6; i++) {
    await page.keyboard.press(i % 2 ? 'Shift+Tab' : 'Tab');
    expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  }
  // A programmatic attempt to focus the background must also be redirected.
  await page
    .locator('.scene-top button')
    .first()
    .evaluate((el) => (el as HTMLElement).focus());
  expect(await dialog.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await dialog.getByRole('button', { name: '继续玩' }).click();
  await expect(pause).toBeFocused();
  await expect(page.getByRole('group', { name: '大咪手里的物件' })).toContainText('放回');
  expect(before).not.toBe('');
  const restart = page.getByRole('button', { name: '重玩这一组', exact: true });
  await restart.click();
  const confirm = page.getByRole('dialog', { name: '重玩场景小游戏' });
  await expect(confirm.getByRole('button', { name: '继续这一轮' })).toBeFocused();
  await page.keyboard.press('Shift+Tab');
  await page.keyboard.press('Shift+Tab');
  expect(await confirm.evaluate((el) => el.contains(document.activeElement))).toBe(true);
  await confirm.getByRole('button', { name: '继续这一轮' }).click();
  await expect(restart).toBeFocused();
  expect((await state(page)).items).toEqual([]);
});
