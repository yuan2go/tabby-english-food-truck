# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames.spec.ts >> M2 spell complete four rounds, help, resume, settlement and return
- Location: e2e/minigames.spec.ts:44:3

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.tap: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '字母 E letter-3-4', exact: true })
    - locator resolved to <button type="button" aria-label="字母 E letter-3-4">E</button>
  - attempting tap action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing tap action

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - region "WordSpell拼食物" [ref=f1e6]:
    - button "← 回游戏小摊" [ref=f1e7] [cursor=pointer]
    - button "重新开始" [ref=f1e8] [cursor=pointer]
    - generic [ref=f1e9]: WordSpell · 4 / 4
    - generic [ref=f1e10]:
      - img "苹果"
      - button "♫ 听一听" [ref=f1e11] [cursor=pointer]
    - generic [ref=f1e12]:
      - region "拼写区，词间空格固定" [ref=f1e13]:
        - region "第1个词" [ref=f1e14]:
          - button "字母位置1 A" [ref=f1e15] [cursor=pointer]: A
          - button "字母位置2 P" [ref=f1e16] [cursor=pointer]: P
          - button "字母位置3 P" [ref=f1e17] [cursor=pointer]: P
          - button "字母位置4 L" [ref=f1e18] [cursor=pointer]: L
          - button "字母位置5" [ref=f1e19] [cursor=pointer]: ·
      - generic [ref=f1e20]:
        - button "字母 P letter-3-2" [disabled] [ref=f1e21]: P
        - button "字母 A letter-3-0" [disabled] [ref=f1e22]: A
        - button "字母 E letter-3-4" [ref=f1e23] [cursor=pointer]: E
        - button "字母 P letter-3-1" [disabled] [ref=f1e24]: P
        - button "字母 L letter-3-3" [disabled] [ref=f1e25]: L
      - button "拼好了" [ref=f1e26] [cursor=pointer]
    - status [ref=f1e27]
    - button "小猫帮帮我" [ref=f1e28] [cursor=pointer]
    - paragraph: 开发语音未听审 · 没有计时与能力评分
