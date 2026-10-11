import { expect, test } from '@playwright/test';
import { choosePrep, handOver, lesson, make, state, tap } from './helpers';

test.use({ hasTouch: true });
const sentence = (page: Parameters<typeof state>[0]) =>
  page.locator('.conversation .sentence-text');

test('normal entrance: complete requests, actual receipt, yard actions, open flavors and real sharing memory', async ({
  page,
}, info) => {
  test.setTimeout(150000);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await lesson(page);
  await expect(sentence(page)).toHaveText('Can I have an apple, please?');
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-apple');
  await handOver(page, 0);
  await expect(sentence(page)).toHaveText('Thank you!');
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
    .toBe('done');
  await lesson(page);
  await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-banana');
  await handOver(page, 1);
  await expect
    .poll(async () => (await state(page)).orders.every((o) => o.status === 'done'), {
      timeout: 18000,
    })
    .toBe(true);
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  await expect(sentence(page)).toHaveText('Please open the drawer.');
  await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  await expect(sentence(page)).toHaveText('Here is the flower!');
  await page.getByRole('button', { name: '重听下一步行动', exact: true }).click();
  await expect(sentence(page)).toHaveText('Please plant the flower.');
  await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  await expect(sentence(page)).toHaveText('We planted the flower!');
  await page.getByRole('button', { name: '一起开席', exact: true }).click();
  await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  await expect(sentence(page)).toContainText('Any flavor is fine.');
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await lesson(page);
  await page.setViewportSize({ width: 393, height: 665 });
  await expect(sentence(page)).toContainText('one scoop of vanilla ice cream in a cone');
  const longPanel = await page.locator('.conversation').boundingBox();
  const guest = await page.locator('[data-hotspot="guest-0"]').boundingBox();
  if (!longPanel || !guest) throw Error('missing request or guest');
  expect(longPanel.y + longPanel.height).toBeLessThanOrEqual(guest.y);
  await page.screenshot({ path: info.outputPath('phone-long-request.png') });
  await page.setViewportSize({ width: 1440, height: 900 });
  await make(page, 'vanilla-cone');
  await handOver(page, 0);
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
    .toBe('done');
  await lesson(page);
  await make(page, 'banana-cream');
  await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  await page.getByRole('button', { name: '品尝香蕉冰淇淋', exact: true }).click();
  await expect(sentence(page)).toHaveText('Yummy! I like it.');
  await page.screenshot({ path: info.outputPath('yard-taste.png') });
  await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  await page.getByRole('button', { name: '自由开店', exact: true }).click();
  await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  await lesson(page);
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  await expect(sentence(page)).toHaveText('I remember your vanilla ice cream in a cone.');
  await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-banana');
  await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  await expect(sentence(page)).toHaveText('This is for you.');
  await expect
    .poll(async () =>
      (await state(page)).adventure?.foods.some((f) => f.source.startsWith('create:')),
    )
    .toBe(true);
  await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  await expect(page.locator('.work-description').first()).toHaveText('I made a banana.');
  const observations = await page.evaluate(
    () => JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}').observations,
  );
  expect(
    observations
      .filter((o: { dimension: string; support: string[] }) =>
        o.support.includes('caption-visible'),
      )
      .every((o: { dimension: string }) => o.dimension === 'meaning'),
  ).toBe(true);
  await page.screenshot({ path: info.outputPath('sharing-memory.png') });
});

test('phone: held tray and two guests replay without delivery; cancellation, pause, failure and short landscape', async ({
  page,
}, info) => {
  await page.setViewportSize({ width: 393, height: 665 });
  await page.goto('/');
  await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  await lesson(page);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-apple');
  await tap(page, 'tray-0', 26);
  const before = await state(page);
  await page.getByRole('button', { name: '重听客人A的请求', exact: true }).click();
  const play = page.getByRole('button', {
    name: '播放整句：Can I have an apple, please?',
    exact: true,
  });
  await play.click();
  await play.click();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toContain('imm-order-apple');
  expect((await state(page)).items).toEqual(before.items);
  expect((await state(page)).attempts).toEqual(before.attempts);
  await page.getByRole('button', { name: '重听客人B的请求', exact: true }).click();
  await lesson(page);
  await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  await page
    .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
    .click();
  await page.getByRole('button', { name: '暂停', exact: true }).click();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBeNull();
  const paused = await state(page);
  await page.waitForTimeout(150);
  expect((await state(page)).gameTime).toBe(paused.gameTime);
  await page.getByRole('button', { name: '继续营业', exact: true }).click();
  await page.route('**/audio/imm-order-*.wav*', (r) => r.abort());
  await page
    .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure
          ?.kind,
    )
    .toBeTruthy();
  await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  await page.unroute('**/audio/imm-order-*.wav*');
  await page
    .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
    .click();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBe('imm-order-banana');
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure,
    )
    .toBeNull();
  await page.evaluate(() => window.dispatchEvent(new Event('blur')));
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBeNull();
  const suspended = await state(page);
  await page.waitForTimeout(150);
  expect((await state(page)).gameTime).toBe(suspended.gameTime);
  await page.evaluate(() => window.dispatchEvent(new Event('focus')));
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBeNull();
  await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  await page.screenshot({ path: info.outputPath('phone-request.png') });
  await page.setViewportSize({ width: 852, height: 393 });
  const panel = await page.locator('.conversation').boundingBox();
  expect(panel).toBeTruthy();
  if (!panel) throw Error('sentence panel missing');
  for (const id of ['supply-apple', 'tray-0', before.orders[0]?.id ?? 'guest-0']) {
    const b = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
    if (!b) throw Error(id);
    expect(
      Math.max(panel.x, b.x) < Math.min(panel.x + panel.width, b.x + b.width) &&
        Math.max(panel.y, b.y) < Math.min(panel.y + panel.height, b.y + b.height),
      id,
    ).toBe(false);
  }
  expect((await state(page)).attempts).toEqual(before.attempts);
  await page.screenshot({ path: info.outputPath('short-landscape.png') });
});
