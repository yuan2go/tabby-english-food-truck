# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-playability-visible.spec.ts >> visible picture and recipe walk completes four cooking families and mixed late service
- Location: e2e/m22-playability-visible.spec.ts:157:1

# Error details

```
Test timeout of 600000ms exceeded.
```

```
Error: locator.boundingBox: Test timeout of 600000ms exceeded.
Call log:
  - waiting for locator('[data-hotspot="note"]')
    - locator resolved to visible <button tabindex="0" type="button" aria-label="请小猫帮忙" data-hotspot="note">请小猫帮忙</button>

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 黄昏汉堡 2 / 3
    - group "餐车操作":
      - button "客人A：选择并重听请求"
      - button "选择煎台备餐"
      - button "煎台开始制作"
      - button "选择组合板备餐"
      - button "组合板开始制作"
      - button "请小猫帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿圆面包"
      - button "拿生饼"
      - button "拿芝士"
      - button "拿生菜"
      - button "拿番茄"
    - button "选择食谱" [ref=e7] [cursor=pointer]: ▤
    - button "送餐 ↗" [ref=e8] [cursor=pointer]
    - button "点请求气泡重听" [ref=e9] [cursor=pointer]:
      - img "芝士三明治"
      - generic [ref=e10]: ♫
    - generic:
      - status: 1号盘是当前备餐位置，点食材添加。
```

# Test source

