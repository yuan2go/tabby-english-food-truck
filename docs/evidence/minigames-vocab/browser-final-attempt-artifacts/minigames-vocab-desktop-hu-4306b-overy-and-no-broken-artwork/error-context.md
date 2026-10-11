# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> desktop hunt, actual two-item delivery, recovery and no broken artwork
- Location: e2e/minigames-vocab.spec.ts:49:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '迷你游戏', exact: true })
    - locator resolved to <button type="button" aria-label="迷你游戏" class="entry-main">…</button>
  - attempting click action
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "餐车小院" [ref=e6]:
    - generic [ref=e7]:
      - text: DAMI'S LITTLE KITCHEN
      - heading "大咪的英语餐车" [level=1] [ref=e8]
      - paragraph [ref=e9]: 一辆小餐车，一院好朋友。
    - button "设置" [ref=e10] [cursor=pointer]: ⚙
    - img "小主厨大咪" [ref=e11]
    - generic [ref=e12]:
      - button "正在准备 · 晨光开门" [ref=e13] [cursor=pointer]:
        - generic [ref=e15]: 送早餐，找到花苗，一起种迎客花
      - button "听正在准备 · 晨光开门" [ref=e16] [cursor=pointer]: ♫
    - generic [ref=e17]:
      - button "自由开店" [ref=e18] [cursor=pointer]:
        - generic [ref=e20]: 今天也有新朋友
      - button "听自由开店" [ref=e21] [cursor=pointer]: ♫
    - button "旧食谱 · 回访活动与作品" [ref=e22] [cursor=pointer]
    - generic [ref=e23]:
      - button "教学练习" [ref=e24] [cursor=pointer]:
        - generic [ref=e26]: 看大咪做，再亲手试试
      - button "听教学练习" [ref=e27] [cursor=pointer]: ♫
    - generic [ref=e28]:
      - button "迷你游戏" [ref=e29] [cursor=pointer]:
        - generic [ref=e31]: 听一听 · 找一找 · 拼一拼
      - button "听迷你游戏" [ref=e32] [cursor=pointer]: ♫
    - generic: 开发素材与语音待审核
```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { wordById } from '../src/content/learning';
  3   | import { state as worldState } from './helpers';
  4   | 
  5   | test.setTimeout(180000);
  6   | const enter = async (page: Page) => {
  7   |   await page.goto('/');
> 8   |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
      |                                                                 ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  9   |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  10  | };
  11  | const choose = async (page: Page, kind: string, title: string) => {
  12  |   await page
  13  |     .getByRole('button', { name: new RegExp(kind) })
  14  |     .first()
  15  |     .click();
  16  |   await page.getByRole('button', { name: new RegExp(title) }).click();
  17  |   await page.getByRole('button', { name: '先认识今天的物件' }).click();
  18  |   await page.getByRole('button', { name: '我来动手' }).click();
  19  | };
  20  | const meaning = async (page: Page) => {
  21  |   if (await page.getByRole('button', { name: '我来动手' }).isVisible())
  22  |     await page.getByRole('button', { name: '我来动手' }).click();
  23  | };
  24  | const take = async (page: Page, name: string) => {
  25  |   await page.getByRole('button', { name: `拿起${name}`, exact: true }).click();
  26  | };
  27  | const place = async (page: Page, name: string) => {
  28  |   await page.getByRole('button', { name: `放到${name}`, exact: true }).click();
  29  | };
  30  | const check = async (page: Page) => {
  31  |   await page.getByRole('button', { name: '给大咪看看' }).click();
  32  |   await expect(page.getByRole('button', { name: '下一段活动' })).toBeVisible();
  33  |   await page.getByRole('button', { name: '下一段活动' }).click();
  34  | };
  35  | const images = async (page: Page) => {
  36  |   await expect
  37  |     .poll(() =>
  38  |       page
  39  |         .locator('.scene-game img, .scene-lobby img')
  40  |         .evaluateAll((imgs) =>
  41  |           imgs.every(
  42  |             (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
  43  |           ),
  44  |         ),
  45  |     )
  46  |     .toBe(true);
  47  | };
  48  | 
  49  | test('desktop hunt, actual two-item delivery, recovery and no broken artwork', async ({ page }) => {
  50  |   await page.setViewportSize({ width: 1440, height: 900 });
  51  |   await enter(page);
  52  |   await choose(page, '小院寻物', '朋友的两份心意');
  53  |   await images(page);
  54  |   await take(page, '杯子');
  55  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  56  |   await expect(page.getByRole('button', { name: '下一段活动' })).toHaveCount(0);
  57  |   await take(page, '勺子');
  58  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  59  |   await page.getByRole('button', { name: '下一段活动' }).click();
  60  |   await meaning(page);
  61  |   await take(page, '书');
  62  |   await page.getByRole('button', { name: '暂停小游戏' }).click();
  63  |   await expect(page.getByRole('dialog', { name: '小游戏已暂停' })).toBeVisible();
  64  |   await page.getByRole('button', { name: '继续玩' }).click();
  65  |   await page.reload();
  66  |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  67  |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  68  |   await page.getByRole('button', { name: /朋友的两份心意/ }).click();
  69  |   await expect(page.getByRole('group', { name: '大咪手里的物件' })).toContainText('放回');
  70  |   if (await page.getByRole('dialog', { name: '小游戏已暂停' }).isVisible())
  71  |     await page.getByRole('button', { name: '继续玩', exact: true }).click();
  72  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  73  |   await page.getByRole('button', { name: '下一段活动' }).click();
  74  |   await meaning(page);
  75  |   await take(page, '花');
  76  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  77  |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/hunt-desktop.png' });
  78  |   await page.getByRole('button', { name: '下一段活动' }).click();
  79  |   await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  80  | });
  81  | 
  82  | test('phone memory supports relook and classifies a wrong replacement separately', async ({
  83  |   page,
  84  | }) => {
  85  |   await page.setViewportSize({ width: 393, height: 665 });
  86  |   await enter(page);
  87  |   await choose(page, '餐桌少了什么', '看看两件');
  88  |   await images(page);
  89  |   await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  90  |   await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  91  |   await take(page, '勺子');
  92  |   await page.getByRole('button', { name: '补回餐桌' }).click();
  93  |   await page.getByRole('button', { name: '给大咪看看' }).click();
  94  |   await expect(page.locator('.scene-feedback')).toContainText('再看');
  95  |   await page.getByRole('button', { name: '再看一眼' }).click();
  96  |   await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  97  |   await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  98  |   for (const word of ['杯子', '碗', '花']) {
  99  |     await take(page, word);
  100 |     await page.getByRole('button', { name: '补回餐桌' }).click();
  101 |     await check(page);
  102 |     if (word !== '花') {
  103 |       await meaning(page);
  104 |       await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  105 |       await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  106 |     }
  107 |   }
  108 |   const saved = await page.evaluate(() =>
```