# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: immersion.spec.ts >> normal entrance: complete requests, actual receipt, yard actions, open flavors and real sharing memory
- Location: e2e/immersion.spec.ts:8:1

# Error details

```
Error: expect(locator).toHaveText(expected) failed

Locator:  locator('.conversation .sentence-text')
Expected: "I remember your vanilla ice cream in a cone."
Received: "I remember your apple."
Timeout:  6000ms

Call log:
  - Expect "toHaveText" locator('.conversation .sentence-text') with timeout 6000ms
  - waiting for locator('.conversation .sentence-text')
    15 × locator resolved to <button lang="en" type="button" class="sentence-text" aria-label="重听兔兔：I remember your apple.">…</button>
       - unexpected value "I remember your apple."

```

```yaml
- button "重听兔兔：I remember your apple.":
  - text: I remember your
  - strong: apple
  - text: .
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
  15  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  16  |   await lesson(page);
  17  |   await expect(sentence(page)).toHaveText('Can I have an apple, please?');
  18  |   await choosePrep(page, '● 1号盘');
  19  |   await tap(page, 'supply-apple');
  20  |   await handOver(page, 0);
  21  |   await expect(sentence(page)).toHaveText('Thank you!');
  22  |   await expect
  23  |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  24  |     .toBe('done');
  25  |   await lesson(page);
  26  |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  27  |   await choosePrep(page, '● 1号盘');
  28  |   await tap(page, 'supply-banana');
  29  |   await handOver(page, 1);
  30  |   await expect
  31  |     .poll(async () => (await state(page)).orders.every((o) => o.status === 'done'), {
  32  |       timeout: 18000,
  33  |     })
  34  |     .toBe(true);
  35  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  36  |   await expect(sentence(page)).toHaveText('Please open the drawer.');
  37  |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  38  |   await expect(sentence(page)).toHaveText('Here is the flower!');
  39  |   await page.getByRole('button', { name: '重听下一步行动', exact: true }).click();
  40  |   await expect(sentence(page)).toHaveText('Please plant the flower.');
  41  |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  42  |   await expect(sentence(page)).toHaveText('We planted the flower!');
  43  |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  44  |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  45  |   await expect(sentence(page)).toContainText('Any flavor is fine.');
  46  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  47  |   await lesson(page);
  48  |   await page.setViewportSize({ width: 393, height: 665 });
  49  |   await expect(sentence(page)).toContainText('one scoop of vanilla ice cream in a cone');
  50  |   const longPanel = await page.locator('.conversation').boundingBox();
  51  |   const guest = await page.locator('[data-hotspot="guest-0"]').boundingBox();
  52  |   if (!longPanel || !guest) throw Error('missing request or guest');
  53  |   expect(longPanel.y + longPanel.height).toBeLessThanOrEqual(guest.y);
  54  |   await page.screenshot({ path: info.outputPath('phone-long-request.png') });
  55  |   await page.setViewportSize({ width: 1440, height: 900 });
  56  |   await make(page, 'vanilla-cone');
  57  |   await handOver(page, 0);
  58  |   await expect
  59  |     .poll(async () => (await state(page)).orders[0]?.status, { timeout: 18000 })
  60  |     .toBe('done');
  61  |   await lesson(page);
  62  |   await make(page, 'banana-cream');
  63  |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  64  |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  65  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  66  |   await page.getByRole('button', { name: '品尝香蕉冰淇淋', exact: true }).click();
  67  |   await expect(sentence(page)).toHaveText('Yummy! I like it.');
  68  |   await page.screenshot({ path: info.outputPath('yard-taste.png') });
  69  |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  70  |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  71  |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  72  |   await lesson(page);
  73  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  74  |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
> 75  |   await expect(sentence(page)).toHaveText('I remember your vanilla ice cream in a cone.');
      |                                ^ Error: expect(locator).toHaveText(expected) failed
  76  |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  77  |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  78  |   await choosePrep(page, '● 1号盘');
  79  |   await tap(page, 'supply-banana');
  80  |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  81  |   await expect(sentence(page)).toHaveText('This is for you.');
  82  |   await expect
  83  |     .poll(async () =>
  84  |       (await state(page)).adventure?.foods.some((f) => f.source.startsWith('create:')),
  85  |     )
  86  |     .toBe(true);
  87  |   await page.getByRole('button', { name: '到活动桌', exact: true }).click();
  88  |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  89  |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  90  |   await expect(page.locator('.work-description').first()).toHaveText('I made a banana.');
  91  |   const observations = await page.evaluate(
  92  |     () => JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}').observations,
  93  |   );
  94  |   expect(
  95  |     observations
  96  |       .filter((o: { dimension: string; support: string[] }) =>
  97  |         o.support.includes('caption-visible'),
  98  |       )
  99  |       .every((o: { dimension: string }) => o.dimension === 'meaning'),
  100 |   ).toBe(true);
  101 |   await page.screenshot({ path: info.outputPath('sharing-memory.png') });
  102 | });
  103 | 
  104 | test('phone: held tray and two guests replay without delivery; cancellation, pause, failure and short landscape', async ({
  105 |   page,
  106 | }, info) => {
  107 |   await page.setViewportSize({ width: 393, height: 665 });
  108 |   await page.goto('/');
  109 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  110 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  111 |   await lesson(page);
  112 |   await choosePrep(page, '● 1号盘');
  113 |   await tap(page, 'supply-apple');
  114 |   await tap(page, 'tray-0', 26);
  115 |   const before = await state(page);
  116 |   await page.getByRole('button', { name: '重听客人A的请求', exact: true }).click();
  117 |   const play = page.getByRole('button', {
  118 |     name: '播放整句：Can I have an apple, please?',
  119 |     exact: true,
  120 |   });
  121 |   await play.click();
  122 |   await play.click();
  123 |   await expect
  124 |     .poll(
  125 |       async () =>
  126 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  127 |     )
  128 |     .toContain('imm-order-apple');
  129 |   expect((await state(page)).items).toEqual(before.items);
  130 |   expect((await state(page)).attempts).toEqual(before.attempts);
  131 |   await page.getByRole('button', { name: '重听客人B的请求', exact: true }).click();
  132 |   await lesson(page);
  133 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  134 |   await page
  135 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  136 |     .click();
  137 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  138 |   await expect
  139 |     .poll(
  140 |       async () =>
  141 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').active,
  142 |     )
  143 |     .toBeNull();
  144 |   const paused = await state(page);
  145 |   await page.waitForTimeout(150);
  146 |   expect((await state(page)).gameTime).toBe(paused.gameTime);
  147 |   await page.getByRole('button', { name: '继续营业', exact: true }).click();
  148 |   await page.route('**/audio/imm-order-*.wav*', (r) => r.abort());
  149 |   await page
  150 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  151 |     .click();
  152 |   await expect
  153 |     .poll(
  154 |       async () =>
  155 |         JSON.parse((await page.locator('main').getAttribute('data-audio-state')) ?? '{}').failure
  156 |           ?.kind,
  157 |     )
  158 |     .toBeTruthy();
  159 |   await expect(sentence(page)).toHaveText('Can I have a banana, please?');
  160 |   await page.unroute('**/audio/imm-order-*.wav*');
  161 |   await page
  162 |     .getByRole('button', { name: '播放整句：Can I have a banana, please?', exact: true })
  163 |     .click();
  164 |   await page.screenshot({ path: info.outputPath('phone-request.png') });
  165 |   await page.setViewportSize({ width: 852, height: 393 });
  166 |   const panel = await page.locator('.conversation').boundingBox();
  167 |   expect(panel).toBeTruthy();
  168 |   if (!panel) throw Error('sentence panel missing');
  169 |   for (const id of ['supply-apple', 'tray-0', before.orders[0]?.id ?? 'guest-0']) {
  170 |     const b = await page.locator(`[data-hotspot="${id}"]`).boundingBox();
  171 |     if (!b) throw Error(id);
  172 |     expect(
  173 |       Math.max(panel.x, b.x) < Math.min(panel.x + panel.width, b.x + b.width) &&
  174 |         Math.max(panel.y, b.y) < Math.min(panel.y + panel.height, b.y + b.height),
  175 |       id,
```