```ts
  1   | import { writeFile } from 'node:fs/promises';
  2   | import { expect, type Locator, type Page, test } from '@playwright/test';
  3   | 
  4   | test.use({
  5   |   viewport: { width: 393, height: 665 },
  6   |   deviceScaleFactor: 3,
  7   |   hasTouch: true,
  8   |   isMobile: true,
  9   | });
  10  | 
  11  | type Step = { station: string; inputs: string[]; output: string };
  12  | const cost = {
  13  |   navigation: 0,
  14  |   teaching: 0,
  15  |   help: 0,
  16  |   correction: 0,
  17  |   preparation: 0,
  18  |   waiting: 0,
  19  |   delivery: 0,
  20  | };
  21  | 
  22  | async function touch(page: Page, target: Locator, kind: keyof typeof cost) {
> 23  |   const box = await target.boundingBox();
      |                            ^ Error: locator.boundingBox: Test timeout of 600000ms exceeded.
  24  |   if (!box) throw Error(`Missing visible target: ${await target.getAttribute('aria-label')}`);
  25  |   await page.touchscreen.tap(box.x + box.width / 2, box.y + box.height / 2);
  26  |   cost[kind]++;
  27  | }
  28  | 
  29  | async function click(target: Locator, kind: keyof typeof cost) {
  30  |   await target.tap();
  31  |   cost[kind]++;
  32  | }
  33  | 
  34  | async function dismissTeaching(page: Page) {
  35  |   const opening = page.getByRole('button', { name: '跳过开场' });
  36  |   if (await opening.count()) await click(opening, 'teaching');
  37  |   const lesson = page.getByRole('button', { name: '我来试试' });
  38  |   if (await lesson.count()) await click(lesson, 'teaching');
  39  | }
  40  | 
  41  | async function pictureRequest(page: Page, seat: 0 | 1): Promise<string[]> {
  42  |   await touch(
  43  |     page,
  44  |     page.locator(`[data-hotspot^="guest-"][aria-label^="客人${seat === 0 ? 'A' : 'B'}"]`),
  45  |     'help',
  46  |   );
  47  |   await touch(page, page.locator('[data-hotspot="note"]'), 'help');
  48  |   await click(page.getByRole('button', { name: '看看客人想要什么' }), 'help');
  49  |   const picture = page.locator('.request-picture');
  50  |   await expect(picture).toBeVisible();
  51  |   const products = await picture
  52  |     .locator('img')
  53  |     .evaluateAll((images) => images.map((image) => image.getAttribute('alt') ?? ''));
  54  |   await click(page.getByRole('button', { name: '收起文字帮助' }), 'help');
  55  |   return products;
  56  | }
  57  | 
  58  | async function readVisibleRecipe(page: Page, expected: string): Promise<Step[]> {
  59  |   await touch(page, page.locator('[data-hotspot="note"]'), 'help');
  60  |   await click(page.getByRole('button', { name: '看食谱与示范' }), 'help');
  61  |   const recipeButton = page.getByRole('button', { name: '看看怎么做' });
  62  |   if (await recipeButton.count()) await click(recipeButton, 'help');
  63  |   await expect(page.locator('.lesson-process')).toBeVisible();
  64  |   const stepButtons = page.locator('.lesson-stepper button');
  65  |   const count = Math.max(1, await stepButtons.count());
  66  |   const steps: Step[] = [];
  67  |   for (let index = 0; index < count; index++) {
  68  |     if (count > 1) await click(stepButtons.nth(index), 'help');
  69  |     const station = (await page.locator('.lesson-process').innerText()).split('→')[0]?.trim() ?? '';
  70  |     const images = await page
  71  |       .locator('.lesson-ingredients img')
  72  |       .evaluateAll((nodes) => nodes.map((node) => node.getAttribute('alt') ?? ''));
  73  |     const output = images.at(-1) ?? '';
  74  |     steps.push({ station, inputs: images.slice(0, -1), output });
  75  |   }
  76  |   expect(steps.at(-1)?.output).toBe(expected);
  77  |   await click(page.getByRole('button', { name: '我来试试' }), 'help');
  78  |   return steps;
  79  | }
  80  | 
  81  | async function chooseFamily(page: Page, step: Step) {
  82  |   const name = step.station.includes('果汁机')
  83  |     ? '果汁'
  84  |     : step.station.includes('冰淇淋台')
  85  |       ? '冰淇淋'
  86  |       : step.station.includes('煎台') || step.inputs.includes('圆面包')
  87  |         ? '汉堡'
  88  |         : '三明治';
  89  |   const switcher = page.getByRole('button', { name: '选择食谱', exact: true });
  90  |   if (!(await switcher.count())) return;
  91  |   await click(switcher, 'preparation');
  92  |   await click(
  93  |     page.getByRole('group', { name: '选择食谱工作台' }).getByRole('button', { name, exact: true }),
  94  |     'preparation',
  95  |   );
  96  | }
  97  | 
  98  | async function prepareStep(page: Page, step: Step, tray: 0 | 1, previousOutput: string | null) {
  99  |   await chooseFamily(page, step);
  100 |   await touch(page, page.locator(`[data-hotspot="tray-${tray}"]`), 'preparation');
  101 |   const machine = step.station.includes('果汁机');
  102 |   const station = machine
  103 |     ? 'machine-apple'
  104 |     : step.station.includes('冰淇淋台')
  105 |       ? 'station-ice'
  106 |       : step.station.includes('煎台')
  107 |         ? 'station-grill'
  108 |         : 'station-board';
  109 |   await touch(page, page.locator(`[data-hotspot="${station}"]`), 'preparation');
  110 |   for (const input of step.inputs) {
  111 |     // The juice cup is a real instance placed by the machine-selection rule.
  112 |     if ((machine && input === '空杯') || input === previousOutput) continue;
  113 |     await touch(page, page.locator(`[aria-label="拿${input}"]`), 'preparation');
  114 |   }
  115 |   const start = machine ? 'start' : `start-station-${station.slice(8)}`;
  116 |   await touch(page, page.locator(`[data-hotspot="${start}"]`), 'preparation');
  117 |   cost.waiting++;
  118 |   await expect
  119 |     .poll(
  120 |       async () =>
  121 |         page
  122 |           .locator('[data-hotspot^="item-"]')
  123 |           .evaluateAll(
```