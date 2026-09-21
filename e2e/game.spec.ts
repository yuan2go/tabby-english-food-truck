import { writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { letters, type MiniState, targetWord } from '../src/rules/minigames';
import { choosePrep, hot, lesson, serve, startStory, state, tap } from './helpers';
import { endMeasure, installMeasure, startMeasure } from './measure';

test.use({
  viewport: { width: 393, height: 665 },
  deviceScaleFactor: 3,
  hasTouch: true,
  isMobile: true,
  video: { mode: 'on', size: { width: 393, height: 665 } },
});
test('M2 phone complete click story: prologue through all recipes to community ending', async ({
  page,
}, info) => {
  test.setTimeout(420000);
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await installMeasure(page);
  await startStory(page);
  const measurements = [];
  const restore = new Set(['grill', 'board']);
  for (let chapter = 0; chapter < 5; chapter++) {
    await startMeasure(page);
    const count = (await state(page)).orders.length;
    for (let n = 0; n < count; n++) {
      await serve(page, restore);
      if (n === 0) await page.screenshot({ path: info.outputPath(`chapter-${chapter}.png`) });
    }
    measurements.push({ chapter, ...(await endMeasure(page)) });
    await expect(page.locator('.ending')).toBeVisible();
    if (chapter < 4) {
      await page.getByRole('button', { name: '翻开下一页' }).tap();
      await lesson(page);
    }
  }
  await expect(page.getByRole('heading', { name: '小院里的朋友，都到齐啦！' })).toBeVisible();
  const profile = await page.evaluate(() =>
    JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  );
  expect(profile.completed).toEqual([0, 1, 2, 3, 4]);
  expect(profile.introduced).toEqual(['juice', 'ice', 'sandwich', 'burger']);
  expect(errors).toEqual([]);
  expect(restore.size).toBe(0);
  await writeFile(
    info.outputPath('operation-performance.json'),
    JSON.stringify(measurements, null, 2),
  );
  await page.getByRole('button', { name: '回小院', exact: true }).tap();
  await page.screenshot({ path: info.outputPath('grown-yard.png') });
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByText('换帮助或玩法', { exact: true }).tap();
  await page.getByRole('button', { name: '帮一部分', exact: true }).tap();
  await page.getByRole('button', { name: '也试多词短语', exact: true }).tap();
  await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  const mini = (): Promise<MiniState> =>
    page.evaluate(
      () => JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions.spell,
    );
  let sawPhrase = false;
  for (let n = 0; n < 4; n++) {
    await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
    const current = await mini();
    if (targetWord(current).text === 'ice cream') {
      sawPhrase = true;
      await expect(page.locator('.letter-word')).toHaveCount(2);
      expect(
        await page
          .locator('.letter-word')
          .evaluateAll((nodes) => nodes.map((n) => n.querySelectorAll('button').length)),
      ).toEqual([3, 5]);
      await page.getByRole('button', { name: '小猫帮帮我' }).tap();
      await expect(page.locator('.spell-model')).toHaveText('ICE CREAM');
      await page.reload();
      await page.locator('.yard-mini .entry-main').tap();
      await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
      await expect(page.locator('.letter-word')).toHaveCount(2);
      expect((await mini()).support).toContain('answer-help');
      await page.screenshot({ path: info.outputPath('multiword-restored.png') });
      break;
    }
    for (const l of letters(current).sort((a, b) => a.index - b.index))
      if (!current.fixed.includes(l.id))
        await page.getByRole('button', { name: `字母 ${l.text} ${l.id}`, exact: true }).tap();
    await page.getByRole('button', { name: '拼好了', exact: true }).tap();
    await page.getByRole('button', { name: '下一位朋友', exact: true }).tap();
  }
  expect(sawPhrase).toBe(true);
});
test('M2 quick input: immediate taps, same-entity double tap, nearby removal and explicit wrong delivery', async ({
  page,
}) => {
  await startStory(page);
  await choosePrep(page, '● 1号盘');
  await tap(page, 'supply-banana');
  await tap(page, 'supply-apple');
  await tap(page, 'supply-apple');
  await tap(page, 'supply-apple');
  expect((await state(page)).items).toHaveLength(3);
  await page.getByRole('button', { name: '送给客人 ↗' }).tap();
  let s = await state(page);
  expect(s.attempts.at(-1)?.result).toBe('request-mismatch');
  expect(s.items).toHaveLength(3);
  await page.waitForTimeout(350);
  const item = s.items[0];
  if (!item) throw Error('item');
  const spot = await hot(page, `item-${item.id}`);
  await page.touchscreen.tap(spot.x, spot.y);
  await expect(page.getByRole('button', { name: '↩ 放回这份' })).toBeVisible();
  await page.waitForTimeout(80);
  await page.touchscreen.tap(spot.x, spot.y);
  expect((await state(page)).items).toHaveLength(2);
  s = await state(page);
  await tap(page, `item-${s.items[0]?.id}`);
  await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  expect((await state(page)).items).toHaveLength(1);
  const attempts = (await state(page)).attempts.length;
  await tap(page, 'guest-0');
  expect((await state(page)).attempts).toHaveLength(attempts);
  await page.getByRole('button', { name: '送给客人 ↗' }).tap();
  await expect
    .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
    .toBe('done');
  expect((await state(page)).attempts.at(-1)?.support).toContain('mismatch-explanation');
});
test('M2 pause and homepage resume keep world; tutorials are separate from the session', async ({
  page,
}) => {
  await startStory(page);
  await choosePrep(page, '果汁机');
  await tap(page, 'supply-apple');
  await tap(page, 'supply-cup');
  await tap(page, 'start');
  await page.getByRole('button', { name: '暂停', exact: true }).tap();
  const before = await state(page);
  await page.waitForTimeout(800);
  expect((await state(page)).machine.remaining).toBe(before.machine.remaining);
  await expect(page.getByRole('dialog', { name: '休息一下' })).not.toContainText('小小餐车营业中');
  await page.getByRole('button', { name: '保存并回到首页' }).tap();
  await page.reload();
  await page.locator('.yard-story .entry-main').tap();
  await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  expect(await page.getByRole('dialog', { name: '场景小教学' }).count()).toBe(0);
  const after = await state(page);
  expect(after.runId).toBe(before.runId);
  expect(after.items.map((i) => i.id)).toEqual(before.items.map((i) => i.id));
  expect(after.machine.remaining).toBeLessThanOrEqual(before.machine.remaining);
  await expect
    .poll(async () => (await state(page)).machine.status, { timeout: 15000 })
    .toBe('ready');
});
