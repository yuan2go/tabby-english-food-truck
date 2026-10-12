# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> visible activity entrance naturally reaches all five chapters and saves a real creation
- Location: e2e/adventure.spec.ts:14:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  locator('.chapter-reward')
Expected: 0
Received: 1
Timeout:  6000ms

Call log:
  - Expect "toHaveCount" locator('.chapter-reward') with timeout 6000ms
  - waiting for locator('.chapter-reward')
    16 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- main [ref=f2e3]:
  - img "同桌场景画面" [ref=f2e4]
  - region "同桌厨房" [ref=f2e6]:
    - generic [ref=f2e7]:
      - generic:
        - generic: 美食嘉年华
        - region "第5章，第1波：为老朋友创作"
        - button "暂停" [ref=f2e8] [cursor=pointer]: Ⅱ
      - region "朋友实际使用食品":
        - generic:
          - generic [ref=f2e10]:
            - button "重听兔兔：Thank you!" [ref=f2e11] [cursor=pointer]: Thank you!
            - button "播放整句：Thank you!" [ref=f2e12] [cursor=pointer]: ▶
            - generic [ref=f2e13]: 可播放整句
          - button "和兔兔说话" [ref=f2e14] [cursor=pointer]:
            - generic [ref=f2e15]: 兔兔
          - button "兔兔的接餐盘" [ref=f2e16] [cursor=pointer]:
            - generic [ref=f2e17]: 兔兔面前的接餐盘
          - generic:
            - generic [ref=f2e18]:
              - button "品尝芝士三明治" [ref=f2e19] [cursor=pointer]:
                - img "芝士三明治"
              - button "拿起芝士三明治（活动）" [ref=f2e20] [cursor=pointer]: ↥
            - img "兔兔已经品尝": ♡
        - generic:
          - button "重听刺刺：Thank you!" [ref=f2e22] [cursor=pointer]: ↻
          - button "和刺刺说话" [active] [ref=f2e23] [cursor=pointer]:
            - generic [ref=f2e24]: 刺刺
          - button "刺刺的接餐盘" [ref=f2e25] [cursor=pointer]:
            - generic [ref=f2e26]: 刺刺面前的接餐盘
          - generic:
            - generic [ref=f2e27]:
              - button "品尝草莓冰淇淋杯" [ref=f2e28] [cursor=pointer]:
                - img "草莓冰淇淋杯"
              - button "拿起草莓冰淇淋杯（活动）" [ref=f2e29] [cursor=pointer]: ↥
            - img "刺刺已经品尝": ♡
        - generic:
          - button "邀请长辈" [ref=f2e30] [cursor=pointer]:
            - generic [ref=f2e31]: 长辈
          - button "长辈的接餐盘" [ref=f2e32] [cursor=pointer]:
            - generic [ref=f2e33]: 长辈面前的接餐盘
      - generic [ref=f2e34]:
        - button "保存到食谱" [ref=f2e35] [cursor=pointer]
        - button "翻开旧食谱" [ref=f2e36] [cursor=pointer]
        - button "取出花苗" [ref=f2e37] [cursor=pointer]
        - button "取出浇水壶" [ref=f2e38] [cursor=pointer]
        - button "取出餐垫" [ref=f2e39] [cursor=pointer]
        - button "取出灯串" [ref=f2e40] [cursor=pointer]
        - button "取出小勺" [ref=f2e41] [cursor=pointer]
      - generic [ref=f2e42]:
        - generic [ref=f2e43]:
          - region "果汁机" [ref=f2e44]:
            - generic [ref=f2e45]:
              - button "放入果汁机水果口" [ref=f2e47] [cursor=pointer]
              - button "放到果汁机杯座" [ref=f2e49] [cursor=pointer]
              - button "启动果汁机" [ref=f2e50] [cursor=pointer]: ▶
            - generic [ref=f2e51]:
              - button "果汁机：苹果" [ref=f2e52] [cursor=pointer]:
                - img "苹果"
              - button "果汁机：香蕉" [ref=f2e53] [cursor=pointer]:
                - img "香蕉"
              - button "果汁机：空杯" [ref=f2e54] [cursor=pointer]:
                - img "空杯"
          - region "冰淇淋" [ref=f2e55]:
            - button "放到冰淇淋台" [ref=f2e57] [cursor=pointer]
            - generic [ref=f2e58]:
              - button "冰淇淋：蛋筒" [ref=f2e59] [cursor=pointer]:
                - img "蛋筒"
              - button "冰淇淋：空杯" [ref=f2e60] [cursor=pointer]:
                - img "空杯"
              - button "冰淇淋：香草球" [ref=f2e61] [cursor=pointer]:
                - img "香草球"
              - button "冰淇淋：草莓球" [ref=f2e62] [cursor=pointer]:
                - img "草莓球"
              - button "冰淇淋：香蕉" [ref=f2e63] [cursor=pointer]:
                - img "香蕉"
          - region "组合板" [ref=f2e64]:
            - button "放到组合板" [ref=f2e66] [cursor=pointer]
            - generic [ref=f2e67]:
              - button "组合板：面包" [ref=f2e68] [cursor=pointer]:
                - img "面包"
              - button "组合板：圆面包" [ref=f2e69] [cursor=pointer]:
                - img "圆面包"
              - button "组合板：芝士" [ref=f2e70] [cursor=pointer]:
                - img "芝士"
              - button "组合板：生菜" [ref=f2e71] [cursor=pointer]:
                - img "生菜"
              - button "组合板：番茄" [ref=f2e72] [cursor=pointer]:
                - img "番茄"
          - region "煎锅" [ref=f2e73]:
            - generic [ref=f2e74]:
              - button "放到煎台" [ref=f2e75] [cursor=pointer]
              - button "启动煎台" [ref=f2e76] [cursor=pointer]: 🔥
            - button "煎锅：生饼" [ref=f2e78] [cursor=pointer]:
              - img "生饼"
        - generic [ref=f2e79]:
          - button "放到制作承放区" [ref=f2e80] [cursor=pointer]
          - region "可直接拿取的水果" [ref=f2e81]:
            - button "拿起苹果" [ref=f2e82] [cursor=pointer]:
              - img "苹果"
            - button "拿起香蕉" [ref=f2e83] [cursor=pointer]:
              - img "香蕉"
      - region "手中真实物件"
      - button "放到作品区" [ref=f2e85] [cursor=pointer]
      - status:
        - strong: 美食嘉年华 · 你的作品留下了！
        - generic: 继续做饭，或去自由厨房
      - status: 作品放好了，可以选食品分享或品尝。
