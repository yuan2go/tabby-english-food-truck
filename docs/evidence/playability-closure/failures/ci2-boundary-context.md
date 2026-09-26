# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory
- Location: e2e/m22-boundaries.spec.ts:11:1

# Error details

```
Error: expect(received).toHaveLength(expected)

Expected length: 4
Received length: 3
Received array:  [{"id": "food-2", "location": "tray:0:0", "product": "juice"}, {"id": "food-5", "location": "tray:0:1", "product": "banana"}, {"id": "food-6", "location": "tray:0:2", "product": "apple"}]
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
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
    - button "送餐 ↗" [ref=e7] [cursor=pointer]
    - button "点请求气泡重听" [ref=e8] [cursor=pointer]:
      - img "苹果"
      - generic [ref=e9]: ♫
    - generic:
      - status: 托盘满了。先选一个食品放回，或移到另一盘。
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { layoutFor } from '../src/game/layout';
  3   | import { hot, lesson, startStory, state, tap } from './helpers';
  4   | 
  5   | test.use({
  6   |   viewport: { width: 393, height: 665 },
  7   |   deviceScaleFactor: 3,
  8   |   hasTouch: true,
  9   |   isMobile: true,
  10  | });
  11  | test('phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory', async ({
  12  |   page,
  13  | }, info) => {
  14  |   await startStory(page);
  15  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  16  |   await page.getByRole('button', { name: '设置', exact: true }).tap();
  17  |   await page.getByRole('button', { name: '两位一起招呼' }).tap();
  18  |   await page.getByRole('button', { name: '← 返回', exact: true }).tap();
  19  |   await expect
  20  |     .poll(
  21  |       async () => (await state(page)).orders.filter((order) => order.status === 'waiting').length,
  22  |       {
  23  |         timeout: 15000,
  24  |       },
  25  |     )
  26  |     .toBe(2);
  27  |   await tap(page, 'supply-banana');
  28  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  29  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  30  |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  31  |   const banana = (await state(page)).items[0];
  32  |   if (!banana) throw Error('banana');
  33  |   await page.waitForTimeout(300);
  34  |   await tap(page, `item-${banana.id}`);
  35  |   await page.getByRole('button', { name: '↩ 放回这份', exact: true }).tap();
  36  |   expect((await state(page)).items).toHaveLength(0);
  37  |   await tap(page, 'machine-apple');
  38  |   await tap(page, 'supply-apple');
  39  |   await tap(page, 'start');
  40  |   await tap(page, 'tray-0');
  41  |   await tap(page, 'supply-banana');
  42  |   await tap(page, 'supply-apple');
  43  |   const full = await state(page);
  44  |   expect(full.routing.machine).not.toBeNull();
  45  |   await tap(page, 'supply-apple');
> 46  |   expect((await state(page)).items).toHaveLength(full.items.length);
      |                                     ^ Error: expect(received).toHaveLength(expected)
  47  |   const attempts = (await state(page)).attempts.length;
  48  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  49  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  50  |   expect((await state(page)).attempts).toHaveLength(attempts);
  51  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  52  |   const frozen = await state(page);
  53  |   await page.reload();
  54  |   await page.locator('.yard-story .entry-main').tap();
  55  |   await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  56  |   await lesson(page);
  57  |   const restored = await state(page);
  58  |   const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  59  |   const vessel = frozen.items.find((i) => i.location === 'machine:cup' || i.product === 'juice');
  60  |   const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  61  |   expect(restored.items.map((i) => i.id)).toEqual(
  62  |     frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  63  |   );
  64  |   for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
  65  |     expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  66  |   if (alreadyFinished)
  67  |     expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
  68  |   await expect
  69  |     .poll(
  70  |       async () =>
  71  |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  72  |       { timeout: 15000 },
  73  |     )
  74  |     .toBe(true);
  75  |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  76  |   if (!juice) throw Error('juice');
  77  |   await tap(page, `item-${juice.id}`);
  78  |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  79  |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  80  |   expect((await state(page)).recycle?.id).toBe(juice.id);
  81  |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  82  |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  83  |   const before = await state(page);
  84  |   const point = await hot(page, 'supply-apple');
  85  |   if (test.info().project.use.browserName !== 'webkit') {
  86  |     const cdp = await page.context().newCDPSession(page);
  87  |     await cdp.send('Input.dispatchTouchEvent', {
  88  |       type: 'touchStart',
  89  |       touchPoints: [{ ...point, id: 1 }],
  90  |     });
  91  |     await cdp.send('Input.dispatchTouchEvent', {
  92  |       type: 'touchStart',
  93  |       touchPoints: [
  94  |         { ...point, id: 1 },
  95  |         { x: point.x + 30, y: point.y, id: 2 },
  96  |       ],
  97  |     });
  98  |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  99  |     await cdp.detach();
  100 |     expect((await state(page)).items).toEqual(before.items);
  101 |   }
  102 |   for (const height of [300, 342, 393]) {
  103 |     await page.setViewportSize({ width: 852, height });
  104 |     const helper = layoutFor(852, height, 'service').helper;
  105 |     await expect
  106 |       .poll(async () => {
  107 |         const point = await hot(page, 'note');
  108 |         return [Math.round(point.x), Math.round(point.y)];
  109 |       })
  110 |       .toEqual([Math.round(helper.x), Math.round(helper.y - 20)]);
  111 |     await expect
  112 |       .poll(async () => {
  113 |         const p = await hot(page, 'note');
  114 |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  115 |       })
  116 |       .toBe('CANVAS');
  117 |     await tap(page, 'note');
  118 |     await expect(page.getByRole('heading', { name: '小猫陪你一起做' })).toBeVisible();
  119 |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  120 |     await tap(page, 'tray-1', 25);
  121 |     await tap(page, 'supply-apple');
  122 |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  123 |     expect(added?.product).toBe('apple');
  124 |     if (!added) throw Error('second tray');
  125 |     await page.waitForTimeout(300);
  126 |     await tap(page, `item-${added.id}`);
  127 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  128 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  129 |   }
  130 | });
  131 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  132 |   page,
  133 | }, info) => {
  134 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  135 |   await startStory(page);
  136 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  137 |   const before = (await state(page)).attempts.length;
  138 |   const supply = await hot(page, 'supply-apple');
  139 |   expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
  140 |     'CANVAS',
  141 |   );
  142 |   await tap(page, 'supply-apple');
  143 |   expect((await state(page)).items).toHaveLength(1);
  144 |   expect((await state(page)).attempts).toHaveLength(before);
  145 |   await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  146 |   const failed = await page.locator('main').getAttribute('data-audio-state');
```