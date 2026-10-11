import { expect, test } from '@playwright/test';
import { choosePrep, lesson, make, state } from './helpers';

test.use({ hasTouch: true });
test('single guest goal has a complete picture path before reading or hearing', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await expect(page.getByRole('region', { name: '图示下一步' })).toBeVisible();
  await expect(page.locator('.goal-pictures svg')).not.toHaveCount(0);
  expect((await state(page)).session.concurrency).toBe(1);
  await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  expect((await state(page)).orders.find((o) => o.visitor === 'hedgehog')?.status).toBe('waiting');
  await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await lesson(page);
  await choosePrep(page, '● 1号盘');
  await make(page, 'banana');
  await expect.poll(async () => (await state(page)).actor.current).toBeNull();
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  const before = await state(page);
  await page.getByRole('button', { name: '一起接待两位', exact: true }).click();
  await page.getByRole('button', { name: '一次接待一位', exact: true }).click();
  const after = await state(page);
  expect(after.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
  expect(after.orders.map((o) => [o.id, o.visitor, o.request])).toEqual(
    before.orders.map((o) => [o.id, o.visitor, o.request]),
  );
  expect(after.items).toEqual(before.items);
  expect(after.adventure).toEqual(before.adventure);
  await page.screenshot({ path: 'docs/evidence/adventure-experience-02/single-dual-phone.png' });
});

test('less support keeps the order answer private until failed speech provides recorded picture help', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await page.goto('/');
  await page.getByRole('button', { name: '旧食谱 · 回访活动与作品', exact: true }).click();
  await page.getByRole('button', { name: '跳过序章', exact: true }).click();
  await page.getByRole('button', { name: '少些帮助，听一听', exact: true }).click();
  await page.getByRole('button', { name: '晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  expect((await state(page)).session.support).toBe('less');
  await expect(page.locator('.goal-guide .food-art')).toHaveCount(0);
  await page.route('**/world-kitchen.wav**', (route) => route.abort());
  await page.getByRole('button', { name: '重听下一步', exact: true }).click();
  await expect(page.locator('.goal-guide .food-art')).toHaveCount(1);
  await expect
    .poll(async () =>
      (await state(page)).orders
        .find((o) => o.status === 'waiting')
        ?.support.includes('audio-unavailable'),
    )
    .toBe(true);
  await page.getByRole('button', { name: '看看怎么行动', exact: true }).click();
  await expect(page.locator('.guide-demonstration')).toBeVisible();
  await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/failed-speech-pictures-phone.png',
  });
});

test('muting through visible settings retains picture goals and safe replay', async ({ page }) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await page.goto('/');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('checkbox', { name: '全部声音', exact: true }).uncheck();
  await page.getByRole('button', { name: '返回', exact: false }).click();
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  await expect(page.locator('.goal-guide .food-art')).toHaveCount(1);
  const before = await state(page);
  await page.getByRole('button', { name: '重听下一步', exact: true }).click();
  await expect.poll(async () => (await state(page)).audio.at(-1)?.status).toBe('muted');
  expect((await state(page)).adventure).toEqual(before.adventure);
  await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
});
