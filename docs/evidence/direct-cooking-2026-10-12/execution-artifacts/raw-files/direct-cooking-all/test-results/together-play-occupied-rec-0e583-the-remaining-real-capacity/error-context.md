# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: together-play.spec.ts >> occupied receiving plate still matches the friend and preparation uses the remaining real capacity
- Location: e2e/together-play.spec.ts:87:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 2
Received: 1

Call Log:
- Timeout 6000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "同桌场景画面" [ref=e4]
  - region "同桌厨房" [ref=e6]:
    - generic [ref=e7]:
      - generic:
        - generic: 自由厨房
        - button "暂停" [ref=e8] [cursor=pointer]: Ⅱ
      - region "朋友实际使用食品":
        - generic:
          - generic [ref=e10]:
            - button "重听兔兔：Can I have an apple, please?" [ref=e11] [cursor=pointer]:
              - text: Can I have an
              - strong [ref=e12]: apple
              - text: ", please?"
            - button "播放整句：Can I have an apple, please?" [ref=e13] [cursor=pointer]: ▶
            - generic [ref=e14]: 可播放整句
          - region "说话者的图示需要" [ref=e15]:
            - button "看图理解兔兔的请求" [ref=e16] [cursor=pointer]:
              - img "苹果"
          - button "交给兔兔" [ref=e17] [cursor=pointer]:
            - generic [ref=e18]: 兔兔
          - button "交给兔兔的餐盘" [ref=e19] [cursor=pointer]:
            - generic [ref=e20]: 兔兔面前的接餐盘
          - generic [ref=e21]:
            - button "品尝苹果" [ref=e22] [cursor=pointer]:
              - img "苹果"
            - button "拿起苹果（活动）" [active] [ref=e23] [cursor=pointer]: ↥
        - generic:
          - button "重听刺刺：Can I have an apple, please?" [ref=e25] [cursor=pointer]: ↻
          - region "说话者的图示需要" [ref=e26]:
            - button "看图理解刺刺的请求" [ref=e27] [cursor=pointer]:
              - img "苹果"
          - button "交给刺刺" [ref=e28] [cursor=pointer]:
            - generic [ref=e29]: 刺刺
          - button "交给刺刺的餐盘" [ref=e30] [cursor=pointer]:
            - generic [ref=e31]: 刺刺面前的接餐盘
        - generic:
          - button "交给长辈" [ref=e32] [cursor=pointer]:
            - generic [ref=e33]: 长辈
          - button "交给长辈的餐盘" [ref=e34] [cursor=pointer]:
            - generic [ref=e35]: 长辈面前的接餐盘
      - generic [ref=e36]:
        - button "翻开旧食谱" [ref=e37] [cursor=pointer]
        - button "取出小勺" [ref=e38] [cursor=pointer]
      - generic [ref=e39]:
        - region "果汁机" [ref=e41]:
          - generic [ref=e42]:
            - button "放入果汁机水果口" [ref=e44] [cursor=pointer]
            - button "放到果汁机杯座" [ref=e46] [cursor=pointer]
            - button "启动果汁机" [ref=e47] [cursor=pointer]: ▶
          - generic [ref=e48]:
            - button "果汁机：苹果" [ref=e49] [cursor=pointer]:
              - img "苹果"
            - button "果汁机：香蕉" [ref=e50] [cursor=pointer]:
              - img "香蕉"
            - button "果汁机：空杯" [ref=e51] [cursor=pointer]:
              - img "空杯"
        - generic [ref=e52]:
          - button "放到制作承放区" [ref=e53] [cursor=pointer]
          - button "拿起苹果" [ref=e54] [cursor=pointer]:
            - img "苹果"
          - generic [ref=e55]:
            - button "品尝香蕉" [ref=e56] [cursor=pointer]:
              - img "香蕉"
            - button "拿起香蕉（活动）" [ref=e57] [cursor=pointer]: ↥
          - group "可直接拿取的水果" [ref=e58]:
            - button "拿起苹果" [ref=e59] [cursor=pointer]:
              - img "苹果"
            - button "拿起香蕉" [ref=e60] [cursor=pointer]:
              - img "香蕉"
      - region "手中真实物件":
        - img "苹果"
      - button "放回手中食品" [ref=e61] [cursor=pointer]: 放回
      - button "放到作品区" [ref=e63] [cursor=pointer]
      - status: 先放下手中的物件。
