# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: experience.spec.ts >> less support keeps the order answer private until failed speech provides recorded picture help
- Location: e2e/experience.spec.ts:36:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '旧食谱 · 回访活动与作品', exact: true })
    - locator resolved to <button type="button" class="yard-activity-badge">旧食谱 · 回访活动与作品</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-label="迷你游戏" class="entry-main">…</button> from <div class="yard-entry yard-mini">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-label="迷你游戏" class="entry-main">…</button> from <div class="yard-entry yard-mini">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    8 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-label="迷你游戏" class="entry-main">…</button> from <div class="yard-entry yard-mini">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "餐车小院" [ref=e6]:
    - generic [ref=e7]:
      - text: DAMI'S LITTLE KITCHEN
      - heading "大咪的英语餐车" [level=1] [ref=e8]
    - button "设置" [ref=e9] [cursor=pointer]: ⚙
    - img "小主厨大咪" [ref=e10]
    - generic [ref=e11]:
      - button "正在准备 · 晨光开门" [ref=e12] [cursor=pointer]:
        - generic [ref=e14]: 送早餐，找到花苗，一起种迎客花
      - button "听正在准备 · 晨光开门" [ref=e15] [cursor=pointer]: ♫
    - generic [ref=e16]:
      - button "自由开店" [ref=e17] [cursor=pointer]:
        - generic [ref=e19]: 今天也有新朋友
      - button "听自由开店" [ref=e20] [cursor=pointer]: ♫
    - button "旧食谱 · 回访活动与作品" [ref=e21] [cursor=pointer]
    - generic [ref=e22]:
      - button "教学练习" [ref=e23] [cursor=pointer]:
        - generic [ref=e25]: 看大咪做，再亲手试试
      - button "听教学练习" [ref=e26] [cursor=pointer]: ♫
    - generic [ref=e27]:
      - button "迷你游戏" [ref=e28] [cursor=pointer]:
        - generic [ref=e30]: 听一听 · 找一找 · 拼一拼
      - button "听迷你游戏" [ref=e31] [cursor=pointer]: ♫
    - generic: 开发素材与语音待审核
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { choosePrep, lesson, make, state } from './helpers';
  3  | 
  4  | test.use({ hasTouch: true });
  5  | test('single guest goal has a complete picture path before reading or hearing', async ({
  6  |   page,
  7  | }) => {
  8  |   await page.setViewportSize({ width: 393, height: 665 });
  9  |   await page.goto('/');
  10 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  11 |   await expect(page.getByRole('region', { name: '图示下一步' })).toBeVisible();
  12 |   await expect(page.locator('.goal-pictures svg')).not.toHaveCount(0);
  13 |   expect((await state(page)).session.concurrency).toBe(1);
  14 |   await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  15 |   expect((await state(page)).orders.find((o) => o.visitor === 'hedgehog')?.status).toBe('waiting');
  16 |   await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
  17 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  18 |   await lesson(page);
  19 |   await choosePrep(page, '● 1号盘');
  20 |   await make(page, 'banana');
  21 |   await expect.poll(async () => (await state(page)).actor.current).toBeNull();
  22 |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  23 |   const before = await state(page);
  24 |   await page.getByRole('button', { name: '一起接待两位', exact: true }).click();
  25 |   await page.getByRole('button', { name: '一次接待一位', exact: true }).click();
  26 |   const after = await state(page);
  27 |   expect(after.orders.filter((o) => o.status === 'waiting')).toHaveLength(2);
  28 |   expect(after.orders.map((o) => [o.id, o.visitor, o.request])).toEqual(
  29 |     before.orders.map((o) => [o.id, o.visitor, o.request]),
  30 |   );
  31 |   expect(after.items).toEqual(before.items);
  32 |   expect(after.adventure).toEqual(before.adventure);
  33 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/single-dual-phone.png' });
  34 | });
  35 | 
  36 | test('less support keeps the order answer private until failed speech provides recorded picture help', async ({
  37 |   page,
  38 | }) => {
  39 |   await page.setViewportSize({ width: 393, height: 665 });
  40 |   await page.goto('/');
> 41 |   await page.getByRole('button', { name: '旧食谱 · 回访活动与作品', exact: true }).click();
     |                                                                          ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  42 |   await page.getByRole('button', { name: '跳过序章', exact: true }).click();
  43 |   await page.getByRole('button', { name: '少些帮助，听一听', exact: true }).click();
  44 |   await page.getByRole('button', { name: '晨光开门', exact: true }).click();
  45 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  46 |   expect((await state(page)).session.support).toBe('less');
  47 |   await expect(page.locator('.goal-guide .food-art')).toHaveCount(0);
  48 |   await page.route('**/world-kitchen.wav**', (route) => route.abort());
  49 |   await page.getByRole('button', { name: '重听下一步', exact: true }).click();
  50 |   await expect(page.locator('.goal-guide .food-art')).toHaveCount(1);
  51 |   await expect
  52 |     .poll(async () =>
  53 |       (await state(page)).orders
  54 |         .find((o) => o.status === 'waiting')
  55 |         ?.support.includes('audio-unavailable'),
  56 |     )
  57 |     .toBe(true);
  58 |   await page.getByRole('button', { name: '看看怎么行动', exact: true }).click();
  59 |   await expect(page.locator('.guide-demonstration')).toBeVisible();
  60 |   await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
  61 |   await page.screenshot({
  62 |     path: 'docs/evidence/adventure-experience-02/failed-speech-pictures-phone.png',
  63 |   });
  64 | });
  65 | 
  66 | test('muting through visible settings retains picture goals and safe replay', async ({ page }) => {
  67 |   await page.setViewportSize({ width: 393, height: 665 });
  68 |   await page.goto('/');
  69 |   await page.getByRole('button', { name: '设置', exact: true }).click();
  70 |   await page.getByRole('checkbox', { name: '全部声音', exact: true }).uncheck();
  71 |   await page.getByRole('button', { name: '返回', exact: false }).click();
  72 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  73 |   await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  74 |   await expect(page.locator('.goal-guide .food-art')).toHaveCount(1);
  75 |   const before = await state(page);
  76 |   await page.getByRole('button', { name: '重听下一步', exact: true }).click();
  77 |   await expect.poll(async () => (await state(page)).audio.at(-1)?.status).toBe('muted');
  78 |   expect((await state(page)).adventure).toEqual(before.adventure);
  79 |   await expect(page.getByRole('button', { name: '去厨房备餐', exact: true })).toBeInViewport();
  80 | });
  81 | 
```