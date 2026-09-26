import { expect, type Locator, type Page, test } from '@playwright/test';
import { FOOD } from '../src/content/recipes';
import { letters, type MiniState, targetWord } from '../src/rules/minigames';

const mini = (p: import('@playwright/test').Page): Promise<MiniState> =>
  p.evaluate(
    () =>
      JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions[
        document.querySelector<HTMLElement>('[data-mini-key]')?.dataset.miniKey ?? ''
      ],
  );
async function dragLetter(p: Page, from: Locator, to: Locator) {
  const a = await from.boundingBox(),
    b = await to.boundingBox();
  if (!a || !b) throw Error('letter bounds');
  const c = await p.context().newCDPSession(p);
  const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  const end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  await c.send('Input.dispatchTouchEvent', {
    type: 'touchStart',
    touchPoints: [{ ...start, id: 1 }],
  });
  for (let n = 1; n <= 8; n++)
    await c.send('Input.dispatchTouchEvent', {
      type: 'touchMove',
      touchPoints: [
        {
          x: start.x + ((end.x - start.x) * n) / 8,
          y: start.y + ((end.y - start.y) * n) / 8,
          id: 1,
        },
      ],
    });
  await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  await c.detach();
}
test.use({
  viewport: { width: 393, height: 740 },
  hasTouch: true,
  isMobile: true,
  deviceScaleFactor: 3,
});
for (const kind of ['match', 'spell'] as const)
  test(`M2 ${kind} complete four rounds, help, resume, settlement and return`, async ({
    page,
  }, info) => {
    test.setTimeout(90000);
    await page.goto('/');
    await page.locator('.yard-mini .entry-main').tap();
    await page.getByText('换帮助或玩法', { exact: true }).tap();
    await page.getByRole('button', { name: '我自己试', exact: true }).tap();
    await page
      .getByRole('button', {
        name:
          kind === 'match'
            ? '食物找朋友 听一题，选一张图'
            : 'A B C WordSpell 拼食物 听发音，摆字母',
      })
      .tap();
    await page.getByRole('button', { name: '开始玩', exact: true }).tap();
    for (let n = 0; n < 4; n++) {
      const s = await mini(page),
        word = targetWord(s);
      await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
      if (kind === 'match') {
        await expect(page.locator('.mini-play')).not.toContainText(word.text);
        await page.locator('.sound-tile').tap();
        const wrong = page
          .locator('.matching-pictures button')
          .filter({ hasNot: page.locator(`img[alt="${FOOD[word.image][0]}"]`) })
          .first();
        if (n === 0) {
          await wrong.tap();
          await expect(page.locator('.mini-feedback')).toContainText('再听一听');
        }
        await page
          .locator('.matching-pictures button')
          .filter({ has: page.locator(`img[alt="${FOOD[word.image][0]}"]`) })
          .tap();
      } else {
        const tileSizes = await page.locator('.letter-bank button').evaluateAll((nodes) =>
          nodes.map((node) => ({
            width: node.getBoundingClientRect().width,
            height: node.getBoundingClientRect().height,
          })),
        );
        expect(tileSizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
        if (n === 0) {
          await page.getByRole('button', { name: '小猫帮帮我' }).tap();
          await page.reload();
          await page.locator('.yard-mini .entry-main').tap();
          await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
          expect((await mini(page)).support).toContain('answer-help');
        }
        const current = await mini(page),
          bank = letters(current);
        // Each repeated letter is a separate observed DOM entity, not injected state.
        for (let i = 0; i < word.text.replaceAll(' ', '').length; i++) {
          const letter = bank.find((l) => l.id === `letter-${n}-${i}`);
          if (!letter) throw Error('letter');
          const tile = page.getByRole('button', {
            name: `字母 ${letter.text} ${letter.id}`,
            exact: true,
          });
          if (n === 0 && i === 0) {
            await dragLetter(page, tile, page.locator('[data-letter-slot="0"]'));
            expect((await mini(page)).draft).toContain(letter.id);
            await dragLetter(
              page,
              page.locator('.letter-draft button:enabled').first(),
              page.locator('.letter-bank'),
            );
            expect((await mini(page)).draft).not.toContain(letter.id);
          }
          await tile.tap();
        }
        if (n === 0) {
          const draft = page.locator('.letter-draft button').last();
          await draft.tap();
          const l = bank.find((l) => l.id === `letter-${n}-${bank.length - 1}`);
          if (!l) throw Error('letter');
          await page.getByRole('button', { name: `字母 ${l.text} ${l.id}`, exact: true }).tap();
        }
        await page.getByRole('button', { name: '拼好了', exact: true }).tap();
      }
      await expect(page.locator('.mini-feedback')).toContainText('找到了');
      if (n === 0) await page.screenshot({ path: info.outputPath(`${kind}-feedback.png`) });
      await page.getByRole('button', { name: '下一位朋友', exact: true }).tap();
    }
    await expect(page.getByRole('heading', { name: '四份心意，都找到了！' })).toBeVisible();
    expect((await mini(page)).attempts.filter((a) => a.result)).toHaveLength(4);
    await page.getByRole('button', { name: '再玩一组', exact: true }).tap();
    await expect(page.getByRole('button', { name: '开始玩', exact: true })).toBeVisible();
    await page.getByRole('button', { name: '← 回游戏小摊', exact: true }).tap();
    await page.getByRole('button', { name: '← 小院', exact: true }).tap();
    await expect(page.locator('.yard-story')).toBeVisible();
  });
test('M2 bilingual uses explicit support and preserves business inventory', async ({ page }) => {
  await page.goto('/');
  const before = await page.evaluate(
    () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
  );
  await page.locator('.yard-mini .entry-main').tap();
  await page.getByText('换帮助或玩法', { exact: true }).tap();
  await page.getByRole('button', { name: '中英配对（识字后）', exact: true }).tap();
  await page.getByRole('button', { name: /食物找朋友 看中文，选英文/ }).tap();
  await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  const word = targetWord(await mini(page));
  await page.locator('.sound-tile').tap();
  await page
    .locator('.matching-pictures')
    .getByRole('button', { name: word.text, exact: true })
    .tap();
  expect((await mini(page)).attempts[0]?.support).toContain('demonstration');
  expect(
    await page.evaluate(
      () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
    ),
  ).toEqual(before);
});
