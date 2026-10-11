# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wp-dual-growth.spec.ts >> deferred menu introduction returns after another completed order
- Location: e2e/wp-dual-growth.spec.ts:4:1

# Error details

```
Error: touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscreen.
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=e7] [cursor=pointer]
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e8] [cursor=pointer]
      - button "切换果汁机" [ref=e9] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
    - button "带作品到活动桌" [ref=e10] [cursor=pointer]
    - button "点请求气泡重听" [ref=e11] [cursor=pointer]:
      - img "苹果"
      - generic [ref=e12]: ♫
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  1   | import { expect, type Page } from '@playwright/test';
  2   | import { REQUESTS } from '../src/content/catalog';
  3   | import { type Product, RAW, RECIPES } from '../src/content/recipes';
  4   | import type { GameState } from '../src/rules/types';
  5   | export const state = (p: Page): Promise<GameState> =>
  6   |   p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}'));
  7   | export async function hot(p: Page, id: string, dy = 0) {
  8   |   const b = await p.locator(`[data-hotspot="${id}"]`).boundingBox();
  9   |   if (!b) throw Error(id);
  10  |   return { x: b.x + b.width / 2, y: b.y + b.height / 2 + dy };
  11  | }
  12  | export async function tap(p: Page, id: string, dy = 0) {
  13  |   const q = await hot(p, id, dy);
> 14  |   await p.touchscreen.tap(q.x, q.y);
      |                       ^ Error: touchscreen.tap: hasTouch must be enabled on the browser context before using the touchscreen.
  15  | }
  16  | async function dismissOpening(p: Page) {
  17  |   const dialog = p.getByRole('dialog', { name: '章节开场' });
  18  |   if (!(await dialog.count())) return;
  19  |   const visualContinue = dialog.getByRole('button', { name: '看图继续 ↗' });
  20  |   const button = (await visualContinue.isVisible())
  21  |     ? visualContinue
  22  |     : dialog.getByRole('button', { name: '跳过开场' });
  23  |   try {
  24  |     await button.tap();
  25  |   } catch (error) {
  26  |     if (await dialog.count()) throw error;
  27  |   }
  28  |   await expect(dialog).toHaveCount(0);
  29  | }
  30  | export async function lesson(p: Page) {
  31  |   await dismissOpening(p);
  32  |   await p.evaluate(
  33  |     () =>
  34  |       new Promise<void>((resolve) =>
  35  |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  36  |       ),
  37  |   );
  38  |   const button = p.getByRole('button', { name: '我来试试', exact: true });
  39  |   if (await button.count()) await button.tap();
  40  |   await expect(p.locator('.loading-page')).toHaveCount(0);
  41  | }
  42  | export async function startStory(p: Page) {
  43  |   await p.goto('/');
  44  |   await p.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).tap();
  45  |   await p.getByRole('button', { name: '去厨房备餐', exact: true }).tap();
  46  |   await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  47  |   await lesson(p);
  48  | }
  49  | export async function startEndless(p: Page, less = true) {
  50  |   await p.goto('/');
  51  |   await p.locator('.yard-endless .entry-main').tap();
  52  |   if (less) {
  53  |     await p.getByRole('button', { name: '少些帮助，听一听' }).tap();
  54  |     await p.getByRole('button', { name: '两位一起招呼' }).tap();
  55  |   }
  56  |   await p.getByRole('button', { name: '开门 / 继续营业' }).tap();
  57  |   await lesson(p);
  58  | }
  59  | export async function choosePrep(p: Page, name: string) {
  60  |   await tap(
  61  |     p,
  62  |     name.includes('盘')
  63  |       ? name.includes('2')
  64  |         ? 'tray-1'
  65  |         : 'tray-0'
  66  |       : name === '果汁机'
  67  |         ? 'machine-apple'
  68  |         : name === '冰淇淋台'
  69  |           ? 'station-ice'
  70  |           : name === '煎台'
  71  |             ? 'station-grill'
  72  |             : 'station-board',
  73  |   );
  74  | }
  75  | export async function make(
  76  |   p: Page,
  77  |   product: Product,
  78  |   restore?: Set<string>,
  79  | ): Promise<string | null> {
  80  |   if (RAW.includes(product)) {
  81  |     await tap(p, `supply-${product}`);
  82  |     return null;
  83  |   }
  84  |   const recipe = RECIPES.find((r) => r.output === product);
  85  |   if (!recipe) throw Error(product);
  86  |   if ((await state(p)).session.family !== recipe.family) await tap(p, `family-${recipe.family}`);
  87  |   await expect(p.locator('.loading-page')).toHaveCount(0);
  88  |   const prep =
  89  |     recipe.station === 'machine'
  90  |       ? '果汁机'
  91  |       : recipe.station === 'ice'
  92  |         ? '冰淇淋台'
  93  |         : recipe.station === 'grill'
  94  |           ? '煎台'
  95  |           : '组合板';
  96  |   await choosePrep(p, prep);
  97  |   for (const input of recipe.inputs) {
  98  |     if (RAW.includes(input)) {
  99  |       if (
  100 |         input !== 'cup' ||
  101 |         !(await state(p)).items.some(
  102 |           (i) => i.location === 'machine:cup' && recipe.station === 'machine',
  103 |         )
  104 |       )
  105 |         await tap(p, `supply-${input}`);
  106 |     } else {
  107 |       const id = await make(p, input, restore);
  108 |       if (!id) throw Error(input);
  109 |       if (
  110 |         !(await state(p)).items
  111 |           .find((i) => i.id === id)
  112 |           ?.location.startsWith(`station:${recipe.station}:`)
  113 |       ) {
  114 |         await tap(p, `item-${id}`);
```