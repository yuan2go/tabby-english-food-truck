# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory
- Location: ../../../../../../../.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/e2e/m22-boundaries.spec.ts:11:1

# Error details

```
Test timeout of 60000ms exceeded.
```

```
Error: locator.tap: Test timeout of 60000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '继续营业', exact: true })
    - locator resolved to <button type="button" class="primary">继续营业</button>

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - generic:
    - generic:
      - button "暂停" [ref=f1e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=f1e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=f1e13] [cursor=pointer]
        - button "重听下一步" [ref=f1e18] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "客人B·刺刺：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=f1e19] [cursor=pointer]
      - button "切换果汁机" [ref=f1e20] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "香蕉，1号盘"
      - button "苹果，1号盘"
      - button "苹果汁，1号盘"
    - button "带作品到活动桌" [ref=f1e21] [cursor=pointer]
    - button "点请求气泡重听" [ref=f1e22] [cursor=pointer]:
      - img "苹果"
      - generic [ref=f1e23]: ♫
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  54  |   await handOver(page, 0);
  55  |   const blocked = await state(page);
  56  |   expect(blocked.machine.status).toBe('processing');
  57  |   expect(blocked.attempts).toEqual(reserved.attempts);
  58  |   expect(blocked.items).toEqual(reserved.items);
  59  |   expect(blocked.orders).toEqual(reserved.orders);
  60  |   await expect(page.getByRole('status')).toContainText('这只盘正等机器的成品');
  61  |   await tap(page, 'supply-apple');
  62  |   const full = await state(page);
  63  |   if (full.machine.status === 'processing') expect(full.routing.machine).toMatchObject({ tray: 0 });
  64  |   else {
  65  |     expect(full.machine.status).toBe('empty');
  66  |     expect(full.routing.machine).toBeNull();
  67  |     expect(
  68  |       full.items.some((item) => item.product === 'juice' && item.location === 'tray:0:0'),
  69  |     ).toBe(true);
  70  |   }
  71  |   await tap(page, 'supply-apple');
  72  |   const stillFull = await state(page);
  73  |   expect(stillFull.nextId).toBe(full.nextId);
  74  |   expect(stillFull.items.every((item) => full.items.some((prior) => prior.id === item.id))).toBe(
  75  |     true,
  76  |   );
  77  |   if (stillFull.machine.status === 'empty') {
  78  |     const cup = reserved.items.find((item) => item.location === 'machine:cup');
  79  |     const apple = reserved.items.find((item) => item.location === 'machine:apple');
  80  |     expect(stillFull.items.find((item) => item.id === cup?.id)).toMatchObject({
  81  |       product: 'juice',
  82  |       location: 'tray:0:0',
  83  |     });
  84  |     expect(stillFull.items.some((item) => item.id === apple?.id)).toBe(false);
  85  |   } else expect(stillFull.items).toEqual(full.items);
  86  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  87  |   const frozen = await state(page);
  88  |   await page.reload();
  89  |   await page.locator('.yard-endless .entry-main').tap();
  90  |   await page.getByRole('button', { name: '开门 / 继续营业' }).tap();
  91  |   await lesson(page);
  92  |   const restored = await state(page);
  93  |   const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  94  |   const vessel = frozen.items.find((i) => i.location === 'machine:cup' || i.product === 'juice');
  95  |   const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  96  |   expect(restored.items.map((i) => i.id)).toEqual(
  97  |     frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  98  |   );
  99  |   for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
  100 |     expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  101 |   if (alreadyFinished)
  102 |     expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
  103 |   await expect
  104 |     .poll(
  105 |       async () =>
  106 |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  107 |       { timeout: 15000 },
  108 |     )
  109 |     .toBe(true);
  110 |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  111 |   if (!juice) throw Error('juice');
  112 |   await tap(page, `item-${juice.id}`);
  113 |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  114 |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  115 |   expect((await state(page)).recycle?.id).toBe(juice.id);
  116 |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  117 |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  118 |   const before = await state(page);
  119 |   const point = await hot(page, 'supply-apple');
  120 |   if (test.info().project.use.browserName !== 'webkit') {
  121 |     const cdp = await page.context().newCDPSession(page);
  122 |     await cdp.send('Input.dispatchTouchEvent', {
  123 |       type: 'touchStart',
  124 |       touchPoints: [{ ...point, id: 1 }],
  125 |     });
  126 |     await cdp.send('Input.dispatchTouchEvent', {
  127 |       type: 'touchStart',
  128 |       touchPoints: [
  129 |         { ...point, id: 1 },
  130 |         { x: point.x + 30, y: point.y, id: 2 },
  131 |       ],
  132 |     });
  133 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  134 |     await cdp.detach();
  135 |     expect((await state(page)).items).toEqual(before.items);
  136 |   }
  137 |   for (const height of [300, 342, 393]) {
  138 |     await page.setViewportSize({ width: 852, height });
  139 |     const helper = layoutFor(852, height, 'service').helper;
  140 |     await expect
  141 |       .poll(async () => {
  142 |         const point = await hot(page, 'note');
  143 |         return [Math.round(point.x), Math.round(point.y)];
  144 |       })
  145 |       .toEqual([Math.round(helper.x), Math.round(helper.y - 20)]);
  146 |     await expect
  147 |       .poll(async () => {
  148 |         const p = await hot(page, 'note');
  149 |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  150 |       })
  151 |       .toBe('CANVAS');
  152 |     await tap(page, 'note');
  153 |     await expect(page.getByRole('heading', { name: '大咪陪你一起做' })).toBeVisible();
> 154 |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
      |                                                                   ^ Error: locator.tap: Test timeout of 60000ms exceeded.
  155 |     await tap(page, 'tray-1', 25);
  156 |     await tap(page, 'supply-apple');
  157 |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  158 |     expect(added?.product).toBe('apple');
  159 |     if (!added) throw Error('second tray');
  160 |     await page.waitForTimeout(300);
  161 |     await tap(page, `item-${added.id}`);
  162 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  163 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  164 |   }
  165 | });
  166 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  167 |   page,
  168 | }, info) => {
  169 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  170 |   await startStory(page);
  171 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  172 |   const before = (await state(page)).attempts.length;
  173 |   const supply = await hot(page, 'supply-apple');
  174 |   expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
  175 |     'CANVAS',
  176 |   );
  177 |   await tap(page, 'supply-apple');
  178 |   expect((await state(page)).items).toHaveLength(1);
  179 |   expect((await state(page)).attempts).toHaveLength(before);
  180 |   await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  181 |   const failed = await page.locator('main').getAttribute('data-audio-state');
  182 |   expect(failed).toContain('failure');
  183 |   await page.unroute('**/audio/*.wav*');
  184 |   await page.getByRole('button', { name: '重试声音', exact: true }).tap();
  185 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toHaveCount(0);
  186 |   await page.screenshot({ path: info.outputPath('audio-recovered.png') });
  187 | });
  188 | 
```