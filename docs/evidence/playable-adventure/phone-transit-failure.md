# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> phone replay follows hedgehog path with real food and no packing task
- Location: e2e/adventure.spec.ts:135:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "done"
Received: "waiting"

Call Log:
- Timeout 20000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 晨光开门
      - button "到活动桌" [ref=e7] [cursor=pointer]
    - group "餐车操作":
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
      - button "香蕉，1号盘" [pressed]
    - button "↩ 放回这份" [ref=e10] [cursor=pointer]
    - button "点请求气泡重听" [ref=e11] [cursor=pointer]:
      - img "香蕉"
      - generic [ref=e12]: ♫
    - generic:
      - status: 点托盘或制作台移动这份；原料可拖回篮子
```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { choosePrep, handOver, hot, lesson, make, state, tap } from './helpers';
  3   | 
  4   | test.use({ hasTouch: true });
  5   | 
  6   | async function kitchen(page: Page) {
  7   |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  8   |   await lesson(page);
  9   | }
  10  | async function table(page: Page) {
  11  |   await lesson(page);
  12  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  13  | }
  14  | async function send(page: Page, index: number, product: Parameters<typeof make>[1]) {
  15  |   await lesson(page);
  16  |   const orderId = (await state(page)).orders[index]?.id;
  17  |   if (product === 'apple' || product === 'banana') {
  18  |     if ((await state(page)).session.family !== 'juice') await tap(page, 'family-juice');
  19  |     await choosePrep(page, '● 1号盘');
  20  |     await tap(page, `supply-${product}`);
  21  |   } else {
  22  |     await choosePrep(page, '● 1号盘');
  23  |     await make(page, product);
  24  |   }
  25  |   await handOver(page, index as 0 | 1);
  26  |   await expect
  27  |     .poll(async () => (await state(page)).orders.find((o) => o.id === orderId)?.status ?? 'done', {
  28  |       timeout: 20000,
  29  |     })
> 30  |     .toBe('done');
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  31  |   await lesson(page);
  32  | }
  33  | async function begin(page: Page) {
  34  |   await page.goto('/');
  35  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  36  | }
  37  | 
  38  | test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  39  |   page,
  40  | }) => {
  41  |   test.setTimeout(300000);
  42  |   await page.setViewportSize({ width: 1440, height: 900 });
  43  |   await begin(page);
  44  |   await kitchen(page);
  45  |   await send(page, 0, 'apple');
  46  |   await send(page, 1, 'banana');
  47  |   await table(page);
  48  |   await page.getByRole('button', { name: '打开储物抽屉' }).click();
  49  |   await page.getByRole('button', { name: '把花种在中间' }).click();
  50  |   await page.getByRole('button', { name: '一起开席' }).click();
  51  |   await page.getByRole('button', { name: '下一院活动' }).click();
  52  |   await kitchen(page);
  53  |   await send(page, 0, 'vanilla-cone');
  54  |   await make(page, 'strawberry-cup');
  55  |   await page.getByRole('button', { name: '送去树荫分享' }).click();
  56  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  57  |   await table(page);
  58  |   await page.getByRole('button', { name: '翻开旧食谱' }).click();
  59  |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯' }).click();
  60  |   await page.getByRole('button', { name: '挂上清凉彩旗' }).click();
  61  |   await page.getByRole('button', { name: '一起开席' }).click();
  62  |   await page.getByRole('button', { name: '下一院活动' }).click();
  63  |   await kitchen(page);
  64  |   await send(page, 0, 'sandwich');
  65  |   await table(page);
  66  |   await page.getByRole('button', { name: '检查野餐篮' }).click();
  67  |   await kitchen(page);
  68  |   await make(page, 'sandwich');
  69  |   await tap(page, 'family-juice');
  70  |   await choosePrep(page, '● 1号盘');
  71  |   await tap(page, 'supply-banana');
  72  |   await page.getByRole('button', { name: '装进野餐篮' }).click();
  73  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  74  |   await send(page, 1, 'salad-sandwich');
  75  |   await table(page);
  76  |   await page.getByRole('button', { name: '把篮子摆上桌' }).click();
  77  |   await page.getByRole('button', { name: '铺上叶子桌布' }).click();
  78  |   await page.getByRole('button', { name: '一起开席' }).click();
  79  |   await page.screenshot({ path: 'docs/evidence/playable-adventure/picnic-rabbit-desktop.png' });
  80  |   await page.getByRole('button', { name: '下一院活动' }).click();
  81  |   await kitchen(page);
  82  |   await send(page, 0, 'cheese-burger');
  83  |   await send(page, 1, 'juice');
  84  |   await table(page);
  85  |   await page.getByRole('button', { name: '打开储物抽屉' }).click();
  86  |   await page.getByRole('button', { name: '选择芝士汉堡' }).click();
  87  |   await page.getByRole('button', { name: '摆到1号餐位' }).click();
  88  |   await page.getByRole('button', { name: '选择苹果汁' }).click();
  89  |   await page.getByRole('button', { name: '摆到2号餐位' }).click();
  90  |   await page.getByRole('button', { name: '点亮暖灯' }).click();
  91  |   await page.getByRole('button', { name: '一起开席' }).click();
  92  |   await page.getByRole('button', { name: '下一院活动' }).click();
  93  |   await page.getByRole('button', { name: '邀请兔兔' }).click();
  94  |   await page.getByRole('button', { name: '邀请刺刺' }).click();
  95  |   await kitchen(page);
  96  |   await choosePrep(page, '● 1号盘');
  97  |   await tap(page, 'supply-banana');
  98  |   await make(page, 'juice');
  99  |   await page.getByRole('button', { name: '带作品到活动桌' }).click();
  100 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  101 |   await table(page);
  102 |   await page.getByRole('button', { name: '选择香蕉', exact: true }).click();
  103 |   await page.getByRole('button', { name: '摆到3号餐位' }).click();
  104 |   await page.getByRole('button', { name: '品尝香蕉', exact: true }).click();
  105 |   await page.getByRole('button', { name: '保存到食谱' }).click();
  106 |   await page.getByRole('button', { name: '一起开席' }).click();
  107 |   await expect
  108 |     .poll(() =>
  109 |       page.evaluate(
  110 |         () =>
  111 |           JSON.parse(
  112 |             localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}',
  113 |           ).activityMemories.filter((m: { state: { rewards: string[] } }) => m.state.rewards.length)
  114 |             .length,
  115 |       ),
  116 |     )
  117 |     .toBe(5);
  118 |   await page.screenshot({ path: 'docs/evidence/playable-adventure/feast-desktop.png' });
  119 |   const before = await state(page);
  120 |   await page.getByRole('button', { name: '收摊回小院' }).click();
  121 |   await page.reload();
  122 |   await page.getByRole('button', { name: '正在准备 · 社区小食会', exact: true }).click();
  123 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  124 |   await page.getByRole('button', { name: '再准备一次' }).click();
  125 |   await page.getByRole('button', { name: '翻开旧食谱' }).click();
  126 |   await expect(
  127 |     page
  128 |       .getByRole('region', { name: '上次留下的作品' })
  129 |       .getByRole('img', { name: '香蕉', exact: true }),
  130 |   ).toBeVisible();
```