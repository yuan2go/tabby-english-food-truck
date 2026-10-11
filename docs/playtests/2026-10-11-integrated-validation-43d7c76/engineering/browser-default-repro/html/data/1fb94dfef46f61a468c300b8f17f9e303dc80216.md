# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> visible activity entrance reaches all five chapters and saves a real creation
- Location: ../../../../../../../.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/e2e/adventure.spec.ts:52:1

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '正在准备 · 晨光开门', exact: true })
    - locator resolved to <button type="button" class="entry-main" aria-label="正在准备 · 晨光开门">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - performing click action

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "小院活动桌" [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "返回小院" [ref=e9] [cursor=pointer]: ← 小院
        - generic [ref=e10]:
          - heading "晨光开门" [level=2] [ref=e11]
          - paragraph [ref=e12]: 送早餐，找到花苗，一起种迎客花
        - group "活动客流" [ref=e13]:
          - button "一次接待一位" [pressed] [ref=e14] [cursor=pointer]: 👤
          - button "一起接待两位" [ref=e15] [cursor=pointer]: 👥
        - button "去厨房备餐" [ref=e16] [cursor=pointer]
      - generic [ref=e21]:
        - generic [ref=e22]:
          - button "去小院游乐角" [ref=e23] [cursor=pointer]:
            - generic [ref=e25]: 去游乐角 · 随时回来
          - button "打开储物抽屉" [ref=e26] [cursor=pointer]
          - button "翻开旧食谱" [ref=e32] [cursor=pointer]
        - region "图示下一步" [ref=e39]:
          - button "图示下一步：点一位朋友，自己决定先帮谁。" [ref=e40] [cursor=pointer]:
            - generic [aria-hidden] [ref=e47]: ➜
            - generic [aria-hidden] [ref=e52]: ●
          - generic [ref=e53]: 点一位朋友，自己决定先帮谁。
          - button "重听下一步" [ref=e55] [cursor=pointer]: ♫
          - button "看看怎么行动" [ref=e56] [cursor=pointer]: ▶
        - paragraph [ref=e57]: 送早餐，找到花苗，一起种迎客花
        - generic [ref=e58]:
          - img "小主厨大咪" [ref=e59]
          - generic [ref=e60]:
            - img "兔兔" [ref=e61]
            - button "先帮兔兔" [ref=e62] [cursor=pointer]: 👋
          - generic [ref=e63]:
            - img "刺刺" [ref=e64]
            - button "先帮刺刺" [ref=e65] [cursor=pointer]: 👋
        - img "朋友的分享场景" [ref=e66]
        - generic [ref=e76]:
          - button "摆到1号餐位" [ref=e77] [cursor=pointer]
          - button "摆到2号餐位" [ref=e79] [cursor=pointer]
          - button "摆到3号餐位" [ref=e81] [cursor=pointer]
        - region "真实送到活动桌的食物" [ref=e83]
      - generic [ref=e90]:
        - status [ref=e91]: 送早餐，找到花苗，一起种迎客花
        - generic [ref=e92]:
          - button "一起开席" [disabled] [ref=e93]
          - button "收摊回小院" [ref=e98] [cursor=pointer]
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
> 49  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
      |                                                                        ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  50  | }
  51  | 
  52  | test('visible activity entrance reaches all five chapters and saves a real creation', async ({
  53  |   page,
  54  | }) => {
  55  |   test.setTimeout(900000);
  56  |   page.setDefaultTimeout(30000);
  57  |   const walkStarted = Date.now();
  58  |   await page.setViewportSize({ width: 1280, height: 720 });
  59  |   await begin(page);
  60  |   await kitchen(page);
  61  |   await send(page, 0, 'apple');
  62  |   await send(page, 1, 'banana');
  63  |   await table(page);
  64  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  65  |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  66  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  67  |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  68  |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  69  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  70  |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  71  |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  72  |   for (let stage = 0; stage < 5; stage++)
  73  |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`), { timeout: 15000 });
  74  |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  75  |     timeout: 15000,
  76  |   });
  77  |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  78  |   await page.screenshot({
  79  |     path: 'docs/evidence/adventure-experience-02/breakfast-friends-desktop.png',
  80  |   });
  81  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  82  |   await kitchen(page);
  83  |   await send(page, 0, 'vanilla-cone');
  84  |   await make(page, 'strawberry-cup');
  85  |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  86  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  87  |   await table(page);
  88  |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  89  |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  90  |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  91  |   await page.getByRole('button', { name: '选择草莓冰淇淋杯', exact: true }).click();
  92  |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  93  |   await page.getByRole('button', { name: '挂上清凉彩旗', exact: true }).click();
  94  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  95  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  96  |   await kitchen(page);
  97  |   await send(page, 0, 'sandwich');
  98  |   await table(page);
  99  |   await page.getByRole('button', { name: '检查野餐篮', exact: true }).click();
  100 |   await kitchen(page);
  101 |   await make(page, 'sandwich');
  102 |   await tap(page, 'family-juice');
  103 |   await choosePrep(page, '● 1号盘');
  104 |   await tap(page, 'supply-banana');
  105 |   await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  106 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  107 |   await send(page, 1, 'salad-sandwich');
  108 |   await table(page);
  109 |   await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  110 |   await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  111 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  112 |   await page.screenshot({
  113 |     path: 'docs/evidence/adventure-experience-02/picnic-rabbit-desktop.png',
  114 |   });
  115 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  116 |   await kitchen(page);
  117 |   await send(page, 0, 'cheese-burger');
  118 |   await send(page, 1, 'juice');
  119 |   await table(page);
  120 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  121 |   await page.getByRole('button', { name: '取出灯串', exact: true }).click();
  122 |   await page.getByRole('button', { name: '请兔兔带灯', exact: true }).click();
  123 |   await page.getByRole('button', { name: '选择芝士汉堡', exact: true }).click();
  124 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  125 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  126 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  127 |   await page.getByRole('button', { name: '点亮暖灯', exact: true }).click();
  128 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  129 |   console.log('EVIDENCE_DINNER_START_SECONDS', (Date.now() - walkStarted) / 1000);
  130 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  131 |     timeout: 15000,
  132 |   });
  133 |   await expect(feast).toHaveClass(/sip/);
  134 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  135 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/dinner-drink-desktop.png' });
  136 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  137 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  138 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  139 |   await kitchen(page);
  140 |   await choosePrep(page, '● 1号盘');
  141 |   await make(page, 'sandwich');
  142 |   await make(page, 'juice');
  143 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  144 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  145 |   await table(page);
  146 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  147 |   await page.getByRole('button', { name: '分享给兔兔', exact: true }).click();
  148 |   await page.getByRole('button', { name: '品尝芝士三明治', exact: true }).click();
  149 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
```