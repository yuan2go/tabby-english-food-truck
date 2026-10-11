# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> free shop stops accepting, saves actual food, restores and returns to a natural ending
- Location: e2e/adventure.spec.ts:302:1

# Error details

```
Error: locator.click: Test ended.
Call log:
  - waiting for getByRole('button', { name: '到活动桌', exact: true })
    - locator resolved to <button type="button" class="activity-kitchen-link">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="e45201943f03214e9694f9932ad4f67ce399b7e2" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.14918288588523865,"machineGain":0.1201409325003624,"effec…>…</main> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="e45201943f03214e9694f9932ad4f67ce399b7e2" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.14918288588523865,"machineGain":0.1201409325003624,"effec…>…</main> intercepts pointer events
    - retrying click action
      - waiting 100ms
    4 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="e45201943f03214e9694f9932ad4f67ce399b7e2" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.14918288588523865,"machineGain":0.1201409325003624,"effec…>…</main> intercepts pointer events
    - retrying click action
      - waiting 500ms
    11 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="e45201943f03214e9694f9932ad4f67ce399b7e2" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":null,"failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.14918288588523865,"machineGain":0.02500000037252903,"effects":0}">…</main> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { choosePrep, evidencePath, handOver, hot, lesson, make, state, tap } from './helpers';
  3   | 
  4   | test.use({ hasTouch: true });
  5   | // These cases inspect the full visual process; CI's low-graphics preference is
  6   | // valid, but has a separate receipt/idempotence case below.
  7   | test.beforeEach(async ({ page }, info) => {
  8   |   if (/visible activity entrance|desktop feast exposes/.test(info.title)) {
  9   |     await page.emulateMedia({ reducedMotion: 'no-preference' });
  10  |     await page.addInitScript(() => localStorage.setItem('tabby.foodtruck.lowGraphics', 'false'));
  11  |   }
  12  | });
  13  | 
  14  | async function kitchen(page: Page) {
  15  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  16  |   await lesson(page);
  17  | }
  18  | async function table(page: Page) {
  19  |   await lesson(page);
> 20  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
      |                                                                 ^ Error: locator.click: Test ended.
  21  | }
  22  | async function send(page: Page, index: number, product: Parameters<typeof make>[1]) {
  23  |   await lesson(page);
  24  |   const order = (await state(page)).orders[index];
  25  |   if (order?.status === 'queued') {
  26  |     await table(page);
  27  |     await page
  28  |       .getByRole('button', {
  29  |         name: order.visitor === 'hedgehog' ? '先帮刺刺' : '先帮兔兔',
  30  |         exact: true,
  31  |       })
  32  |       .click();
  33  |     await kitchen(page);
  34  |   }
  35  |   const orderId = order?.id;
  36  |   if (product === 'apple' || product === 'banana') {
  37  |     if ((await state(page)).session.family !== 'juice') await tap(page, 'family-juice');
  38  |     await choosePrep(page, '● 1号盘');
  39  |     await tap(page, `supply-${product}`);
  40  |   } else {
  41  |     await choosePrep(page, '● 1号盘');
  42  |     await make(page, product);
  43  |   }
  44  |   const activeOrder = (await state(page)).orders.find((o) => o.id === orderId);
  45  |   if (!activeOrder || activeOrder.status !== 'waiting')
  46  |     throw Error('chosen friend was not admitted');
  47  |   await handOver(page, activeOrder.seat);
  48  |   await expect
  49  |     .poll(async () => (await state(page)).orders.find((o) => o.id === orderId)?.status ?? 'done', {
  50  |       timeout: 20000,
  51  |     })
  52  |     .toBe('done');
  53  |   await lesson(page);
  54  | }
  55  | async function begin(page: Page) {
  56  |   await page.goto('/');
  57  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  58  | }
  59  | 
  60  | test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  61  |   page,
  62  | }) => {
  63  |   test.setTimeout(900000);
  64  |   page.setDefaultTimeout(30000);
  65  |   const walkStarted = Date.now();
  66  |   await page.setViewportSize({ width: 1280, height: 720 });
  67  |   await begin(page);
  68  |   await kitchen(page);
  69  |   await send(page, 0, 'apple');
  70  |   await send(page, 1, 'banana');
  71  |   await table(page);
  72  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  73  |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  74  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  75  |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  76  |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  77  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  78  |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  79  |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  80  |   for (let stage = 0; stage < 5; stage++)
  81  |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`), { timeout: 15000 });
  82  |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  83  |     timeout: 15000,
  84  |   });
  85  |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  86  |   await page.screenshot({
  87  |     path: evidencePath('docs/evidence/adventure-experience-02/breakfast-friends-desktop.png'),
  88  |   });
  89  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  90  |   await kitchen(page);
  91  |   await send(page, 0, 'vanilla-cone');
  92  |   await make(page, 'strawberry-cup');
  93  |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  94  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  95  |   await table(page);
  96  |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  97  |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  98  |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  99  |   await page.getByRole('button', { name: '选择草莓冰淇淋杯', exact: true }).click();
  100 |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  101 |   await page.getByRole('button', { name: '挂上清凉彩旗', exact: true }).click();
  102 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  103 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  104 |   await kitchen(page);
  105 |   await send(page, 0, 'sandwich');
  106 |   await table(page);
  107 |   await page.getByRole('button', { name: '检查野餐篮', exact: true }).click();
  108 |   await kitchen(page);
  109 |   await make(page, 'sandwich');
  110 |   await tap(page, 'family-juice');
  111 |   await choosePrep(page, '● 1号盘');
  112 |   await tap(page, 'supply-banana');
  113 |   await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  114 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  115 |   await send(page, 1, 'salad-sandwich');
  116 |   await table(page);
  117 |   await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  118 |   await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  119 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  120 |   await page.screenshot({
```