```

# Test source

```ts
  20  |   await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  21  |   await page.getByRole('button', { name: '交给刺刺', exact: true }).click();
  22  |   await expect.poll(async () => (await state(page)).orders[1]?.status).toBe('done');
  23  |   await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  24  |   expect((await state(page)).adventure?.rewards).toEqual(['flower-page']);
  25  |   expect((await state(page)).adventure?.steps).not.toContain('plant');
  26  |   for (const label of ['去厨房备餐', '到活动桌', '端盘', '选盘'])
  27  |     await expect(page.getByRole('button', { name: label, exact: true })).toHaveCount(0);
  28  | });
  29  | 
  30  | test('visible device targets make real juice and wrong delivery leaves hand ownership recoverable', async ({
  31  |   page,
  32  | }) => {
  33  |   await page.goto('/');
  34  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  35  |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  36  |   await page.getByRole('button', { name: '拿起香蕉', exact: true }).click();
  37  |   const before = (await state(page)).items;
  38  |   await page.getByRole('button', { name: '交给兔兔', exact: true }).click();
  39  |   expect((await state(page)).items).toEqual(before);
  40  |   await page.getByRole('button', { name: '放回手中食品', exact: true }).click();
  41  |   expect((await state(page)).items).toEqual([]);
  42  |   await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  43  |   await page.getByRole('button', { name: '放入果汁机水果口', exact: true }).click();
  44  |   await page.getByRole('button', { name: '果汁机：空杯', exact: true }).click();
  45  |   await page.getByRole('button', { name: '启动果汁机', exact: true }).click();
  46  |   expect((await state(page)).machine.status).toBe('processing');
  47  |   await expect(page.getByRole('button', { name: '拿起苹果汁', exact: true })).toBeVisible({
  48  |     timeout: 15000,
  49  |   });
  50  |   await page.getByRole('button', { name: '拿起苹果汁', exact: true }).click();
  51  |   expect(
  52  |     (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  53  |   ).toEqual(['juice']);
  54  |   await page.reload();
  55  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  56  |   expect(
  57  |     (await state(page)).items.filter((i) => i.location.startsWith('hand:')).map((i) => i.product),
  58  |   ).toEqual(['juice']);
  59  | });
  60  | 
  61  | test('speaker meaning pictures and same-stage demonstration are usable assistance without inventory or language submission', async ({
  62  |   page,
  63  | }) => {
  64  |   await page.goto('/');
  65  |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  66  |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  67  |   await expect(
  68  |     page.getByRole('button', { name: '看图理解兔兔的请求', exact: true }).locator('img'),
  69  |   ).toBeVisible();
  70  |   await page.getByRole('button', { name: '看图理解兔兔的请求', exact: true }).click();
  71  |   const before = await state(page);
  72  |   expect(before.orders[0]?.support).toContain('meaning-picture');
  73  |   expect(before.orders[0]?.support).toContain('picture-request');
  74  |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  75  |   await page.getByRole('button', { name: '看兔兔的同场示范', exact: true }).click();
  76  |   await expect(page.getByRole('dialog', { name: '同场动作示范' })).toBeVisible();
  77  |   await page.getByRole('button', { name: '下一步示范', exact: true }).click();
  78  |   await page.getByRole('button', { name: '我来动手', exact: true }).click();
  79  |   expect((await state(page)).items).toEqual(before.items);
  80  |   expect((await state(page)).attempts).toEqual(before.attempts);
  81  |   expect((await state(page)).orders[0]?.support).toContain('demonstration');
  82  |   await page.getByRole('button', { name: '拿起苹果', exact: true }).click();
  83  |   await page.getByRole('button', { name: '交给兔兔的餐盘', exact: true }).click();
  84  |   await expect.poll(async () => (await state(page)).orders[0]?.status).toBe('done');
  85  |   expect((await state(page)).attempts[0]?.support).toContain('demonstration');
  86  | });
  87  | test('occupied receiving plate still matches the friend and preparation uses the remaining real capacity', async ({
  88  |   page,
  89  | }) => {
  90  |   await page.goto('/');
  91  |   await page.locator('.yard-endless .entry-main').click();
  92  |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  93  |   await page.getByRole('button', { name: '调整开店设置', exact: true }).click();
  94  |   await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  95  |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  96  |   for (let i = 0; i < 3; i++) {
  97  |     await page.locator('[data-hotspot="supply-apple"]').click();
  98  |     await page.getByRole('button', { name: '放到制作承放区', exact: true }).click();
  99  |   }
  100 |   await page.locator('[data-hotspot="supply-banana"]').click();
  101 |   await page.getByRole('button', { name: '放到制作承放区', exact: true }).click();
  102 |   expect(
  103 |     (await state(page)).items.some(
  104 |       (i) => i.product === 'banana' && i.location.startsWith('tray:1:'),
  105 |     ),
  106 |   ).toBe(true);
  107 |   const apple = (await state(page)).items.find((i) => i.product === 'apple');
  108 |   if (!apple) throw Error('apple');
  109 |   await page.locator(`[data-hotspot="item-${apple.id}"]`).click();
  110 |   await page.getByRole('button', { name: '交给兔兔的餐盘', exact: true }).click();
  111 |   await expect.poll(async () => (await state(page)).session.served).toBe(1);
  112 |   // No menu popup while actual preparation food remains. Choose another actual apple.
  113 |   const next = (await state(page)).items.find((i) => i.product === 'apple');
  114 |   if (!next) throw Error('next');
  115 |   await page.locator(`[data-hotspot="item-${next.id}"]`).click();
  116 |   const plate = page.getByRole('button', { name: '交给兔兔的餐盘', exact: true });
  117 |   const box = await plate.boundingBox();
  118 |   if (!box) throw Error('plate');
  119 |   await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
> 120 |   await expect.poll(async () => (await state(page)).session.served).toBe(2);
      |                                                                     ^ Error: expect(received).toBe(expected) // Object.is equality
  121 |   expect((await state(page)).attempts.filter((a) => a.activity === 'delivery')).toHaveLength(2);
  122 | });
  123 | test('open request remains at its actual speaker after another conversation and cannot thank before receipt', async ({
  124 |   page,
  125 | }) => {
  126 |   await page.goto('/');
  127 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  128 |   for (const [friend, food] of [
  129 |     ['兔兔', '苹果'],
  130 |     ['刺刺', '香蕉'],
  131 |   ]) {
  132 |     await page.getByRole('button', { name: `先帮${friend}`, exact: true }).click();
  133 |     await page.getByRole('button', { name: `拿起${food}`, exact: true }).click();
  134 |     await page.getByRole('button', { name: `交给${friend}`, exact: true }).click();
  135 |     await expect
  136 |       .poll(
  137 |         async () =>
  138 |           (await state(page)).orders.find(
  139 |             (o) => o.visitor === (friend === '兔兔' ? 'rabbit' : 'hedgehog'),
  140 |           )?.status,
  141 |       )
  142 |       .toBe('done');
  143 |   }
  144 |   await page.getByRole('button', { name: '一起吃早餐', exact: true }).click();
  145 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  146 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  147 |   const open = page.getByRole('button', { name: /重听刺刺：.*ice cream/ });
  148 |   await expect(open).toBeVisible();
  149 |   const before = await state(page);
  150 |   await open.click();
  151 |   await page.locator('[data-actor="hedgehog"]').click();
  152 |   expect((await state(page)).adventure?.foods).toEqual(before.adventure?.foods);
  153 |   expect((await state(page)).attempts).toEqual(before.attempts);
  154 |   await expect(open).toBeVisible();
  155 |   await expect(page.getByRole('button', { name: '重听刺刺：Thank you!', exact: true })).toHaveCount(
  156 |     0,
  157 |   );
  158 | });
  159 | 
```