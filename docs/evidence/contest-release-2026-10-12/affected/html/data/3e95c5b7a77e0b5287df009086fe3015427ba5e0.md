# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: immersion.spec.ts >> normal entrance: complete requests, actual receipt, yard actions, open flavors and real sharing memory
- Location: e2e/immersion.spec.ts:8:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '品尝香蕉冰淇淋', exact: true })

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
          - heading "树荫甜点" [level=2] [ref=e11]
          - paragraph [ref=e12]: 尝不同口味，把分享彩旗挂起来
        - group "活动客流" [ref=e13]:
          - button "一次接待一位" [pressed] [ref=e14] [cursor=pointer]: 👤
          - button "一起接待两位" [ref=e15] [cursor=pointer]: 👥
        - button "去厨房备餐" [ref=e16] [cursor=pointer]
      - region "英语交流" [ref=e21]:
        - generic [ref=e22]:
          - button "重听下一步行动" [ref=e23] [cursor=pointer]: ➜ ♫
          - generic [ref=e24]: 大咪
          - group [ref=e25]:
            - generic "回看最近交流" [ref=e26] [cursor=pointer]: ↶
        - generic [ref=e27]:
          - button "重听大咪：Please open the recipe book." [ref=e28] [cursor=pointer]: Please open the recipe book.
          - button "播放整句：Please open the recipe book." [ref=e29] [cursor=pointer]: ▶
          - generic [ref=e30]: 可播放整句
      - generic [ref=e31]:
        - generic [ref=e32]:
          - button "去小院游乐角" [ref=e33] [cursor=pointer]:
            - generic [ref=e35]: 去游乐角 · 随时回来
          - button "打开储物抽屉" [ref=e36] [cursor=pointer]:
            - generic [ref=e41]:
              - text: 打开储物抽屉
              - generic [ref=e42]: Drawer
          - button "翻开旧食谱" [ref=e43] [cursor=pointer]:
            - generic [ref=e49]:
              - text: 翻开旧食谱
              - generic [ref=e50]: Recipe book
        - region "图示下一步" [ref=e51]:
          - button "图示下一步：翻开旧食谱，看看两份真实甜点。" [ref=e52] [cursor=pointer]:
            - generic [aria-hidden] [ref=e57]: ➜
            - generic [aria-hidden] [ref=e61]: ●
          - generic [ref=e62]: 翻开旧食谱，看看两份真实甜点。
          - button "重听下一步" [ref=e64] [cursor=pointer]: ♫
          - button "看看怎么行动" [ref=e65] [cursor=pointer]: ▶
        - paragraph [ref=e66]: 尝不同口味，把分享彩旗挂起来
        - generic [ref=e67]:
          - img "小主厨大咪" [ref=e68]
          - generic [ref=e69]:
            - img "兔兔" [ref=e70]
            - generic [ref=e71]:
              - img "香草蛋筒"
          - img "刺刺" [ref=e73]
        - region "朋友实际使用食品" [ref=e74]:
          - img "接餐、携带、摆放、品尝、回应" [ref=e75]:
            - generic [ref=e76]: 接餐
            - generic [ref=e84]: 携带
            - generic [ref=e91]: 摆放
            - generic [ref=e98]: 品尝
            - generic [ref=e104]: 回应
          - img "大咪携带真实食品" [ref=e110]:
            - img "大咪" [ref=e111]
            - generic [ref=e113]:
              - img "香蕉冰淇淋"
            - generic [ref=e114]: 大咪接好食品，带到所选位置，等你安排分享
          - generic [ref=e120]:
            - button "重看朋友使用" [ref=e121] [cursor=pointer]: ↻ ♫
            - button "跳过朋友演出" [ref=e122] [cursor=pointer]: ↗
            - button "低动态表现" [ref=e123] [cursor=pointer]: ◒
        - generic [ref=e124]:
          - img "已经种下的迎客花":
            - generic: ✿
            - generic: ✿
            - generic [aria-hidden]: 🦋
          - button "摆到1号餐位" [ref=e125] [cursor=pointer]
          - button "摆到2号餐位" [ref=e127] [cursor=pointer]
          - button "摆到3号餐位" [ref=e129] [cursor=pointer]
        - region "真实送到活动桌的食物" [ref=e131]:
          - generic [ref=e132]:
            - button "选择香草蛋筒" [pressed] [ref=e133] [cursor=pointer]:
              - img "香草蛋筒"
              - generic [aria-hidden] [ref=e134]: ●
            - button "选择香蕉冰淇淋" [ref=e135] [cursor=pointer]:
              - img "香蕉冰淇淋"
              - generic [aria-hidden] [ref=e136]: ●
          - region "当前拿着香草蛋筒" [ref=e137]:
            - img "香草蛋筒"
            - generic [aria-hidden] [ref=e138]: ➜
            - button "品尝香草蛋筒" [ref=e144] [cursor=pointer]
      - generic [ref=e149]:
        - button "比较两种甜点" [ref=e151] [cursor=pointer]
        - status [ref=e159]: 翻开旧食谱，看看两份真实甜点。
        - generic [ref=e160]:
          - button "一起开席" [disabled] [ref=e161]
          - button "收摊回小院" [ref=e166] [cursor=pointer]
      - generic [ref=e170]: 当前拿着香草蛋筒，可点一个餐位摆放。
