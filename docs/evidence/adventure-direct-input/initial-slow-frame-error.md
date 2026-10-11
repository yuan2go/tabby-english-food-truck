# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: game.spec.ts >> M2 phone complete click story: prologue through all recipes to community ending
- Location: e2e/game.spec.ts:15:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 15000ms exceeded while waiting on the predicate
```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - generic:
    - generic:
      - button "暂停" [ref=f1e6] [cursor=pointer]: Ⅱ
      - generic:
        - text: 野餐三明治 1 / 2
        - generic: 铺好野餐桌布 · 2/5
    - progressbar "铺好野餐桌布"
    - group "餐车操作":
      - button "客人A·长辈：选择并重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [active] [ref=f1e7] [cursor=pointer]
      - button "切换果汁机" [ref=f1e8] [cursor=pointer]
      - button "切换冰淇淋台" [ref=f1e9] [cursor=pointer]
      - button "切换组合板" [ref=f1e10] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "空杯，杯座"
      - button "苹果，机器入口"
    - button "点请求气泡重听" [ref=f1e11] [cursor=pointer]:
      - img "苹果汁"
      - generic [ref=f1e12]: ♫
    - generic:
      - status: 设备制作中 → 成品会到托盘；可以继续准备
```

# Test source

```ts
  112 |           .find((i) => i.id === id)
  113 |           ?.location.startsWith(`station:${recipe.station}:`)
  114 |       ) {
  115 |         await tap(p, `item-${id}`);
  116 |         await choosePrep(p, prep);
  117 |       } else await choosePrep(p, prep);
  118 |     }
  119 |   }
  120 |   if (recipe.station === 'board') {
  121 |     // Inspect settled ingredient slots, not an ingredient crossing the counter in transit.
  122 |     await p.waitForTimeout(260);
  123 |     for (const item of (await state(p)).items.filter((i) =>
  124 |       i.location.startsWith('station:board:'),
  125 |     )) {
  126 |       await tap(p, `item-${item.id}`);
  127 |       await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
  128 |         'aria-pressed',
  129 |         'true',
  130 |       );
  131 |     }
  132 |   }
  133 |   await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  134 |   if (restore?.has(recipe.station)) {
  135 |     restore.delete(recipe.station);
  136 |     await p.getByRole('button', { name: '暂停', exact: true }).tap();
  137 |     const before = await state(p);
  138 |     const beforeStatus =
  139 |       recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status;
  140 |     if (beforeStatus === 'empty') {
  141 |       expect(before.routing[recipe.station]).toBeNull();
  142 |       expect(
  143 |         before.items.some(
  144 |           (i) =>
  145 |             i.product === product &&
  146 |             (recipe.station === 'grill'
  147 |               ? i.location.startsWith('station:board:')
  148 |               : i.location.startsWith('tray:')),
  149 |         ),
  150 |       ).toBe(true);
  151 |     } else expect(beforeStatus).toBe('processing');
  152 |     if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
  153 |     await p.reload();
  154 |     await p.locator('.yard-story .entry-main').tap();
  155 |     await lesson(p);
  156 |     const after = await state(p);
  157 |     expect(after.runId).toBe(before.runId);
  158 |     if (beforeStatus === 'empty') expect(after.items).toEqual(before.items);
  159 |     else {
  160 |       const inputs = before.items.filter((i) =>
  161 |         i.location.startsWith(`station:${recipe.station}:`),
  162 |       );
  163 |       const source = inputs[0];
  164 |       const target = before.routing[recipe.station];
  165 |       if (!source || !target) throw Error('processing station lost input or output reservation');
  166 |       const output = after.items.find((i) => i.id === source.id && i.product === product);
  167 |       if (output) {
  168 |         expect(after.items.map((i) => i.id).sort()).toEqual(
  169 |           before.items
  170 |             .filter((i) => !inputs.some((input) => input.id === i.id) || i.id === source.id)
  171 |             .map((i) => i.id)
  172 |             .sort(),
  173 |         );
  174 |         for (const item of before.items.filter((i) => !inputs.some((input) => input.id === i.id)))
  175 |           expect(after.items.find((i) => i.id === item.id)).toEqual(item);
  176 |         expect(output.location).toBe(
  177 |           'station' in target
  178 |             ? `station:${target.station}:${target.slot}`
  179 |             : `tray:${target.tray}:${target.slot}`,
  180 |         );
  181 |       } else {
  182 |         expect(after.items).toEqual(before.items);
  183 |         expect(
  184 |           recipe.station === 'machine'
  185 |             ? after.machine.status
  186 |             : after.stations[recipe.station].status,
  187 |         ).toBe('processing');
  188 |       }
  189 |     }
  190 |     // Restart measurement after navigation; no gameplay state is injected.
  191 |     await p.evaluate(() => {
  192 |       const m = Reflect.get(window, 'm2measure');
  193 |       if (m) {
  194 |         m.running = true;
  195 |         m.last = 0;
  196 |       }
  197 |     });
  198 |   }
  199 | 
  200 |   await expect
  201 |     .poll(
  202 |       async () =>
  203 |         (await state(p)).items.some(
  204 |           (i) =>
  205 |             i.product === product &&
  206 |             (recipe.station === 'grill'
  207 |               ? i.location.startsWith('station:board:')
  208 |               : i.location.startsWith('tray:')),
  209 |         ),
  210 |       { timeout: 15000 },
  211 |     )
> 212 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  213 |   const item = (await state(p)).items.find(
  214 |     (i) =>
  215 |       i.product === product &&
  216 |       (recipe.station === 'grill'
  217 |         ? i.location.startsWith('station:board:')
  218 |         : i.location.startsWith('tray:')),
  219 |   );
  220 |   if (!item) throw Error(product);
  221 |   return item.id;
  222 | }
  223 | export async function serve(p: Page, restore?: Set<string>) {
  224 |   await lesson(p);
  225 |   const s = await state(p),
  226 |     order = s.orders.find((o) => o.status === 'waiting');
  227 |   if (!order) throw Error('waiting');
  228 |   for (const product of REQUESTS[order.request].products) {
  229 |     if (RAW.includes(product)) {
  230 |       if (!(await p.locator(`[data-hotspot="supply-${product}"]`).count())) {
  231 |         await tap(p, 'family-juice');
  232 |       }
  233 |       await choosePrep(p, '● 1号盘');
  234 |       await make(p, product);
  235 |     } else {
  236 |       const id = await make(p, product, restore);
  237 |       if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
  238 |         await tap(p, `item-${id}`);
  239 |         await choosePrep(p, '● 1号盘');
  240 |       }
  241 |     }
  242 |   }
  243 |   await handOver(p, order.seat);
  244 |   await expect
  245 |     .poll(
  246 |       async () => {
  247 |         const next = await state(p);
  248 |         return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
  249 |       },
  250 |       { timeout: 18000 },
  251 |     )
  252 |     .toBe('done');
  253 | }
  254 | export async function handOver(p: Page, seat?: 0 | 1, tray: 0 | 1 = 0) {
  255 |   const order = (await state(p)).orders.find(
  256 |     (o) => o.status === 'waiting' && (seat === undefined || o.seat === seat),
  257 |   );
  258 |   if (!order) throw Error('no waiting guest');
  259 |   await tap(p, `tray-${tray}`, 26);
  260 |   await tap(p, order.id, 20);
  261 | }
  262 | export async function drag(p: Page, from: string, to: string) {
  263 |   const a = await hot(p, from, from.startsWith('tray') ? 25 : 0),
  264 |     b = await hot(p, to);
  265 |   const c = await p.context().newCDPSession(p);
  266 |   await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  267 |   for (let n = 1; n <= 10; n++)
  268 |     await c.send('Input.dispatchTouchEvent', {
  269 |       type: 'touchMove',
  270 |       touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
  271 |     });
  272 |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  273 |   await c.detach();
  274 | }
  275 | 
```