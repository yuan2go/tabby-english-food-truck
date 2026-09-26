import { expect, type Page, test } from '@playwright/test';
import { REQUESTS } from '../src/content/catalog';
import { RAW } from '../src/content/recipes';
import { STORY_LEVELS, storyRequests, storyVisitors } from '../src/content/story-levels';
import { choosePrep, make, state, tap } from './helpers';

async function overlapGrillAndSecondTray(page: Page) {
  const lesson = page.getByRole('dialog', { name: '场景小教学' });
  if (await lesson.count()) await lesson.getByRole('button', { name: '我来试试' }).tap();
  await choosePrep(page, '● 1号盘');
  await tap(page, 'station-grill');
  await tap(page, 'supply-patty');
  await page.getByRole('button', { name: '▶ 煎熟肉饼' }).tap();
  expect((await state(page)).stations.grill.status).toBe('processing');
  await choosePrep(page, '● 2号盘');
  await page.getByRole('button', { name: '选择食谱' }).tap();
  await page
    .getByRole('group', { name: '选择食谱工作台' })
    .getByRole('button', { name: '果汁', exact: true })
    .tap();
  await expect(page.locator('.loading-page')).toHaveCount(0);
  await page.getByRole('button', { name: '食材直接放盘' }).tap();
  await tap(page, 'supply-apple');
  const simultaneous = await state(page);
  expect(
    simultaneous.items.some(
      (item) => item.product === 'apple' && item.location.startsWith('tray:1:'),
    ),
  ).toBe(true);
  expect(simultaneous.stations.grill.status).toBe('processing');
  await page.screenshot({
    path: 'docs/evidence/dual-layout-playflow/overlap-prep-desktop-1440x900.png',
  });
  await page.getByRole('button', { name: '选择食谱' }).tap();
  await page
    .getByRole('group', { name: '选择食谱工作台' })
    .getByRole('button', { name: '汉堡', exact: true })
    .tap();
  await expect(page.locator('.loading-page')).toHaveCount(0);
  await page.screenshot({
    path: 'docs/evidence/dual-layout-playflow/overlap-desktop-1440x900.png',
  });
  await tap(page, 'guest-1');
  await page.getByRole('button', { name: '送给右边客人 ↗' }).tap();
  await expect
    .poll(async () => (await state(page)).orders[1]?.status, { timeout: 20000 })
    .toBe('done');
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'cooked-patty'), {
      timeout: 20000,
    })
    .toBe(true);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'station-board');
  for (const product of ['bun', 'lettuce', 'tomato']) await tap(page, `supply-${product}`);
  await page.getByRole('button', { name: '▶ 盖合食物' }).tap();
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'burger'), {
      timeout: 15000,
    })
    .toBe(true);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 20000 })
    .toBe('done');
}

async function overlapTwoDevices(page: Page) {
  const lesson = page.getByRole('dialog', { name: '场景小教学' });
  if (await lesson.count()) await lesson.getByRole('button', { name: '我来试试' }).tap();
  await choosePrep(page, '● 1号盘');
  await page.getByRole('button', { name: '选择食谱' }).tap();
  await page
    .getByRole('group', { name: '选择食谱工作台' })
    .getByRole('button', { name: '汉堡', exact: true })
    .tap();
  await expect(page.locator('.loading-page')).toHaveCount(0);
  await tap(page, 'station-grill');
  await tap(page, 'supply-patty');
  await choosePrep(page, '● 2号盘');
  await page.getByRole('button', { name: '选择食谱' }).tap();
  await page
    .getByRole('group', { name: '选择食谱工作台' })
    .getByRole('button', { name: '果汁', exact: true })
    .tap();
  await expect(page.locator('.loading-page')).toHaveCount(0);
  await tap(page, 'supply-banana');
  await tap(page, 'supply-cup');
  await page.getByRole('button', { name: '▶ 榨成果汁' }).tap();
  expect((await state(page)).machine.status).toBe('processing');
  await page.getByRole('button', { name: '选择食谱' }).tap();
  await page
    .getByRole('group', { name: '选择食谱工作台' })
    .getByRole('button', { name: '汉堡', exact: true })
    .tap();
  await expect(page.locator('.loading-page')).toHaveCount(0);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'station-grill');
  await page.getByRole('button', { name: '▶ 煎熟肉饼' }).tap();
  const simultaneous = await state(page);
  expect(simultaneous.machine.status).toBe('processing');
  expect(simultaneous.stations.grill.status).toBe('processing');
  await page.screenshot({
    path: 'docs/evidence/dual-layout-playflow/parallel-devices-desktop-1440x900.png',
  });
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'banana-juice'), {
      timeout: 20000,
    })
    .toBe(true);
  await choosePrep(page, '● 2号盘');
  await tap(page, 'guest-1');
  await page.getByRole('button', { name: '送给右边客人 ↗' }).tap();
  await expect
    .poll(async () => (await state(page)).orders[1]?.status, { timeout: 20000 })
    .toBe('done');
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'cooked-patty'), {
      timeout: 20000,
    })
    .toBe(true);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'station-board');
  for (const product of ['bun', 'cheese']) await tap(page, `supply-${product}`);
  await page.getByRole('button', { name: '▶ 盖合食物' }).tap();
  await expect
    .poll(async () => (await state(page)).items.some((item) => item.product === 'cheese-burger'), {
      timeout: 15000,
    })
    .toBe(true);
  await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 20000 })
    .toBe('done');
}

