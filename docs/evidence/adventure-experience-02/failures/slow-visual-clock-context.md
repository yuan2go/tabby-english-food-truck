# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> visible activity entrance reaches all five chapters and saves a real creation
- Location: e2e/adventure.spec.ts:52:1

# Error details

```
Error: expect(locator).toHaveClass(expected) failed

Locator: getByRole('region', { name: '朋友实际使用食品', exact: true })
Expected pattern: /stage-2/
Received string:  "friend-theatre theatre-finish stage-1  bite"
Timeout: 6000ms

Call log:
  - Expect "toHaveClass" getByRole('region', { name: '朋友实际使用食品', exact: true }) with timeout 6000ms
  - waiting for getByRole('region', { name: '朋友实际使用食品', exact: true })
    9 × locator resolved to <section aria-label="朋友实际使用食品" class="friend-theatre theatre-finish stage-1  bite" data-moment="e3420f11-b5ee-4f1d-9367-4613a8a2216f:moment:8">…</section>
      - unexpected value "friend-theatre theatre-finish stage-1  bite"

```

```yaml
- region "朋友实际使用食品":
  - img "接餐、携带、摆放、品尝、回应": 接餐 携带 摆放 品尝 回应
  - img "兔兔品尝真实食品"
  - img "第1份，共2份": ● ●
  - button "重看朋友使用": ↻ ♫
  - button "跳过朋友演出": ↗
  - button "低动态表现": ◒
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
  16  |   const order = (await state(page)).orders[index];
  17  |   if (order?.status === 'queued') {
  18  |     await table(page);
  19  |     await page
  20  |       .getByRole('button', {
  21  |         name: order.visitor === 'hedgehog' ? '先帮刺刺' : '先帮兔兔',
  22  |         exact: true,
  23  |       })
  24  |       .click();
  25  |     await kitchen(page);
  26  |   }
  27  |   const orderId = order?.id;
  28  |   if (product === 'apple' || product === 'banana') {
  29  |     if ((await state(page)).session.family !== 'juice') await tap(page, 'family-juice');
  30  |     await choosePrep(page, '● 1号盘');
  31  |     await tap(page, `supply-${product}`);
  32  |   } else {
  33  |     await choosePrep(page, '● 1号盘');
  34  |     await make(page, product);
  35  |   }
  36  |   const activeOrder = (await state(page)).orders.find((o) => o.id === orderId);
  37  |   if (!activeOrder || activeOrder.status !== 'waiting')
  38  |     throw Error('chosen friend was not admitted');
  39  |   await handOver(page, activeOrder.seat);
  40  |   await expect
  41  |     .poll(async () => (await state(page)).orders.find((o) => o.id === orderId)?.status ?? 'done', {
  42  |       timeout: 20000,
  43  |     })
  44  |     .toBe('done');
  45  |   await lesson(page);
  46  | }
  47  | async function begin(page: Page) {
  48  |   await page.goto('/');
  49  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  50  | }
  51  | 
  52  | test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  53  |   page,
  54  | }) => {
  55  |   test.setTimeout(480000);
  56  |   const walkStarted = Date.now();
  57  |   await page.setViewportSize({ width: 1280, height: 720 });
  58  |   await begin(page);
  59  |   await kitchen(page);
  60  |   await send(page, 0, 'apple');
  61  |   await send(page, 1, 'banana');
  62  |   await table(page);
  63  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  64  |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  65  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  66  |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  67  |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  68  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  69  |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  70  |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  71  |   for (let stage = 0; stage < 5; stage++)
> 72  |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`));
      |                         ^ Error: expect(locator).toHaveClass(expected) failed
  73  |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible();
  74  |   await expect(feast).toHaveClass(/stage-4/);
  75  |   await page.screenshot({
  76  |     path: 'docs/evidence/adventure-experience-02/breakfast-friends-desktop.png',
  77  |   });
  78  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  79  |   await kitchen(page);
  80  |   await send(page, 0, 'vanilla-cone');
  81  |   await make(page, 'strawberry-cup');
  82  |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  83  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  84  |   await table(page);
  85  |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  86  |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  87  |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  88  |   await page.getByRole('button', { name: '选择草莓冰淇淋杯', exact: true }).click();
  89  |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  90  |   await page.getByRole('button', { name: '挂上清凉彩旗', exact: true }).click();
  91  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  92  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  93  |   await kitchen(page);
  94  |   await send(page, 0, 'sandwich');
  95  |   await table(page);
  96  |   await page.getByRole('button', { name: '检查野餐篮', exact: true }).click();
  97  |   await kitchen(page);
  98  |   await make(page, 'sandwich');
  99  |   await tap(page, 'family-juice');
  100 |   await choosePrep(page, '● 1号盘');
  101 |   await tap(page, 'supply-banana');
  102 |   await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  103 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  104 |   await send(page, 1, 'salad-sandwich');
  105 |   await table(page);
  106 |   await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  107 |   await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  108 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  109 |   await page.screenshot({
  110 |     path: 'docs/evidence/adventure-experience-02/picnic-rabbit-desktop.png',
  111 |   });
  112 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  113 |   await kitchen(page);
  114 |   await send(page, 0, 'cheese-burger');
  115 |   await send(page, 1, 'juice');
  116 |   await table(page);
  117 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  118 |   await page.getByRole('button', { name: '取出灯串', exact: true }).click();
  119 |   await page.getByRole('button', { name: '请兔兔带灯', exact: true }).click();
  120 |   await page.getByRole('button', { name: '选择芝士汉堡', exact: true }).click();
  121 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  122 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  123 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  124 |   await page.getByRole('button', { name: '点亮暖灯', exact: true }).click();
  125 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  126 |   console.log('EVIDENCE_DINNER_START_SECONDS', (Date.now() - walkStarted) / 1000);
  127 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible();
  128 |   await expect(feast).toHaveClass(/sip/);
  129 |   await expect(feast).toHaveClass(/stage-4/);
  130 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/dinner-drink-desktop.png' });
  131 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  132 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  133 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  134 |   await kitchen(page);
  135 |   await choosePrep(page, '● 1号盘');
  136 |   await make(page, 'sandwich');
  137 |   await make(page, 'juice');
  138 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  139 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  140 |   await table(page);
  141 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  142 |   await page.getByRole('button', { name: '分享给兔兔', exact: true }).click();
  143 |   await page.getByRole('button', { name: '品尝芝士三明治', exact: true }).click();
  144 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  145 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  146 |   await expect
  147 |     .poll(() =>
  148 |       page.evaluate(
  149 |         () =>
  150 |           JSON.parse(
  151 |             localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}',
  152 |           ).activityMemories.filter((m: { state: { rewards: string[] } }) => m.state.rewards.length)
  153 |             .length,
  154 |       ),
  155 |     )
  156 |     .toBe(5);
  157 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/feast-desktop.png' });
  158 |   const before = await state(page);
  159 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  160 |   await page.reload();
  161 |   await page.getByRole('button', { name: '正在准备 · 社区小食会', exact: true }).click();
  162 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  163 |   await page.getByRole('button', { name: '再准备一次', exact: true }).click();
  164 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  165 |   await expect(
  166 |     page
  167 |       .getByRole('region', { name: '上次留下的作品', exact: true })
  168 |       .locator('.remembered-table')
  169 |       .getByRole('img', { name: '芝士三明治', exact: true }),
  170 |   ).toBeVisible();
  171 |   expect((await state(page)).adventure?.foods).toEqual([]);
  172 |   expect((await state(page)).adventure?.rewards).toEqual([]);
```