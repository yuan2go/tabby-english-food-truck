import { expect, test } from '@playwright/test';
import { make, startEndless, startStory, state, supply } from './helpers';

test.use({ hasTouch: true });
test('scene pause isolates background, traps focus and restores a usable trigger', async ({
  page,
}) => {
  await startStory(page);
  await supply(page, 'apple');
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const before = await state(page);
  const d = page.getByRole('dialog', { name: '休息一下' });
  await expect(d).toBeVisible();
  await d.getByRole('button', { name: '继续操作', exact: true }).press('Tab');
  expect(
    await page.evaluate(() => Boolean(document.activeElement?.closest('[role="dialog"]'))),
  ).toBe(true);
  await d.getByRole('button', { name: '继续操作', exact: true }).press('Enter');
  expect((await state(page)).items).toEqual(before.items);
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeFocused();
});
test('individual hand portions, preparation rest and explicit recipients stay distinct through replay and delivery', async ({
  page,
}) => {
  await startStory(page);
  await supply(page, 'banana');
  await page.getByRole('button', { name: '放到制作承放区', exact: true }).click();
  await supply(page, 'apple');
  const before = await state(page);
  await page
    .getByRole('button', { name: '播放整句：Can I have an apple, please?', exact: true })
    .click();
  expect((await state(page)).items).toEqual(before.items);
  await page.locator('[data-actor="rabbit"]').click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  expect((await state(page)).items.map((i) => i.product)).toEqual(['banana']);
  expect((await state(page)).adventure?.foods.map((f) => f.product)).toEqual(['apple']);
});
test('real recipe comparisons preserve assistance and leave ingredients and flavor to the player', async ({
  page,
}) => {
  await startStory(page);
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  const book = page.getByRole('dialog', { name: '食谱与作品' });
  await expect(book.locator('.recipe-pictures .food-art')).not.toHaveCount(0);
  const before = await state(page);
  expect(before.orders[0]?.support).toContain('recipe-reference');
  await book.getByRole('button', { name: '收起食谱', exact: true }).click();
  expect((await state(page)).attempts).toEqual(before.attempts);
  expect((await state(page)).items).toEqual(before.items);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await startEndless(page, false);
  await make(page, 'banana-juice');
  expect(
    (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  ).toEqual(['banana-juice']);
  expect((await state(page)).orders[0]?.request).toBe('apple');
});
test('home invitation and autonomous entrances remain reachable in compact layouts', async ({
  page,
}) => {
  await page.goto('/');
  for (const size of [
    { width: 393, height: 665 },
    { width: 852, height: 300 },
  ]) {
    await page.setViewportSize(size);
    for (const name of [
      '正在准备 · 早餐派对',
      '自由开店',
      '迷你游戏',
      '教学练习',
      '旧食谱 · 回访活动与作品',
    ]) {
      const b = page.getByRole('button', { name, exact: true });
      await expect(b).toBeInViewport({ ratio: 1 });
      expect(
        await b.evaluate((el) => {
          const r = el.getBoundingClientRect();
          const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
          return (
            r.width >= 48 && r.height >= 48 && (hit === el || Boolean(hit && el.contains(hit)))
          );
        }),
      ).toBe(true);
    }
  }
});
test('optional drag snaps only to the target actually pointed at and empty release does not submit', async ({
  page,
}) => {
  await startStory(page);
  const before = await state(page);
  const source = await page.locator('[data-hotspot="supply-apple"]').boundingBox();
  if (!source) throw Error('source');
  await page.mouse.move(source.x + 25, source.y + 25);
  await page.mouse.down();
  await page.mouse.move(380, 10, { steps: 8 });
  await page.mouse.up();
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  const receiver = await page.locator('[data-actor="rabbit"]').boundingBox();
  if (!receiver) throw Error('receiver');
  await page.mouse.move(source.x + 25, source.y + 25);
  await page.mouse.down();
  await page.mouse.move(receiver.x + receiver.width / 2, receiver.y + receiver.height / 2, {
    steps: 8,
  });
  await page.mouse.up();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  expect((await state(page)).adventure?.foods.map((f) => f.product)).toEqual(['apple']);
});
