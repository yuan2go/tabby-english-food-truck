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
Received: "loaded"
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
      - button "客人B：选择并重听请求" [disabled]
      - button "选择组合板备餐" [disabled]
      - button "组合板开始制作" [disabled]
      - button "请小猫帮忙" [disabled]
      - button "1号托盘：放入食品或选择整盘" [disabled]
      - button "拿面包" [disabled]
      - button "拿芝士" [disabled]
      - button "拿生菜" [disabled]
      - button "拿番茄" [disabled]
      - button "面包，组合板" [disabled]
      - button "面包，组合板" [disabled]
    - generic:
      - status: 已放回原料。
  - dialog "休息一下" [ref=e8]:
    - heading "歇一歇，食物会等你。" [level=2] [ref=e9]
    - button "继续营业" [active] [ref=e10] [cursor=pointer]
    - button "设置" [ref=e11] [cursor=pointer]
    - button "保存并回到首页" [ref=e12] [cursor=pointer]
```

# Test source

```ts
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
  137 |     for (const item of (await state(p)).items.filter((i) =>
  138 |       i.location.startsWith('station:board:'),
  139 |     )) {
  140 |       await tap(p, `item-${item.id}`);
  141 |       await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
  142 |         'aria-pressed',
  143 |         'true',
  144 |       );
  145 |     }
  146 |   }
  147 |   await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  148 |   if (restore?.has(recipe.station)) {
  149 |     restore.delete(recipe.station);
  150 |     await p.getByRole('button', { name: '暂停', exact: true }).tap();
  151 |     const before = await state(p);
  152 |     const chapter = CHAPTERS[before.session.chapter];
  153 |     if (!chapter) throw Error('chapter');
  154 |     expect(
  155 |       recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status,
> 156 |     ).toBe('processing');
      |       ^ Error: expect(received).toBe(expected) // Object.is equality
  157 |     if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
  158 |     await p.reload();
  159 |     await p.locator('.yard-story .entry-main').tap();
  160 |     await p.getByRole('button', { name: chapter.title, exact: true }).tap();
  161 |     await lesson(p);
  162 |     const after = await state(p);
  163 |     expect(after.runId).toBe(before.runId);
  164 |     expect(after.items.map((i) => i.id)).toEqual(before.items.map((i) => i.id));
  165 |     // Restart measurement after navigation; no gameplay state is injected.
  166 |     await p.evaluate(() => {
  167 |       const m = Reflect.get(window, 'm2measure');
  168 |       if (m) {
  169 |         m.running = true;
  170 |         m.last = 0;
  171 |       }
  172 |     });
  173 |   }
  174 | 
  175 |   await expect
  176 |     .poll(
  177 |       async () =>
  178 |         (await state(p)).items.some(
  179 |           (i) =>
  180 |             i.product === product &&
  181 |             (recipe.station === 'grill'
  182 |               ? i.location.startsWith('station:board:')
  183 |               : i.location.startsWith('tray:')),
  184 |         ),
  185 |       { timeout: 15000 },
  186 |     )
  187 |     .toBe(true);
  188 |   const item = (await state(p)).items.find(
  189 |     (i) =>
  190 |       i.product === product &&
  191 |       (recipe.station === 'grill'
  192 |         ? i.location.startsWith('station:board:')
  193 |         : i.location.startsWith('tray:')),
  194 |   );
  195 |   if (!item) throw Error(product);
  196 |   return item.id;
  197 | }
  198 | export async function serve(p: Page, restore?: Set<string>) {
  199 |   await lesson(p);
  200 |   const s = await state(p),
  201 |     order = s.orders.find((o) => o.status === 'waiting');
  202 |   if (!order) throw Error('waiting');
  203 |   for (const product of REQUESTS[order.request].products) {
  204 |     if (RAW.includes(product)) {
  205 |       await choosePrep(p, '● 1号盘');
  206 |       await make(p, product);
  207 |     } else {
  208 |       const id = await make(p, product, restore);
  209 |       if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
  210 |         await tap(p, `item-${id}`);
  211 |         await choosePrep(p, '● 1号盘');
  212 |       }
  213 |     }
  214 |   }
  215 |   // Explicit target chosen without a UI correctness gate. Tests read state; never inject it.
  216 |   const label =
  217 |     s.orders.filter((o) => o.status === 'waiting').length === 1
  218 |       ? '送餐 ↗'
  219 |       : order.seat === 0
  220 |         ? '送给左边客人 ↗'
  221 |         : '送给右边客人 ↗';
  222 |   if (s.orders.filter((o) => o.status === 'waiting').length > 1)
  223 |     await p.getByRole('button', { name: '送餐 ↗', exact: true }).tap();
  224 |   await p.getByRole('button', { name: label, exact: true }).tap();
  225 |   await expect
  226 |     .poll(
  227 |       async () => {
  228 |         const next = await state(p);
  229 |         return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
  230 |       },
  231 |       { timeout: 18000 },
  232 |     )
  233 |     .toBe('done');
  234 | }
  235 | export async function drag(p: Page, from: string, to: string) {
  236 |   const a = await hot(p, from, from.startsWith('tray') ? 25 : 0),
  237 |     b = await hot(p, to);
  238 |   const c = await p.context().newCDPSession(p);
  239 |   await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  240 |   for (let n = 1; n <= 10; n++)
  241 |     await c.send('Input.dispatchTouchEvent', {
  242 |       type: 'touchMove',
  243 |       touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
  244 |     });
  245 |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  246 |   await c.detach();
  247 | }
  248 | 
```