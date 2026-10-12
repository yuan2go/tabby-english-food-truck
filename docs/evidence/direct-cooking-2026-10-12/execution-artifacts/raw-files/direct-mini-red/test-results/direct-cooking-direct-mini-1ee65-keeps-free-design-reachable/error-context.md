# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: direct-cooking.spec.ts >> direct mini entry visibly presents recorded meanings and keeps free design reachable
- Location: e2e/direct-cooking.spec.ts:57:1

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: getByRole('region', { name: '食物与英文名字' })
Expected substring: "apple"
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toContainText" getByRole('region', { name: '食物与英文名字' }) with timeout 6000ms
  - waiting for getByRole('region', { name: '食物与英文名字' })

```

```yaml
- main:
  - img "同桌场景画面"
  - region "食物找朋友":
    - button "← 回游戏小摊"
    - button "重新开始"
    - text: 听词找图 · 1 / 4
    - status:
      - text: 声音没播完整，可以重听或看图继续。
      - button "♫ 重试"
      - button "🖼 看图"
    - button "♫ 听一听"
    - button "香蕉":
      - img "香蕉"
    - button "苹果":
      - img "苹果"
    - status
    - button "大咪帮帮我"
    - paragraph: 开发语音未听审 · 没有计时与能力评分
```

# Test source

```ts
  1  | import { expect, test } from '@playwright/test';
  2  | import { state } from './helpers';
  3  | import { targetWord } from '../src/rules/minigames';
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
  57 | test('direct mini entry visibly presents recorded meanings and keeps free design reachable', async ({page}) => {
  58 |   await page.goto('/');
  59 |   await page.locator('.yard-mini .entry-main').click();
  60 |   await page.getByRole('button',{name:/食物找朋友 听一题/}).click();
  61 |   const mini=await page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.minigame.m21')??'{}').sessions[document.querySelector<HTMLElement>('[data-mini-key]')?.dataset.miniKey??'']);
  62 |   const word=targetWord(mini);
  63 |   expect(mini.support).toContain('meaning-picture');
> 64 |   await expect(page.getByRole('region',{name:'食物与英文名字'})).toContainText(word.text);
     |                                                           ^ Error: expect(locator).toContainText(expected) failed
  65 |   await expect(page.getByRole('region',{name:'食物与英文名字'}).locator('img')).toBeVisible();
  66 |   await page.getByRole('button',{name:'← 回游戏小摊'}).click();
  67 |   await page.getByRole('button',{name:/A B C WordSpell/}).click();
  68 |   await expect(page.locator('.spell-model')).toBeVisible();
  69 |   await page.getByRole('button',{name:'← 回游戏小摊'}).click();
  70 |   await page.getByRole('button',{name:/小院场景小游戏 ·/}).click();
  71 |   await page.getByRole('button',{name:'餐桌设计师',exact:true}).click();
  72 |   await page.getByRole('button',{name:/上下里面旁边/}).click();
  73 |   await expect(page.getByRole('region',{name:'场景物件与英文'})).toBeVisible();
  74 |   await page.getByRole('button',{name:'自由布置餐桌',exact:true}).click();
  75 |   const scenes=await page.evaluate(()=>JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1')??'{}').scenes['design-0']);
  76 |   expect(scenes.mode).toBe('free');
  77 |   expect(scenes.attempts).toHaveLength(0);
  78 | });
  79 | 
```