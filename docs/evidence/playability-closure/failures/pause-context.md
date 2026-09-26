# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> M2 pause and homepage resume keep world; tutorials are separate from the session
- Location: e2e/game.spec.ts:147:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "ready"
Received: "empty"

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - generic:
    - generic:
      - button "暂停" [ref=f1e6] [cursor=pointer]: Ⅱ
      - generic: 晨光果汁 0 / 4
    - group "餐车操作":
      - button "客人B：选择并重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "启动果汁机"
      - button "请小猫帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "苹果汁，1号盘"
    - button "送餐 ↗" [ref=f1e7] [cursor=pointer]
    - button "点请求气泡重听" [ref=f1e8] [cursor=pointer]:
      - img "苹果"
      - generic [ref=f1e9]: ♫
    - generic:
      - status: 选好备餐位置，点食材就能放进去。
```

# Test source

```ts
  71  |     const current = await mini();
  72  |     if (targetWord(current).text === 'ice cream') {
  73  |       sawPhrase = true;
  74  |       await expect(page.locator('.letter-word')).toHaveCount(2);
  75  |       expect(
  76  |         await page
  77  |           .locator('.letter-word')
  78  |           .evaluateAll((nodes) => nodes.map((n) => n.querySelectorAll('button').length)),
  79  |       ).toEqual([3, 5]);
  80  |       await page.getByRole('button', { name: '小猫帮帮我' }).tap();
  81  |       await expect(page.locator('.spell-model')).toHaveText('ICE CREAM');
  82  |       await page.reload();
  83  |       await page.locator('.yard-mini .entry-main').tap();
  84  |       await page.getByRole('button', { name: /A B C WordSpell/ }).tap();
  85  |       await expect(page.locator('.letter-word')).toHaveCount(2);
  86  |       expect((await mini()).support).toContain('answer-help');
  87  |       const layout = await page.locator('.mini-play button').evaluateAll((nodes) =>
  88  |         nodes
  89  |           .filter((n) => !(n as HTMLButtonElement).disabled)
  90  |           .map((n) => {
  91  |             const b = n.getBoundingClientRect();
  92  |             return {
  93  |               width: b.width,
  94  |               height: b.height,
  95  |               inside: b.x >= 0 && b.right <= innerWidth && b.y >= 0 && b.bottom <= innerHeight,
  96  |             };
  97  |           }),
  98  |       );
  99  |       expect(layout.every((b) => b.width >= 44 && b.height >= 44 && b.inside)).toBe(true);
  100 |       await page.screenshot({ path: info.outputPath('multiword-restored.png') });
  101 |       break;
  102 |     }
  103 |     for (const l of letters(current).sort((a, b) => a.index - b.index))
  104 |       if (!current.fixed.includes(l.id))
  105 |         await page.getByRole('button', { name: `字母 ${l.text} ${l.id}`, exact: true }).tap();
  106 |     await page.getByRole('button', { name: '拼好了', exact: true }).tap();
  107 |     await page.getByRole('button', { name: '下一位朋友', exact: true }).tap();
  108 |   }
  109 |   expect(sawPhrase).toBe(true);
  110 | });
  111 | test('M2 quick input: immediate taps, same-entity double tap, nearby removal and explicit wrong delivery', async ({
  112 |   page,
  113 | }) => {
  114 |   await startStory(page);
  115 |   await choosePrep(page, '● 1号盘');
  116 |   await tap(page, 'supply-banana');
  117 |   await tap(page, 'supply-apple');
  118 |   await tap(page, 'supply-apple');
  119 |   await tap(page, 'supply-apple');
  120 |   expect((await state(page)).items).toHaveLength(3);
  121 |   await page.getByRole('button', { name: '送餐 ↗' }).tap();
  122 |   let s = await state(page);
  123 |   expect(s.attempts.at(-1)?.result).toBe('request-mismatch');
  124 |   expect(s.items).toHaveLength(3);
  125 |   await page.waitForTimeout(350);
  126 |   const item = s.items[0];
  127 |   if (!item) throw Error('item');
  128 |   const spot = await hot(page, `item-${item.id}`);
  129 |   await page.touchscreen.tap(spot.x, spot.y);
  130 |   await expect(page.getByRole('button', { name: '↩ 放回这份' })).toBeVisible();
  131 |   await page.waitForTimeout(80);
  132 |   await page.touchscreen.tap(spot.x, spot.y);
  133 |   expect((await state(page)).items).toHaveLength(2);
  134 |   s = await state(page);
  135 |   await tap(page, `item-${s.items[0]?.id}`);
  136 |   await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  137 |   expect((await state(page)).items).toHaveLength(1);
  138 |   const attempts = (await state(page)).attempts.length;
  139 |   await tap(page, 'guest-0');
  140 |   expect((await state(page)).attempts).toHaveLength(attempts);
  141 |   await page.getByRole('button', { name: '送餐 ↗' }).tap();
  142 |   await expect
  143 |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  144 |     .toBe('done');
  145 |   expect((await state(page)).attempts.at(-1)?.support).toContain('mismatch-explanation');
  146 | });
  147 | test('M2 pause and homepage resume keep world; tutorials are separate from the session', async ({
  148 |   page,
  149 | }) => {
  150 |   await startStory(page);
  151 |   await choosePrep(page, '果汁机');
  152 |   await tap(page, 'supply-apple');
  153 |   await tap(page, 'supply-cup');
  154 |   await tap(page, 'start');
  155 |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  156 |   const before = await state(page);
  157 |   await page.waitForTimeout(800);
  158 |   expect((await state(page)).machine.remaining).toBe(before.machine.remaining);
  159 |   await expect(page.getByRole('dialog', { name: '休息一下' })).not.toContainText('小小餐车营业中');
  160 |   await page.getByRole('button', { name: '保存并回到首页' }).tap();
  161 |   await page.reload();
  162 |   await page.locator('.yard-story .entry-main').tap();
  163 |   await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  164 |   expect(await page.getByRole('dialog', { name: '场景小教学' }).count()).toBe(0);
  165 |   const after = await state(page);
  166 |   expect(after.runId).toBe(before.runId);
  167 |   expect(after.items.map((i) => i.id)).toEqual(before.items.map((i) => i.id));
  168 |   expect(after.machine.remaining).toBeLessThanOrEqual(before.machine.remaining);
  169 |   await expect
  170 |     .poll(async () => (await state(page)).machine.status, { timeout: 15000 })
> 171 |     .toBe('ready');
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  172 | });
  173 | 
```