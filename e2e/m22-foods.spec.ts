import { expect, test } from '@playwright/test';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
});
test('all 50 foods are reachable by visible baskets and the selected food enters listening practice', async ({
  page,
}, info) => {
  const failed: string[] = [];
  page.on('response', (r) => {
    if (r.status() >= 400) failed.push(r.url());
  });
  await page.goto('/');
  await page.locator('.yard-training .entry-main').tap();
  await page.getByRole('button', { name: /五篮食物朋友/ }).tap();
  const seen = new Set<string>();
  for (const basket of ['水果篮', '菜园篮', '厨房篮', '香甜篮', '点心篮']) {
    await page.getByRole('button', { name: basket, exact: true }).tap();
    for (const half of [0, 1]) {
      if (half) await page.getByRole('button', { name: /换半篮/ }).tap();
      const foods = page.locator('.basket-foods button');
      await expect(foods).toHaveCount(5);
      for (let i = 0; i < 5; i++) {
        const button = foods.nth(i);
        const label = await button.getAttribute('aria-label');
        expect(label).toMatch(/^认识/);
        if (label) seen.add(label.slice(2));
        await button.tap();
        await expect(page.locator('.food-meaning strong')).not.toHaveText('');
        expect(
          await button
            .locator('img')
            .evaluate((e) => e instanceof HTMLImageElement && e.complete && e.naturalWidth >= 200),
        ).toBe(true);
      }
    }
  }
  expect(seen.size).toBe(50);
  expect(failed).toEqual([]);
  await page.getByRole('button', { name: '水果篮', exact: true }).tap();
  await page.getByRole('button', { name: /认识橙子/ }).tap();
  await page.screenshot({ path: info.outputPath('foods-393x665-dpr3.png') });
  await page.getByRole('button', { name: /听一听，找朋友/ }).tap();
  await page.getByRole('button', { name: /食物找朋友/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  await expect(page.locator('.meaning-stage h2')).toHaveText('orange');
  await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  await page.getByRole('button', { name: '橙子', exact: true }).tap();
  await expect(page.locator('.mini-feedback')).toContainText('找到了');
  await page.reload();
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByRole('button', { name: /食物找朋友/ }).tap();
  await expect(page.locator('.mini-feedback')).toContainText('找到了');
});
