# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> visible activity entrance reaches all five chapters and saves a real creation
- Location: e2e/adventure.spec.ts:60:1

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
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 野餐准备
      - button "到活动桌" [ref=e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：把装好的篮子带到桌上打开。" [ref=e13] [cursor=pointer]
        - button "重听下一步" [ref=e19] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·刺刺：拿盘交付，空手重听请求"
      - button "选择组合板备餐"
      - button "▶ 盖合食物" [active] [ref=e20] [cursor=pointer]
      - button "切换果汁机" [ref=e21] [cursor=pointer]
      - button "切换冰淇淋台" [ref=e22] [cursor=pointer]
      - button "切换组合板" [ref=e23] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [ref=e24] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e25] [cursor=pointer]
      - button "拿面包"
      - button "拿芝士"
      - button "拿生菜"
      - button "拿番茄"
      - button "面包，组合板"
      - button "面包，组合板"
      - button "生菜，组合板"
      - button "番茄，组合板" [pressed]
    - button "↩" [ref=e26] [cursor=pointer]
    - button "点请求气泡重听" [ref=e27] [cursor=pointer]:
      - img "蔬菜三明治"
      - generic [ref=e28]: ♫
    - generic:
      - status: 先在目的盘或组合板腾一个位置，再开始。
```

# Test source

```ts
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
  135 |   await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  136 |   if (restore?.has(recipe.station)) {
  137 |     restore.delete(recipe.station);
  138 |     await p.getByRole('button', { name: '暂停', exact: true }).tap();
  139 |     const before = await state(p);
  140 |     const beforeStatus =
  141 |       recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status;
  142 |     if (beforeStatus === 'empty') {
  143 |       expect(before.routing[recipe.station]).toBeNull();
  144 |       expect(
  145 |         before.items.some(
  146 |           (i) =>
  147 |             i.product === product &&
  148 |             (recipe.station === 'grill'
  149 |               ? i.location.startsWith('station:board:')
  150 |               : i.location.startsWith('tray:')),
  151 |         ),
  152 |       ).toBe(true);
  153 |     } else expect(beforeStatus).toBe('processing');
  154 |     if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
  155 |     await p.reload();
  156 |     await p.locator('.yard-story .entry-main').tap();
  157 |     await lesson(p);
  158 |     const after = await state(p);
  159 |     expect(after.runId).toBe(before.runId);
  160 |     if (beforeStatus === 'empty') expect(after.items).toEqual(before.items);
  161 |     else {
  162 |       const inputs = before.items.filter((i) =>
  163 |         i.location.startsWith(`station:${recipe.station}:`),
  164 |       );
  165 |       const source = inputs[0];
  166 |       const target = before.routing[recipe.station];
  167 |       if (!source || !target) throw Error('processing station lost input or output reservation');
  168 |       const output = after.items.find((i) => i.id === source.id && i.product === product);
  169 |       if (output) {
  170 |         expect(after.items.map((i) => i.id).sort()).toEqual(
  171 |           before.items
  172 |             .filter((i) => !inputs.some((input) => input.id === i.id) || i.id === source.id)
  173 |             .map((i) => i.id)
  174 |             .sort(),
  175 |         );
  176 |         for (const item of before.items.filter((i) => !inputs.some((input) => input.id === i.id)))
  177 |           expect(after.items.find((i) => i.id === item.id)).toEqual(item);
  178 |         expect(output.location).toBe(
  179 |           'station' in target
  180 |             ? `station:${target.station}:${target.slot}`
  181 |             : `tray:${target.tray}:${target.slot}`,
  182 |         );
  183 |       } else {
  184 |         expect(after.items).toEqual(before.items);
  185 |         expect(
  186 |           recipe.station === 'machine'
  187 |             ? after.machine.status
  188 |             : after.stations[recipe.station].status,
  189 |         ).toBe('processing');
  190 |       }
  191 |     }
  192 |     // Restart measurement after navigation; no gameplay state is injected.
  193 |     await p.evaluate(() => {
  194 |       const m = Reflect.get(window, 'm2measure');
  195 |       if (m) {
  196 |         m.running = true;
  197 |         m.last = 0;
  198 |       }
  199 |     });
  200 |   }
  201 | 
  202 |   await expect
  203 |     .poll(
  204 |       async () =>
  205 |         (await state(p)).items.some(
  206 |           (i) =>
  207 |             i.product === product &&
  208 |             (recipe.station === 'grill'
  209 |               ? i.location.startsWith('station:board:')
  210 |               : i.location.startsWith('tray:')),
  211 |         ),
  212 |       { timeout: 15000 },
  213 |     )
> 214 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  215 |   const item = (await state(p)).items.find(
  216 |     (i) =>
  217 |       i.product === product &&
  218 |       (recipe.station === 'grill'
  219 |         ? i.location.startsWith('station:board:')
  220 |         : i.location.startsWith('tray:')),
  221 |   );
  222 |   if (!item) throw Error(product);
  223 |   return item.id;
  224 | }
  225 | export async function serve(p: Page, restore?: Set<string>) {
  226 |   await lesson(p);
  227 |   const s = await state(p),
  228 |     order = s.orders.find((o) => o.status === 'waiting');
  229 |   if (!order) throw Error('waiting');
  230 |   for (const product of REQUESTS[order.request].products) {
  231 |     if (RAW.includes(product)) {
  232 |       if (!(await p.locator(`[data-hotspot="supply-${product}"]`).count())) {
  233 |         await tap(p, 'family-juice');
  234 |       }
  235 |       await choosePrep(p, '● 1号盘');
  236 |       await make(p, product);
  237 |     } else {
  238 |       const id = await make(p, product, restore);
  239 |       if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
  240 |         await tap(p, `item-${id}`);
  241 |         await choosePrep(p, '● 1号盘');
  242 |       }
  243 |     }
  244 |   }
  245 |   await handOver(p, order.seat);
  246 |   await expect
  247 |     .poll(
  248 |       async () => {
  249 |         const next = await state(p);
  250 |         return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
  251 |       },
  252 |       { timeout: 18000 },
  253 |     )
  254 |     .toBe('done');
  255 | }
  256 | export async function handOver(p: Page, seat?: 0 | 1, tray: 0 | 1 = 0) {
  257 |   const order = (await state(p)).orders.find(
  258 |     (o) => o.status === 'waiting' && (seat === undefined || o.seat === seat),
  259 |   );
  260 |   if (!order) throw Error('no waiting guest');
  261 |   await tap(p, `tray-${tray}`, 26);
  262 |   await tap(p, order.id, 20);
  263 | }
  264 | export async function drag(p: Page, from: string, to: string) {
  265 |   const a = await hot(p, from, from.startsWith('tray') ? 25 : 0),
  266 |     b = await hot(p, to);
  267 |   const c = await p.context().newCDPSession(p);
  268 |   await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  269 |   for (let n = 1; n <= 10; n++)
  270 |     await c.send('Input.dispatchTouchEvent', {
  271 |       type: 'touchMove',
  272 |       touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
  273 |     });
  274 |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  275 |   await c.detach();
  276 | }
  277 | 
  278 | export function evidencePath(original: string) {
  279 |   if (!process.env.EVIDENCE_DIR) return original;
  280 |   const dir = join(process.env.EVIDENCE_DIR, 'screenshots');
  281 |   mkdirSync(dir, { recursive: true });
  282 |   return join(dir, basename(original));
  283 | }
  284 | 
```