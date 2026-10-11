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
    await page.touchscreen.tap(
      b.x + b.width / 2,
      b.y + b.height / 2 + (name.startsWith('1号托盘') ? 26 : 0),
    );
  };
  await touch('拿苹果');
  await touch('1号托盘：放入食品或选择整盘');
  const guest = await page.locator('[data-hotspot="guest-0"]').boundingBox();
  if (!guest) throw Error('guest');
  await page.touchscreen.tap(guest.x + guest.width / 2, guest.y + guest.height * 0.75);
  await expect(page.locator('.ending')).toBeVisible({ timeout: 18000 });
  await page.getByRole('button', { name: '继续下一小关' }).tap();
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toBeVisible({ timeout: 18000 });
  await page.getByRole('button', { name: '看看怎么做', exact: true }).tap();
  await expect(page.locator('.lesson-ingredients')).toBeVisible();
  await expect(page.locator('.lesson-process')).toContainText('果汁机');
  await page.screenshot({ path: info.outputPath('formal-juice-help.png') });
  await page.getByRole('button', { name: '回餐车，亲手做 ↗', exact: true }).tap();
  await touch('果汁机苹果入口');
  await touch('拿苹果');
  await touch('▶ 榨成果汁');
  await expect(page.getByRole('button', { name: '苹果汁，1号盘', exact: true })).toBeAttached({
    timeout: 15000,
  });
  await page.screenshot({ path: info.outputPath('visible-walk-juice.png') });
  await touch('1号托盘：放入食品或选择整盘');
  const nextGuest = await page.locator('[data-hotspot="guest-0"]').boundingBox();
  if (!nextGuest) throw Error('guest');
  await page.touchscreen.tap(
    nextGuest.x + nextGuest.width / 2,
    nextGuest.y + nextGuest.height * 0.75,
  );
  await expect(page.locator('.ending')).toBeVisible({ timeout: 18000 });
  await writeFile(
    info.outputPath('walk.json'),
    JSON.stringify(
      {
        method: 'VISIBLE_UI_AND_FORMAL_HELP',
        hiddenAnswers: false,
        gameplayClicks: { apple: 3, juice: 5 },
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
