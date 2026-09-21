# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory
- Location: e2e/m22-boundaries.spec.ts:10:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 0

  Array [
    "food-2",
-   "food-3",
    "food-5",
    "food-6",
  ]
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
  18  |   await tap(page, 'supply-banana');
  19  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  20  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  21  |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  22  |   const banana = (await state(page)).items[0];
  23  |   if (!banana) throw Error('banana');
  24  |   await page.waitForTimeout(300);
  25  |   await tap(page, `item-${banana.id}`);
  26  |   await page.getByRole('button', { name: '↩ 放回这份', exact: true }).tap();
  27  |   expect((await state(page)).items).toHaveLength(0);
  28  |   await tap(page, 'machine-apple');
  29  |   await tap(page, 'supply-apple');
  30  |   await tap(page, 'start');
  31  |   await tap(page, 'tray-0');
  32  |   await tap(page, 'supply-banana');
  33  |   await tap(page, 'supply-apple');
  34  |   const full = await state(page);
  35  |   expect(full.routing.machine).not.toBeNull();
  36  |   await tap(page, 'supply-apple');
  37  |   expect((await state(page)).items).toHaveLength(full.items.length);
  38  |   const attempts = (await state(page)).attempts.length;
  39  |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  40  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
  41  |   expect((await state(page)).attempts).toHaveLength(attempts);
  42  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  43  |   const frozen = await state(page);
  44  |   await page.reload();
  45  |   await page.locator('.yard-story .entry-main').tap();
  46  |   await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  47  |   await lesson(page);
> 48  |   expect((await state(page)).items.map((i) => i.id)).toEqual(frozen.items.map((i) => i.id));
      |                                                      ^ Error: expect(received).toEqual(expected) // deep equality
  49  |   await expect
  50  |     .poll(
  51  |       async () =>
  52  |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  53  |       { timeout: 15000 },
  54  |     )
  55  |     .toBe(true);
  56  |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  57  |   if (!juice) throw Error('juice');
  58  |   await tap(page, `item-${juice.id}`);
  59  |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  60  |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  61  |   expect((await state(page)).recycle?.id).toBe(juice.id);
  62  |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  63  |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  64  |   const before = await state(page);
  65  |   const point = await hot(page, 'supply-apple');
  66  |   if (test.info().project.use.browserName !== 'webkit') {
  67  |     const cdp = await page.context().newCDPSession(page);
  68  |     await cdp.send('Input.dispatchTouchEvent', {
  69  |       type: 'touchStart',
  70  |       touchPoints: [{ ...point, id: 1 }],
  71  |     });
  72  |     await cdp.send('Input.dispatchTouchEvent', {
  73  |       type: 'touchStart',
  74  |       touchPoints: [
  75  |         { ...point, id: 1 },
  76  |         { x: point.x + 30, y: point.y, id: 2 },
  77  |       ],
  78  |     });
  79  |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  80  |     await cdp.detach();
  81  |     expect((await state(page)).items).toEqual(before.items);
  82  |   }
  83  |   for (const height of [300, 342, 393]) {
  84  |     await page.setViewportSize({ width: 852, height });
  85  |     await expect
  86  |       .poll(async () => {
  87  |         const p = await hot(page, 'note');
  88  |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  89  |       })
  90  |       .toBe('CANVAS');
  91  |     await tap(page, 'note');
  92  |     await expect(page.getByRole('heading', { name: '小猫陪你一起做' })).toBeVisible();
  93  |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  94  |     await tap(page, 'tray-1', 25);
  95  |     await tap(page, 'supply-apple');
  96  |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  97  |     expect(added?.product).toBe('apple');
  98  |     if (!added) throw Error('second tray');
  99  |     await page.waitForTimeout(300);
  100 |     await tap(page, `item-${added.id}`);
  101 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  102 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  103 |   }
  104 | });
  105 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  106 |   page,
  107 | }, info) => {
  108 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  109 |   await startStory(page);
  110 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
  111 |   const before = (await state(page)).attempts.length;
  112 |   const supply = await hot(page, 'supply-apple');
  113 |   expect(await page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, supply)).toBe(
  114 |     'CANVAS',
  115 |   );
  116 |   await tap(page, 'supply-apple');
  117 |   expect((await state(page)).items).toHaveLength(1);
  118 |   expect((await state(page)).attempts).toHaveLength(before);
  119 |   await page.getByRole('button', { name: '声音状态', exact: true }).tap();
  120 |   const failed = await page.locator('main').getAttribute('data-audio-state');
  121 |   expect(failed).toContain('failure');
  122 |   await page.unroute('**/audio/*.wav*');
  123 |   await page.getByRole('button', { name: '重试声音', exact: true }).tap();
  124 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toHaveCount(0);
  125 |   await page.screenshot({ path: info.outputPath('audio-recovered.png') });
  126 | });
  127 | 
```