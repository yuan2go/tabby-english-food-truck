# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames.spec.ts >> M2 bilingual uses explicit support and preserves business inventory
- Location: e2e/minigames.spec.ts:131:1

# Error details

```
TimeoutError: locator.tap: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: /^食物找朋友/ })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "游戏小摊" [ref=e6]:
    - button "← 小院" [ref=e7] [cursor=pointer]
    - heading "食物朋友的小摊" [level=2] [ref=e8]
    - paragraph [ref=e9]: 随时回来，字母和这一题都会等你。
    - generic [ref=e10]:
      - button "苹果 食物找朋友 看中文，选英文" [ref=e11] [cursor=pointer]:
        - img "苹果"
        - strong [ref=e12]: 食物找朋友
        - generic [ref=e13]: 看中文，选英文
      - button "A B C WordSpell 拼食物 听发音，摆字母" [ref=e14] [cursor=pointer]:
        - generic [ref=e15]: A B C
        - strong [ref=e16]: WordSpell 拼食物
        - generic [ref=e17]: 听发音，摆字母
    - group [ref=e18]:
      - generic "换帮助或玩法" [ref=e19]
      - group "新活动需要怎样的帮助？" [ref=e20]:
        - button "先看示范" [pressed] [ref=e22] [cursor=pointer]
        - button "帮一部分" [ref=e23] [cursor=pointer]
        - button "我自己试" [ref=e24] [cursor=pointer]
      - group "字母准备到哪一步？" [ref=e25]:
        - button "刚认识字母" [pressed] [ref=e27] [cursor=pointer]
        - button "熟悉字母了" [ref=e28] [cursor=pointer]
        - button "也试多词短语" [ref=e29] [cursor=pointer]
      - group "找朋友怎么玩？" [ref=e30]:
        - button "听词找图" [ref=e32] [cursor=pointer]
        - button "英文配图片" [ref=e33] [cursor=pointer]
        - button "中英配对（识字后）" [active] [pressed] [ref=e34] [cursor=pointer]
      - generic [ref=e35]:
        - button "按新设置找朋友" [ref=e36] [cursor=pointer]
        - button "按新设置拼字母" [ref=e37] [cursor=pointer]
    - generic [ref=e38]: 前两种从图片开始。中英文字配对供已识字玩家选择。继续活动保留原来的帮助与题目。
```

# Test source

