import { expect, test } from '@playwright/test';
import { targetWord } from '../src/rules/minigames';
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
test('direct mini entry visibly presents recorded meanings and keeps free design reachable', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-mini .entry-main').click();
  await page.getByRole('button', { name: /食物找朋友 听一题/ }).click();
  const mini = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions[
        document.querySelector<HTMLElement>('[data-mini-key]')?.dataset.miniKey ?? ''
      ],
  );
  const word = targetWord(mini);
  expect(mini.support).toContain('meaning-picture');
  await expect(page.getByRole('region', { name: '食物与英文名字' })).toContainText(word.text);
  await expect(page.getByRole('region', { name: '食物与英文名字' }).locator('img')).toBeVisible();
  await page.getByRole('button', { name: '← 回游戏小摊' }).click();
  await page.getByRole('button', { name: /A B C WordSpell/ }).click();
  await expect(page.locator('.spell-model')).toBeVisible();
  await page.getByRole('button', { name: '← 回游戏小摊' }).click();
  await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  await page.getByRole('button', { name: /餐桌设计师/ }).click();
  await page.getByRole('button', { name: /上下里面旁边/ }).click();
  await expect(page.getByRole('region', { name: '场景物件与英文' })).toBeVisible();
  await page.getByRole('button', { name: '自由布置餐桌', exact: true }).click();
  const scenes = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}').scenes['design-0'],
  );
  expect(scenes.mode).toBe('free');
  expect(scenes.attempts).toHaveLength(0);
});
