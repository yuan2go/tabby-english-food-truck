import { expect, test } from '@playwright/test';
import { lesson, startEndless, state, tap } from './helpers';

test.use({ hasTouch: true });
for (const viewport of [
  { width: 393, height: 665 },
  { width: 1280, height: 720 },
]) {
  test(`one connected scene flow ${viewport.width}`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto('/');
    await page.locator('.yard-story .entry-main').tap();
    await page.getByRole('button', { name: '跳过序章' }).tap();
    await expect(page.locator('.service-surface')).toBeVisible();
    expect((await state(page)).session.levelId).toBe('c1-open-door');
    expect((await state(page)).orders).toHaveLength(1);
    await lesson(page);
    await tap(page, 'supply-apple');
    await page.waitForTimeout(300);
    await tap(page, 'tray-0', 26);
    await page.getByRole('button', { name: '点请求气泡重听' }).tap();
    expect((await state(page)).attempts).toHaveLength(0);
    await tap(page, 'guest-0', 20);
    await expect(page.locator('.scene-result')).toBeVisible({ timeout: 18000 });
    await expect(page.getByRole('progressbar', { name: '把小花放上窗台' })).toHaveAttribute(
      'aria-valuenow',
      '1',
    );
    await page.screenshot({ path: `test-results/adventure-result-${viewport.width}.png` });
    await page.getByRole('button', { name: '继续下一小关' }).tap();
    await lesson(page);
    await tap(page, 'machine-apple');
    await tap(page, 'supply-apple');
    await tap(page, 'start');
    await expect
      .poll(async () =>
        (await state(page)).items.some(
          (i) => i.product === 'juice' && i.location.startsWith('tray:0:'),
        ),
      )
      .toBe(true);
    await page.screenshot({ path: `test-results/adventure-juice-${viewport.width}.png` });
    await tap(page, 'tray-0', 26);
    await tap(page, 'guest-0', 20);
    await expect(page.locator('.scene-result')).toBeVisible({ timeout: 18000 });
    await page.reload();
    await page.locator('.yard-story .entry-main').tap();
    await lesson(page);
    expect((await state(page)).session.levelId).toBe('c1-new-fruit');
    await tap(page, 'supply-banana');
    await page.waitForTimeout(300);
    await tap(page, 'tray-0', 26);
    await tap(page, 'guest-0', 20);
    await expect(page.locator('.scene-result')).toBeVisible({ timeout: 18000 });
    await page.reload();
    await page.locator('.yard-story .entry-main').tap();
    await expect(page.getByRole('dialog', { name: '先帮谁？' })).toBeVisible();
    await page.getByRole('button', { name: '先帮刺刺榨香蕉汁' }).tap();
    expect((await state(page)).session.storyChoice).toBe(1);
    expect((await state(page)).orders.map((o) => o.request)).toEqual(['banana-juice', 'fruit']);
  });
}
test('listening to the full prologue starts the same first task', async ({ page }) => {
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '接着听' }).tap();
  await page.getByRole('button', { name: '接着听' }).tap();
  await page.getByRole('button', { name: '拿起食谱，开店啦' }).tap();
  expect((await state(page)).session.levelId).toBe('c1-open-door');
  expect((await state(page)).orders).toHaveLength(1);
});

test('less support keeps an audio bubble while holding a tray', async ({ page }) => {
  await startEndless(page);
  await tap(page, 'tray-0', 26);
  await tap(page, 'supply-apple');
  await page.waitForTimeout(300);
  await tap(page, 'tray-0', 26);
  const before = (await state(page)).attempts.length;
  const bubble = page.getByRole('button', { name: '点请求气泡重听' });
  await expect(bubble.locator('img')).toHaveCount(0);
  await bubble.tap();
  expect((await state(page)).attempts).toHaveLength(before);
  await tap(page, 'guest-0', 20);
  expect((await state(page)).attempts).toHaveLength(before + 1);
});
