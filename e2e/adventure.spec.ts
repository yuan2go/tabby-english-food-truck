import { expect, type Page, test } from '@playwright/test';
import { choosePrep, make, serve, state, supply } from './helpers';

test.use({ hasTouch: true });
const click = (p: Page, name: string) => p.getByRole('button', { name, exact: true }).click();
async function begin(p: Page) {
  await p.goto('/');
  await click(p, '正在准备 · 晨光开门');
}
async function send(p: Page, index: number) {
  const o = (await state(p)).orders[index];
  if (o?.status === 'queued') await click(p, o.visitor === 'rabbit' ? '先帮兔兔' : '先帮刺刺');
  await serve(p);
}
async function finishBreakfast(p: Page) {
  await send(p, 0);
  await send(p, 1);
  await click(p, '一起吃早餐');
  expect((await state(p)).adventure?.rewards).toEqual(['flower-page']);
}
async function bookAction(p: Page, name: string) {
  await click(p, '翻开旧食谱');
  await p
    .getByRole('dialog', { name: '食谱与作品' })
    .getByRole('button', { name, exact: true })
    .click();
}

async function desserts(p: Page) {
  await send(p, 0);
  await make(p, 'strawberry-cup');
  await click(p, '交给刺刺');
  await expect.poll(async () => (await state(p)).adventure?.steps.includes('cool')).toBe(true);
  await click(p, '比较两份甜点');
  await click(p, '品尝草莓冰淇淋杯');
  await click(p, '挂起清凉彩旗');
  expect((await state(p)).adventure?.decor.bunting).toBe('cool');
  expect((await state(p)).adventure?.experience?.heldDecoration).toBeFalsy();
  await click(p, '一起开席');
}
async function picnic(p: Page, hedgehog = false) {
  await send(p, hedgehog ? 1 : 0);
  await send(p, hedgehog ? 0 : 1);
  if (!hedgehog) {
    await click(p, '检查野餐篮');
    await expect(p.getByRole('button', { name: /重听兔兔：Please pack a sandwich/ })).toBeVisible();
    const requestFits = await p
      .getByRole('button', { name: /重听兔兔：Please pack a sandwich/ })
      .evaluate((node) => {
        const text = node.getBoundingClientRect(),
          bubble = node.closest('.local-bubble')?.getBoundingClientRect();
        return (
          !!bubble &&
          text.top >= bubble.top &&
          text.bottom <= bubble.bottom &&
          text.right <= bubble.right
        );
      });
    expect(requestFits).toBe(true);
    const id = await make(p, 'sandwich');
    if (!id) throw Error('sandwich');
    await supply(p, 'banana');
    await click(p, '把食品放进野餐篮');
    await expect.poll(async () => (await state(p)).adventure?.steps.includes('pack')).toBe(true);
    await click(p, '把篮子摆上桌');
  } else {
    expect((await state(p)).adventure?.steps).toEqual(
      expect.arrayContaining(['place:0', 'place:1']),
    );
  }
  await click(p, '铺叶子桌布');
  expect((await state(p)).adventure?.steps).toContain('cloth');
  await click(p, '一起开席');
}
async function dinner(p: Page, restore?: Set<string>) {
  await click(p, '先帮兔兔');
  await serve(p, restore);
  await click(p, '先帮刺刺');
  await serve(p, restore);
  await click(p, '请兔兔带灯');
  expect((await state(p)).adventure?.steps).toEqual(expect.arrayContaining(['place:0', 'place:1']));
  await click(p, '点亮暖灯');
  expect((await state(p)).adventure?.steps).toContain('light');
  await click(p, '一起开席');
}
async function creation(p: Page) {
  await click(p, '邀请兔兔');
  await click(p, '邀请刺刺');
  const foods = ['sandwich', 'strawberry-cup'] as const;
  const ids: string[] = [];
  for (const f of foods) {
    const id = await make(p, f);
    if (!id) throw Error(f);
    ids.push(id);
    await choosePrep(p, '盘');
  }
  for (const id of ids) await p.locator(`[data-hotspot="item-${id}"]`).click();
  await click(p, '放到作品区');
  await expect.poll(async () => (await state(p)).adventure?.steps.includes('create')).toBe(true);
  for (const f of (await state(p)).adventure?.foods.filter((f) => f.place === 'work') ?? []) {
    await p.locator(`[data-hotspot="item-${f.id}"]`).click();
    await p.locator(`[data-actor="${f.product === 'sandwich' ? 'rabbit' : 'hedgehog'}"]`).click();
  }
  await click(p, '品尝芝士三明治');
  await expect(p.getByRole('button', { name: '重听兔兔：Thank you!', exact: true })).toBeVisible();
  await expect(
    p.getByRole('button', { name: /重听兔兔：Can I have a sandwich or a burger/ }),
  ).toHaveCount(0);
  await click(p, '保存到食谱');
  await click(p, '一起开席');
}
test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  page,
}) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 393, height: 665 });
  await begin(page);
  await finishBreakfast(page);
  await click(page, '下一院活动');
  await desserts(page);
  await click(page, '下一院活动');
  await picnic(page);
  await click(page, '下一院活动');
  await dinner(page, new Set(['grill', 'machine']));
  await click(page, '下一院活动');
  for (const viewport of [
    { width: 1280, height: 720 },
    { width: 665, height: 393 },
  ]) {
    await page.setViewportSize(viewport);
    await expect
      .poll(async () =>
        page.locator('.direct-ingredient').evaluateAll((buttons) =>
          buttons.every((button) => {
            const r = button.getBoundingClientRect();
            const hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
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
  await creation(page);
  const s = await state(page);
  expect(s.adventure?.rewards).toEqual(['feast-page']);
  expect(s.adventure?.works[0]?.foods.map((f) => f.product).sort()).toEqual([
    'sandwich',
    'strawberry-cup',
  ]);
  expect(s.adventure?.experience?.used).toContain('share');
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
test('receipt presentation and low motion never repeat settlement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await begin(page);
  await finishBreakfast(page);
  const before = await state(page);
  await page.waitForTimeout(4000);
  const after = await state(page);
  expect(after.adventure?.rewards).toEqual(before.adventure?.rewards);
  expect(after.attempts).toEqual(before.attempts);
  expect(after.adventure?.foods.map((f) => f.id)).toEqual(before.adventure?.foods.map((f) => f.id));
});
test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  test.setTimeout(180000);
  await begin(page);
  await finishBreakfast(page);
  await click(page, '下一院活动');
  await desserts(page);
  await click(page, '下一院活动');
  await picnic(page, true);
  expect((await state(page)).adventure?.branch).toBe('hedgehog');
  expect((await state(page)).adventure?.steps).not.toContain('pack');
  expect(
    (await state(page)).adventure?.foods.filter(
      (f) => f.place.startsWith('table:') || f.place.startsWith('guest-'),
    ),
  ).toHaveLength(2);
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
  await click(page, '先帮兔兔');
  await page.getByRole('button', { name: '拿起香蕉', exact: true }).press('Enter');
  const before = await state(page);
  await page.locator('[data-actor="rabbit"]').press('Enter');
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  await click(page, '放回手中食品');
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
  await finishBreakfast(page);
  const food = (await state(page)).adventure?.foods;
  for (const size of [
    { width: 393, height: 665 },
    { width: 665, height: 393 },
  ]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: '暂停', exact: true })).toBeInViewport();
    await expect(page.getByRole('button', { name: '下一院活动', exact: true })).toBeInViewport();
    expect((await state(page)).adventure?.foods).toEqual(food);
  }
});
