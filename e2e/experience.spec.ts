import { expect, test } from '@playwright/test';
import { startStory, state, supply } from './helpers';

test.use({ hasTouch: true });
test('single guest has a complete local request and direct physical path before reading instructions', async ({
  page,
}) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await startStory(page);
  expect((await state(page)).session.concurrency).toBe(1);
  await expect(page.locator('.local-bubble .sentence-text')).toContainText(
    'Can I have an apple, please?',
  );
  await expect(page.getByRole('button', { name: '拿起苹果', exact: true })).toBeInViewport();
  await supply(page, 'apple');
  const before = await state(page);
  await page
    .getByRole('button', { name: '播放整句：Can I have an apple, please?', exact: true })
    .click();
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  await page.locator('[data-actor="rabbit"]').click();
  await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  expect((await state(page)).adventure?.foods[0]?.product).toBe('apple');
});
test('less support retains complete English, records visible captions and audio failure separately', async ({
  page,
}) => {
  await page.route('**/audio/*.wav*', (r) => r.abort());
  await page.goto('/');
  await page.getByRole('button', { name: '旧食谱 · 回访活动与作品', exact: true }).click();
  await page.getByRole('button', { name: '跳过序章', exact: true }).click();
  await page.getByRole('button', { name: '少些帮助，听一听', exact: true }).click();
  await page.getByRole('button', { name: '晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  await expect
    .poll(async () => (await state(page)).orders[0]?.support.includes('audio-unavailable'))
    .toBe(true);
  expect((await state(page)).orders[0]?.support).toContain('caption-visible');
  await supply(page, 'apple');
  await page.locator('[data-actor="rabbit"]').click();
  await expect.poll(async () => (await state(page)).attempts.length).toBe(1);
  expect((await state(page)).attempts[0]?.support).toContain('caption-visible');
  expect((await state(page)).attempts[0]?.result).toBe('completed');
});
test('muting through settings retains full English and safe replay', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: '设置', exact: true }).click();
  await page.getByRole('checkbox', { name: '全部声音', exact: true }).uncheck();
  await page.getByRole('button', { name: '← 返回', exact: true }).click();
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  const before = await state(page);
  await page
    .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
    .click();
  await expect.poll(async () => (await state(page)).audio.at(-1)?.status).toBe('muted');
  expect((await state(page)).adventure).toEqual(before.adventure);
  expect((await state(page)).attempts).toEqual(before.attempts);
});