```

# Test source

```ts
  1   | import { expect, test } from '@playwright/test';
  2   | import { choosePrep, handOver, lesson, make, state, tap } from './helpers';
  3   | 
  4   | test.use({ hasTouch: true });
  5   | const sentence = (page: Parameters<typeof state>[0]) =>
  6   |   page.locator('.conversation .sentence-text');
  7   | 
  8   | test('normal entrance: complete requests, actual receipt, yard actions, open flavors and real sharing memory', async ({
  9   |   page,
  10  | }, info) => {
  11  |   test.setTimeout(150000);
  12  |   await page.setViewportSize({ width: 1440, height: 900 });
  13  |   await page.goto('/');
  14  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  15  |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  16  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  17  |   await lesson(page);
  18  |   await expect(sentence(page)).toHaveText('Can I have an apple, please?');
  19  |   await choosePrep(page, '● 1号盘');
  20  |   await tap(page, 'supply-apple');
  21  |   await handOver(page, 0);
  22  |   await expect(sentence(page)).toHaveText('Thank you!');
  23  |   await expect
  24  |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  25  |     .toBe('done');
  26  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  27  |   await page.getByRole('button', { name: '先帮刺刺', exact: true }).click();
  28  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  29  |   await lesson(page);
  30  |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  31  |   await choosePrep(page, '● 1号盘');
  32  |   await tap(page, 'supply-banana');
  33  |   await handOver(page);
  34  |   await expect
  35  |     .poll(async () => (await state(page)).orders.every((o) => o.status === 'done'), {
  36  |       timeout: 18000,
  37  |     })
  38  |     .toBe(true);
  39  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  40  |   await expect(sentence(page)).toHaveText('Please open the drawer.');
  41  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  42  |   await expect(sentence(page)).toHaveText('Here is the flower!');
  43  |   await page.getByRole('button', { name: '重听下一步行动', exact: true }).click();
  44  |   await expect(sentence(page)).toHaveText('Please plant the flower.');
  45  |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  46  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  47  |   await expect(sentence(page)).toHaveText('We planted the flower!');
  48  |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  49  |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  50  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  51  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  52  |   await expect(sentence(page)).toContainText('Any flavor is fine.');
  53  |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  54  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  55  |   await lesson(page);
  56  |   await page.setViewportSize({ width: 393, height: 665 });
  57  |   await expect(sentence(page)).toContainText('one scoop of vanilla ice cream in a cone');
  58  |   const longPanel = await page.locator('.conversation').boundingBox();
  59  |   const guest = await page.locator('[data-hotspot="guest-0"]').boundingBox();
  60  |   if (!longPanel || !guest) throw Error('missing request or guest');
  61  |   expect(longPanel.y + longPanel.height).toBeLessThanOrEqual(guest.y);
  62  |   await page.screenshot({ path: info.outputPath('phone-long-request.png') });
  63  |   await page.setViewportSize({ width: 1440, height: 900 });
  64  |   await make(page, 'vanilla-cone');
  65  |   await handOver(page, 0);
  66  |   await expect
  67  |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  68  |     .toBe('done');
  69  |   await lesson(page);
  70  |   await make(page, 'banana-cream');
  71  |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  72  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  73  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
> 74  |   await page.getByRole('button', { name: '品尝香蕉冰淇淋', exact: true }).click();
      |                                                                    ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  75  |   await expect(sentence(page)).toHaveText('Yummy! I like it.');
  76  |   await page.screenshot({ path: info.outputPath('yard-taste.png') });
  77  |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  78  |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  79  |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  80  |   await lesson(page);
  81  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  82  |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  83  |   await expect(sentence(page)).toHaveText('I remember your vanilla ice cream in a cone.');
  84  |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  85  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  86  |   await choosePrep(page, '● 1号盘');
  87  |   await tap(page, 'supply-banana');
  88  |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  89  |   await expect(sentence(page)).toHaveText('This is for you.');
  90  |   await expect
  91  |     .poll(async () =>
  92  |       (await state(page)).adventure?.foods.some((f) => f.source.startsWith('create:')),
  93  |     )
  94  |     .toBe(true);
  95  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  96  |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  97  |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  98  |   await expect(page.locator('.work-description').first()).toHaveText('I made a banana.');
  99  |   const observations = await page.evaluate(
  100 |     () => JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}').observations,
  101 |   );
  102 |   expect(
  103 |     observations
  104 |       .filter((o: { dimension: string; support: string[] }) =>
  105 |         o.support.includes('caption-visible'),
  106 |       )
  107 |       .every((o: { dimension: string }) => o.dimension === 'meaning'),
  108 |   ).toBe(true);
  109 |   await page.screenshot({ path: info.outputPath('sharing-memory.png') });
  110 | });
  111 | 
  112 | test('phone: held tray and two guests replay without delivery; cancellation, pause, failure and short landscape', async ({
  113 |   page,
  114 | }, info) => {
  115 |   await page.setViewportSize({ width: 393, height: 665 });
  116 |   await page.goto('/');
  117 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  118 |   await page.getByRole('button', { name: '一起接待两位', exact: true }).click();
  119 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  120 |   await lesson(page);
  121 |   await choosePrep(page, '● 1号盘');
  122 |   await tap(page, 'supply-apple');
  123 |   await tap(page, 'lift-tray-0');
  124 |   const before = await state(page);
  125 |   await page.getByRole('button', { name: '重听客人A的请求', exact: true }).click();
  126 |   const play = page.getByRole('button', {
  127 |     name: '播放整句：Can I have an apple, please?',
  128 |     exact: true,
  129 |   });
  130 |   await play.click();
  131 |   await play.click();
  132 |   await expect
  133 |     .poll(
  134 |       async () =>
  135 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  136 |     )
  137 |     .toContain('imm-order-apple');
  138 |   expect((await state(page)).items).toEqual(before.items);
  139 |   expect((await state(page)).attempts).toEqual(before.attempts);
  140 |   await page.getByRole('button', { name: '重听客人B的请求', exact: true }).click();
  141 |   await lesson(page);
  142 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  143 |   await page
  144 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  145 |     .click();
  146 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  147 |   await expect
  148 |     .poll(
  149 |       async () =>
  150 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  151 |     )
  152 |     .toBeNull();
  153 |   const paused = await state(page);
  154 |   await page.waitForTimeout(150);
  155 |   expect((await state(page)).gameTime).toBe(paused.gameTime);
  156 |   await page.getByRole('button', { name: '继续营业', exact: true }).click();
  157 |   await page.route('**/audio/imm-order-*.wav*', (r) => r.abort());
  158 |   await page
  159 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  160 |     .click();
  161 |   await expect
  162 |     .poll(
  163 |       async () =>
  164 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure
  165 |           ?.kind,
  166 |     )
  167 |     .toBeTruthy();
  168 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  169 |   await page.unroute('**/audio/imm-order-*.wav*');
  170 |   await page
  171 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  172 |     .click();
  173 |   await expect
  174 |     .poll(
```