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

Expected length: 1
Received length: 2
Received array:  [{"activity": "delivery", "audioQualified": false, "condition": "assisted", "gameTime": 5266.4, "id": "c590e827-c456-4980-a9b9-6a578c200f01:attempt:9", "input": "guest-0:banana", "result": "request-mismatch", "retry": 0, "runId": "c590e827-c456-4980-a9b9-6a578c200f01", "support": ["picture-request", "meaning-picture", "audio-not-observed"], "visit": "first"}, {"activity": "delivery", "audioQualified": false, "condition": "assisted", "gameTime": 17365.899999999998, "id": "c590e827-c456-4980-a9b9-6a578c200f01:attempt:18", "input": "guest-0:juice,banana,apple", "result": "request-mismatch", "retry": 1, "runId": "c590e827-c456-4980-a9b9-6a578c200f01", "support": ["picture-request", "meaning-picture", "audio-not-observed", "mismatch-explanation"], "visit": "first"}]
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=e7] [cursor=pointer]
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "客人B·刺刺：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e8] [cursor=pointer]
      - button "切换果汁机" [ref=e9] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "苹果汁，1号盘"
      - button "香蕉，1号盘"
      - button "苹果，1号盘"
    - button "带作品到活动桌" [ref=e10] [cursor=pointer]
    - button "点请求气泡重听" [ref=e11] [cursor=pointer]:
      - img "苹果"
      - generic [ref=e12]: ♫
    - generic:
      - status: 这位客人想要一个苹果。 食物留在盘里，可以调整。
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { layoutFor } from '../src/game/layout';
  3   | import { handOver, hot, lesson, startEndless, startStory, state, tap } from './helpers';
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
  14  |   await startEndless(page, false);
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
  27  |   await tap(page, 'tray-0');
  28  |   await tap(page, 'tray-0', 26);
  29  |   await tap(page, 'supply-banana');
  30  |   await expect
  31  |     .poll(async () => (await state(page)).items.find((item) => item.product === 'banana')?.location)
  32  |     .toMatch(/^tray:0:/);
  33  |   await handOver(page);
  34  |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  35  |   const banana = (await state(page)).items[0];
  36  |   if (!banana) throw Error('banana');
  37  |   await page.waitForTimeout(300);
  38  |   await tap(page, `item-${banana.id}`);
  39  |   await page.getByRole('button', { name: '↩ 放回这份', exact: true }).tap();
  40  |   expect((await state(page)).items).toHaveLength(0);
  41  |   await tap(page, 'machine-apple');
  42  |   await tap(page, 'supply-apple');
  43  |   await tap(page, 'start');
  44  |   await tap(page, 'tray-0');
  45  |   await tap(page, 'supply-banana');
  46  |   await tap(page, 'supply-apple');
  47  |   const full = await state(page);
  48  |   expect(full.routing.machine).not.toBeNull();
  49  |   await tap(page, 'supply-apple');
  50  |   const stillFull = await state(page);
  51  |   expect(stillFull.nextId).toBe(full.nextId);
  52  |   expect(stillFull.items.every((item) => full.items.some((prior) => prior.id === item.id))).toBe(
  53  |     true,
  54  |   );
  55  |   if (stillFull.machine.status === 'empty') {
  56  |     const cup = full.items.find((item) => item.location === 'machine:cup');
  57  |     const apple = full.items.find((item) => item.location === 'machine:apple');
  58  |     expect(stillFull.items.find((item) => item.id === cup?.id)).toMatchObject({
  59  |       product: 'juice',
  60  |       location: 'tray:0:0',
  61  |     });
  62  |     expect(stillFull.items.some((item) => item.id === apple?.id)).toBe(false);
  63  |   } else expect(stillFull.items).toEqual(full.items);
  64  |   const attempts = (await state(page)).attempts.length;
  65  |   await handOver(page, 0);
