import { expect, test } from '@playwright/test';
import { state } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true });
test('natural entrance, clear wave goal and receipt feedback need no welcome or finish buttons', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  await expect(page.locator('.story-progress')).toBeVisible();
  await expect(
    page.getByRole('button', { name: /先帮|一起吃早餐|一起开席|下一院活动/ }),
  ).toHaveCount(0);
  await expect(page.getByRole('region', { name: '果汁机', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  await expect(page.locator('.receive-reward')).toBeVisible();
  await expect
    .poll(async () => (await state(page)).adventure?.foods.some((f) => f.product === 'apple'))
    .toBe(true);
  await expect
    .poll(async () =>
      (await state(page)).orders.some((o) => o.request === 'banana' && o.status === 'waiting'),
    )
    .toBe(true);
  await expect
    .poll(
      async () =>
        (await state(page)).audio.some((a) => a.order === 'guest-1' && a.status === 'started'),
      { timeout: 15000 },
    )
    .toBe(true);
});
test('leaving during a chapter reward resumes the same real kitchen and keeps an extra fruit', async ({
  page,
}) => {
  test.setTimeout(90000);
  const { serve, supply } = await import('./helpers');
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  for (let i = 0; i < 4; i++) {
    await expect
      .poll(async () => (await state(page)).orders.some((o) => o.status === 'waiting'))
      .toBe(true);
    await serve(page);
  }
  await expect.poll(async () => (await state(page)).adventure?.flow?.phase).toBe('reward');
  await supply(page, 'banana');
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const before = await state(page);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await expect(page.locator('.yard-story .entry-main')).toHaveAttribute(
    'aria-label',
    '正在准备 · 早餐派对',
  );
  await page.locator('.yard-story .entry-main').click();
  expect((await state(page)).runId).toBe(before.runId);
  expect((await state(page)).items).toEqual(before.items);
});
test('short landscape keeps the current full sentence inside its bubble and above cooking controls', async ({
  page,
}) => {
  await page.setViewportSize({ width: 665, height: 393 });
  await page.goto('/');
  await page.locator('.yard-story .entry-main').click();
  const sentence = page.locator('.local-bubble:not(.speaker-mini) .sentence-text').first();
  await expect(sentence).toContainText('Can I have an apple, please?');
  expect(
    await sentence.evaluate((el) => {
      const text = el.getBoundingClientRect();
      const bubble = el.closest('.local-bubble')?.getBoundingClientRect();
      const kitchen = document.querySelector('.direct-kitchen')?.getBoundingClientRect();
      if (!bubble || !kitchen) return false;
      return text.top >= bubble.top && text.bottom <= bubble.bottom && bubble.bottom <= kitchen.top;
    }),
  ).toBe(true);
});