```

# Test source

```ts
  1   | import { expect, type Page, test } from '@playwright/test';
  2   | import { finishChapter, make, serve, startStory, state, supply } from './helpers';
  3   | 
  4   | test.use({ hasTouch: true });
  5   | const click = (p: Page, name: string) => p.getByRole('button', { name, exact: true }).click();
  6   | const begin = startStory;
  7   | async function bookAction(p: Page, name: string) {
  8   |   await click(p, '翻开旧食谱');
  9   |   await p
  10  |     .getByRole('dialog', { name: '食谱与作品' })
  11  |     .getByRole('button', { name, exact: true })
  12  |     .click();
  13  | }
  14  | test('visible activity entrance naturally reaches all five chapters and saves a real creation', async ({
  15  |   page,
  16  | }) => {
  17  |   test.setTimeout(420000);
  18  |   await page.setViewportSize({ width: 393, height: 665 });
  19  |   await begin(page);
  20  |   for (let chapter = 0; chapter < 5; chapter++) {
  21  |     await finishChapter(
  22  |       page,
  23  |       chapter,
  24  |       'rabbit',
  25  |       new Set(chapter === 3 ? ['grill', 'machine'] : []),
  26  |     );
  27  |     await expect(
  28  |       page.getByRole('button', { name: /一起吃早餐|一起开席|下一院活动|先帮/ }),
  29  |     ).toHaveCount(0);
  30  |   }
  31  |   const s = await state(page);
  32  |   expect(s.adventure?.flow?.archives.map((a) => a.chapter)).toEqual([0, 1, 2, 3]);
  33  |   expect(s.adventure?.flow?.archives.map((a) => a.foods.length)).toEqual([6, 5, 4, 4]);
  34  |   expect(s.adventure?.rewards).toEqual(['feast-page']);
  35  |   expect(s.adventure?.works[0]?.foods.map((f) => f.product).sort()).toEqual([
  36  |     'sandwich',
  37  |     'strawberry-cup',
  38  |   ]);
  39  |   expect(s.adventure?.experience?.used).toContain('share');
> 40  |   await expect(page.locator('.chapter-reward')).toHaveCount(0, { timeout: 6000 });
      |                                                 ^ Error: expect(locator).toHaveCount(expected) failed
  41  |   expect((await state(page)).adventure?.works).toEqual(s.adventure?.works);
  42  |   expect((await state(page)).adventure?.foods).toEqual(s.adventure?.foods);
  43  |   for (const viewport of [
  44  |     { width: 1280, height: 720 },
  45  |     { width: 665, height: 393 },
  46  |     { width: 1024, height: 768 },
  47  |   ]) {
  48  |     await page.setViewportSize(viewport);
  49  |     await expect
  50  |       .poll(async () =>
  51  |         page.locator('.direct-ingredient').evaluateAll((buttons) =>
  52  |           buttons.every((button) => {
  53  |             const r = button.getBoundingClientRect(),
  54  |               hit = document.elementFromPoint(r.x + r.width / 2, r.y + r.height / 2);
  55  |             return (
  56  |               r.width >= 48 &&
  57  |               r.height >= 48 &&
  58  |               r.x >= 0 &&
  59  |               r.y >= 0 &&
  60  |               r.right <= innerWidth &&
  61  |               r.bottom <= innerHeight - 30 &&
  62  |               !!hit &&
  63  |               button.contains(hit)
  64  |             );
  65  |           }),
  66  |         ),
  67  |       )
  68  |       .toBe(true);
  69  |   }
  70  |   await page.setViewportSize({ width: 393, height: 665 });
  71  |   await page.screenshot({ path: test.info().outputPath('five-chapters-phone.png') });
  72  |   await page.reload();
  73  |   await page.locator('.yard-story .entry-main').click();
  74  |   expect((await state(page)).adventure?.works).toEqual(s.adventure?.works);
  75  |   await click(page, '翻开旧食谱');
  76  |   await expect(page.getByRole('region', { name: '这次保存的作品' })).toContainText('I made');
  77  |   await click(page, '再准备一次');
  78  |   await click(page, '翻开旧食谱');
  79  |   await expect(page.getByRole('region', { name: '旧活动的作品' })).toContainText('I made');
  80  |   expect((await state(page)).items).toHaveLength(0);
  81  | });
  82  | test('receipt presentation and low motion never repeat settlement while the story naturally continues', async ({
  83  |   page,
  84  | }) => {
  85  |   await page.emulateMedia({ reducedMotion: 'reduce' });
  86  |   await begin(page);
  87  |   await finishChapter(page, 0);
  88  |   const before = await state(page);
  89  |   await page.waitForTimeout(2400);
  90  |   const after = await state(page);
  91  |   expect(after.adventure?.flow?.archives).toEqual(before.adventure?.flow?.archives);
  92  |   expect(after.attempts).toEqual(before.attempts);
  93  |   expect(after.adventure?.flow?.archives[0]?.rewards).toEqual(['flower-page']);
  94  | });
  95  | test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  96  |   test.setTimeout(240000);
  97  |   await begin(page);
  98  |   await finishChapter(page, 0);
  99  |   await finishChapter(page, 1);
  100 |   await finishChapter(page, 2, 'hedgehog');
  101 |   const picnic = (await state(page)).adventure?.flow?.archives.find((a) => a.chapter === 2);
  102 |   expect(picnic?.branch).toBe('hedgehog');
  103 |   expect(picnic?.steps).not.toContain('pack');
  104 |   expect(
  105 |     picnic?.foods.filter((f) => f.place.startsWith('table:') || f.place.startsWith('guest-')),
  106 |   ).toHaveLength(2);
  107 |   expect(picnic?.rewards).toEqual(['picnic-page']);
  108 | });
  109 | test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  110 |   page,
  111 | }) => {
  112 |   await page.goto('/');
  113 |   await page.locator('.yard-endless .entry-main').click();
  114 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  115 |   await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  116 |   await click(page, '开门 / 继续营业');
  117 |   await supply(page, 'apple');
  118 |   await pDeliver(page);
  119 |   await expect(page.getByRole('dialog', { name: '今日新菜单' })).toBeVisible({ timeout: 18000 });
  120 |   await click(page, '这次先不加 ↗');
  121 |   await click(page, '暂停');
  122 |   await click(page, '停止接客，做作品');
  123 |   expect((await state(page)).session.shop?.accepting).toBe(false);
  124 |   await supply(page, 'apple');
  125 |   await click(page, '放到作品区');
  126 |   await expect.poll(async () => (await state(page)).adventure?.foods.length).toBeGreaterThan(1);
  127 |   await expect(page.locator('.nearby-feedback')).toContainText('作品放好了');
  128 |   await bookAction(page, '保存到食谱');
  129 |   const saved = (await state(page)).adventure?.works;
  130 |   await page.reload();
  131 |   await page.locator('.yard-endless .entry-main').click();
  132 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  133 |   await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  134 |   await click(page, '开门 / 继续营业');
  135 |   expect((await state(page)).adventure?.works).toEqual(saved);
  136 | });
  137 | async function pDeliver(p: Page) {
  138 |   await p.locator('[data-actor="rabbit"]').click();
  139 | }
  140 | test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
```