# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> phone replay follows hedgehog path with real food and no packing task
- Location: e2e/adventure.spec.ts:251:1

# Error details

```
Error: page.evaluate: Test ended.
```

# Test source

```ts
  1   | import { mkdirSync } from 'node:fs';
  2   | import { basename, join } from 'node:path';
  3   | import { expect, type Page } from '@playwright/test';
  4   | import { REQUESTS } from '../src/content/catalog';
  5   | import { type Product, RAW, RECIPES } from '../src/content/recipes';
  6   | import type { GameState } from '../src/rules/types';
  7   | export const state = (p: Page): Promise<GameState> =>
  8   |   p.evaluate(() => JSON.parse(localStorage.getItem('tabby.foodtruck.save.m2') ?? '{}'));
  9   | export async function hot(p: Page, id: string, dy = 0) {
  10  |   const b = await p.locator(`[data-hotspot="${id}"]`).boundingBox();
  11  |   if (!b) throw Error(id);
  12  |   return { x: b.x + b.width / 2, y: b.y + b.height / 2 + dy };
  13  | }
  14  | export async function tap(p: Page, id: string, dy = 0) {
  15  |   const q = await hot(p, id, dy);
  16  |   await p.touchscreen.tap(q.x, q.y);
  17  | }
  18  | async function dismissOpening(p: Page) {
  19  |   const dialog = p.getByRole('dialog', { name: '章节开场' });
  20  |   if (!(await dialog.count())) return;
  21  |   const visualContinue = dialog.getByRole('button', { name: '看图继续 ↗' });
  22  |   const button = (await visualContinue.isVisible())
  23  |     ? visualContinue
  24  |     : dialog.getByRole('button', { name: '跳过开场' });
  25  |   try {
  26  |     await button.tap();
  27  |   } catch (error) {
  28  |     if (await dialog.count()) throw error;
  29  |   }
  30  |   await expect(dialog).toHaveCount(0);
  31  | }
  32  | export async function lesson(p: Page) {
  33  |   await dismissOpening(p);
> 34  |   await p.evaluate(
      |           ^ Error: page.evaluate: Test ended.
  35  |     () =>
  36  |       new Promise<void>((resolve) =>
  37  |         requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
  38  |       ),
  39  |   );
  40  |   const button = p.getByRole('button', { name: '我来试试', exact: true });
  41  |   if (await button.count()) await button.tap();
  42  |   await expect(p.locator('.loading-page')).toHaveCount(0);
  43  | }
  44  | export async function startStory(p: Page) {
  45  |   await p.goto('/');
  46  |   await p.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).tap();
  47  |   await p.getByRole('button', { name: '先帮兔兔', exact: true }).tap();
  48  |   await p.getByRole('button', { name: '去厨房备餐', exact: true }).tap();
  49  |   await expect(p.getByRole('dialog', { name: '场景小教学' })).toBeVisible();
  50  |   await lesson(p);
  51  | }
  52  | export async function startEndless(p: Page, less = true) {
  53  |   await p.goto('/');
  54  |   await p.locator('.yard-endless .entry-main').tap();
  55  |   if (less) {
  56  |     await p.getByRole('button', { name: '少些帮助，听一听' }).tap();
  57  |     await p.getByRole('button', { name: '两位一起招呼' }).tap();
  58  |   }
  59  |   await p.getByRole('button', { name: '开门 / 继续营业' }).tap();
  60  |   await lesson(p);
  61  | }
  62  | export async function choosePrep(p: Page, name: string) {
  63  |   await tap(
  64  |     p,
  65  |     name.includes('盘')
  66  |       ? name.includes('2')
  67  |         ? 'tray-1'
  68  |         : 'tray-0'
  69  |       : name === '果汁机'
  70  |         ? 'machine-apple'
  71  |         : name === '冰淇淋台'
  72  |           ? 'station-ice'
  73  |           : name === '煎台'
  74  |             ? 'station-grill'
  75  |             : 'station-board',
  76  |   );
  77  | }
  78  | export async function make(
  79  |   p: Page,
  80  |   product: Product,
  81  |   restore?: Set<string>,
  82  | ): Promise<string | null> {
  83  |   if (RAW.includes(product)) {
  84  |     await tap(p, `supply-${product}`);
  85  |     return null;
  86  |   }
  87  |   const recipe = RECIPES.find((r) => r.output === product);
  88  |   if (!recipe) throw Error(product);
  89  |   if ((await state(p)).session.family !== recipe.family) await tap(p, `family-${recipe.family}`);
  90  |   await expect(p.locator('.loading-page')).toHaveCount(0);
  91  |   const prep =
  92  |     recipe.station === 'machine'
  93  |       ? '果汁机'
  94  |       : recipe.station === 'ice'
  95  |         ? '冰淇淋台'
  96  |         : recipe.station === 'grill'
  97  |           ? '煎台'
  98  |           : '组合板';
  99  |   await choosePrep(p, prep);
  100 |   for (const input of recipe.inputs) {
  101 |     if (RAW.includes(input)) {
  102 |       if (
  103 |         input !== 'cup' ||
  104 |         !(await state(p)).items.some(
  105 |           (i) => i.location === 'machine:cup' && recipe.station === 'machine',
  106 |         )
  107 |       )
  108 |         await tap(p, `supply-${input}`);
  109 |     } else {
  110 |       const id = await make(p, input, restore);
  111 |       if (!id) throw Error(input);
  112 |       if (
  113 |         !(await state(p)).items
  114 |           .find((i) => i.id === id)
  115 |           ?.location.startsWith(`station:${recipe.station}:`)
  116 |       ) {
  117 |         await tap(p, `item-${id}`);
  118 |         await choosePrep(p, prep);
  119 |       } else await choosePrep(p, prep);
  120 |     }
  121 |   }
  122 |   if (recipe.station === 'board') {
  123 |     // Inspect settled ingredient slots, not an ingredient crossing the counter in transit.
  124 |     await p.waitForTimeout(260);
  125 |     for (const item of (await state(p)).items.filter((i) =>
  126 |       i.location.startsWith('station:board:'),
  127 |     )) {
  128 |       await tap(p, `item-${item.id}`);
  129 |       await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
  130 |         'aria-pressed',
  131 |         'true',
  132 |       );
  133 |     }
  134 |   }
```