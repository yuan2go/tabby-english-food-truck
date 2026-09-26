# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: upgrade.spec.ts >> M2 phone DPR and Pad composition, failed asset/audio retry keeps progress
- Location: e2e/upgrade.spec.ts:115:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: locator('.resource-alert')
Expected: visible
Timeout: 6000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" locator('.resource-alert') with timeout 6000ms
  - waiting for locator('.resource-alert')

```

```yaml
- main:
  - img "英语餐车游戏画面"
  - button "暂停": Ⅱ
  - text: 晨光果汁 0 / 4
  - button "保存与画面状态": "!"
  - button "声音状态": ♫!
  - group "餐车操作":
    - button "客人B：选择并重听请求"
    - button "果汁机苹果入口"
    - button "果汁机杯座"
    - button "启动果汁机"
    - button "请小猫帮忙"
    - button "1号托盘：放入食品或选择整盘"
    - button "拿苹果"
    - button "拿香蕉"
    - button "拿空杯"
  - button "送餐 ↗"
  - button "点请求气泡重听":
    - img "苹果"
    - text: ♫
  - status: 点食物直接放盘；做果汁先点机器。准备好后点送餐。
```

# Test source

```ts
  23  |   const teachingPoints = await teachingMotion;
  24  |   expect(
  25  |     Math.max(
  26  |       ...teachingPoints
  27  |         .slice(1)
  28  |         .map((p, i) =>
  29  |           Math.hypot(p.x - (teachingPoints[i]?.x ?? p.x), p.y - (teachingPoints[i]?.y ?? p.y)),
  30  |         ),
  31  |     ),
  32  |   ).toBeLessThan(0.08);
  33  |   await writeFile(info.outputPath('teaching-exit-motion.json'), JSON.stringify(teachingPoints));
  34  |   await info.attach('teaching-exit-motion', {
  35  |     body: JSON.stringify(teachingPoints),
  36  |     contentType: 'application/json',
  37  |   });
  38  |   await choosePrep(page, '● 1号盘');
  39  |   await tap(page, 'supply-apple');
  40  |   await tap(page, 'note');
  41  |   await page.getByRole('button', { name: '图片 banana', exact: true }).tap();
  42  |   await page.getByRole('button', { name: '交给小猫', exact: true }).tap();
  43  |   await page.getByRole('button', { name: '送给客人 ↗' }).tap(); // blocked by this tray reservation, not a language error
  44  |   expect((await state(page)).attempts).toHaveLength(0);
  45  |   const samples = await page.evaluate(async () => {
  46  |     const values: { x: number; y: number }[] = [];
  47  |     for (let i = 0; i < 120; i++) {
  48  |       await new Promise<void>((r) => requestAnimationFrame(() => r()));
  49  |       const c = document.querySelector('canvas');
  50  |       values.push({ x: Number(c?.dataset.catX), y: Number(c?.dataset.catY) });
  51  |     }
  52  |     return values;
  53  |   });
  54  |   let max = 0;
  55  |   for (let i = 1; i < samples.length; i++) {
  56  |     const a = samples[i],
  57  |       b = samples[i - 1];
  58  |     if (a && b) max = Math.max(max, Math.hypot(a.x - b.x, a.y - b.y));
  59  |   }
  60  |   expect(max).toBeLessThan(0.08);
  61  |   await writeFile(info.outputPath('continuous-actor-samples.json'), JSON.stringify(samples));
  62  |   await info.attach('continuous-actor-samples', {
  63  |     body: JSON.stringify(samples),
  64  |     contentType: 'application/json',
  65  |   });
  66  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  67  |   const before = await state(page);
  68  |   await page.waitForTimeout(400);
  69  |   expect((await state(page)).helper?.remaining).toBe(before.helper?.remaining);
  70  |   await page.setViewportSize({ width: 1024, height: 768 });
  71  |   await page.screenshot({ path: info.outputPath('pad-paused.png') });
  72  |   await page.getByRole('button', { name: '继续营业' }).tap();
  73  |   await expect.poll(async () => (await state(page)).helper, { timeout: 15000 }).toBeNull();
  74  | });
  75  | test('M2 endless replenishes, restores seed/cursor and bounds active state', async ({
  76  |   page,
  77  | }, info) => {
  78  |   test.setTimeout(200000);
  79  |   await startEndless(page);
  80  |   for (let n = 0; n < 8; n++) {
  81  |     await serve(page);
  82  |     await lesson(page);
  83  |   }
  84  |   const before = await state(page);
  85  |   expect(before.session.served).toBe(8);
  86  |   expect(before.orders).toHaveLength(2);
  87  |   await page.getByRole('button', { name: '暂停', exact: true }).tap();
  88  |   await page.getByRole('button', { name: '保存并回到首页' }).tap();
  89  |   await page.reload();
  90  |   await page.locator('.yard-endless .entry-main').tap();
  91  |   await page.getByRole('button', { name: '开始 / 继续' }).tap();
  92  |   const after = await state(page);
  93  |   expect(after.session.seed).toBe(before.session.seed);
  94  |   expect(after.session.cursor).toBe(before.session.cursor);
  95  |   expect(after.orders).toEqual(before.orders);
  96  |   await page.screenshot({ path: info.outputPath('endless-continued.png') });
  97  | });
  98  | test('M2 drag and keyboard equivalent; selected guest never changes to correct answer', async ({
  99  |   page,
  100 | }) => {
  101 |   await startEndless(page);
  102 |   await choosePrep(page, '● 1号盘');
  103 |   await drag(page, 'supply-apple', 'tray-0');
  104 |   expect(
  105 |     (await state(page)).items.some((i) => i.product === 'apple' && i.location.startsWith('tray:0')),
  106 |   ).toBe(true);
  107 |   await page.locator('[data-hotspot="supply-banana"]').press('Enter');
  108 |   expect((await state(page)).items).toHaveLength(2);
  109 |   const before = await state(page);
  110 |   await tap(page, 'guest-1');
  111 |   expect((await state(page)).attempts.length).toBe(before.attempts.length);
  112 |   await drag(page, 'tray-0', 'guest-1');
  113 |   expect((await state(page)).orders[0]?.status).toBe('waiting');
  114 | });
  115 | test('M2 phone DPR and Pad composition, failed asset/audio retry keeps progress', async ({
  116 |   page,
  117 | }, info) => {
  118 |   await page.setViewportSize({ width: 768, height: 1024 });
  119 |   let deny = true;
  120 |   await page.route('**/assets/banana.webp*', (r) => (deny ? r.abort() : r.continue()));
  121 |   await page.route('**/audio/request-*.wav*', (r) => r.abort());
  122 |   await startStory(page);
> 123 |   await expect(page.locator('.resource-alert')).toBeVisible();
      |                                                 ^ Error: expect(locator).toBeVisible() failed
  124 |   const before = await state(page);
  125 |   deny = false;
  126 |   await page.getByRole('button', { name: '重试画面' }).tap();
  127 |   await expect(page.locator('.resource-alert')).toHaveCount(0);
  128 |   expect((await state(page)).runId).toBe(before.runId);
  129 |   await page.setViewportSize({ width: 1024, height: 768 });
  130 |   await page.screenshot({ path: info.outputPath('pad-landscape.png') });
  131 |   expect(await page.evaluate(() => document.documentElement.scrollHeight === innerHeight)).toBe(
  132 |     true,
  133 |   );
  134 | });
  135 | 
  136 | test('M2 teaching practice starts at the courtyard and completes its own five-request session', async ({
  137 |   page,
  138 | }, info) => {
  139 |   test.setTimeout(160000);
  140 |   await page.goto('/');
  141 |   await page.locator('.yard-training .entry-main').tap();
  142 |   await page.getByRole('button', { name: '开始 / 继续', exact: true }).tap();
  143 |   await lesson(page);
  144 |   expect((await state(page)).session.activity).toBe('training');
  145 |   const total = (await state(page)).orders.length;
  146 |   expect(total).toBe(5);
  147 |   for (let n = 0; n < total; n++) await serve(page);
  148 |   await expect(page.locator('.ending')).toBeVisible();
  149 |   const profile = await page.evaluate(() =>
  150 |     JSON.parse(localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}'),
  151 |   );
  152 |   expect(profile.completed).toEqual([]);
  153 |   await page.screenshot({ path: info.outputPath('training-ending.png') });
  154 |   await page.getByRole('button', { name: '回小院', exact: true }).tap();
  155 |   await expect(page.locator('.yard-story')).toBeVisible();
  156 | });
  157 | 
```