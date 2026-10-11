import { expect, type Page, test } from '@playwright/test';
import { choosePrep, handOver, hot, lesson, make, state, tap } from './helpers';

test.use({ hasTouch: true });

async function kitchen(page: Page) {
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await lesson(page);
}
async function table(page: Page) {
  await lesson(page);
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
}
async function send(page: Page, index: number, product: Parameters<typeof make>[1]) {
  await lesson(page);
  const order = (await state(page)).orders[index];
  if (order?.status === 'queued') {
    await table(page);
    await page
      .getByRole('button', {
        name: order.visitor === 'hedgehog' ? '先帮刺刺' : '先帮兔兔',
        exact: true,
      })
      .click();
    await kitchen(page);
  }
  const orderId = order?.id;
  if (product === 'apple' || product === 'banana') {
    if ((await state(page)).session.family !== 'juice') await tap(page, 'family-juice');
    await choosePrep(page, '● 1号盘');
    await tap(page, `supply-${product}`);
  } else {
    await choosePrep(page, '● 1号盘');
    await make(page, product);
  }
  const activeOrder = (await state(page)).orders.find((o) => o.id === orderId);
  if (!activeOrder || activeOrder.status !== 'waiting')
    throw Error('chosen friend was not admitted');
  await handOver(page, activeOrder.seat);
  await expect
    .poll(async () => (await state(page)).orders.find((o) => o.id === orderId)?.status ?? 'done', {
      timeout: 20000,
    })
    .toBe('done');
  await lesson(page);
}
async function begin(page: Page) {
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
}

test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  page,
}) => {
  test.setTimeout(420000);
  await page.setViewportSize({ width: 1280, height: 720 });
  await begin(page);
  await kitchen(page);
  await send(page, 0, 'apple');
  await send(page, 1, 'banana');
  await table(page);
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'vanilla-cone');
  await make(page, 'strawberry-cup');
  await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  await table(page);
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  await page.getByRole('button', { name: '选择草莓冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '挂上清凉彩旗', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'sandwich');
  await table(page);
  await page.getByRole('button', { name: '检查野餐篮', exact: true }).click();
  await kitchen(page);
  await make(page, 'sandwich');
  await tap(page, 'family-juice');
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-banana');
  await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  await send(page, 1, 'salad-sandwich');
  await table(page);
  await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/picnic-rabbit-desktop.png',
  });
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'cheese-burger');
  await send(page, 1, 'juice');
  await table(page);
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await page.getByRole('button', { name: '取出灯串', exact: true }).click();
  await page.getByRole('button', { name: '请兔兔带灯', exact: true }).click();
  await page.getByRole('button', { name: '选择芝士汉堡', exact: true }).click();
  await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  await page.getByRole('button', { name: '点亮暖灯', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  await kitchen(page);
  await choosePrep(page, '● 1号盘');
  await make(page, 'sandwich');
  await make(page, 'juice');
  await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  await table(page);
  await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  await page.getByRole('button', { name: '分享给兔兔', exact: true }).click();
  await page.getByRole('button', { name: '品尝芝士三明治', exact: true }).click();
  await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await expect
    .poll(() =>
      page.evaluate(
        () =>
          JSON.parse(
            localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}',
          ).activityMemories.filter((m: { state: { rewards: string[] } }) => m.state.rewards.length)
            .length,
      ),
    )
    .toBe(5);
  await page.screenshot({ path: 'docs/evidence/adventure-experience-02/feast-desktop.png' });
  const before = await state(page);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '正在准备 · 社区小食会', exact: true }).click();
  expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  await page.getByRole('button', { name: '再准备一次', exact: true }).click();
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  await expect(
    page
      .getByRole('region', { name: '上次留下的作品', exact: true })
      .locator('.remembered-table')
      .getByRole('img', { name: '芝士三明治', exact: true }),
  ).toBeVisible();
  expect((await state(page)).adventure?.foods).toEqual([]);
  expect((await state(page)).adventure?.rewards).toEqual([]);
});

test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  test.setTimeout(300000);
  await page.setViewportSize({ width: 393, height: 665 });
  await begin(page);
  await kitchen(page);
  await send(page, 0, 'apple');
  await send(page, 1, 'banana');
  await table(page);
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  await page.getByRole('button', { name: '把花种在左边', exact: true }).click();
  await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'vanilla-cone');
  await make(page, 'vanilla-cup');
  await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  await table(page);
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  await page.getByRole('button', { name: '选择香草冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '品尝香草冰淇淋杯', exact: true }).click();
  await page.getByRole('button', { name: '挂上暖色彩旗', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await kitchen(page);
  await send(page, 1, 'salad-sandwich');
  await table(page);
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await page.getByRole('button', { name: '取出餐垫', exact: true }).click();
  await page.getByRole('button', { name: '选择蔬菜三明治', exact: true }).click();
  await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'sandwich');
  await table(page);
  await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  await page.getByRole('button', { name: '铺上阳光桌布', exact: true }).click();
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  expect((await state(page)).adventure?.branch).toBe('hedgehog');
  expect((await state(page)).adventure?.rewards).toEqual(['picnic-page']);
  await expect(page.getByRole('button', { name: '把篮子摆上桌', exact: true })).toHaveCount(0);
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/picnic-hedgehog-phone.png',
  });
});

