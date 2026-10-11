# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> free shop stops accepting, saves actual food, restores and returns to a natural ending
- Location: e2e/adventure.spec.ts:310:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '到活动桌', exact: true })
    - locator resolved to <button type="button" class="activity-kitchen-link">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="337bd84c7a24264f038a9d45be83b867fbac012b" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.1417950540781021,"machineGain":0.11448267102241516,"effec…>…</main> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="337bd84c7a24264f038a9d45be83b867fbac012b" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.1417950540781021,"machineGain":0.11448267102241516,"effec…>…</main> intercepts pointer events
    - retrying click action
      - waiting 100ms
    4 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="337bd84c7a24264f038a9d45be83b867fbac012b" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":"grow-banana","failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.1417950540781021,"machineGain":0.11448267102241516,"effec…>…</main> intercepts pointer events
    - retrying click action
      - waiting 500ms
    18 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <main data-build-dirty="false" class="game-shell m2-shell screen-game" data-content-version="adventure-experience-2" data-build-sha="337bd84c7a24264f038a9d45be83b867fbac012b" data-asset-version="325147c9c3a95a163aa05b55eb6aa6e3894d0e8896097f7b21708bbf36ed5b02" data-audio-state="{"active":null,"failure":null,"loops":[],"settings":{"master":true,"voice":true,"music":true,"ambience":true,"effects":true},"context":"running","musicGain":0.1417950540781021,"machineGain":0.02500000037252903,"effects":0}">…</main> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - generic:
    - generic:
      - button "暂停" [ref=f1e6] [cursor=pointer]: Ⅱ
      - button "到活动桌" [ref=f1e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=f1e13] [cursor=pointer]
        - button "重听下一步" [ref=f1e18] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求" [disabled]
      - button "果汁机苹果入口" [disabled]
      - button "果汁机杯座" [disabled]
      - button "▶ 榨成果汁" [disabled] [ref=f1e19]
      - button "切换果汁机" [disabled] [ref=f1e20]
      - button "请大咪帮忙" [disabled]
      - button "1号托盘：放入食品或选择整盘" [disabled]
      - button "拿起或放下1号整盘" [disabled] [ref=f1e21]
      - button "2号托盘：放入食品或选择整盘" [disabled]
      - button "拿起或放下2号整盘" [disabled] [ref=f1e22]
      - button "拿苹果" [disabled]
      - button "拿香蕉" [disabled]
      - button "拿空杯" [disabled]
    - dialog "今日新菜单" [ref=f1e23]:
      - generic [ref=f1e24]:
        - generic [ref=f1e25]: 大咪发现一个新味道
        - button "这次先不加 ↗" [active] [ref=f1e26] [cursor=pointer]
      - heading "认识后，再放上菜单" [level=2] [ref=f1e27]
      - button "听新菜单" [ref=f1e28] [cursor=pointer]:
        - generic [ref=f1e29]:
          - img "香蕉"
        - strong [ref=f1e30]: A banana, please.
        - generic [ref=f1e31]: ♫
      - paragraph [ref=f1e32]: 香蕉可以直接放到盘子里。
      - button "加入今日菜单" [ref=f1e33] [cursor=pointer]
      - generic [ref=f1e34]: 这是认识新菜单，不是考试。随时可请大咪帮忙。
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { choosePrep, evidencePath, handOver, hot, lesson, make, state, tap } from './helpers';
  3   | 
  4   | test.use({ hasTouch: true });
  5   | test.afterEach(async ({ page }, info) => {
  6   |   if (info.status !== info.expectedStatus) {
  7   |     await info.attach('actual-failure-state', {
  8   |       body: JSON.stringify(await state(page), null, 2),
  9   |       contentType: 'application/json',
  10  |     });
  11  |   }
  12  | });
  13  | // These cases inspect the full visual process; CI's low-graphics preference is
  14  | // valid, but has a separate receipt/idempotence case below.
  15  | test.beforeEach(async ({ page }, info) => {
  16  |   if (/visible activity entrance|desktop feast exposes/.test(info.title)) {
  17  |     await page.emulateMedia({ reducedMotion: 'no-preference' });
  18  |     await page.addInitScript(() => localStorage.setItem('tabby.foodtruck.lowGraphics', 'false'));
  19  |   }
  20  | });
  21  | 
  22  | async function kitchen(page: Page) {
  23  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  24  |   await lesson(page);
  25  | }
  26  | async function table(page: Page) {
  27  |   await lesson(page);
> 28  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
      |                                                                 ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  29  | }
  30  | async function send(page: Page, index: number, product: Parameters<typeof make>[1]) {
  31  |   await lesson(page);
  32  |   const order = (await state(page)).orders[index];
  33  |   if (order?.status === 'queued') {
  34  |     await table(page);
  35  |     await page
  36  |       .getByRole('button', {
  37  |         name: order.visitor === 'hedgehog' ? '先帮刺刺' : '先帮兔兔',
  38  |         exact: true,
  39  |       })
  40  |       .click();
  41  |     await kitchen(page);
  42  |   }
  43  |   const orderId = order?.id;
  44  |   if (product === 'apple' || product === 'banana') {
  45  |     if ((await state(page)).session.family !== 'juice') await tap(page, 'family-juice');
  46  |     await choosePrep(page, '● 1号盘');
  47  |     await tap(page, `supply-${product}`);
  48  |   } else {
  49  |     await choosePrep(page, '● 1号盘');
  50  |     await make(page, product);
  51  |   }
  52  |   const activeOrder = (await state(page)).orders.find((o) => o.id === orderId);
  53  |   if (!activeOrder || activeOrder.status !== 'waiting')
  54  |     throw Error('chosen friend was not admitted');
  55  |   await handOver(page, activeOrder.seat);
  56  |   await expect
  57  |     .poll(async () => (await state(page)).orders.find((o) => o.id === orderId)?.status ?? 'done', {
  58  |       timeout: 20000,
  59  |     })
  60  |     .toBe('done');
  61  |   await lesson(page);
  62  | }
  63  | async function begin(page: Page) {
  64  |   await page.goto('/');
  65  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  66  | }
  67  | 
  68  | test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  69  |   page,
  70  | }) => {
  71  |   test.setTimeout(900000);
  72  |   page.setDefaultTimeout(30000);
  73  |   const walkStarted = Date.now();
  74  |   await page.setViewportSize({ width: 1280, height: 720 });
  75  |   await begin(page);
  76  |   await kitchen(page);
  77  |   await send(page, 0, 'apple');
  78  |   await send(page, 1, 'banana');
  79  |   await table(page);
  80  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  81  |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  82  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  83  |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  84  |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  85  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  86  |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  87  |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  88  |   for (let stage = 0; stage < 5; stage++)
  89  |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`), { timeout: 15000 });
  90  |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  91  |     timeout: 15000,
  92  |   });
  93  |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  94  |   await page.screenshot({
  95  |     path: evidencePath('docs/evidence/adventure-experience-02/breakfast-friends-desktop.png'),
  96  |   });
  97  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  98  |   await kitchen(page);
  99  |   await send(page, 0, 'vanilla-cone');
  100 |   await make(page, 'strawberry-cup');
  101 |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  102 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  103 |   await table(page);
  104 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  105 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  106 |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  107 |   await page.getByRole('button', { name: '选择草莓冰淇淋杯', exact: true }).click();
  108 |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  109 |   await page.getByRole('button', { name: '挂上清凉彩旗', exact: true }).click();
  110 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  111 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  112 |   await kitchen(page);
  113 |   await send(page, 0, 'sandwich');
  114 |   await table(page);
  115 |   await page.getByRole('button', { name: '检查野餐篮', exact: true }).click();
  116 |   await kitchen(page);
  117 |   await make(page, 'sandwich');
  118 |   await tap(page, 'family-juice');
  119 |   await choosePrep(page, '● 1号盘');
  120 |   await tap(page, 'supply-banana');
  121 |   await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  122 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  123 |   await send(page, 1, 'salad-sandwich');
  124 |   await table(page);
  125 |   await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  126 |   await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  127 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  128 |   await page.screenshot({
```