# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> phone replay follows hedgehog path with real food and no packing task
- Location: e2e/adventure.spec.ts:259:1

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
      - button "到活动桌" [ref=e7] [cursor=pointer]
      - region "图示下一步":
        - button "图示下一步：听请求，做食物，再交给这位朋友。" [ref=e13] [cursor=pointer]:
          - generic [ref=e15]:
            - img "香草蛋筒"
            - img "数量1" [ref=e16]: ●
        - button "重听下一步" [ref=e17] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "选择冰淇淋台备餐"
      - button "▶ 接好冰淇淋" [active] [ref=e18] [cursor=pointer]
      - button "切换果汁机" [ref=e19] [cursor=pointer]
      - button "切换冰淇淋台" [ref=e20] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [ref=e21] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e22] [cursor=pointer]
      - button "拿蛋筒"
      - button "拿空杯"
      - button "拿香草球"
      - button "拿草莓球"
      - button "拿香蕉"
      - button "蛋筒，1号盘"
      - button "香草球，1号盘"
    - button "送去树荫分享" [ref=e23] [cursor=pointer]
    - region "英语交流":
      - generic:
        - button "重听客人A的请求" [pressed] [ref=e24] [cursor=pointer]: A ♫
        - button "重听开放请求" [ref=e25] [cursor=pointer]: ▧ ♫
        - generic: 兔兔
        - button "图示帮助" [ref=e26] [cursor=pointer]: ▧
        - group:
          - generic "回看最近交流": ↶
      - generic:
        - button "重听兔兔：Can I have one scoop of vanilla ice cream in a cone, please?" [ref=e27] [cursor=pointer]:
          - text: Can I have one scoop of
          - strong [ref=e28]: vanilla ice cream in a cone
          - text: ", please?"
        - button "播放整句：Can I have one scoop of vanilla ice cream in a cone, please?" [ref=e29] [cursor=pointer]: ▶
        - generic: 可播放整句
    - generic:
      - status: 还没接好：看看杯或筒、球数与配料。可以点原料放回，再按需看食谱。
```

# Test source

```ts
  123 |           .find((i) => i.id === id)
  124 |           ?.location.startsWith(`station:${recipe.station}:`)
  125 |       ) {
  126 |         await tap(p, `item-${id}`);
  127 |         await choosePrep(p, prep);
  128 |       } else await choosePrep(p, prep);
  129 |     }
  130 |   }
  131 |   if (recipe.station === 'board') {
  132 |     // Inspect settled ingredient slots, not an ingredient crossing the counter in transit.
  133 |     await p.waitForTimeout(260);
  134 |     for (const item of (await state(p)).items.filter((i) =>
  135 |       i.location.startsWith('station:board:'),
  136 |     )) {
  137 |       await tap(p, `item-${item.id}`);
  138 |       await expect(p.locator(`[data-hotspot="item-${item.id}"]`)).toHaveAttribute(
  139 |         'aria-pressed',
  140 |         'true',
  141 |       );
  142 |     }
  143 |   }
  144 |   await tap(p, recipe.station === 'machine' ? 'start' : `start-station-${recipe.station}`);
  145 |   if (restore?.has(recipe.station)) {
  146 |     restore.delete(recipe.station);
  147 |     await p.getByRole('button', { name: '暂停', exact: true }).tap();
  148 |     const before = await state(p);
  149 |     const beforeStatus =
  150 |       recipe.station === 'machine' ? before.machine.status : before.stations[recipe.station].status;
  151 |     if (beforeStatus === 'empty') {
  152 |       expect(before.routing[recipe.station]).toBeNull();
  153 |       expect(
  154 |         before.items.some(
  155 |           (i) =>
  156 |             i.product === product &&
  157 |             (recipe.station === 'grill'
  158 |               ? i.location.startsWith('station:board:')
  159 |               : i.location.startsWith('tray:')),
  160 |         ),
  161 |       ).toBe(true);
  162 |     } else expect(beforeStatus).toBe('processing');
  163 |     if (recipe.station === 'grill') await p.setViewportSize({ width: 768, height: 1024 });
  164 |     await p.reload();
  165 |     await p.locator('.yard-story .entry-main').tap();
  166 |     await lesson(p);
  167 |     const after = await state(p);
  168 |     expect(after.runId).toBe(before.runId);
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
> 223 |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
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
  269 |   if (!order) throw Error('no waiting guest');
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