test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.setViewportSize({ width: 393, height: 665 });
  await page.goto('/');
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('button', { name: '晨间水果', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await lesson(page);
  await table(page);
  await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  await expect(page.getByRole('region', { name: '朋友的回访分享需要', exact: true })).toBeVisible();
  await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  await kitchen(page);
  await send(page, 0, 'apple');
  await expect.poll(async () => (await state(page)).orders.length).toBe(0);
  await make(page, 'juice');
  await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  await table(page);
  await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  await page.getByRole('button', { name: '摆到3号餐位', exact: true }).click();
  await page.getByRole('button', { name: '拿回苹果汁到桌边', exact: true }).click();
  const beforeBlocked = await state(page);
  await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  await expect(page.locator('.goal-guide')).toHaveAttribute('data-guide', 'occupied');
  expect((await state(page)).adventure?.foods).toEqual(beforeBlocked.adventure?.foods);
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/occupied-recovery-phone.png',
  });
  await page.getByRole('button', { name: /图示下一步：餐位已经/ }).click();
  await expect(page.getByRole('button', { name: '拿回苹果到桌边', exact: true })).toBeFocused();
  await page.getByRole('button', { name: '拿回苹果到桌边', exact: true }).click();
  await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  await page.getByRole('button', { name: '品尝苹果汁', exact: true }).click();
  const tasted = await state(page);
  await expect(page.locator('.theatre-sip, .friend-theatre.sip')).toBeVisible();
  await page.waitForTimeout(900);
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/friend-drinking-phone.png',
  });
  await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  await page.waitForTimeout(300);
  expect((await state(page)).adventure?.foods).toEqual(tasted.adventure?.foods);
  expect((await state(page)).adventure?.rewards).toEqual(tasted.adventure?.rewards);
  await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  await expect(
    page.locator('.remembered-seat').nth(1).getByRole('img', { name: '苹果汁', exact: true }),
  ).toBeVisible();
  await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  const before = await state(page);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await page.reload();
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await table(page);
  expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  await page.screenshot({ path: 'docs/evidence/adventure-experience-02/free-shop-phone.png' });
  await page.getByRole('button', { name: '收拾桌面', exact: true }).click();
  const dialog = page.getByRole('dialog', { name: '收拾活动桌', exact: true });
  await expect(dialog.getByRole('button', { name: '继续摆餐', exact: true })).toBeFocused();
  await dialog.getByRole('button', { name: '确认收拾', exact: true }).click();
  expect((await state(page)).adventure?.foods).toEqual([]);
  expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  expect((await state(page)).items).toEqual([]);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await expect(page.getByRole('heading', { name: '大咪的英语餐车', exact: true })).toBeVisible();
});

test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  browser,
}) => {
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 },
    hasTouch: false,
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await page.getByRole('button', { name: '我来试试', exact: true }).click();
  const tray = await hot(page, 'tray-0', 26);
  await page.mouse.click(tray.x, tray.y);
  const point = await hot(page, 'supply-banana');
  await page.mouse.click(point.x, point.y);
  const fruit = (await state(page)).items[0];
  await page.mouse.click(tray.x, tray.y);
  const guest = await hot(page, (await state(page)).orders[0]?.id ?? 'guest-0', 20);
  await page.mouse.click(guest.x, guest.y);
  expect((await state(page)).items[0]).toEqual(fruit);
  expect((await state(page)).adventure?.branch).toBeNull();
  expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  const supply = page.getByRole('button', { name: '拿苹果', exact: true });
  await supply.focus();
  await supply.press('Enter');
  expect((await state(page)).items.map((f) => f.product)).toEqual(['banana', 'apple']);
  const inlet = await hot(page, 'machine-apple');
  await page.mouse.click(inlet.x, inlet.y);
  await page.mouse.click(point.x, point.y);
  const start = await hot(page, 'start');
  await page.mouse.click(start.x, start.y);
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  const saved = await state(page);
  expect(saved.machine.status).toBe('processing');
  await page.waitForTimeout(300);
  expect((await state(page)).gameTime).toBe(saved.gameTime);
  await page.reload();
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  expect((await state(page)).runId).toBe(saved.runId);
  expect((await state(page)).items).toEqual(saved.items);
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await expect
    .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-juice'), {
      timeout: 15000,
    })
    .toBe(true);
  await page.screenshot({
    path: 'docs/evidence/adventure-experience-02/kitchen-desktop-mouse.png',
  });
  await context.close();
});

test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  page,
}) => {
  test.setTimeout(90000);
  await page.goto('/');
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await lesson(page);
  await send(page, 0, 'apple');
  await page
    .getByRole('dialog', { name: '今日新菜单', exact: true })
    .getByRole('button', { name: '加入今日菜单', exact: true })
    .click();
  await table(page);
  await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  await kitchen(page);
  const request = (await state(page)).orders[0]?.request;
  if (request !== 'apple' && request !== 'banana') throw Error('unexpected first revisit');
  await send(page, 0, request);
  await table(page);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('checkbox', { name: /apple/i }).uncheck();
  await page.getByRole('checkbox', { name: /banana/i }).check();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await lesson(page);
  const pendingMenu = page.getByRole('dialog', { name: '今日新菜单', exact: true });
  if (await pendingMenu.count())
    await pendingMenu.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  const old = (await state(page)).orders[0];
  expect(old?.request).toBe('banana');
  await table(page);
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('checkbox', { name: /banana/i }).uncheck();
  await page.getByRole('checkbox', { name: /apple/i }).check();
  await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  const next = await state(page);
  expect(next.orders[0]).toEqual(old);
  expect(next.orders[1]?.request).toBe('apple');
  expect(next.session.menu).toEqual(['apple']);
});
