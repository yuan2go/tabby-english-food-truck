import { expect, test } from '@playwright/test';
import { serve, startStory, state, supply } from './helpers';

test.use({ hasTouch: true });
test('normal entrance keeps requests and receipt at the speaker, with optional garden and real memory', async ({
  page,
}) => {
  await startStory(page);
  await expect(page.locator('.local-bubble .sentence-text')).toHaveText(
    'Can I have an apple, please?',
  );
  await serve(page);
  await expect(
    page.getByRole('button', { name: '重听兔兔：Thank you!', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  await serve(page);
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  expect((await state(page)).adventure?.experience?.used).toContain('water');
  const before = await state(page);
  await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  expect((await state(page)).adventure?.foods).toHaveLength(2);
  const settled = await state(page);
  await page
    .getByRole('button', { name: /播放整句/ })
    .last()
    .click();
  expect((await state(page)).adventure?.rewards).toEqual(settled.adventure?.rewards);
  expect((await state(page)).attempts).toEqual(before.attempts);
});
test('phone actual hand and both guests re-hear without delivery; wrong recipient and pause preserve ownership', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await startStory(page);
  await supply(page, 'apple');
  const before = await state(page);
  await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  expect((await state(page)).orders[1]?.status).toBe('queued');
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  await page
    .getByRole('button', { name: '重听兔兔：Can I have an apple, please?', exact: true })
    .click();
  expect((await state(page)).items).toEqual(before.items);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const frozen = await state(page);
  await page.setViewportSize({ width: 665, height: 393 });
  await page.getByRole('button', { name: '继续操作', exact: true }).click();
  expect((await state(page)).items).toEqual(frozen.items);
  await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  expect((await state(page)).items).toHaveLength(0);
});
