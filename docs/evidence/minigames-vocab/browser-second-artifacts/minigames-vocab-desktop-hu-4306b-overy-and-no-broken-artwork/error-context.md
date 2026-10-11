# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: minigames-vocab.spec.ts >> desktop hunt, actual two-item delivery, recovery and no broken artwork
- Location: e2e/minigames-vocab.spec.ts:48:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '交付找到的物件' })
    - locator resolved to <button type="button" aria-label="交付找到的物件" class="delivery-basket">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" class="primary">继续玩</button> from <div role="dialog" aria-label="小游戏已暂停" class="scene-overlay">…</div> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" class="primary">继续玩</button> from <div role="dialog" aria-label="小游戏已暂停" class="scene-overlay">…</div> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    - waiting for element to be visible, enabled and stable
    - element is visible, enabled and stable
    - scrolling into view if needed
    - done scrolling
    - <button type="button" class="primary">继续玩</button> from <div role="dialog" aria-label="小游戏已暂停" class="scene-overlay">…</div> subtree intercepts pointer events
  - retrying click action
    - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - region "小院寻物 · 朋友的两份心意" [ref=f1e6]:
    - generic [ref=f1e7]:
      - button "返回游乐角" [ref=f1e8] [cursor=pointer]
      - heading "小院寻物 再相见 · 2/3" [level=2] [ref=f1e9]:
        - text: 小院寻物
        - generic [ref=f1e10]: 再相见 · 2/3
      - button "暂停小游戏" [ref=f1e11] [cursor=pointer]: 暂停
    - generic [ref=f1e12]:
      - generic [ref=f1e13]:
        - button "重听场景请求" [ref=f1e14] [cursor=pointer]
        - paragraph [ref=f1e18]: Bring me a book, please.
        - button "看图示范" [ref=f1e19] [cursor=pointer]
      - generic [ref=f1e20]:
        - img "大咪响应你做的动作"
        - generic [ref=f1e21]:
          - generic [ref=f1e22]:
            - generic [ref=f1e24]:
              - img "树"
            - generic [ref=f1e25]:
              - generic [ref=f1e26]:
                - img "架子"
              - generic [ref=f1e27]:
                - button "拿起叶子" [ref=f1e28] [cursor=pointer]:
                  - generic [ref=f1e29]:
                    - img "叶子"
                - button "拿起球" [ref=f1e30] [cursor=pointer]:
                  - generic [ref=f1e31]:
                    - img "球"
          - group "大咪手里的物件" [ref=f1e32]:
            - generic [ref=f1e33]:
              - img "书"
            - generic [aria-hidden] [ref=f1e34]: →
            - button "放回物件" [ref=f1e35] [cursor=pointer]: 放回
          - button "交付找到的物件" [ref=f1e36] [cursor=pointer]:
            - generic [ref=f1e37]:
              - img "篮子"
            - generic [ref=f1e38]: 交给篮子
      - button "撤回一步" [ref=f1e40] [cursor=pointer]
      - status [ref=f1e41]
      - generic [ref=f1e42]:
        - button "重玩这一组" [ref=f1e43] [cursor=pointer]
        - generic [ref=f1e44]: 开发语音未听审 · 没有计时与能力评分
    - dialog "小游戏已暂停" [ref=f1e45]:
      - heading "休息一会儿" [level=3] [ref=f1e46]
      - button "继续玩" [ref=f1e47] [cursor=pointer]
      - button "回游乐角" [ref=f1e48] [cursor=pointer]