```ts
  39  |   hasTouch: true,
  40  |   isMobile: true,
  41  |   deviceScaleFactor: 3,
  42  | });
  43  | for (const kind of ['match', 'spell'] as const)
  44  |   test(`M2 ${kind} complete four rounds, help, resume, settlement and return`, async ({
  45  |     page,
  46  |   }, info) => {
  47  |     test.setTimeout(90000);
  48  |     await page.goto('/');
  49  |     await page.locator('.yard-mini .entry-main').tap();
  50  |     await page.getByText('换帮助或玩法', { exact: true }).tap();
  51  |     await page.getByRole('button', { name: '我自己试', exact: true }).tap();
  52  |     await page
  53  |       .getByRole('button', {
  54  |         name:
  55  |           kind === 'match'
  56  |             ? '食物找朋友 听一题，选一张图'
  57  |             : 'A B C WordSpell 拼食物 听发音，摆字母',
  58  |       })
  59  |       .tap();
  60  |     await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  61  |     for (let n = 0; n < 4; n++) {
  62  |       const s = await mini(page),
  63  |         word = targetWord(s);
  64  |       await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  65  |       if (kind === 'match') {
  66  |         await expect(page.locator('.mini-play')).not.toContainText(word.text);
  67  |         await page.locator('.sound-tile').tap();
  68  |         const wrong = page
  69  |           .locator('.matching-pictures button')
  70  |           .filter({ hasNot: page.locator(`img[alt="${FOOD[word.image][0]}"]`) })
  71  |           .first();
  72  |         if (n === 0) {
  73  |           await wrong.tap();
  74  |           await expect(page.getByRole('status')).toContainText('再听一听');
  75  |         }
  76  |         await page
  77  |           .locator('.matching-pictures button')
  78  |           .filter({ has: page.locator(`img[alt="${FOOD[word.image][0]}"]`) })
  79  |           .tap();
  80  |       } else {
  81  |         if (n === 0) {
  82  |           await page.getByRole('button', { name: '小猫帮帮我' }).tap();
  83  |           await page.reload();
  84  |           await page.locator('.yard-mini .entry-main').tap();
  85  |           await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  86  |           expect((await mini(page)).support).toContain('answer-help');
  87  |         }
  88  |         const current = await mini(page),
  89  |           bank = letters(current);
  90  |         // Each repeated letter is a separate observed DOM entity, not injected state.
  91  |         for (let i = 0; i < word.text.replaceAll(' ', '').length; i++) {
  92  |           const letter = bank.find((l) => l.id === `letter-${n}-${i}`);
  93  |           if (!letter) throw Error('letter');
  94  |           const tile = page.getByRole('button', {
  95  |             name: `字母 ${letter.text} ${letter.id}`,
  96  |             exact: true,
  97  |           });
  98  |           if (n === 0 && i === 0) {
  99  |             await dragLetter(page, tile, page.locator('[data-letter-slot="0"]'));
  100 |             expect((await mini(page)).draft).toContain(letter.id);
  101 |             await dragLetter(
  102 |               page,
  103 |               page.locator('.letter-draft button:enabled').first(),
  104 |               page.locator('.letter-bank'),
  105 |             );
  106 |             expect((await mini(page)).draft).not.toContain(letter.id);
  107 |           }
  108 |           await tile.tap();
  109 |         }
  110 |         if (n === 0) {
  111 |           const draft = page.locator('.letter-draft button').last();
  112 |           await draft.tap();
  113 |           const l = bank.find((l) => l.id === `letter-${n}-${bank.length - 1}`);
  114 |           if (!l) throw Error('letter');
  115 |           await page.getByRole('button', { name: `字母 ${l.text} ${l.id}`, exact: true }).tap();
  116 |         }
  117 |         await page.getByRole('button', { name: '拼好了', exact: true }).tap();
  118 |       }
  119 |       await expect(page.getByRole('status')).toContainText('找到了');
  120 |       if (n === 0) await page.screenshot({ path: info.outputPath(`${kind}-feedback.png`) });
  121 |       await page.getByRole('button', { name: '下一位朋友', exact: true }).tap();
  122 |     }
  123 |     await expect(page.getByRole('heading', { name: '四份心意，都找到了！' })).toBeVisible();
  124 |     expect((await mini(page)).attempts.filter((a) => a.result)).toHaveLength(4);
  125 |     await page.getByRole('button', { name: '再玩一组', exact: true }).tap();
  126 |     await expect(page.getByRole('button', { name: '开始玩', exact: true })).toBeVisible();
  127 |     await page.getByRole('button', { name: '← 回游戏小摊', exact: true }).tap();
  128 |     await page.getByRole('button', { name: '← 小院', exact: true }).tap();
  129 |     await expect(page.locator('.yard-story')).toBeVisible();
  130 |   });
  131 | test('M2 bilingual uses explicit support and preserves business inventory', async ({ page }) => {
  132 |   await page.goto('/');
  133 |   const before = await page.evaluate(
  134 |     () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
  135 |   );
  136 |   await page.locator('.yard-mini .entry-main').tap();
  137 |   await page.getByText('换帮助或玩法', { exact: true }).tap();
  138 |   await page.getByRole('button', { name: '中英配对（识字后）', exact: true }).tap();
> 139 |   await page.getByRole('button', { name: /^食物找朋友/ }).tap();
      |                                                      ^ TimeoutError: locator.tap: Timeout 12000ms exceeded.
  140 |   await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  141 |   await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  142 |   const word = targetWord(await mini(page));
  143 |   await page.locator('.sound-tile').tap();
  144 |   await page
  145 |     .locator('.matching-pictures')
  146 |     .getByRole('button', { name: word.text, exact: true })
  147 |     .tap();
  148 |   expect((await mini(page)).attempts[0]?.support).toContain('demonstration');
  149 |   expect(
  150 |     await page.evaluate(
  151 |       () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
  152 |     ),
  153 |   ).toEqual(before);
  154 | });
  155 | 
```