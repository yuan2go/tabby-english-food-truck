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