```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { wordById } from '../src/content/learning';
  3   | 
  4   | test.setTimeout(180000);
  5   | const enter = async (page: Page) => {
  6   |   await page.goto('/');
  7   |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  8   |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  9   | };
  10  | const choose = async (page: Page, kind: string, title: string) => {
  11  |   await page
  12  |     .getByRole('button', { name: new RegExp(kind) })
  13  |     .first()
  14  |     .click();
  15  |   await page.getByRole('button', { name: new RegExp(title) }).click();
  16  |   await page.getByRole('button', { name: '先认识今天的物件' }).click();
  17  |   await page.getByRole('button', { name: '我来动手' }).click();
  18  | };
  19  | const meaning = async (page: Page) => {
  20  |   if (await page.getByRole('button', { name: '我来动手' }).isVisible())
  21  |     await page.getByRole('button', { name: '我来动手' }).click();
  22  | };
  23  | const take = async (page: Page, name: string) => {
  24  |   await page.getByRole('button', { name: `拿起${name}`, exact: true }).click();
  25  | };
  26  | const place = async (page: Page, name: string) => {
  27  |   await page.getByRole('button', { name: `放到${name}`, exact: true }).click();
  28  | };
  29  | const check = async (page: Page) => {
  30  |   await page.getByRole('button', { name: '给大咪看看' }).click();
  31  |   await expect(page.getByRole('button', { name: '下一段活动' })).toBeVisible();
  32  |   await page.getByRole('button', { name: '下一段活动' }).click();
  33  | };
  34  | const images = async (page: Page) => {
  35  |   await expect
  36  |     .poll(() =>
  37  |       page
  38  |         .locator('.scene-game img, .scene-lobby img')
  39  |         .evaluateAll((imgs) =>
  40  |           imgs.every(
  41  |             (i) => (i as HTMLImageElement).complete && (i as HTMLImageElement).naturalWidth > 0,
  42  |           ),
  43  |         ),
  44  |     )
  45  |     .toBe(true);
  46  | };
  47  | 
  48  | test('desktop hunt, actual two-item delivery, recovery and no broken artwork', async ({ page }) => {
  49  |   await page.setViewportSize({ width: 1440, height: 900 });
  50  |   await enter(page);
  51  |   await choose(page, '小院寻物', '朋友的两份心意');
  52  |   await images(page);
  53  |   await take(page, '杯子');
  54  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  55  |   await expect(page.getByRole('button', { name: '下一段活动' })).toHaveCount(0);
  56  |   await take(page, '勺子');
  57  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  58  |   await page.getByRole('button', { name: '下一段活动' }).click();
  59  |   await meaning(page);
  60  |   await take(page, '书');
  61  |   await page.getByRole('button', { name: '暂停小游戏' }).click();
  62  |   await expect(page.getByRole('dialog', { name: '小游戏已暂停' })).toBeVisible();
  63  |   await page.getByRole('button', { name: '继续玩' }).click();
  64  |   await page.reload();
  65  |   await page.getByRole('button', { name: '迷你游戏', exact: true }).click();
  66  |   await page.getByRole('button', { name: /小院场景小游戏 ·/ }).click();
  67  |   await page.getByRole('button', { name: /朋友的两份心意/ }).click();
  68  |   await expect(page.getByRole('group', { name: '大咪手里的物件' })).toContainText('放回');
> 69  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
      |                                                       ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  70  |   await page.getByRole('button', { name: '下一段活动' }).click();
  71  |   await meaning(page);
  72  |   await take(page, '花');
  73  |   await page.getByRole('button', { name: '交付找到的物件' }).click();
  74  |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/hunt-desktop.png' });
  75  |   await page.getByRole('button', { name: '下一段活动' }).click();
  76  |   await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  77  | });
  78  | 
  79  | test('phone memory supports relook and classifies a wrong replacement separately', async ({
  80  |   page,
  81  | }) => {
  82  |   await page.setViewportSize({ width: 393, height: 665 });
  83  |   await enter(page);
  84  |   await choose(page, '餐桌少了什么', '看看两件');
  85  |   await images(page);
  86  |   await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  87  |   await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  88  |   await take(page, '勺子');
  89  |   await page.getByRole('button', { name: '补回餐桌' }).click();
  90  |   await page.getByRole('button', { name: '给大咪看看' }).click();
  91  |   await expect(page.locator('.scene-feedback')).toContainText('再看');
  92  |   await page.getByRole('button', { name: '再看一眼' }).click();
  93  |   await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  94  |   await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  95  |   for (const word of ['杯子', '碗', '花']) {
  96  |     await take(page, word);
  97  |     await page.getByRole('button', { name: '补回餐桌' }).click();
  98  |     await check(page);
  99  |     if (word !== '花') {
  100 |       await meaning(page);
  101 |       await page.getByRole('button', { name: '看好了，盖上再找' }).click();
  102 |       await page.getByRole('button', { name: '揭开餐桌看看' }).click();
  103 |     }
  104 |   }
  105 |   const saved = await page.evaluate(() =>
  106 |     JSON.parse(localStorage.getItem('tabby.foodtruck.scene-mini.v1') ?? '{}'),
  107 |   );
  108 |   expect(saved.scenes['memory-0'].attempts[0].dimension).toBe('memory');
  109 |   expect(saved.scenes['memory-0'].support).toContain('memory-relook');
  110 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/memory-phone.png' });
  111 | });
  112 | 
  113 | test('phone sorting accepts both-use containers without English penalties for incomplete moves', async ({
  114 |   page,
  115 | }) => {
  116 |   await page.setViewportSize({ width: 393, height: 665 });
  117 |   await enter(page);
  118 |   await choose(page, '小仓库整理', '一物多用');
  119 |   await take(page, '篮子');
  120 |   await place(page, '花园');
  121 |   await page.getByRole('button', { name: '给大咪看看' }).click();
  122 |   await expect(page.locator('.scene-feedback')).toContainText('还有');
  123 |   for (const [word, target] of [
  124 |     ['倒水壶', '花园'],
  125 |     ['浇水壶', '花园'],
  126 |   ]) {
  127 |     await take(page, word ?? '');
  128 |     await place(page, target ?? '');
  129 |   }
  130 |   await check(page);
  131 |   await meaning(page);
  132 |   for (const [word, target] of [
  133 |     ['袋子', '厨房'],
  134 |     ['餐巾', '厨房'],
  135 |     ['叶子', '花园'],
  136 |   ]) {
  137 |     await take(page, word ?? '');
  138 |     await place(page, target ?? '');
  139 |   }
  140 |   await check(page);
  141 |   await meaning(page);
  142 |   for (const [word, target] of [
  143 |     ['盒子', '花园'],
  144 |     ['瓶子', '厨房'],
  145 |     ['书', '木架'],
  146 |   ]) {
  147 |     await take(page, word ?? '');
  148 |     await place(page, target ?? '');
  149 |   }
  150 |   await page.screenshot({ path: 'docs/evidence/minigames-vocab/sort-phone.png' });
  151 |   await images(page);
  152 |   await check(page);
  153 |   await expect(page.getByText('这次小院活动完成了')).toBeVisible();
  154 | });
  155 | 
  156 | test('phone designer spatial targets and saved free mode use actual objects', async ({ page }) => {
  157 |   await page.setViewportSize({ width: 393, height: 665 });
  158 |   await enter(page);
  159 |   await choose(page, '餐桌设计师', '上下里面旁边');
  160 |   for (const [word, target] of [
  161 |     ['杯子', '桌上'],
  162 |     ['球', '篮内'],
  163 |     ['球', '桌下'],
  164 |     ['椅子', '桌边'],
  165 |   ]) {
  166 |     await take(page, word ?? '');
  167 |     await place(page, target ?? '');
  168 |     await check(page);
  169 |     if (word !== '椅子') await meaning(page);
```