```

# Test source

```ts
  15  |   if (!a || !b) throw Error('letter bounds');
  16  |   const c = await p.context().newCDPSession(p);
  17  |   const start = { x: a.x + a.width / 2, y: a.y + a.height / 2 };
  18  |   const end = { x: b.x + b.width / 2, y: b.y + b.height / 2 };
  19  |   await c.send('Input.dispatchTouchEvent', {
  20  |     type: 'touchStart',
  21  |     touchPoints: [{ ...start, id: 1 }],
  22  |   });
  23  |   for (let n = 1; n <= 8; n++)
  24  |     await c.send('Input.dispatchTouchEvent', {
  25  |       type: 'touchMove',
  26  |       touchPoints: [
  27  |         {
  28  |           x: start.x + ((end.x - start.x) * n) / 8,
  29  |           y: start.y + ((end.y - start.y) * n) / 8,
  30  |           id: 1,
  31  |         },
  32  |       ],
  33  |     });
  34  |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  35  |   await c.detach();
  36  | }
  37  | test.use({
  38  |   viewport: { width: 393, height: 740 },
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
  74  |           await expect(page.locator('.mini-feedback')).toContainText('再听一听');
  75  |         }
  76  |         await page
  77  |           .locator('.matching-pictures button')
  78  |           .filter({ has: page.locator(`img[alt="${FOOD[word.image][0]}"]`) })
  79  |           .tap();
  80  |       } else {
  81  |         const tileSizes = await page.locator('.letter-bank button').evaluateAll((nodes) =>
  82  |           nodes.map((node) => ({
  83  |             width: node.getBoundingClientRect().width,
  84  |             height: node.getBoundingClientRect().height,
  85  |           })),
  86  |         );
  87  |         expect(tileSizes.every((size) => size.width >= 44 && size.height >= 44)).toBe(true);
  88  |         if (n === 0) {
  89  |           await page.getByRole('button', { name: '小猫帮帮我' }).tap();
  90  |           await page.reload();
  91  |           await page.locator('.yard-mini .entry-main').tap();
  92  |           await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  93  |           expect((await mini(page)).support).toContain('answer-help');
  94  |         }
  95  |         const current = await mini(page),
  96  |           bank = letters(current);
  97  |         // Each repeated letter is a separate observed DOM entity, not injected state.
  98  |         for (let i = 0; i < word.text.replaceAll(' ', '').length; i++) {
  99  |           const letter = bank.find((l) => l.id === `letter-${n}-${i}`);
  100 |           if (!letter) throw Error('letter');
  101 |           const tile = page.getByRole('button', {
  102 |             name: `字母 ${letter.text} ${letter.id}`,
  103 |             exact: true,
  104 |           });
  105 |           if (n === 0 && i === 0) {
  106 |             await dragLetter(page, tile, page.locator('[data-letter-slot="0"]'));
  107 |             expect((await mini(page)).draft).toContain(letter.id);
  108 |             await dragLetter(
  109 |               page,
  110 |               page.locator('.letter-draft button:enabled').first(),
  111 |               page.locator('.letter-bank'),
  112 |             );
  113 |             expect((await mini(page)).draft).not.toContain(letter.id);
  114 |           }
> 115 |           await tile.tap();
      |                      ^ Error: locator.tap: Test timeout of 90000ms exceeded.
  116 |         }
  117 |         if (n === 0) {
  118 |           const draft = page.locator('.letter-draft button').last();
  119 |           await draft.tap();
  120 |           const l = bank.find((l) => l.id === `letter-${n}-${bank.length - 1}`);
  121 |           if (!l) throw Error('letter');
  122 |           await page.getByRole('button', { name: `字母 ${l.text} ${l.id}`, exact: true }).tap();
  123 |         }
  124 |         await page.getByRole('button', { name: '拼好了', exact: true }).tap();
  125 |       }
  126 |       await expect(page.locator('.mini-feedback')).toContainText('找到了');
  127 |       if (n === 0) await page.screenshot({ path: info.outputPath(`${kind}-feedback.png`) });
  128 |       await page.getByRole('button', { name: '下一位朋友', exact: true }).tap();
  129 |     }
  130 |     await expect(page.getByRole('heading', { name: '四份心意，都找到了！' })).toBeVisible();
  131 |     expect((await mini(page)).attempts.filter((a) => a.result)).toHaveLength(4);
  132 |     await page.getByRole('button', { name: '再玩一组', exact: true }).tap();
  133 |     await expect(page.getByRole('button', { name: '开始玩', exact: true })).toBeVisible();
  134 |     await page.getByRole('button', { name: '← 回游戏小摊', exact: true }).tap();
  135 |     await page.getByRole('button', { name: '← 小院', exact: true }).tap();
  136 |     await expect(page.locator('.yard-story')).toBeVisible();
  137 |   });
  138 | test('M2 bilingual uses explicit support and preserves business inventory', async ({ page }) => {
  139 |   await page.goto('/');
  140 |   const before = await page.evaluate(
  141 |     () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
  142 |   );
  143 |   await page.locator('.yard-mini .entry-main').tap();
  144 |   await page.getByText('换帮助或玩法', { exact: true }).tap();
  145 |   await page.getByRole('button', { name: '中英配对（识字后）', exact: true }).tap();
  146 |   await page.getByRole('button', { name: /食物找朋友 看中文，选英文/ }).tap();
  147 |   await page.getByRole('button', { name: '开始玩', exact: true }).tap();
  148 |   await page.getByRole('button', { name: '我来找 / 拼', exact: true }).tap();
  149 |   const word = targetWord(await mini(page));
  150 |   await page.locator('.sound-tile').tap();
  151 |   await page
  152 |     .locator('.matching-pictures')
  153 |     .getByRole('button', { name: word.text, exact: true })
  154 |     .tap();
  155 |   expect((await mini(page)).attempts[0]?.support).toContain('demonstration');
  156 |   expect(
  157 |     await page.evaluate(
  158 |       () => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').items,
  159 |     ),
  160 |   ).toEqual(before);
  161 | });
  162 | 
```