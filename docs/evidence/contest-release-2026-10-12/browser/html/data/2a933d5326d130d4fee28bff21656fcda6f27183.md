# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: immersion.spec.ts >> normal entrance: complete requests, actual receipt, yard actions, open flavors and real sharing memory
- Location: e2e/immersion.spec.ts:8:1

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
      - generic: 晨光开门
      - button "到活动桌" [ref=e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：朋友找到了抽屉，一起打开看看。" [ref=e13] [cursor=pointer]
        - button "重听下一步" [ref=e17] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·刺刺：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e18] [cursor=pointer]
      - button "切换果汁机" [ref=e19] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [ref=e20] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e21] [cursor=pointer]
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
      - button "香蕉，1号盘"
    - region "英语交流":
      - generic:
        - button "重听客人A的请求" [pressed] [ref=e22] [cursor=pointer]: A ♫
        - generic: 刺刺
        - button "图示帮助" [ref=e23] [cursor=pointer]: ▧
        - group:
          - generic "回看最近交流": ↶
      - generic:
        - button "重听刺刺：Can I have a banana, please?" [ref=e24] [cursor=pointer]:
          - text: Can I have a
          - strong [ref=e25]: banana
          - text: ", please?"
        - button "播放整句：Can I have a banana, please?" [ref=e26] [cursor=pointer]: ↻
        - generic: 正在播放，点击从头重听
    - generic:
      - status: 备好这一盘 → 点托盘拿起，再点朋友递出
```

# Test source

```ts
  169 |     if (beforeStatus === 'empty') expect(after.items).toEqual(before.items);
  170 |     else {
  171 |       const inputs = before.items.filter((i) =>
  172 |         i.location.startsWith(`station:${recipe.station}:`),
  173 |       );
  174 |       const source = inputs[0];
  175 |       const target = before.routing[recipe.station];
  176 |       if (!source || !target) throw Error('processing station lost input or output reservation');
  177 |       const output = after.items.find((i) => i.id === source.id && i.product === product);
  178 |       if (output) {
  179 |         expect(after.items.map((i) => i.id).sort()).toEqual(
  180 |           before.items
  181 |             .filter((i) => !inputs.some((input) => input.id === i.id) || i.id === source.id)
  182 |             .map((i) => i.id)
  183 |             .sort(),
  184 |         );
  185 |         for (const item of before.items.filter((i) => !inputs.some((input) => input.id === i.id)))
  186 |           expect(after.items.find((i) => i.id === item.id)).toEqual(item);
  187 |         expect(output.location).toBe(
  188 |           'station' in target
  189 |             ? `station:${target.station}:${target.slot}`
  190 |             : `tray:${target.tray}:${target.slot}`,
  191 |         );
  192 |       } else {
  193 |         expect(after.items).toEqual(before.items);
  194 |         expect(
  195 |           recipe.station === 'machine'
  196 |             ? after.machine.status
  197 |             : after.stations[recipe.station].status,
  198 |         ).toBe('processing');
  199 |       }
  200 |     }
  201 |     // Restart measurement after navigation; no gameplay state is injected.
  202 |     await p.evaluate(() => {
  203 |       const m = Reflect.get(window, 'm2measure');
  204 |       if (m) {
  205 |         m.running = true;
  206 |         m.last = 0;
  207 |       }
  208 |     });
  209 |   }
  210 | 
  211 |   await expect
  212 |     .poll(
  213 |       async () =>
  214 |         (await state(p)).items.some(
  215 |           (i) =>
  216 |             i.product === product &&
  217 |             (recipe.station === 'grill'
  218 |               ? i.location.startsWith('station:board:')
  219 |               : i.location.startsWith('tray:')),
  220 |         ),
  221 |       { timeout: 15000 },
  222 |     )
  223 |     .toBe(true);
  224 |   const item = (await state(p)).items.find(
  225 |     (i) =>
  226 |       i.product === product &&
  227 |       (recipe.station === 'grill'
  228 |         ? i.location.startsWith('station:board:')
  229 |         : i.location.startsWith('tray:')),
  230 |   );
  231 |   if (!item) throw Error(product);
  232 |   return item.id;
  233 | }
  234 | export async function serve(p: Page, restore?: Set<string>) {
  235 |   await lesson(p);
  236 |   const s = await state(p),
  237 |     order = s.orders.find((o) => o.status === 'waiting');
  238 |   if (!order) throw Error('waiting');
  239 |   for (const product of REQUESTS[order.request].products) {
  240 |     if (RAW.includes(product)) {
  241 |       if (!(await p.locator(`[data-hotspot="supply-${product}"]`).count())) {
  242 |         await tap(p, 'family-juice');
  243 |       }
  244 |       await choosePrep(p, '● 1号盘');
  245 |       await make(p, product);
  246 |     } else {
  247 |       const id = await make(p, product, restore);
  248 |       if (!(await state(p)).items.find((i) => i.id === id)?.location.startsWith('tray:0:')) {
  249 |         await tap(p, `item-${id}`);
  250 |         await choosePrep(p, '● 1号盘');
  251 |       }
  252 |     }
  253 |   }
  254 |   await handOver(p, order.seat);
  255 |   await expect
  256 |     .poll(
  257 |       async () => {
  258 |         const next = await state(p);
  259 |         return next.orders.find((o) => o.id === order.id)?.status ?? 'done';
  260 |       },
  261 |       { timeout: 18000 },
  262 |     )
  263 |     .toBe('done');
  264 | }
  265 | export async function handOver(p: Page, seat?: 0 | 1, tray: 0 | 1 = 0) {
  266 |   const order = (await state(p)).orders.find(
  267 |     (o) => o.status === 'waiting' && (seat === undefined || o.seat === seat),
  268 |   );
> 269 |   if (!order) throw Error('no waiting guest');
      |                     ^ Error: no waiting guest
  270 |   await tap(p, `lift-tray-${tray}`);
  271 |   await tap(p, order.id, 20);
  272 | }
  273 | export async function drag(p: Page, from: string, to: string) {
  274 |   const a = await hot(p, from),
  275 |     b = await hot(p, to);
  276 |   const c = await p.context().newCDPSession(p);
  277 |   await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  278 |   for (let n = 1; n <= 10; n++)
  279 |     await c.send('Input.dispatchTouchEvent', {
  280 |       type: 'touchMove',
  281 |       touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
  282 |     });
  283 |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  284 |   await c.detach();
  285 | }
  286 | 
  287 | export function evidencePath(original: string) {
  288 |   if (!process.env.EVIDENCE_DIR) return original;
  289 |   const dir = join(process.env.EVIDENCE_DIR, 'screenshots');
  290 |   mkdirSync(dir, { recursive: true });
  291 |   return join(dir, basename(original));
  292 | }
  293 | 
```