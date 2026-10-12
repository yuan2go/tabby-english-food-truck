# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: direct-cooking.spec.ts >> direct mini entry visibly presents recorded meanings and keeps free design reachable
- Location: e2e/direct-cooking.spec.ts:57:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '餐桌设计师', exact: true })

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "同桌场景画面" [ref=e4]
  - region "小院场景小游戏" [ref=e6]:
    - generic [ref=e7]:
      - button "返回游戏小摊" [ref=e8] [cursor=pointer]
      - heading "大咪的小院游乐角" [level=2] [ref=e9]
      - button "听游乐角引导" [ref=e10] [cursor=pointer]
    - generic [ref=e14]:
      - button "篮子 小院寻物" [pressed] [ref=e15] [cursor=pointer]:
        - generic [ref=e16]:
          - img "篮子"
        - generic [ref=e17]: 小院寻物
      - button "盘子 餐桌少了什么" [ref=e18] [cursor=pointer]:
        - generic [ref=e19]:
          - img "盘子"
        - generic [ref=e20]: 餐桌少了什么
      - button "架子 小仓库整理" [ref=e21] [cursor=pointer]:
        - generic [ref=e22]:
          - img "架子"
        - generic [ref=e23]: 小仓库整理
      - button "桌子 餐桌设计师" [ref=e24] [cursor=pointer]:
        - generic [ref=e25]:
          - img "桌子"
        - generic [ref=e26]: 餐桌设计师
      - button "Open the box. 大咪动作小剧场" [ref=e27] [cursor=pointer]:
        - img "Open the box." [ref=e28]:
          - generic [ref=e30]:
            - img "桌子"
          - img "大咪演示" [ref=e31]
          - generic [ref=e33]:
            - img "盒子"
        - generic [ref=e35]: 大咪动作小剧场
    - generic [ref=e36]:
      - button "先认识 小院寻物 · 帮大咪拿东西 开始这一组" [ref=e37] [cursor=pointer]:
        - generic [ref=e38]: 先认识
        - strong [ref=e39]: 小院寻物 · 帮大咪拿东西
        - generic [ref=e40]: 开始这一组
      - button "换一种玩法 小院寻物 · 换个地方找 开始这一组" [ref=e41] [cursor=pointer]:
        - generic [ref=e42]: 换一种玩法
        - strong [ref=e43]: 小院寻物 · 换个地方找
        - generic [ref=e44]: 开始这一组
      - button "再相见 小院寻物 · 朋友的两份心意 开始这一组" [ref=e45] [cursor=pointer]:
        - generic [ref=e46]: 再相见
        - strong [ref=e47]: 小院寻物 · 朋友的两份心意
        - generic [ref=e48]: 开始这一组
    - paragraph [ref=e49]: 点物件，再点要去的地方。随时重听、看图、撤回或回小院。
    - generic [ref=e50]: 开发语音未听审；完成活动不代表英语掌握率。
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { targetWord } from '../src/rules/minigames';
  3  | import { state } from './helpers';
  4  | 
  5  | test.use({ viewport: { width: 393, height: 665 }, hasTouch: true, isMobile: true });
  6  | test('single scoop uses four real actions and a different dessert is tasted on the scene', async ({
  7  |   page,
  8  | }) => {
  9  |   await page.goto('/');
  10 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  11 |   for (const [friend, food] of [
  12 |     ['兔兔', '苹果'],
  13 |     ['刺刺', '香蕉'],
  14 |   ]) {
  15 |     await page.getByRole('button', { name: '先帮' + friend, exact: true }).click();
  16 |     await page.getByRole('button', { name: '拿起' + food, exact: true }).click();
  17 |     await page.getByRole('button', { name: '交给' + friend, exact: true }).click();
  18 |     await expect
  19 |       .poll(
  20 |         async () =>
  21 |           (await state(page)).orders.find(
  22 |             (o) => o.visitor === (friend === '兔兔' ? 'rabbit' : 'hedgehog'),
  23 |           )?.status,
  24 |       )
  25 |       .toBe('done');
  26 |   }
  27 |   await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  28 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  29 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  30 |   await page.getByRole('button', { name: '冰淇淋：蛋筒', exact: true }).click();
  31 |   await page.getByRole('button', { name: '冰淇淋：香草球', exact: true }).click();
  32 |   expect((await state(page)).items.map((i) => i.product)).toEqual(['vanilla-cone']);
  33 |   await expect(page.getByRole('button', { name: '启动冰淇淋台', exact: true })).toHaveCount(0);
  34 |   await page.getByRole('button', { name: '拿起香草蛋筒', exact: true }).click();
  35 |   await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  36 |   await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  37 |   await page.getByRole('button', { name: '冰淇淋：空杯', exact: true }).click();
  38 |   await page.getByRole('button', { name: '冰淇淋：草莓球', exact: true }).click();
  39 |   await page.getByRole('button', { name: '拿起草莓冰淇淋杯', exact: true }).click();
  40 |   await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  41 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  42 |   await page.getByRole('button', { name: '比较两份甜点', exact: true }).click();
  43 |   await page.getByRole('button', { name: '品尝草莓冰淇淋杯', exact: true }).click();
  44 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  45 |   expect((await state(page)).adventure?.rewards).toEqual(['bunting-page']);
  46 |   expect((await state(page)).adventure?.explored).not.toContain('recipe');
  47 | });
  48 | test('free kitchen starts at once and configuration is optional', async ({ page }) => {
  49 |   await page.goto('/');
  50 |   await page.locator('.yard-endless .entry-main').click();
  51 |   await expect(page.getByRole('region', { name: '同桌厨房', exact: true })).toBeVisible();
  52 |   await expect(page.getByRole('region', { name: '自由开店菜单', exact: true })).toHaveCount(0);
  53 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  54 |   await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  55 |   await expect(page.getByRole('region', { name: '自由开店菜单', exact: true })).toBeVisible();
  56 | });
  57 | test('direct mini entry visibly presents recorded meanings and keeps free design reachable', async ({
  58 |   page,
  59 | }) => {
  60 |   await page.goto('/');
  61 |   await page.locator('.yard-mini .entry-main').click();
  62 |   await page.getByRole('button', { name: /食物找朋友 听一题/ }).click();
  63 |   const mini = await page.evaluate(
  64 |     () =>
  65 |       JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21') ?? '{}').sessions[
  66 |         document.querySelector<HTMLElement>('[data-mini-key]')?.dataset.miniKey ?? ''
  67 |       ],
  68 |   );
  69 |   const word = targetWord(mini);
  70 |   expect(mini.support).toContain('meaning-picture');
  71 |   await expect(page.getByRole('region', { name: '食物与英文名字' })).toContainText(word.text);
  72 |   await expect(page.getByRole('region', { name: '食物与英文名字' }).locator('img')).toBeVisible();
  73 |   await page.getByRole('button', { name: '← 回游戏小摊' }).click();
  74 |   await page.getByRole('button', { name: /A B C WordSpell/ }).click();
  75 |   await expect(page.locator('.spell-model')).toBeVisible();
  76 |   await page.getByRole('button', { name: '← 回游戏小摊' }).click();
  77 |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
> 78 |   await page.getByRole('button', { name: '餐桌设计师', exact: true }).click();
     |                                                                  ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  79 |   await page.getByRole('button', { name: /上下里面旁边/ }).click();
  80 |   await expect(page.getByRole('region', { name: '场景物件与英文' })).toBeVisible();
  81 |   await page.getByRole('button', { name: '自由布置餐桌', exact: true }).click();
  82 |   const scenes = await page.evaluate(
  83 |     () =>
  84 |       JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}').scenes['design-0'],
  85 |   );
  86 |   expect(scenes.mode).toBe('free');
  87 |   expect(scenes.attempts).toHaveLength(0);
  88 | });
  89 | 
```