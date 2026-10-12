import { expect, test } from '@playwright/test';
import { state } from './helpers';

test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
test('single scoop uses four real actions and a different dessert is tasted on the scene', async ({
  page,
}) => {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  for (const [friend, food] of [
    ['兔兔', '苹果'],
    ['刺刺', '香蕉'],
  ]) {
    await page.getByRole('button', { name: '先帮' + friend, exact: true }).click();
    await page.getByRole('button', { name: '拿起' + food, exact: true }).click();
    await page.getByRole('button', { name: '交给' + friend, exact: true }).click();
    await expect
      .poll(
        async () =>
          (await state(page)).orders.find(
            (o) => o.visitor === (friend === '兔兔' ? 'rabbit' : 'hedgehog'),
          )?.status,
      )
      .toBe('done');
  }
  await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  await page.getByRole('button', { name: '冰淇淋：蛋筒', exact: true }).click();
  await page.getByRole('button', { name: '冰淇淋：香草球', exact: true }).click();
  expect((await state(page)).items.map((i) => i.product)).toEqual(['vanilla-cone']);
  await expect(page.getByRole('button', { name: '启动冰淇淋台', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '拿起香草蛋筒', exact: true }).click();
  await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  await page.getByRole('button', { name: '冰淇淋：空杯', exact: true }).click();
  await page.getByRole('button', { name: '冰淇淋：草莓球', exact: true }).click();
  await page.getByRole('button', { name: '拿起草莓冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  await page.getByRole('button', { name: '比较两份甜点', exact: true }).click();
  await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  expect((await state(page)).adventure?.rewards).toEqual(['bunting-page']);
  expect((await state(page)).adventure?.explored).not.toContain('recipe');
});
test('free kitchen starts at once and configuration is optional', async ({ page }) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await expect(page.getByRole('region', { name: '同桌厨房', exact: true })).toBeVisible();
  await expect(page.getByRole('region', { name: '自由开店菜单', exact: true })).toHaveCount(0);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  await expect(page.getByRole('region', { name: '自由开店菜单', exact: true })).toBeVisible();
});
