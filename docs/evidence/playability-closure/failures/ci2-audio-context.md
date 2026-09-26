# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: m22-boundaries.spec.ts >> audio loading failure exposes correct retry, never blocks supplies or creates a language error
- Location: e2e/m22-boundaries.spec.ts:131:1

# Error details

```
Error: expect(locator).toHaveCount(expected) failed

Locator:  getByRole('button', { name: '跳过开场' })
Expected: 0
Received: 1
Timeout:  6000ms

Call log:
  - Expect "toHaveCount" getByRole('button', { name: '跳过开场' }) with timeout 6000ms
  - waiting for getByRole('button', { name: '跳过开场' })
    14 × locator resolved to 1 element
       - unexpected value "1"

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 晨光果汁 0 / 4
      - button "声音状态" [ref=e7] [cursor=pointer]: ♫!
    - group "餐车操作":
      - button "客人B：选择并重听请求" [disabled]
      - button "果汁机苹果入口" [disabled]
      - button "果汁机杯座" [disabled]
      - button "启动果汁机" [disabled]
      - button "请小猫帮忙" [disabled]
      - button "1号托盘：放入食品或选择整盘" [disabled]
      - button "拿苹果" [disabled]
      - button "拿香蕉" [disabled]
      - button "拿空杯" [disabled]
    - dialog "章节开场" [ref=e8]:
      - paragraph [ref=e9]: 长辈的老客人来了。用水果做一杯清凉的问候吧。
      - status [ref=e10]:
        - paragraph [ref=e11]: 声音没播出来。看图也能继续。
        - button "♫ 重试声音" [ref=e12] [cursor=pointer]
        - button "看图继续 ↗" [ref=e13] [cursor=pointer]
      - button "跳过开场" [active] [ref=e14] [cursor=pointer]
    - generic:
      - status: 选好备餐位置，点食材就能放进去。
```

# Test source

