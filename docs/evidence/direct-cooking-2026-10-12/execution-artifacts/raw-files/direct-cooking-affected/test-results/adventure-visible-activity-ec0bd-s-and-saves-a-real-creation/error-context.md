# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> visible activity entrance reaches all five chapters and saves a real creation
- Location: e2e/adventure.spec.ts:102:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for locator('[data-hotspot="item-food-2"]')
    - locator resolved to <button type="button" aria-label="拿起熟饼" class="loose-food" data-grab="item:food-2" data-hotspot="item-food-2">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-label="启动煎台" class="heat-switch" data-hotspot="start-station-grill">🔥</button> intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <button type="button" aria-label="启动煎台" class="heat-switch" data-hotspot="start-station-grill">🔥</button> intercepts pointer events
    - retrying click action
      - waiting 100ms
    22 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <button type="button" aria-label="启动煎台" class="heat-switch" data-hotspot="start-station-grill">🔥</button> intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "同桌场景画面" [ref=f1e4]
  - region "同桌厨房" [ref=f1e6]:
    - generic [ref=f1e7]:
      - generic:
        - generic: 黄昏协作
        - button "暂停" [ref=f1e8] [cursor=pointer]: Ⅱ
      - region "朋友实际使用食品":
        - generic:
          - button "重听兔兔：Can I have a cheeseburger, please?" [ref=f1e10] [cursor=pointer]: ↻
          - region "说话者的图示需要" [ref=f1e11]:
            - button "看图理解兔兔的请求" [ref=f1e12] [cursor=pointer]:
              - img "芝士汉堡"
          - button "听兔兔的请求" [ref=f1e13] [cursor=pointer]:
            - generic [ref=f1e14]: 兔兔
          - button "兔兔的接餐盘" [ref=f1e15] [cursor=pointer]:
            - generic [ref=f1e16]: 兔兔面前的接餐盘
        - generic:
          - button "先帮刺刺" [ref=f1e17] [cursor=pointer]:
            - generic [ref=f1e18]: 刺刺
          - button "刺刺的接餐盘" [ref=f1e19] [cursor=pointer]:
            - generic [ref=f1e20]: 刺刺面前的接餐盘
      - generic [ref=f1e21]:
        - button "打开储物抽屉" [ref=f1e22] [cursor=pointer]
        - button "保存到食谱" [ref=f1e23] [cursor=pointer]
        - button "翻开旧食谱" [ref=f1e24] [cursor=pointer]
      - generic [ref=f1e25]:
        - generic [ref=f1e26]:
          - region "果汁机" [ref=f1e27]:
            - generic [ref=f1e28]:
              - button "放入果汁机水果口" [ref=f1e30] [cursor=pointer]
              - button "放到果汁机杯座" [ref=f1e32] [cursor=pointer]
              - button "启动果汁机" [ref=f1e33] [cursor=pointer]: ▶
            - generic [ref=f1e34]:
              - button "果汁机：苹果" [ref=f1e35] [cursor=pointer]:
                - img "苹果"
              - button "果汁机：香蕉" [ref=f1e36] [cursor=pointer]:
                - img "香蕉"
              - button "果汁机：空杯" [ref=f1e37] [cursor=pointer]:
                - img "空杯"
          - region "冰淇淋" [ref=f1e38]:
            - button "放到冰淇淋台" [ref=f1e40] [cursor=pointer]
            - generic [ref=f1e41]:
              - button "冰淇淋：蛋筒" [ref=f1e42] [cursor=pointer]:
                - img "蛋筒"
              - button "冰淇淋：空杯" [ref=f1e43] [cursor=pointer]:
                - img "空杯"
              - button "冰淇淋：香草球" [ref=f1e44] [cursor=pointer]:
                - img "香草球"
              - button "冰淇淋：草莓球" [ref=f1e45] [cursor=pointer]:
                - img "草莓球"
              - button "冰淇淋：香蕉" [ref=f1e46] [cursor=pointer]:
                - img "香蕉"
          - region "组合板" [ref=f1e47]:
            - generic [ref=f1e48]:
              - button "放到组合板" [ref=f1e49] [cursor=pointer]
              - button "拿起圆面包" [ref=f1e50] [cursor=pointer]:
                - img "圆面包"
            - generic [ref=f1e51]:
              - button "组合板：面包" [ref=f1e52] [cursor=pointer]:
                - img "面包"
              - button "组合板：圆面包" [ref=f1e53] [cursor=pointer]:
                - img "圆面包"
              - button "组合板：芝士" [ref=f1e54] [cursor=pointer]:
                - img "芝士"
              - button "组合板：生菜" [ref=f1e55] [cursor=pointer]:
                - img "生菜"
              - button "组合板：番茄" [ref=f1e56] [cursor=pointer]:
                - img "番茄"
          - region "煎锅" [ref=f1e57]:
            - generic [ref=f1e58]:
              - button "放到煎台" [ref=f1e59] [cursor=pointer]
              - button "拿起熟饼" [ref=f1e60] [cursor=pointer]:
                - img "熟饼"
              - button "启动煎台" [ref=f1e61] [cursor=pointer]: 🔥
            - button "煎锅：生饼" [ref=f1e63] [cursor=pointer]:
              - img "生饼"
        - generic [ref=f1e64]:
          - button "放到制作承放区" [ref=f1e65] [cursor=pointer]
          - generic "可直接拿取的水果" [ref=f1e66]:
            - button "拿起苹果" [ref=f1e67] [cursor=pointer]:
              - img "苹果"
            - button "拿起香蕉" [ref=f1e68] [cursor=pointer]:
              - img "香蕉"
      - region "手中真实物件"
      - status: 安排煎制与饮品，把灯带到餐桌
      - generic [ref=f1e70]:
        - button "重听大咪：The food is ready!" [ref=f1e71] [cursor=pointer]: The food is ready!
        - button "播放整句：The food is ready!" [ref=f1e72] [cursor=pointer]: ▶
        - generic [ref=f1e73]: 可播放整句
