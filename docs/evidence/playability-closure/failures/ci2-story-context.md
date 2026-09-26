# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> M2 phone complete click story: prologue through all recipes to community ending
- Location: e2e/game.spec.ts:14:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: "processing"
Received: "empty"
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 野餐三明治 0 / 3
    - group "餐车操作":
      - button "客人A：选择并重听请求" [disabled]
      - button "选择组合板备餐" [disabled]
      - button "组合板开始制作" [disabled]
      - button "请小猫帮忙" [disabled]
      - button "1号托盘：放入食品或选择整盘" [disabled]
      - button "拿面包" [disabled]
      - button "拿芝士" [disabled]
      - button "拿生菜" [disabled]
      - button "拿番茄" [disabled]
      - button "芝士三明治，1号盘" [disabled]
    - generic:
      - status: 盖合开始了，还能准备另一盘。
  - dialog "休息一下" [ref=e8]:
    - heading "歇一歇，食物会等你。" [level=2] [ref=e9]
    - button "继续营业" [active] [ref=e10] [cursor=pointer]
    - button "设置" [ref=e11] [cursor=pointer]
    - button "保存并回到首页" [ref=e12] [cursor=pointer]
```

# Test source

```ts
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
  147 |     }
  148 |   }
  149 |   await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  150 |   if (restore?.has(recipe.station)) {
  151 |     restore.delete(recipe.station);
  152 |     await p.getByRole('button', { name: '暂停', exact: true }).tap();
  153 |     const before = await state(p);
  154 |     const chapter = CHAPTERS[before.session.chapter];
  155 |     if (!chapter) throw Error('chapter');
  156 |     expect(
  157 |       recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status,
> 158 |     ).toBe('processing');
      |       ^ Error: expect(received).toBe(expected) // Object.is equality
  159 |     if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
  160 |     await p.reload();
  161 |     await p.locator('.yard-story .entry-main').tap();
  162 |     await p.getByRole('button', { name: chapter.title, exact: true }).tap();
  163 |     await lesson(p);
  164 |     const after = await state(p);
  165 |     expect(after.runId).toBe(before.runId);
  166 |     const inputs = before.items.filter((i) => i.location.startsWith(`station:${recipe.station}:`));
  167 |     const source = inputs[0];
  168 |     const target = before.routing[recipe.station];
  169 |     if (!source || !target) throw Error('processing station lost input or output reservation');
  170 |     const output = after.items.find((i) => i.id === source.id && i.product === product);
  171 |     if (output) {
  172 |       expect(after.items.map((i) => i.id).sort()).toEqual(
  173 |         before.items
  174 |           .filter((i) => !inputs.some((input) => input.id === i.id) || i.id === source.id)
  175 |           .map((i) => i.id)
  176 |           .sort(),
  177 |       );
  178 |       for (const item of before.items.filter((i) => !inputs.some((input) => input.id === i.id)))
  179 |         expect(after.items.find((i) => i.id === item.id)).toEqual(item);
  180 |       expect(output.location).toBe(
  181 |         'station' in target
  182 |           ? `station:${target.station}:${target.slot}`
  183 |           : `tray:${target.tray}:${target.slot}`,
  184 |       );
  185 |     } else {
  186 |       expect(after.items).toEqual(before.items);
  187 |       expect(
  188 |         recipe.station === 'machine' ? after.machine.status : after.stations[recipe.station].status,
  189 |       ).toBe('processing');
  190 |     }
  191 |     // Restart measurement after navigation; no gameplay state is injected.
  192 |     await p.evaluate(() => {
  193 |       const m = Reflect.get(window, 'm2measure');
  194 |       if (m) {
  195 |         m.running = true;
  196 |         m.last = 0;
  197 |       }
  198 |     });
  199 |   }
  200 | 
  201 |   await expect
  202 |     .poll(
  203 |       async () =>
  204 |         (await state(p)).items.some(
  205 |           (i) =>
  206 |             i.product === product &&
  207 |             (recipe.station === 'grill'
  208 |               ? i.location.startsWith('station:board:')
  209 |               : i.location.startsWith('tray:')),
  210 |         ),
  211 |       { timeout: 15000 },
  212 |     )
  213 |     .toBe(true);
  214 |   const item = (await state(p)).items.find(
  215 |     (i) =>
  216 |       i.product === product &&
  217 |       (recipe.station === 'grill'
  218 |         ? i.location.startsWith('station:board:')
  219 |         : i.location.startsWith('tray:')),
  220 |   );
  221 |   if (!item) throw Error(product);
  222 |   return item.id;
  223 | }
  224 | export async function serve(p: Page, restore?: Set<string>) {
  225 |   await lesson(p);
  226 |   const s = await state(p),
  227 |     order = s.orders.find((o) => o.status === 'waiting');
  228 |   if (!order) throw Error('waiting');
  229 |   for (const product of REQUESTS[order.request].products) {
  230 |     if (RAW.includes(product)) {
  231 |       await choosePrep(p, '● 1号盘');
  232 |       await make(p, product);
  233 |     } else {
  234 |       const id = await make(p, product, restore);
  235 |       if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
  236 |         await tap(p, `item-${id}`);
  237 |         await choosePrep(p, '● 1号盘');
  238 |       }
  239 |     }
  240 |   }
  241 |   // Explicit target chosen without a UI correctness gate. Tests read state; never inject it.
  242 |   const label =
  243 |     s.orders.filter((o) => o.status === 'waiting').length === 1
  244 |       ? '送餐 ↗'
  245 |       : order.seat === 0
  246 |         ? '送给左边客人 ↗'
  247 |         : '送给右边客人 ↗';
  248 |   if (s.orders.filter((o) => o.status === 'waiting').length > 1)
  249 |     await p.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  250 |   await p.getByRole('button', { name: label, exact: true }).tap();
  251 |   await expect
  252 |     .poll(
  253 |       async () => {
  254 |         const next = await state(p);
  255 |         return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
  256 |       },
  257 |       { timeout: 18000 },
  258 |     )
```