> 66  |   expect((await state(page)).attempts).toHaveLength(attempts);
      |                                        ^ Error: expect(received).toHaveLength(expected)
  67  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  68  |   const frozen = await state(page);
  69  |   await page.reload();
  70  |   await page.locator('.yard-endless .entry-main').tap();
  71  |   await page.getByRole('button', { name: '开门 / 继续营业' }).tap();
  72  |   await lesson(page);
  73  |   const restored = await state(page);
  74  |   const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  75  |   const vessel = frozen.items.find((i) => i.location === 'machine:cup' || i.product === 'juice');
  76  |   const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  77  |   expect(restored.items.map((i) => i.id)).toEqual(
  78  |     frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  79  |   );
  80  |   for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
  81  |     expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  82  |   if (alreadyFinished)
  83  |     expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
  84  |   await expect
  85  |     .poll(
  86  |       async () =>
  87  |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  88  |       { timeout: 15000 },
  89  |     )
  90  |     .toBe(true);
  91  |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  92  |   if (!juice) throw Error('juice');
  93  |   await tap(page, `item-${juice.id}`);
  94  |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  95  |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  96  |   expect((await state(page)).recycle?.id).toBe(juice.id);
  97  |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  98  |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  99  |   const before = await state(page);
  100 |   const point = await hot(page, 'supply-apple');
  101 |   if (test.info().project.use.browserName !== 'webkit') {
  102 |     const cdp = await page.context().newCDPSession(page);
  103 |     await cdp.send('Input.dispatchTouchEvent', {
  104 |       type: 'touchStart',
  105 |       touchPoints: [{ ...point, id: 1 }],
  106 |     });
  107 |     await cdp.send('Input.dispatchTouchEvent', {
  108 |       type: 'touchStart',
  109 |       touchPoints: [
  110 |         { ...point, id: 1 },
  111 |         { x: point.x + 30, y: point.y, id: 2 },
  112 |       ],
  113 |     });
  114 |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  115 |     await cdp.detach();
  116 |     expect((await state(page)).items).toEqual(before.items);
  117 |   }
  118 |   for (const height of [300, 342, 393]) {
  119 |     await page.setViewportSize({ width: 852, height });
  120 |     const helper = layoutFor(852, height, 'service').helper;
  121 |     await expect
  122 |       .poll(async () => {
  123 |         const point = await hot(page, 'note');
  124 |         return [Math.round(point.x), Math.round(point.y)];
  125 |       })
  126 |       .toEqual([Math.round(helper.x), Math.round(helper.y - 20)]);
  127 |     await expect
  128 |       .poll(async () => {
  129 |         const p = await hot(page, 'note');
  130 |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  131 |       })
  132 |       .toBe('CANVAS');
  133 |     await tap(page, 'note');
  134 |     await expect(page.getByRole('heading', { name: '大咪陪你一起做' })).toBeVisible();
  135 |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  136 |     await tap(page, 'tray-1', 25);
  137 |     await tap(page, 'supply-apple');
  138 |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  139 |     expect(added?.product).toBe('apple');
  140 |     if (!added) throw Error('second tray');
  141 |     await page.waitForTimeout(300);
  142 |     await tap(page, `item-${added.id}`);
  143 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  144 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  145 |   }
  146 | });
  147 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  148 |   page,
  149 | }, info) => {
  150 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  151 |   await startStory(page);
  152 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  153 |   const before = (await state(page)).attempts.length;
  154 |   const supply = await hot(page, 'supply-apple');
  155 |   expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
  156 |     'CANVAS',
  157 |   );
  158 |   await tap(page, 'supply-apple');
  159 |   expect((await state(page)).items).toHaveLength(1);
  160 |   expect((await state(page)).attempts).toHaveLength(before);
  161 |   await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  162 |   const failed = await page.locator('main').getAttribute('data-audio-state');
  163 |   expect(failed).toContain('failure');
  164 |   await page.unroute('**/audio/*.wav*');
  165 |   await page.getByRole('button', { name: '重试声音', exact: true }).tap();
  166 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toHaveCount(0);
```