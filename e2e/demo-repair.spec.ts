import { expect, test } from '@playwright/test';
import { SCENE_KEY } from '../src/platform/minis';
import { evidencePath, startStory, state, tap } from './helpers';

test.use({ hasTouch: true, isMobile: true });

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
  const before = await page.evaluate((key) => localStorage.getItem(key), SCENE_KEY);
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
  expect(before).not.toBeNull();
  expect(await page.evaluate((key) => localStorage.getItem(key), SCENE_KEY)).toBe(before);
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

test('individual food and the whole tray remain distinct through touch, rehearing and delivery', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await startStory(page);
  await tap(page, 'tray-0');
  await tap(page, 'supply-apple');
  await tap(page, 'supply-banana');
  const foods = (await state(page)).items;
  const apple = foods.find((i) => i.product === 'apple');
  const banana = foods.find((i) => i.product === 'banana');
  if (!apple || !banana) throw Error('actual food missing');
  for (const size of [
    { width: 393, height: 665 },
    { width: 768, height: 1024 },
    { width: 852, height: 300 },
  ]) {
    await page.setViewportSize(size);
    for (const tray of [0, 1]) {
      const body = await page.locator(`[data-hotspot="tray-${tray}"]`).boundingBox();
      const handle = page.locator(`[data-hotspot="lift-tray-${tray}"]`);
      await expect(handle).toBeInViewport({ ratio: 1 });
      const box = await handle.boundingBox();
      if (!body || !box) throw Error('missing tray geometry');
      expect(body.y + body.height).toBeLessThanOrEqual(box.y);
      expect(box.width).toBeGreaterThanOrEqual(48);
      expect(box.height).toBeGreaterThanOrEqual(48);
      expect(
        await handle.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return [0.25, 0.5, 0.75].every((n) => {
            const hit = document.elementFromPoint(r.x + r.width * n, r.y + r.height / 2);
            return hit === el || (!!hit && el.contains(hit));
          });
        }),
      ).toBe(true);
    }
  }
  await page.setViewportSize({ width: 393, height: 665 });
  await tap(page, `item-${banana.id}`);
  await expect(page.locator(`[data-hotspot="item-${banana.id}"]`)).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.screenshot({ path: evidencePath('individual-food-phone.png') });
  const handle = page.locator('[data-hotspot="lift-tray-0"]');
  await handle.tap();
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  expect((await state(page)).items).toEqual(foods);
  await page.screenshot({ path: evidencePath('whole-tray-phone.png') });
  await page.getByRole('button', { name: '点请求气泡重听', exact: true }).tap();
  await expect(handle).toHaveAttribute('aria-pressed', 'true');
  await handle.tap();
  await expect(handle).toHaveAttribute('aria-pressed', 'false');
  expect((await state(page)).items).toEqual(foods);
  await tap(page, `item-${banana.id}`);
  const body = page.locator('[data-hotspot="tray-1"]');
  const bodyBox = await body.boundingBox();
  if (!bodyBox) throw Error('plate body missing');
  await page.touchscreen.tap(bodyBox.x + bodyBox.width / 2, bodyBox.y + bodyBox.height * 0.75);
  await expect
    .poll(async () => (await state(page)).items.find((i) => i.id === banana.id)?.location)
    .toMatch(/^tray:1:/);
  await handle.tap();
  const order = (await state(page)).orders.find((o) => o.status === 'waiting');
  if (!order) throw Error('guest missing');
  await tap(page, order.id, 20);
  await expect
    .poll(async () => (await state(page)).adventure?.foods.some((i) => i.product === 'apple'), {
      timeout: 15000,
    })
    .toBe(true);
  expect((await state(page)).attempts.filter((a) => a.activity === 'delivery')).toHaveLength(1);
  expect((await state(page)).items.find((i) => i.id === banana.id)?.location).toMatch(/^tray:1:/);
  await page.getByRole('button', { name: '到活动桌', exact: true }).tap();
  await expect(page.locator('.goal-guide')).not.toHaveAttribute('data-guide', 'wait');
  const hint = await page.locator('.goal-pictures').getAttribute('aria-label');
  await expect(page.locator('.world-feedback')).not.toContainText('正在送过去');
  await expect(page.locator('.world-feedback')).toHaveText(
    hint?.replace('图示下一步：', '') ?? 'missing guide',
  );
  await page.screenshot({ path: evidencePath('received-current-goal-phone.png') });
});

