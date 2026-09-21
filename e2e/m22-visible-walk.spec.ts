import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});
// This walk uses only visible pictures, official help, and semantic input geometry.
// It never reads localStorage, controller state, catalog answers or hidden game data.
test('visible interface and formal help walk: apple and juice without hidden answers', async ({
  page,
}, info) => {
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  const opening = page.getByRole('button', { name: '跳过开场' });
  if (await opening.count()) await opening.tap();
  await page.getByRole('button', { name: '我来试试', exact: true }).tap();
  await expect(
    page
      .getByRole('button', { name: '点请求气泡重听' })
      .getByRole('img', { name: '苹果', exact: true }),
  ).toBeVisible();
  const touch = async (name: string) => {
    const b = await page.getByRole('button', { name, exact: true }).boundingBox();
    if (!b) throw Error(name);
    await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2);
  };
  await touch('拿苹果');
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toBeVisible({ timeout: 18000 });
  await page.getByRole('button', { name: '看看怎么做', exact: true }).tap();
  await expect(page.locator('.lesson-ingredients')).toBeVisible();
  await expect(page.locator('.lesson-process')).toContainText('果汁机');
  await page.screenshot({ path: info.outputPath('formal-juice-help.png') });
  await page.getByRole('button', { name: '回餐车，亲手做 ↗', exact: true }).tap();
  await touch('果汁机苹果入口');
  await touch('拿苹果');
  await touch('启动果汁机');
  await expect(page.getByRole('button', { name: '苹果汁，1号盘', exact: true })).toBeAttached({
    timeout: 15000,
  });
  await page.screenshot({ path: info.outputPath('visible-walk-juice.png') });
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect(page.locator('.service-count')).toContainText('2 / 4', { timeout: 18000 });
  await writeFile(
    info.outputPath('walk.json'),
    JSON.stringify(
      {
        method: 'VISIBLE_UI_AND_FORMAL_HELP',
        hiddenAnswers: false,
        gameplayClicks: { apple: 2, juice: 4 },
        extraRecipeHelpClicks: 2,
        audibleHumanListening: 'NOT_RUN',
        result: 'two real deliveries',
        remaining: 'owner/child usability review',
      },
      null,
      2,
    ),
  );
});