```

# Test source

```ts
  32  |     await p.getByRole('button', { name: '少些帮助，听一听' }).click();
  33  |     await p.getByRole('button', { name: '两位一起招呼' }).click();
  34  |     await p.getByRole('button', { name: '开门 / 继续营业' }).click();
  35  |   }
  36  |   await lesson(p);
  37  | }
  38  | export async function choosePrep(p: Page, name: string) {
  39  |   const label = name.includes('盘')
  40  |     ? '放到制作承放区'
  41  |     : name === '果汁机'
  42  |       ? '放入果汁机水果口'
  43  |       : name === '冰淇淋台'
  44  |         ? '放到冰淇淋台'
  45  |         : name === '煎台'
  46  |           ? '放到煎台'
  47  |           : '放到组合板';
  48  |   await p.getByRole('button', { name: label, exact: true }).click();
  49  | }
  50  | export async function selectDevice(p:Page,device:string) {
  51  |  const name=device==='burger'?'煎锅':device==='burger-board'||device==='sandwich'?'组合板':device==='juice'?'果汁机':device==='ice'?'冰淇淋':null;
  52  |  if(name) await expect(p.getByRole('region',{name,exact:true})).toBeVisible();
  53  | }
  54  | export async function supply(p: Page, product: Product) {
  55  |   if (!(await p.locator(`[data-hotspot="supply-${product}"]`).isVisible())) {
  56  |     await p.getByRole('button',{name:'查看更多食物篮',exact:true}).click();
  57  |     for(let page=0;page<4;page++) {
  58  |       await p.getByRole('button',{name:`查看第${page+1}篮食物`,exact:true}).click();
  59  |       if(await p.locator(`[data-hotspot="supply-${product}"]`).isVisible()) break;
  60  |     }
  61  |   }
  62  |   await p.locator(`[data-hotspot="supply-${product}"]`).click();
  63  |   return (
  64  |     (await state(p)).items
  65  |       .filter((i) => i.product === product && i.location.startsWith('hand:'))
  66  |       .at(-1)?.id ?? null
  67  |   );
  68  | }
  69  | export async function make(
  70  |   p: Page,
  71  |   product: Product,
  72  |   restore?: Set<string>,
  73  | ): Promise<string | null> {
  74  |   if (RAW.includes(product)) return supply(p, product);
  75  |   const recipe = RECIPES.find((r) => r.output === product);
  76  |   if (!recipe) {
  77  |     return supply(p, product);
  78  |   }
  79  |   const inputs = recipe.family==='sandwich' ? ['bread' as Product,...recipe.inputs.filter(x=>x!=='bread'),'bread' as Product] : recipe.inputs;
  80  |   for(const input of inputs) {
  81  |     if(!RAW.includes(input)) {
  82  |       const id=await make(p,input,restore);
  83  |       if(!id) throw Error(`no actual ${input}`);
  84  |       await p.getByRole('button',{name:'放到组合板',exact:true}).click();
  85  |     } else {
  86  |       const name=recipe.station==='machine'?'果汁机':recipe.station==='ice'?'冰淇淋':recipe.station==='grill'?'煎锅':'组合板';
  87  |       const labels=(await import('../src/content/catalog')).PRODUCT_NAMES;
  88  |       await p.getByRole('button',{name:`${name}：${labels[input]}`,exact:true}).click();
  89  |     }
  90  |   }
  91  |   if(recipe.station==='machine'||recipe.station==='grill') {
  92  |     await p.locator(`[data-hotspot="${recipe.station==='machine'?'start':'start-station-grill'}"]`).click();
  93  |     const before=await state(p);
  94  |     expect(recipe.station==='machine'?before.machine.status:before.stations.grill.status).toBe('processing');
  95  |   } else expect((await state(p)).stations[recipe.station].status).toBe('ready');
  96  |   if (restore?.has(recipe.station)) {
  97  |     restore.delete(recipe.station);
  98  |     await p.getByRole('button', { name: '暂停', exact: true }).click();
  99  |     const frozen = await state(p);
  100 |     await p.reload();
  101 |     await p.locator('.yard-story .entry-main').click();
  102 |     expect((await state(p)).runId).toBe(frozen.runId);
  103 |     for (const item of frozen.items.filter(
  104 |       (i) =>
  105 |         !i.location.startsWith(
  106 |           recipe.station === 'machine' ? 'machine:' : `station:${recipe.station}:`,
  107 |         ),
  108 |     ))
  109 |       expect((await state(p)).items.find((i) => i.id === item.id)).toEqual(item);
  110 |   }
  111 |   await expect
  112 |     .poll(
  113 |       async () =>
  114 |         (await state(p)).items.some(
  115 |           (i) =>
  116 |             i.product === product &&
  117 |             (recipe.station === 'machine'
  118 |               ? i.location === 'machine:cup'
  119 |               : i.location.startsWith(`station:${recipe.station}:`)),
  120 |         ),
  121 |       { timeout: 15000 },
  122 |     )
  123 |     .toBe(true);
  124 |   const item = (await state(p)).items.find(
  125 |     (i) =>
  126 |       i.product === product &&
  127 |       (recipe.station === 'machine'
  128 |         ? i.location === 'machine:cup'
  129 |         : i.location.startsWith(`station:${recipe.station}:`)),
  130 |   );
  131 |   if (!item) throw Error(product);
> 132 |   await p.locator(`[data-hotspot="item-${item.id}"]`).click();
      |                                                       ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  133 |   expect((await state(p)).items.find((i) => i.id === item.id)?.location).toMatch(/^hand:/);
  134 |   return item.id;
  135 | }
  136 | export async function handOver(p: Page, seat?: 0 | 1, _tray: 0 | 1 = 0) {
  137 |   const order = (await state(p)).orders.find(
  138 |     (o) => o.status === 'waiting' && (seat === undefined || o.seat === seat),
  139 |   );
  140 |   if (!order) throw Error('waiting');
  141 |   await p
  142 |     .locator(`[data-actor="${order.visitor ?? (order.seat === 0 ? 'rabbit' : 'hedgehog')}"]`)
  143 |     .click();
  144 | }
  145 | export async function serve(p: Page, restore?: Set<string>) {
  146 |   const order = (await state(p)).orders.find((o) => o.status === 'waiting');
  147 |   if (!order) throw Error('waiting');
  148 |   const ids: string[] = [];
  149 |   for (const product of REQUESTS[order.request].products) {
  150 |     const id = await make(p, product, restore);
  151 |     if (!id) throw Error(product);
  152 |     ids.push(id);
  153 |     await choosePrep(p, '盘');
  154 |   }
  155 |   for (const id of ids) await p.locator(`[data-hotspot="item-${id}"]`).click();
  156 |   await handOver(p, order.seat);
  157 |   await expect
  158 |     .poll(async () => (await state(p)).orders.find((o) => o.id === order.id)?.status ?? 'done', {
  159 |       timeout: 18000,
  160 |     })
  161 |     .toBe('done');
  162 | }
  163 | export async function drag(p: Page, from: string, to: string) {
  164 |   const a = await hot(p, from),
  165 |     b = await hot(p, to);
  166 |   const c = await p.context().newCDPSession(p);
  167 |   await c.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ ...a, id: 1 }] });
  168 |   for (let n = 1; n <= 10; n++)
  169 |     await c.send('Input.dispatchTouchEvent', {
  170 |       type: 'touchMove',
  171 |       touchPoints: [{ x: a.x + ((b.x - a.x) * n) / 10, y: a.y + ((b.y - a.y) * n) / 10, id: 1 }],
  172 |     });
  173 |   await c.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
  174 |   await c.detach();
  175 | }
  176 | 
  177 | export function evidencePath(original: string) {
  178 |   const dir = join(
  179 |     process.env.EVIDENCE_DIR ?? 'docs/evidence/simplified-play-2026-10-12/browser',
  180 |     'screenshots',
  181 |   );
  182 |   mkdirSync(dir, { recursive: true });
  183 |   return join(dir, basename(original));
  184 | }
  185 | 
```