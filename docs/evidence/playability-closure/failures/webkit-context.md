# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> phone wrong delivery, full reserved plate, cancel/multitouch and short landscape keep real inventory
- Location: e2e/m22-boundaries.spec.ts:10:1

# Error details

```
TimeoutError: locator.tap: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('group', { name: '选择送餐客人' }).getByRole('button').first()

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
      - button "香蕉，1号盘"
    - button "送餐 ↗" [ref=e7] [cursor=pointer]
    - button "点请求气泡重听" [ref=e8] [cursor=pointer]:
      - img "苹果"
      - generic [ref=e9]: ♫
    - generic:
      - status: 这位客人想要一个苹果。 食物留在盘里，可以调整。
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
> 20  |   await page.getByRole('group', { name: '选择送餐客人' }).getByRole('button').first().tap();
      |                                                                                 ^ TimeoutError: locator.tap: Timeout 12000ms exceeded.
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
  48  |   const restored = await state(page);
  49  |   const consumed = frozen.items.find((i) => i.location === 'machine:apple');
  50  |   const vessel = frozen.items.find((i) => i.location === 'machine:cup');
  51  |   const alreadyFinished = restored.items.some((i) => i.product === 'juice');
  52  |   expect(restored.items.map((i) => i.id)).toEqual(
  53  |     frozen.items.filter((i) => !alreadyFinished || i.id !== consumed?.id).map((i) => i.id),
  54  |   );
  55  |   for (const item of frozen.items.filter((i) => !i.location.startsWith('machine:')))
  56  |     expect(restored.items.find((i) => i.id === item.id)).toEqual(item);
  57  |   if (alreadyFinished)
  58  |     expect(restored.items.find((i) => i.product === 'juice')?.id).toBe(vessel?.id);
  59  |   await expect
  60  |     .poll(
  61  |       async () =>
  62  |         (await state(page)).items.some((i) => i.product === 'juice' && i.location === 'tray:0:0'),
  63  |       { timeout: 15000 },
  64  |     )
  65  |     .toBe(true);
  66  |   const juice = (await state(page)).items.find((i) => i.product === 'juice');
  67  |   if (!juice) throw Error('juice');
  68  |   await tap(page, `item-${juice.id}`);
  69  |   await page.getByRole('button', { name: '收起成品', exact: true }).tap();
  70  |   await page.getByRole('button', { name: '确认收起', exact: true }).tap();
  71  |   expect((await state(page)).recycle?.id).toBe(juice.id);
  72  |   await page.getByRole('button', { name: '↶ 恢复成品', exact: true }).tap();
  73  |   expect((await state(page)).items.find((i) => i.id === juice.id)?.product).toBe('juice');
  74  |   const before = await state(page);
  75  |   const point = await hot(page, 'supply-apple');
  76  |   if (test.info().project.use.browserName !== 'webkit') {
  77  |     const cdp = await page.context().newCDPSession(page);
  78  |     await cdp.send('Input.dispatchTouchEvent', {
  79  |       type: 'touchStart',
  80  |       touchPoints: [{ ...point, id: 1 }],
  81  |     });
  82  |     await cdp.send('Input.dispatchTouchEvent', {
  83  |       type: 'touchStart',
  84  |       touchPoints: [
  85  |         { ...point, id: 1 },
  86  |         { x: point.x + 30, y: point.y, id: 2 },
  87  |       ],
  88  |     });
  89  |     await cdp.send('Input.dispatchTouchEvent', { type: 'touchCancel', touchPoints: [] });
  90  |     await cdp.detach();
  91  |     expect((await state(page)).items).toEqual(before.items);
  92  |   }
  93  |   for (const height of [300, 342, 393]) {
  94  |     await page.setViewportSize({ width: 852, height });
  95  |     await expect
  96  |       .poll(async () => {
  97  |         const p = await hot(page, 'note');
  98  |         return page.evaluate((p) => document.elementFromPoint(p.x, p.y)?.tagName, p);
  99  |       })
  100 |       .toBe('CANVAS');
  101 |     await tap(page, 'note');
  102 |     await expect(page.getByRole('heading', { name: '小猫陪你一起做' })).toBeVisible();
  103 |     await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  104 |     await tap(page, 'tray-1', 25);
  105 |     await tap(page, 'supply-apple');
  106 |     const added = (await state(page)).items.find((i) => i.location.startsWith('tray:1:'));
  107 |     expect(added?.product).toBe('apple');
  108 |     if (!added) throw Error('second tray');
  109 |     await page.waitForTimeout(300);
  110 |     await tap(page, `item-${added.id}`);
  111 |     await page.getByRole('button', { name: '↩ 放回这份' }).tap();
  112 |     await page.screenshot({ path: info.outputPath(`short-landscape-${height}.png`) });
  113 |   }
  114 | });
  115 | test('audio loading failure exposes correct retry, never blocks supplies or creates a language error', async ({
  116 |   page,
  117 | }, info) => {
  118 |   await page.route('**/audio/*.wav*', (r) => r.abort());
  119 |   await startStory(page);
  120 |   await expect(page.getByRole('button', { name: '声音状态', exact: true })).toBeVisible();
```