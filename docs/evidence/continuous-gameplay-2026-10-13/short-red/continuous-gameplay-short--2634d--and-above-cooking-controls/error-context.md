# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: continuous-gameplay.spec.ts >> short landscape keeps the current full sentence inside its bubble and above cooking controls
- Location: e2e/continuous-gameplay.spec.ts:60:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "同桌场景画面" [ref=e4]
  - region "同桌厨房" [ref=e6]:
    - generic [ref=e7]:
      - generic:
        - generic: 早餐派对
        - region "第1章，第1波：一份早餐":
          - generic: 一份早餐
        - button "暂停" [ref=e8] [cursor=pointer]: Ⅱ
      - region "朋友实际使用食品":
        - generic:
          - generic [ref=e10]:
            - button "重听兔兔：Can I have an apple, please?" [ref=e11] [cursor=pointer]:
              - text: Can I have an
              - strong [ref=e12]: apple
              - text: ", please?"
            - button "播放整句：Can I have an apple, please?" [ref=e13] [cursor=pointer]: ↻
            - generic [ref=e14]: 正在播放，点击从头重听
          - region "说话者的图示需要" [ref=e15]:
            - button "看图理解兔兔的请求" [ref=e16] [cursor=pointer]:
              - img "苹果"
          - button "听兔兔的请求" [ref=e17] [cursor=pointer]:
            - generic [ref=e18]: 兔兔
          - button "兔兔的接餐盘" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 兔兔面前的接餐盘
        - generic:
          - button "和刺刺说话" [ref=e21] [cursor=pointer]:
            - generic [ref=e22]: 刺刺
          - button "刺刺的接餐盘" [ref=e23] [cursor=pointer]:
            - generic [ref=e24]: 刺刺面前的接餐盘
      - generic [ref=e25]:
        - button "打开储物抽屉" [ref=e26] [cursor=pointer]
        - button "翻开旧食谱" [ref=e27] [cursor=pointer]
      - generic [ref=e30]:
        - button "放到制作承放区" [ref=e31] [cursor=pointer]
        - region "可直接拿取的水果" [ref=e32]:
          - button "拿起苹果" [ref=e33] [cursor=pointer]:
            - img "苹果"
          - button "拿起香蕉" [ref=e34] [cursor=pointer]:
            - img "香蕉"
      - region "手中真实物件"
      - status: 可以看图、重听，慢慢准备。
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { state } from './helpers';
  3  | 
  4  | test.use({ viewport: { width: 393, height: 665 }, hasTouch: true });
  5  | test('natural entrance, clear wave goal and receipt feedback need no welcome or finish buttons', async ({
  6  |   page,
  7  | }) => {
  8  |   await page.goto('/');
  9  |   await page.locator('.yard-story .entry-main').click();
  10 |   await expect(page.locator('.story-progress')).toBeVisible();
  11 |   await expect(
  12 |     page.getByRole('button', { name: /先帮|一起吃早餐|一起开席|下一院活动/ }),
  13 |   ).toHaveCount(0);
  14 |   await expect(page.getByRole('region', { name: '果汁机', exact: true })).toHaveCount(0);
  15 |   await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  16 |   await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  17 |   await expect(page.locator('.receive-reward')).toBeVisible();
  18 |   await expect
  19 |     .poll(async () => (await state(page)).adventure?.foods.some((f) => f.product === 'apple'))
  20 |     .toBe(true);
  21 |   await expect
  22 |     .poll(async () =>
  23 |       (await state(page)).orders.some((o) => o.request === 'banana' && o.status === 'waiting'),
  24 |     )
  25 |     .toBe(true);
  26 |   await expect
  27 |     .poll(
  28 |       async () =>
  29 |         (await state(page)).audio.some((a) => a.order === 'guest-1' && a.status === 'started'),
  30 |       { timeout: 15000 },
  31 |     )
  32 |     .toBe(true);
  33 | });
  34 | test('leaving during a chapter reward resumes the same real kitchen and keeps an extra fruit', async ({
  35 |   page,
  36 | }) => {
  37 |   test.setTimeout(90000);
  38 |   const { serve, supply } = await import('./helpers');
  39 |   await page.goto('/');
  40 |   await page.locator('.yard-story .entry-main').click();
  41 |   for (let i = 0; i < 4; i++) {
  42 |     await expect
  43 |       .poll(async () => (await state(page)).orders.some((o) => o.status === 'waiting'))
  44 |       .toBe(true);
  45 |     await serve(page);
  46 |   }
  47 |   await expect.poll(async () => (await state(page)).adventure?.flow?.phase).toBe('reward');
  48 |   await supply(page, 'banana');
  49 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  50 |   const before = await state(page);
  51 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  52 |   await expect(page.locator('.yard-story .entry-main')).toHaveAttribute(
  53 |     'aria-label',
  54 |     '正在准备 · 早餐派对',
  55 |   );
  56 |   await page.locator('.yard-story .entry-main').click();
  57 |   expect((await state(page)).runId).toBe(before.runId);
  58 |   expect((await state(page)).items).toEqual(before.items);
  59 | });
  60 | test('short landscape keeps the current full sentence inside its bubble and above cooking controls', async ({ page }) => {
  61 |   await page.setViewportSize({ width: 665, height: 393 });
  62 |   await page.goto('/');
  63 |   await page.locator('.yard-story .entry-main').click();
  64 |   const sentence = page.locator('.local-bubble:not(.speaker-mini) .sentence-text').first();
  65 |   await expect(sentence).toContainText('Can I have an apple, please?');
  66 |   expect(await sentence.evaluate((el) => {
  67 |     const text = el.getBoundingClientRect();
  68 |     const bubble = el.closest('.local-bubble')!.getBoundingClientRect();
  69 |     const kitchen = document.querySelector('.direct-kitchen')!.getBoundingClientRect();
  70 |     return text.top >= bubble.top && text.bottom <= bubble.bottom && bubble.bottom <= kitchen.top;
> 71 |   })).toBe(true);
     |       ^ Error: expect(received).toBe(expected) // Object.is equality
  72 | });
  73 | 
```