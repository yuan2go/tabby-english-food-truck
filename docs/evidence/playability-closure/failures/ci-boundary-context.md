# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory
- Location: e2e/m22-boundaries.spec.ts:10:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: undefined
Received: "food-2"
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
      - button "客人A：选择并重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "启动果汁机"
      - button "请小猫帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "苹果汁，1号盘"
      - button "香蕉，1号盘"
      - button "苹果，1号盘"
    - button "送餐 ↗" [ref=f1e7] [cursor=pointer]
    - button "点请求气泡重听" [ref=f1e8] [cursor=pointer]:
      - img "苹果"
      - generic [ref=f1e9]: ♫
    - generic:
      - status: 选好备餐位置，点食材就能放进去。
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { hot, lesson, startStory, state, tap } from './helpers';
  3   | 
  4   | test.use({
  5   |   viewport: { width: 393, height: 665 },
  6   |   deviceScaleFactor: 3,
  7   |   hasTouch: true,
  8   |   isMobile: true,
  9   | });
  10  | test('phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory', async ({
  11  |   page,
  12  | }, info) => {
  13  |   await startStory(page);
  14  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  15  |   await page.getByRole('button', { name: '设置', exact: true }).tap();
  16  |   await page.getByRole('button', { name: '两位一起招呼' }).tap();
  17  |   await page.getByRole('button', { name: '← 返回', exact: true }).tap();
  18  |   await expect
  19  |     .poll(
  20  |       async () => (await state(page)).orders.filter((order) => order.status === 'waiting').length,
  21  |       {
  22  |         timeout: 15000,
  23  |       },
  24  |     )
  25  |     .toBe(2);
  26  |   await tap(page, 'supply-banana');
  27  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  28  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  29  |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  30  |   const banana = (await state(page)).items[0];
  31  |   if (!banana) throw Error('banana');
  32  |   await page.waitForTimeout(300);
  33  |   await tap(page, `item-${banana.id}`);
  34  |   await page.getByRole('button', { name: '↩ 放回这份', exact: true }).tap();
  35  |   expect((await state(page)).items).toHaveLength(0);
  36  |   await tap(page, 'machine-apple');
  37  |   await tap(page, 'supply-apple');
  38  |   await tap(page, 'start');
  39  |   await tap(page, 'tray-0');
  40  |   await tap(page, 'supply-banana');
  41  |   await tap(page, 'supply-apple');
  42  |   const full = await state(page);
  43  |   expect(full.routing.machine).not.toBeNull();
  44  |   await tap(page, 'supply-apple');
  45  |   expect((await state(page)).items).toHaveLength(full.items.length);
  46  |   const attempts = (await state(page)).attempts.length;
  47  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  48  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  49  |   expect((await state(page)).attempts).toHaveLength(attempts);
  50  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  51  |   const frozen = await state(page);
  52  |   await page.reload();
  53  |   await page.locator('.yard-story .entry-main').tap();
  54  |   await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  55  |   await lesson(page);
  56  |   const restored = await state(page);
  57  |   const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  58  |   const vessel = frozen.items.find((i) => i.location === 'machine:cup');
  59  |   const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  60  |   expect(restored.items.map((i) => i.id)).toEqual(
  61  |     frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  62  |   );
  63  |   for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
  64  |     expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  65  |   if (alreadyFinished)
> 66  |     expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
      |                                                                   ^ Error: expect(received).toBe(expected) // Object.is equality
  67  |   await expect
  68  |     .poll(
  69  |       async () =>
  70  |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  71  |       { timeout: 15000 },
  72  |     )
  73  |     .toBe(true);
  74  |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  75  |   if (!juice) throw Error('juice');
  76  |   await tap(page, `item-${juice.id}`);
  77  |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  78  |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  79  |   expect((await state(page)).recycle?.id).toBe(juice.id);
  80  |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  81  |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  82  |   const before = await state(page);
  83  |   const point = await hot(page, 'supply-apple');
  84  |   if (test.info().project.use.browserName !== 'webkit') {
  85  |     const cdp = await page.context().newCDPSession(page);
  86  |     await cdp.send('Input.dispatchTouchEvent', {
  87  |       type: 'touchStart',
  88  |       touchPoints: [{ ...point, id: 1 }],
  89  |     });
  90  |     await cdp.send('Input.dispatchTouchEvent', {
  91  |       type: 'touchStart',
  92  |       touchPoints: [
  93  |         { ...point, id: 1 },
  94  |         { x: point.x + 30, y: point.y, id: 2 },
  95  |       ],
  96  |     });
  97  |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  98  |     await cdp.detach();
  99  |     expect((await state(page)).items).toEqual(before.items);
  100 |   }
  101 |   for (const height of [300, 342, 393]) {
  102 |     await page.setViewportSize({ width: 852, height });
  103 |     await expect
  104 |       .poll(async () => {
  105 |         const p = await hot(page, 'note');
  106 |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  107 |       })
  108 |       .toBe('CANVAS');
  109 |     await tap(page, 'note');
  110 |     await expect(page.getByRole('heading', { name: '小猫陪你一起做' })).toBeVisible();
  111 |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  112 |     await tap(page, 'tray-1', 25);
  113 |     await tap(page, 'supply-apple');
  114 |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  115 |     expect(added?.product).toBe('apple');
  116 |     if (!added) throw Error('second tray');
  117 |     await page.waitForTimeout(300);
  118 |     await tap(page, `item-${added.id}`);
  119 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  120 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  121 |   }
  122 | });
  123 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  124 |   page,
  125 | }, info) => {
  126 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  127 |   await startStory(page);
  128 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  129 |   const before = (await state(page)).attempts.length;
  130 |   const supply = await hot(page, 'supply-apple');
  131 |   expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
  132 |     'CANVAS',
  133 |   );
  134 |   await tap(page, 'supply-apple');
  135 |   expect((await state(page)).items).toHaveLength(1);
  136 |   expect((await state(page)).attempts).toHaveLength(before);
  137 |   await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  138 |   const failed = await page.locator('main').getAttribute('data-audio-state');
  139 |   expect(failed).toContain('failure');
  140 |   await page.unroute('**/audio/*.wav*');
  141 |   await page.getByRole('button', { name: '重试声音', exact: true }).tap();
  142 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toHaveCount(0);
  143 |   await page.screenshot({ path: info.outputPath('audio-recovered.png') });
  144 | });
  145 | 
```