# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: wp-dual-story-throughline.spec.ts >> normal entrance reaches the community feast through every service level
- Location: e2e/wp-dual-story-throughline.spec.ts:117:1

# Error details

```
Error: no waiting guest
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic:
        - text: 社区小食会 0 / 2
        - generic: 写完小食会食谱 · 2/5
    - progressbar "写完小食会食谱"
    - group "餐车操作":
      - button "客人A·长辈：选择并重听请求"
      - button "客人B·兔兔：选择并重听请求"
      - button "选择煎台备餐"
      - button "▶ 煎熟肉饼" [ref=e7] [cursor=pointer]
      - button "选择组合板备餐"
      - button "▶ 盖合食物" [ref=e8] [cursor=pointer]
      - button "切换果汁机" [ref=e9] [cursor=pointer]
      - button "切换冰淇淋台" [ref=e10] [cursor=pointer]
      - button "切换组合板" [ref=e11] [cursor=pointer]
      - button "切换汉堡台" [ref=e12] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿圆面包"
      - button "拿生饼"
      - button "拿芝士"
      - button "拿生菜"
      - button "拿番茄"
      - button "熟饼，组合板"
    - button "点请求气泡重听" [ref=e13] [cursor=pointer]:
      - img "芝士汉堡"
      - generic [ref=e14]: ♫
    - generic:
      - status: 大咪正在递餐 → 等朋友接好；还能准备另一盘
```

# Test source

```ts
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
  212 |     .toBe(true);
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
> 258 |   if (!order) throw Error('no waiting guest');
      |                     ^ Error: no waiting guest
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