test('normal entrance reaches the community feast through every service level', async ({
  browser,
}) => {
  test.setTimeout(900000);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    hasTouch: true,
    deviceScaleFactor: 1,
    recordVideo: { dir: 'test-results/full-story-video', size: { width: 1440, height: 900 } },
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '帮朋友完成这关' }).tap();

  for (const [index, level] of STORY_LEVELS.entries()) {
    console.log(`story progress ${index + 1}/${STORY_LEVELS.length}: ${level.id}`);
    const opening = page.getByRole('dialog', { name: '章节开场' });
    if (await opening.count()) await opening.getByRole('button', { name: '跳过开场' }).tap();
    await expect.poll(async () => (await state(page)).session.levelId).toBe(level.id);
    if (['c1-first-juice', 'c3-drink', 'c5-help'].includes(level.id)) {
      const current = await state(page);
      const names = { rabbit: '兔兔', hedgehog: '刺刺', elder: '长辈' };
      const visitors = storyVisitors(level, current.session.storyChoice ?? 0);
      for (const [orderIndex, order] of current.orders.entries()) {
        if (order.status !== 'waiting') continue;
        const visitor = visitors[orderIndex];
        if (!visitor) throw Error(`${level.id} has no visitor for order ${orderIndex}`);
        await expect(page.locator(`[data-hotspot="${order.id}"]`)).toHaveAttribute(
          'aria-label',
          new RegExp(names[visitor]),
          { timeout: 12000 },
        );
      }
    }
    if (level.id === 'c4-wait') {
      await page.context().storageState({ path: '/tmp/tabby-before-overlap.storage.json' });
      await overlapGrillAndSecondTray(page);
    } else if (level.id === 'c5-help') {
      await page.context().storageState({ path: '/tmp/tabby-before-parallel.storage.json' });
      await overlapTwoDevices(page);
    } else
      for (const request of storyRequests(level, (await state(page)).session.storyChoice ?? 0)) {
        const lesson = page.getByRole('dialog', { name: '场景小教学' });
        if (await lesson.count())
          await lesson.getByRole('button', { name: '我来试试', exact: true }).tap();
        await expect(page.locator('.loading-page')).toHaveCount(0);
        const current = await state(page);
        const order = current.orders.find((o) => o.status === 'waiting' && o.request === request);
        if (!order) throw Error(`${level.id}: ${request} did not arrive`);
        await choosePrep(page, order.seat === 0 ? '● 1号盘' : '● 2号盘');
        for (const product of REQUESTS[request].products) {
          if (RAW.includes(product)) {
            if (!(await state(page)).session.unlocked.includes('juice'))
              throw Error('missing juice');
            if ((await state(page)).session.family !== 'juice') {
              await page.getByRole('button', { name: '选择食谱' }).tap();
              await page
                .getByRole('group', { name: '选择食谱工作台' })
                .getByRole('button', { name: '果汁', exact: true })
                .tap();
            }
            await page.getByRole('button', { name: '食材直接放盘' }).tap();
            await tap(page, `supply-${product}`);
          } else {
            const id = await make(page, product);
            const made = (await state(page)).items.find((item) => item.id === id);
            if (!made) throw Error(`${level.id}: ${product} missing after preparation`);
            if (!made.location.startsWith(`tray:${order.seat}:`)) {
              await tap(page, `item-${id}`);
              await choosePrep(page, order.seat === 0 ? '● 1号盘' : '● 2号盘');
            }
          }
        }
        if ((await state(page)).orders.filter((o) => o.status === 'waiting').length > 1) {
          await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
          await page
            .getByRole('button', {
              name: order.seat === 0 ? '送给左边客人 ↗' : '送给右边客人 ↗',
            })
            .tap();
        } else await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
        await expect
          .poll(async () => (await state(page)).orders.find((o) => o.id === order.id)?.status, {
            timeout: 20000,
          })
          .toBe('done');
      }
    await expect(page.locator('.ending')).toBeVisible();
    if (level.id === 'c3-tablecloth') await page.getByRole('button', { name: '👥 两位一起' }).tap();
    if (index === STORY_LEVELS.length - 1) {
      await expect(page.locator('.ending')).toContainText('小院里的朋友，都到齐啦');
      await page.screenshot({
        path: 'docs/evidence/dual-layout-playflow/story-finale-1440x900.png',
      });
    } else if (STORY_LEVELS[index + 1]?.choice) {
      const next = STORY_LEVELS[index + 1];
      if (!next?.choice) throw Error('choice missing');
      await page
        .getByRole('button', { name: next.choice.labels[next.chapter === 3 ? 1 : 0] })
        .tap();
    } else {
      await page
        .getByRole('button', {
          name: STORY_LEVELS[index + 1]?.chapter === level.chapter ? '继续下一小关' : '翻开下一页',
        })
        .tap();
    }
  }
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = localStorage.getItem('tabby.foodtruck.profile.m2');
        return raw ? JSON.parse(raw).completedLevels.length : 0;
      }),
    )
    .toBe(STORY_LEVELS.length);
  await context.close();
});
