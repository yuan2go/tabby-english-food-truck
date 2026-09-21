# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22.spec.ts >> M22 two-tap fruit, four-tap juice, pause and measured unobscured supplies
- Location: e2e/m22.spec.ts:10:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 晨光果汁 2 / 4
    - group "餐车操作":
      - button "客人A：选择并重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "启动果汁机"
      - button "请小猫帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
    - button "送餐 ↗" [ref=e7] [cursor=pointer]
    - button "点请求气泡重听" [ref=e8] [cursor=pointer]:
      - img "香蕉汁"
      - generic [ref=e9]: ♫
    - generic:
      - status: 点食物直接放盘；做果汁先点机器。准备好后点送餐。
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { lesson, startStory, state, tap } from './helpers';
  3  | 
  4  | test.use({
  5  |   viewport: { width: 393, height: 665 },
  6  |   deviceScaleFactor: 3,
  7  |   hasTouch: true,
  8  |   isMobile: true,
  9  | });
  10 | test('M22 two-tap fruit, four-tap juice, pause and measured unobscured supplies', async ({
  11 |   page,
  12 | }, info) => {
  13 |   await startStory(page);
  14 |   expect(await page.locator('.prep-selector,.request-tools,.family-tabs').count()).toBe(0);
  15 |   const hit = async (id: string) => {
  16 |     const h = page.locator(`[data-hotspot="${id}"]`);
  17 |     expect(
  18 |       await h.evaluate((e) => {
  19 |         const r = e.getBoundingClientRect(),
  20 |           top = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  21 |         return (
  22 |           r.width >= 44 &&
  23 |           r.height >= 44 &&
  24 |           r.bottom <= innerHeight &&
  25 |           (top?.tagName === 'CANVAS' || top === e)
  26 |         );
  27 |       }),
> 28 |     ).toBe(true);
     |       ^ Error: expect(received).toBe(expected) // Object.is equality
  29 |   };
  30 |   await hit('supply-apple');
  31 |   await tap(page, 'supply-apple');
  32 |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  33 |   await expect
  34 |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  35 |     .toBe('done');
  36 |   await lesson(page);
  37 |   await hit('machine-apple');
  38 |   await tap(page, 'machine-apple');
  39 |   await tap(page, 'supply-apple');
  40 |   await tap(page, 'start');
  41 |   await expect.poll(async () => (await state(page)).routing.machine !== null).toBe(true);
  42 |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  43 |   expect(await page.getByRole('dialog').getByRole('button').count()).toBe(3);
  44 |   await page.getByRole('button', { name: '继续营业', exact: true }).tap();
  45 |   await expect
  46 |     .poll(
  47 |       async () =>
  48 |         (await state(page)).items.some(
  49 |           (i) => i.product === 'juice' && i.location.startsWith('tray:'),
  50 |         ),
  51 |       { timeout: 15000 },
  52 |     )
  53 |     .toBe(true);
  54 |   await page.screenshot({ path: info.outputPath('juice-393x665-dpr3.png') });
  55 |   await page.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  56 |   await expect
  57 |     .poll(async () => (await state(page)).orders[1]?.status, { timeout: 18000 })
  58 |     .toBe('done');
  59 |   await lesson(page);
  60 |   for (const h of [565, 759, 665]) {
  61 |     await page.setViewportSize({ width: 393, height: h });
  62 |     await hit('supply-apple');
  63 |   }
  64 |   await page.setViewportSize({ width: 852, height: 393 });
  65 |   await hit('supply-apple');
  66 |   await page.screenshot({ path: info.outputPath('landscape.png') });
  67 | });
  68 | 
```