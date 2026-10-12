import { expect, type Page, test } from '@playwright/test';
import { finishChapter, make, serve, startStory, state, supply } from './helpers';

test.use({ hasTouch: true });
const click = (p: Page, name: string) => p.getByRole('button', { name, exact: true }).click();
const begin = startStory;
async function bookAction(p: Page, name: string) {
  await click(p, '翻开旧食谱');
  await p
    .getByRole('dialog', { name: '食谱与作品' })
    .getByRole('button', { name, exact: true })
    .click();
}
test('visible activity entrance naturally reaches all five chapters and saves a real creation', async ({
  page,
}) => {
  test.setTimeout(420000);
  await page.setViewportSize({ width: 393, height: 665 });
  await begin(page);
  for (let chapter = 0; chapter < 5; chapter++) {
    await finishChapter(
      page,
      chapter,
      'rabbit',
      new Set(chapter === 3 ? ['grill', 'machine'] : []),
    );
    await expect(
      page.getByRole('button', { name: /一起吃早餐|一起开席|下一院活动|先帮/ }),
    ).toHaveCount(0);
  }
  const s = await state(page);
  expect(s.adventure?.flow?.archives.map((a) => a.chapter)).toEqual([0, 1, 2, 3]);
  expect(s.adventure?.flow?.archives.map((a) => a.foods.length)).toEqual([6, 5, 4, 4]);
  expect(s.adventure?.rewards).toEqual(['feast-page']);
  expect(s.adventure?.works[0]?.foods.map((f) => f.product).sort()).toEqual([
    'sandwich',
    'strawberry-cup',
  ]);
  expect(s.adventure?.experience?.used).toContain('share');
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 665, height: 393 },
    { width: 1024, height: 768 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(async () =>
        page.locator('.direct-ingredient').evaluateAll((buttons) =>
          buttons.every((button) => {
            const r = button.getBoundingClientRect(),
              hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
            return (
              r.width >= 48 &&
              r.height >= 48 &&
              r.x >= 0 &&
              r.y >= 0 &&
              r.right <= innerWidth &&
              r.bottom <= innerHeight - 30 &&
              !!hit &&
              button.contains(hit)
            );
          }),
        ),
      )
      .toBe(true);
  }
  await page.setViewportSize({ width: 393, height: 665 });
  await page.screenshot({ path: test.info().outputPath('five-chapters-phone.png') });
  await page.reload();
  await page.locator('.yard-story .entry-main').click();
  expect((await state(page)).adventure?.works).toEqual(s.adventure?.works);
  await click(page, '翻开旧食谱');
  await expect(page.getByRole('region', { name: '这次保存的作品' })).toContainText('I made');
  await click(page, '再准备一次');
  await click(page, '翻开旧食谱');
  await expect(page.getByRole('region', { name: '旧活动的作品' })).toContainText('I made');
  expect((await state(page)).items).toHaveLength(0);
});
test('receipt presentation and low motion never repeat settlement while the story naturally continues', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await begin(page);
  await finishChapter(page, 0);
  const before = await state(page);
  await page.waitForTimeout(2400);
  const after = await state(page);
  expect(after.adventure?.flow?.archives).toEqual(before.adventure?.flow?.archives);
  expect(after.attempts).toEqual(before.attempts);
  expect(after.adventure?.flow?.archives[0]?.rewards).toEqual(['flower-page']);
});
test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  test.setTimeout(240000);
  await begin(page);
  await finishChapter(page, 0);
  await finishChapter(page, 1);
  await finishChapter(page, 2, 'hedgehog');
  const picnic = (await state(page)).adventure?.flow?.archives.find((a) => a.chapter === 2);
  expect(picnic?.branch).toBe('hedgehog');
  expect(picnic?.steps).not.toContain('pack');
  expect(
    picnic?.foods.filter((f) => f.place.startsWith('table:') || f.place.startsWith('guest-')),
  ).toHaveLength(2);
  expect(picnic?.rewards).toEqual(['picnic-page']);
});
test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  await click(page, '开门 / 继续营业');
  await supply(page, 'apple');
  await pDeliver(page);
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({ timeout: 18000 });
  await click(page, '这次先不加 ↗');
  await click(page, '暂停');
  await click(page, '停止接客，做作品');
  expect((await state(page)).session.shop?.accepting).toBe(false);
  await supply(page, 'apple');
  await click(page, '放到作品区');
  await expect.poll(async () => (await state(page)).adventure?.foods.length).toBeGreaterThan(1);
  await expect(page.locator('.nearby-feedback')).toContainText('作品放好了');
  await bookAction(page, '保存到食谱');
  const saved = (await state(page)).adventure?.works;
  await page.reload();
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  await click(page, '开门 / 继续营业');
  expect((await state(page)).adventure?.works).toEqual(saved);
});
async function pDeliver(p: Page) {
  await p.locator('[data-actor="rabbit"]').click();
}
test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  page,
}) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await begin(page);
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).press('Enter');
  const before = await state(page);
  await page.locator('[data-actor="rabbit"]').press('Enter');
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  await click(page, '放回手中食品');
  await click(page, '暂停');
  await click(page, '收摊回小院');
  await page.locator('.yard-endless .entry-main').click();
  await make(page, 'juice', new Set(['machine']));
  expect(
    (await state(page)).items.some((i) => i.product === 'juice' && i.location.startsWith('hand:')),
  ).toBe(true);
});
test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-endless .entry-main').click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  await click(page, '两位一起招呼');
  await click(page, '开门 / 继续营业');
  const accepted = (await state(page)).orders;
  await supply(page, 'apple');
  await pDeliver(page);
  await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({ timeout: 18000 });
  await click(page, '加入今日菜单');
  expect((await state(page)).session.menu).toContain('banana');
  for (const o of accepted.filter((o) => o.seat === 1))
    expect((await state(page)).orders.find((n) => n.id === o.id)?.request).toBe(o.request);
});
test('low motion receipts retain actual foods and reachable controls across compact layouts', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await begin(page);
  await serve(page);
  await click(page, '暂停');
  const food = (await state(page)).adventure?.foods;
  for (const size of [
    { width: 393, height: 665 },
    { width: 665, height: 393 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: '继续操作', exact: true })).toBeInViewport();
    expect((await state(page)).adventure?.foods).toEqual(food);
  }
  await click(page, '继续操作');
  await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeInViewport();
  await expect(page.getByRole('button', { name: '下一院活动', exact: true })).toHaveCount(0);
});