test('optional visual contrasts preserve assistance and leave the choice to the player', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await startStory(page);
  const helpTrigger = page.locator('[data-hotspot="note"]');
  await helpTrigger.focus();
  await helpTrigger.press('Enter');
  await page.getByRole('button', { name: '看食物和份数对比', exact: true }).tap();
  const contrast = page.getByRole('region', { name: '食物和份数图音对比' });
  await expect(contrast.getByRole('img', { name: '汉堡', exact: true })).toBeVisible();
  await expect(contrast.getByRole('img', { name: '芝士汉堡', exact: true })).toBeVisible();
  await contrast
    .locator('img')
    .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  await page.screenshot({ path: evidencePath('burger-contrast-phone.png') });
  await contrast.getByRole('button', { name: '杯和筒', exact: true }).tap();
  await expect(contrast.getByRole('img', { name: '香草冰淇淋杯', exact: true })).toBeVisible();
  await expect(contrast.getByRole('img', { name: '香草蛋筒', exact: true })).toBeVisible();
  await contrast
    .locator('img')
    .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  await page.screenshot({ path: evidencePath('cup-cone-contrast-phone.png') });
  await contrast.getByRole('button', { name: '一份和两份', exact: true }).tap();
  await expect(contrast.getByRole('img', { name: '苹果', exact: true })).toHaveCount(3);
  await contrast.getByRole('button', { name: '听两份', exact: true }).tap();
  await contrast
    .locator('img')
    .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  await page.screenshot({ path: evidencePath('quantity-contrast-phone.png') });
  await contrast.getByRole('button', { name: '两种壶', exact: true }).tap();
  await expect(contrast.getByRole('button', { name: '听倒水的壶', exact: true })).toBeVisible();
  await contrast
    .locator('img')
    .evaluateAll((images) => Promise.all(images.map((img) => (img as HTMLImageElement).decode())));
  await page.screenshot({ path: evidencePath('vessel-contrast-phone.png') });
  await page.getByRole('button', { name: '回去自己做', exact: true }).tap();
  await expect(helpTrigger).toBeFocused();
  expect((await state(page)).orders[0]?.support).toContain('visual-contrast');
  expect((await state(page)).items).toEqual([]);
  expect((await state(page)).attempts).toEqual([]);
  await page.reload();
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).tap();
  expect((await state(page)).orders[0]?.support).toContain('visual-contrast');
});

test('home main invitation and autonomous entrances are physically reachable in compact layouts', async ({
  page,
}) => {
  await page.goto('/');
  for (const size of [
    { width: 393, height: 665 },
    { width: 768, height: 1024 },
    { width: 852, height: 300 },
  ]) {
    await page.setViewportSize(size);
    for (const name of [
      '正在准备 · 晨光开门',
      '自由开店',
      '迷你游戏',
      '教学练习',
      '旧食谱 · 回访活动与作品',
    ]) {
      const button = page.getByRole('button', { name, exact: true });
      await expect(button).toBeInViewport({ ratio: 1 });
      expect(
        await button.evaluate((el) => {
          const r = el.getBoundingClientRect();
          return (
            r.width >= 48 &&
            r.height >= 48 &&
            [0.25, 0.5, 0.75].every((n) => {
              const hit = document.elementFromPoint(r.x + r.width * n, r.y + r.height * 0.5);
              return hit === el || (hit !== null && el.contains(hit));
            })
          );
        }),
      ).toBe(true);
    }
    await page.screenshot({ path: evidencePath(`home-${size.width}x${size.height}.png`) });
  }
});