```ts
  1   | import { expect, type Page } from '@playwright/test';
  2   | import { REQUESTS } from '../src/content/catalog';
  3   | import { CHAPTERS } from '../src/content/chapters';
  4   | import { type Product, RAW, RECIPES } from '../src/content/recipes';
  5   | import type { GameState } from '../src/rules/types';
  6   | export const state = (p: Page): Promise<GameState> =>
  7   |   p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}'));
  8   | export async function hot(p: Page, id: string, dy = 0) {
  9   |   const b = await p.locator(`[data-hotspot="${id}"]`).boundingBox();
  10  |   if (!b) throw Error(id);
  11  |   return { x: b.x + b.width / 2, y: b.y + b.height / 2 + dy };
  12  | }
  13  | export async function tap(p: Page, id: string, dy = 0) {
  14  |   const q = await hot(p, id, dy);
  15  |   await p.touchscreen.tap(q.x, q.y);
  16  | }
  17  | export async function lesson(p: Page) {
  18  |   const opening = p.getByRole('button', { name: '跳过开场' });
  19  |   if (await opening.count()) {
  20  |     try {
  21  |       await opening.tap({ timeout: 700 });
  22  |     } catch {
  23  |       await expect(opening).toHaveCount(0);
  24  |     }
  25  |   }
  26  |   await p.evaluate(
  27  |     () =>
  28  |       new Promise<void>((resolve) =>
  29  |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  30  |       ),
  31  |   );
  32  |   const button = p.getByRole('button', { name: '我来试试', exact: true });
  33  |   if (await button.count()) await button.tap();
  34  |   await expect(p.locator('.loading-page')).toHaveCount(0);
  35  | }
  36  | export async function startStory(p: Page) {
  37  |   await p.goto('/');
  38  |   await p.locator('.yard-story .entry-main').tap();
  39  |   await p.getByRole('button', { name: '跳过序章' }).tap();
  40  |   await p.getByRole('button', { name: '晨光果汁', exact: true }).tap();
  41  |   const opening = p.getByRole('button', { name: '跳过开场' });
  42  |   if (await opening.count()) {
  43  |     try {
  44  |       await opening.tap({ timeout: 700 });
  45  |     } catch {
> 46  |       await expect(opening).toHaveCount(0);
      |                             ^ Error: expect(locator).toHaveCount(expected) failed
  47  |     }
  48  |   }
  49  |   await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  50  |   await p.waitForTimeout(500);
  51  |   await lesson(p);
  52  | }
  53  | export async function startEndless(p: Page, less = true) {
  54  |   await p.goto('/');
  55  |   await p.locator('.yard-endless .entry-main').tap();
  56  |   if (less) {
  57  |     await p.getByRole('button', { name: '少些帮助，听一听' }).tap();
  58  |     await p.getByRole('button', { name: '两位一起招呼' }).tap();
  59  |   }
  60  |   await p.getByRole('button', { name: '开始 / 继续' }).tap();
  61  |   await lesson(p);
  62  | }
  63  | export async function choosePrep(p: Page, name: string) {
  64  |   await tap(
  65  |     p,
  66  |     name.includes('盘')
  67  |       ? name.includes('2')
  68  |         ? 'tray-1'
  69  |         : 'tray-0'
  70  |       : name === '果汁机'
  71  |         ? 'machine-apple'
  72  |         : name === '冰淇淋台'
  73  |           ? 'station-ice'
  74  |           : name === '煎台'
  75  |             ? 'station-grill'
  76  |             : 'station-board',
  77  |   );
  78  | }
  79  | export async function make(
  80  |   p: Page,
  81  |   product: Product,
  82  |   restore?: Set<string>,
  83  | ): Promise<string | null> {
  84  |   if (RAW.includes(product)) {
  85  |     await tap(p, `supply-${product}`);
  86  |     return null;
  87  |   }
  88  |   const recipe = RECIPES.find((r) => r.output === product);
  89  |   if (!recipe) throw Error(product);
  90  |   const family = {
  91  |     juice: '果汁',
  92  |     ice: '冰淇淋',
  93  |     sandwich: '三明治',
  94  |     burger: '汉堡',
  95  |     ready: '水果与预制点心',
  96  |   }[recipe.family];
  97  |   if ((await state(p)).session.family !== recipe.family) {
  98  |     await p.getByRole('button', { name: '选择食谱', exact: true }).tap();
  99  |     await p
  100 |       .getByRole('group', { name: '选择食谱工作台' })
  101 |       .getByRole('button', { name: family, exact: true })
  102 |       .tap();
  103 |   }
  104 |   await expect(p.locator('.loading-page')).toHaveCount(0);
  105 |   const prep =
  106 |     recipe.station === 'machine'
  107 |       ? '果汁机'
  108 |       : recipe.station === 'ice'
  109 |         ? '冰淇淋台'
  110 |         : recipe.station === 'grill'
  111 |           ? '煎台'
  112 |           : '组合板';
  113 |   await choosePrep(p, prep);
  114 |   for (const input of recipe.inputs) {
  115 |     if (RAW.includes(input)) {
  116 |       if (
  117 |         input !== 'cup' ||
  118 |         !(await state(p)).items.some(
  119 |           (i) => i.location === 'machine:cup' && recipe.station === 'machine',
  120 |         )
  121 |       )
  122 |         await tap(p, `supply-${input}`);
  123 |     } else {
  124 |       const id = await make(p, input, restore);
  125 |       if (!id) throw Error(input);
  126 |       if (
  127 |         !(await state(p)).items
  128 |           .find((i) => i.id === id)
  129 |           ?.location.startsWith(`station:${recipe.station}:`)
  130 |       ) {
  131 |         await tap(p, `item-${id}`);
  132 |         await choosePrep(p, prep);
  133 |       } else await choosePrep(p, prep);
  134 |     }
  135 |   }
  136 |   if (recipe.station === 'board') {
  137 |     // Inspect settled ingredient slots, not an ingredient crossing the counter in transit.
  138 |     await p.waitForTimeout(260);
  139 |     for (const item of (await state(p)).items.filter((i) =>
  140 |       i.location.startsWith('station:board:'),
  141 |     )) {
  142 |       await tap(p, `item-${item.id}`);
  143 |       await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
  144 |         'aria-pressed',
  145 |         'true',
  146 |       );
```