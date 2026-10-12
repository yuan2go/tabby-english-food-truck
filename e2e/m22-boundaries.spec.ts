import { expect, test } from '@playwright/test';
import { hot, startStory, state, supply } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
test('wrong delivery, reserved capacity, cancel/multitouch and landscape keep real inventory', async ({
  page,
}) => {
  test.setTimeout(90000);
  await startStory(page);
  await supply(page, 'banana');
  const wrong = await state(page);
  await page.locator('[data-actor="rabbit"]').click();
  expect((await state(page)).items).toEqual(wrong.items);
  expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  await supply(page, 'apple');
  await page.getByRole('button', { name: '放入果汁机水果口', exact: true }).click();
  await page.getByRole('button', { name: '果汁机：空杯', exact: true }).click();
  await page.getByRole('button', { name: '启动果汁机', exact: true }).click();
  await supply(page, 'banana');
  await supply(page, 'apple');
  await supply(page, 'banana');
  const full = await state(page);
  await supply(page, 'banana');
  expect((await state(page)).nextId).toBe(full.nextId);
  expect((await state(page)).items.map((i) => i.id).sort()).toEqual(
    full.items.map((i) => i.id).sort(),
  );
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  await expect(page.getByRole('button', { name: '拿起苹果汁', exact: true })).toBeVisible({
    timeout: 15000,
  });
  await page.getByRole('button', { name: '拿起苹果汁', exact: true }).click();
  const juice = (await state(page)).items.find((i) => i.product === 'juice');
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '收起成品' })).toHaveCount(0);
  expect((await state(page)).recycle?.id).toBe(juice?.id);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '恢复收起的成品', exact: true }).click();
  expect((await state(page)).items.find((i) => i.id === juice?.id)?.product).toBe('juice');
  const before = await state(page),
    point = await hot(page, 'supply-apple');
  const c = await page.context().newCDPSession(page);
  await c.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...point, id: 1 }],
  });
  await c.send('Input.dispatchTouchEvent', {
    type: 'touchMove',
    touchPoints: [{ x: point.x + 12, y: point.y - 15, id: 1 }],
  });
  await c.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [
      { x: point.x + 12, y: point.y - 15, id: 1 },
      { x: point.x + 40, y: point.y, id: 2 },
    ],
  });
  await c.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  await c.detach();
  expect((await state(page)).items).toEqual(before.items);
  await page.setViewportSize({ width: 665, height: 393 });
  await expect(
    page.getByRole('button', { name: '拿起苹果', exact: true }).first(),
  ).toBeInViewport();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '给大咪写便签', exact: true }).click();
  await expect(page.getByRole('dialog', { name: '大咪便签' })).toBeVisible();
  expect((await state(page)).items).toEqual(before.items);
});
test('audio failure exposes correct retry, leaves supplies playable and never creates a language error', async ({
  page,
}) => {
  await page.route('**/audio/*.wav*', (r) => r.abort());
  await startStory(page);
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}')
          .failure !== null,
    )
    .toBe(true);
  const before = (await state(page)).attempts;
  await supply(page, 'apple');
  expect((await state(page)).items).toHaveLength(1);
  expect((await state(page)).attempts).toEqual(before);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.unroute('**/audio/*.wav*');
  await page.getByRole('button', { name: '重试声音', exact: true }).click();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure,
    )
    .toBeNull();
  expect((await state(page)).attempts).toEqual(before);
});
