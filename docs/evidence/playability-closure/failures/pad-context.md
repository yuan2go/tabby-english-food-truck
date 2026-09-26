# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: recovery.spec.ts >> M2 Pad prologue and real processing restore in portrait and landscape
- Location: e2e/recovery.spec.ts:24:1

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
      - generic: 晨光果汁 1 / 4
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
      - img "苹果汁"
      - generic [ref=f1e9]: ♫
    - generic:
      - status: 选好备餐位置，点食材就能放进去。
```

# Test source

```ts
  1   | import { execFileSync } from 'node:child_process';
  2   | import { writeFile } from 'node:fs/promises';
  3   | import { expect, test } from '@playwright/test';
  4   | import { REQUESTS } from '../src/content/catalog';
  5   | import { RAW } from '../src/content/recipes';
  6   | import {
  7   |   choosePrep,
  8   |   hot,
  9   |   lesson,
  10  |   make,
  11  |   serve,
  12  |   startEndless,
  13  |   startStory,
  14  |   state,
  15  |   tap,
  16  | } from './helpers';
  17  | 
  18  | test.use({
  19  |   viewport: { width: 1024, height: 768 },
  20  |   deviceScaleFactor: 2,
  21  |   hasTouch: true,
  22  |   video: { mode: 'on', size: { width: 1024, height: 768 } },
  23  | });
  24  | test('M2 Pad prologue and real processing restore in portrait and landscape', async ({
  25  |   page,
  26  | }, info) => {
  27  |   test.setTimeout(120000);
  28  |   await page.goto('/');
  29  |   await page.locator('.yard-story .entry-main').tap();
  30  |   await page.getByRole('button', { name: '重听故事', exact: true }).tap();
  31  |   await page.getByRole('button', { name: '接着听', exact: true }).tap();
  32  |   await page.getByRole('button', { name: '接着听', exact: true }).tap();
  33  |   await page.screenshot({ path: info.outputPath('pad-handover.png') });
  34  |   await page.getByRole('button', { name: '拿起食谱，开店啦', exact: true }).tap();
  35  |   await lesson(page);
  36  |   await serve(page);
  37  |   await lesson(page);
  38  |   await choosePrep(page, '果汁机');
  39  |   await tap(page, 'supply-apple');
  40  |   await tap(page, 'supply-cup');
  41  |   await tap(page, 'start');
  42  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  43  |   const before = await state(page);
  44  |   expect(before.machine.status).toBe('processing');
  45  |   await page.setViewportSize({ width: 768, height: 1024 });
  46  |   await page.reload();
  47  |   await page.locator('.yard-story .entry-main').tap();
  48  |   await page.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  49  |   expect((await state(page)).runId).toBe(before.runId);
  50  |   await expect
  51  |     .poll(async () => (await state(page)).machine.status, { timeout: 15000 })
> 52  |     .toBe('ready');
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  53  |   const item = (await state(page)).items.find((i) => i.product === 'juice');
  54  |   if (!item) throw Error('juice');
  55  |   await tap(page, `item-${item.id}`);
  56  |   await choosePrep(page, '● 1号盘');
  57  |   await page.screenshot({ path: info.outputPath('pad-portrait-collected.png') });
  58  |   await page.getByRole('button', { name: '送给客人 ↗', exact: true }).tap();
  59  |   await expect
  60  |     .poll(async () => (await state(page)).orders.filter((o) => o.status === 'done').length, {
  61  |       timeout: 15000,
  62  |     })
  63  |     .toBe(2);
  64  |   await page.setViewportSize({ width: 1024, height: 768 });
  65  |   await lesson(page);
  66  |   await page.screenshot({ path: info.outputPath('pad-landscape-after.png') });
  67  |   expect(await page.evaluate(() => document.documentElement.scrollHeight <= innerHeight)).toBe(
  68  |     true,
  69  |   );
  70  | });
  71  | test('M2 actual helper and delivery overlap, reload, cancellation and continued motion', async ({
  72  |   page,
  73  | }, info) => {
  74  |   test.setTimeout(90000);
  75  |   await startEndless(page);
  76  |   await lesson(page);
  77  |   const startPoint = await hot(page, 'start');
  78  |   expect(
  79  |     await page.evaluate(
  80  |       ({ x, y }) => document.elementFromPoint(x, y)?.closest('.delivery-actions') !== null,
  81  |       startPoint,
  82  |     ),
  83  |   ).toBe(false);
  84  |   const first = (await state(page)).orders.find((o) => o.status === 'waiting');
  85  |   if (!first) throw Error('order');
  86  |   for (const p of REQUESTS[first.request].products) {
  87  |     if (RAW.includes(p)) {
  88  |       await choosePrep(page, '● 1号盘');
  89  |       await make(page, p);
  90  |     } else {
  91  |       const id = await make(page, p);
  92  |       await tap(page, `item-${id}`);
  93  |       await choosePrep(page, '● 1号盘');
  94  |     }
  95  |   }
  96  |   await tap(page, 'note');
  97  |   await page.getByRole('button', { name: '2号盘', exact: true }).tap();
  98  |   await page.getByRole('button', { name: '看图请小猫', exact: true }).tap();
  99  |   await page.getByRole('button', { name: '图片 banana', exact: true }).tap();
  100 |   await page.getByRole('button', { name: '交给小猫', exact: true }).tap();
  101 |   await page
  102 |     .getByRole('button', {
  103 |       name: first.seat === 0 ? '送给左边客人 ↗' : '送给右边客人 ↗',
  104 |       exact: true,
  105 |     })
  106 |     .tap();
  107 |   let s = await state(page);
  108 |   expect(s.helper).not.toBeNull();
  109 |   expect(s.actor.queue.some((j) => j.kind === 'delivery')).toBe(true);
  110 |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  111 |   s = await state(page);
  112 |   const jobs = [s.actor.current?.plan.id, ...s.actor.queue.map((j) => j.plan.id)];
  113 |   await page.reload();
  114 |   await page.locator('.yard-endless .entry-main').tap();
  115 |   await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  116 |   expect([
  117 |     (await state(page)).actor.current?.plan.id,
  118 |     ...(await state(page)).actor.queue.map((j) => j.plan.id),
  119 |   ]).toEqual(jobs);
  120 |   await page.evaluate(() => {
  121 |     const read = () =>
  122 |       JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}').actor.point;
  123 |     const relevant = (e: Event) =>
  124 |       e.target instanceof Element && e.target.closest('button')?.textContent?.includes('撤回便签');
  125 |     document.addEventListener(
  126 |       'click',
  127 |       (e) => {
  128 |         if (relevant(e)) {
  129 |           const c = document.querySelector('canvas');
  130 |           Reflect.set(window, 'm2CancelBefore', {
  131 |             x: Number(c?.dataset.catX),
  132 |             y: Number(c?.dataset.catY),
  133 |           });
  134 |         }
  135 |       },
  136 |       true,
  137 |     );
  138 |     document.addEventListener('click', (e) => {
  139 |       if (relevant(e)) Reflect.set(window, 'm2CancelAfter', read());
  140 |     });
  141 |   });
  142 |   await page.getByRole('button', { name: '撤回便签', exact: true }).tap();
  143 |   expect((await state(page)).helper).toBeNull();
  144 |   const boundary = await page.evaluate(() => ({
  145 |     before: Reflect.get(window, 'm2CancelBefore'),
  146 |     after: Reflect.get(window, 'm2CancelAfter'),
  147 |   }));
  148 |   // Compare the last rendered point with the command-flushed rule point.
  149 |   // A pre-command storage read can be up to two seconds older than the frame.
  150 |   expect(
  151 |     Math.hypot(boundary.after.x - boundary.before.x, boundary.after.y - boundary.before.y),
  152 |   ).toBeLessThan(0.000001);
```