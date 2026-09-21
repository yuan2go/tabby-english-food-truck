import { expect, test } from '@playwright/test';
import { startStory, state, tap } from './helpers';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});
test('M21 first prologue starts, opening can skip, short lesson records only real choices', async ({
  page,
}, info) => {
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBe('prologue-0');
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  await expect(page.getByRole('dialog', { name: '章节开场' })).toBeVisible();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBe('chapter-juice');
  await page.getByRole('button', { name: '跳过开场' }).tap();
  await expect(page.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  const profile = () =>
    page.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'));
  expect((await profile()).tutorials).not.toContain('request-apple');
  expect((await profile()).observations).toHaveLength(0);
  await page.getByRole('button', { name: '来试一下 →' }).tap();
  await page.getByRole('button', { name: '苹果', exact: true }).tap();
  expect((await profile()).observations).toHaveLength(1);
  await page.getByRole('button', { name: '听成品名称' }).tap();
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBe('apple');
  await page.getByRole('button', { name: '回餐车，亲手做 ↗' }).tap();
  await expect(page.locator('.prep-selector button[aria-pressed="true"]')).toHaveText('● 1号盘');
  await expect
    .poll(
      async () =>
        JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
    )
    .toBe('request-apple');
  await tap(page, 'supply-apple');
  expect((await state(page)).items[0]?.location).toBe('tray:0:0');
  await page.screenshot({ path: info.outputPath('first-order.png') });
});
test('M21 matching accepts direct picture after playback and switches activities without losing drafts', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByRole('button', { name: /食物找朋友 听一题/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  await expect
    .poll(async () =>
      page.evaluate(
        () =>
          JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions?.[
            'match-listen'
          ]?.heard,
      ),
    )
    .toBe(true);
  const target = await page.evaluate(
    () =>
      JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions[
        'match-listen'
      ].words[0],
  );
  await page.getByRole('button', { name: target === 'apple' ? '苹果' : '香蕉', exact: true }).tap();
  await expect(page.locator('.mini-feedback')).toContainText('找到了');
  await page.getByRole('button', { name: '← 回游戏小摊' }).tap();
  await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  await page.getByRole('button', { name: '小猫帮帮我' }).tap();
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}'),
  );
  await page.getByRole('button', { name: '← 回游戏小摊' }).tap();
  await page.getByRole('button', { name: /食物找朋友 听一题/ }).tap();
  await expect(page.locator('.mini-feedback')).toContainText('找到了');
  await page.reload();
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}'),
  );
  expect(after.sessions.spell).toEqual(before.sessions.spell);
});
test('M21 failed speech permits opening skip and exact object retry without blocking play', async ({
  page,
}) => {
  await page.route('**/audio/*.wav*', (r) => r.abort());
  await startStory(page);
  await expect(page.locator('.prep-selector')).toBeVisible();
  await tap(page, 'supply-apple');
  expect((await state(page)).items).toHaveLength(1);
});
test('M21 unfinished lesson resumes its real step and receipt; rejected mini storage keeps in-memory sessions', async ({
  page,
}) => {
  await page.goto('/');
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '跳过序章' }).tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  await page.getByRole('button', { name: '跳过开场' }).tap();
  await page.getByRole('button', { name: '来试一下 →' }).tap();
  await page.getByRole('button', { name: '香蕉', exact: true }).tap();
  const before = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  );
  await page.reload();
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  await expect(page.getByRole('button', { name: '♫ 再听一遍' })).toBeVisible();
  const restored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  );
  expect(restored.observations).toEqual(before.observations);
  await page.getByRole('button', { name: '苹果', exact: true }).tap();
  const after = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  );
  expect(after.observations).toHaveLength(2);
  expect(new Set(after.observations.map((o: { id: string }) => o.id)).size).toBe(2);
  await page.getByRole('button', { name: '回餐车，亲手做 ↗' }).tap();
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  await page.getByRole('button', { name: '保存并回到首页' }).tap();
  // Fault injection affects storage only, not normal progress or answers.
  await page.evaluate(() => {
    const set = Storage.prototype.setItem;
    Storage.prototype.setItem = function (k, v) {
      if (k.includes('minigame')) throw new DOMException('quota', 'QuotaExceededError');
      return set.call(this, k, v);
    };
  });
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  await page.getByRole('button', { name: '小猫帮帮我' }).tap();
  const slots = await page.locator('.letter-draft').textContent();
  await page.getByRole('button', { name: '← 回游戏小摊' }).tap();
  await page.getByRole('button', { name: /食物找朋友 听一题/ }).tap();
  await page.getByRole('button', { name: '← 回游戏小摊' }).tap();
  await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  expect(await page.locator('.letter-draft').textContent()).toBe(slots);
  await expect(page.locator('.spell-model')).toBeVisible();
  await expect(page.locator('.development-note')).toContainText('内存');
});
