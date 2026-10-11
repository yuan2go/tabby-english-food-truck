# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> desktop feast exposes replay skip and low motion without repeating settlement
- Location: e2e/adventure.spec.ts:180:1

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  getByRole('button', { name: '重看朋友使用', exact: true })
Expected: in viewport
Received: viewport ratio 0.13636364042758942
Timeout:  6000ms

Call log:
  - Expect "toBeInViewport" getByRole('button', { name: '重看朋友使用', exact: true }) with timeout 6000ms
  - waiting for getByRole('button', { name: '重看朋友使用', exact: true })
    14 × locator resolved to <button type="button" aria-label="重看朋友使用">↻ ♫</button>
       - unexpected value "viewport ratio 0.13636364042758942"

```

```yaml
- button "重看朋友使用": ↻ ♫
```

# Test source

```ts
  100 |   await kitchen(page);
  101 |   await make(page, 'sandwich');
  102 |   await tap(page, 'family-juice');
  103 |   await choosePrep(page, '● 1号盘');
  104 |   await tap(page, 'supply-banana');
  105 |   await page.getByRole('button', { name: '装进野餐篮', exact: true }).click();
  106 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('pack')).toBe(true);
  107 |   await send(page, 1, 'salad-sandwich');
  108 |   await table(page);
  109 |   await page.getByRole('button', { name: '把篮子摆上桌', exact: true }).click();
  110 |   await page.getByRole('button', { name: '铺上叶子桌布', exact: true }).click();
  111 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  112 |   await page.screenshot({
  113 |     path: 'docs/evidence/adventure-experience-02/picnic-rabbit-desktop.png',
  114 |   });
  115 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  116 |   await kitchen(page);
  117 |   await send(page, 0, 'cheese-burger');
  118 |   await send(page, 1, 'juice');
  119 |   await table(page);
  120 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  121 |   await page.getByRole('button', { name: '取出灯串', exact: true }).click();
  122 |   await page.getByRole('button', { name: '请兔兔带灯', exact: true }).click();
  123 |   await page.getByRole('button', { name: '选择芝士汉堡', exact: true }).click();
  124 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  125 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  126 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  127 |   await page.getByRole('button', { name: '点亮暖灯', exact: true }).click();
  128 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  129 |   console.log('EVIDENCE_DINNER_START_SECONDS', (Date.now() - walkStarted) / 1000);
  130 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  131 |     timeout: 15000,
  132 |   });
  133 |   await expect(feast).toHaveClass(/sip/);
  134 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  135 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/dinner-drink-desktop.png' });
  136 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  137 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  138 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  139 |   await kitchen(page);
  140 |   await choosePrep(page, '● 1号盘');
  141 |   await make(page, 'sandwich');
  142 |   await make(page, 'juice');
  143 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  144 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  145 |   await table(page);
  146 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  147 |   await page.getByRole('button', { name: '分享给兔兔', exact: true }).click();
  148 |   await page.getByRole('button', { name: '品尝芝士三明治', exact: true }).click();
  149 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  150 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  151 |   await expect
  152 |     .poll(() =>
  153 |       page.evaluate(
  154 |         () =>
  155 |           JSON.parse(
  156 |             localStorage.getItem('tabby.foodtruck.profile.m2') ?? '{}',
  157 |           ).activityMemories.filter((m: { state: { rewards: string[] } }) => m.state.rewards.length)
  158 |             .length,
  159 |       ),
  160 |     )
  161 |     .toBe(5);
  162 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/feast-desktop.png' });
  163 |   const before = await state(page);
  164 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  165 |   await page.reload();
  166 |   await page.getByRole('button', { name: '正在准备 · 社区小食会', exact: true }).click();
  167 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  168 |   await page.getByRole('button', { name: '再准备一次', exact: true }).click();
  169 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  170 |   await expect(
  171 |     page
  172 |       .getByRole('region', { name: '上次留下的作品', exact: true })
  173 |       .locator('.remembered-table')
  174 |       .getByRole('img', { name: '芝士三明治', exact: true }),
  175 |   ).toBeVisible();
  176 |   expect((await state(page)).adventure?.foods).toEqual([]);
  177 |   expect((await state(page)).adventure?.rewards).toEqual([]);
  178 | });
  179 | 
  180 | test('desktop feast exposes replay skip and low motion without repeating settlement', async ({
  181 |   page,
  182 | }) => {
  183 |   test.setTimeout(180000);
  184 |   page.setDefaultTimeout(30000);
  185 |   await page.setViewportSize({ width: 1280, height: 720 });
  186 |   await begin(page);
  187 |   await kitchen(page);
  188 |   await send(page, 0, 'apple');
  189 |   await send(page, 1, 'banana');
  190 |   await table(page);
  191 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  192 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  193 |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  194 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  195 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  196 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  197 |   const before = await state(page);
  198 |   for (const name of ['重看朋友使用', '跳过朋友演出', '低动态表现']) {
  199 |     const button = page.getByRole('button', { name, exact: true });
> 200 |     await expect(button).toBeInViewport({ ratio: 1 });
      |                          ^ Error: expect(locator).toBeInViewport() failed
  201 |     await button.click();
  202 |   }
  203 |   expect((await state(page)).adventure).toEqual(before.adventure);
  204 |   await page.screenshot({
  205 |     path: 'docs/evidence/adventure-experience-02/desktop-friend-controls.png',
  206 |   });
  207 | });
  208 | 
  209 | test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  210 |   test.setTimeout(300000);
  211 |   await page.setViewportSize({ width: 393, height: 665 });
  212 |   await begin(page);
  213 |   await kitchen(page);
  214 |   await send(page, 0, 'apple');
  215 |   await send(page, 1, 'banana');
  216 |   await table(page);
  217 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  218 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  219 |   await page.getByRole('button', { name: '把花种在左边', exact: true }).click();
  220 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  221 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  222 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  223 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  224 |   await kitchen(page);
  225 |   await send(page, 0, 'vanilla-cone');
  226 |   await make(page, 'vanilla-cup');
  227 |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  228 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  229 |   await table(page);
  230 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  231 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  232 |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  233 |   await page.getByRole('button', { name: '选择香草冰淇淋杯', exact: true }).click();
  234 |   await page.getByRole('button', { name: '品尝香草冰淇淋杯', exact: true }).click();
  235 |   await page.getByRole('button', { name: '挂上暖色彩旗', exact: true }).click();
  236 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  237 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  238 |   await kitchen(page);
  239 |   await send(page, 1, 'salad-sandwich');
  240 |   await table(page);
  241 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  242 |   await page.getByRole('button', { name: '取出餐垫', exact: true }).click();
  243 |   await page.getByRole('button', { name: '选择蔬菜三明治', exact: true }).click();
  244 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  245 |   await kitchen(page);
  246 |   await send(page, 0, 'sandwich');
  247 |   await table(page);
  248 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  249 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  250 |   await page.getByRole('button', { name: '铺上阳光桌布', exact: true }).click();
  251 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  252 |   expect((await state(page)).adventure?.branch).toBe('hedgehog');
  253 |   expect((await state(page)).adventure?.rewards).toEqual(['picnic-page']);
  254 |   await expect(page.getByRole('button', { name: '把篮子摆上桌', exact: true })).toHaveCount(0);
  255 |   await page.screenshot({
  256 |     path: 'docs/evidence/adventure-experience-02/picnic-hedgehog-phone.png',
  257 |   });
  258 | });
  259 | 
  260 | test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  261 |   page,
  262 | }) => {
  263 |   test.setTimeout(150000);
  264 |   await page.setViewportSize({ width: 393, height: 665 });
  265 |   await page.goto('/');
  266 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  267 |   await page.getByRole('button', { name: '晨间水果', exact: true }).click();
  268 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  269 |   await lesson(page);
  270 |   await table(page);
  271 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  272 |   await expect(page.getByRole('region', { name: '朋友的回访分享需要', exact: true })).toBeVisible();
  273 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  274 |   await page.getByRole('button', { name: '邀请长辈', exact: true }).click();
  275 |   await page.getByRole('button', { name: '下一组分享朋友', exact: true }).click();
  276 |   await expect(page.getByRole('button', { name: '分享给长辈', exact: true })).toBeInViewport();
  277 |   await page.getByRole('button', { name: '上一组分享朋友', exact: true }).click();
  278 |   await expect(page.getByRole('button', { name: '取出小勺', exact: true })).toBeInViewport();
  279 |   await page.getByRole('button', { name: '取出小勺', exact: true }).click();
  280 |   const beforeRotation = await state(page);
  281 |   await page.setViewportSize({ width: 665, height: 393 });
  282 |   await expect(page.getByRole('button', { name: '分享给兔兔', exact: true })).toBeInViewport();
  283 |   await expect(page.getByRole('button', { name: '收摊回小院', exact: true })).toBeInViewport();
  284 |   await page.setViewportSize({ width: 393, height: 665 });
  285 |   expect((await state(page)).adventure).toEqual(beforeRotation.adventure);
  286 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  287 |   await kitchen(page);
  288 |   await send(page, 0, 'apple');
  289 |   await expect.poll(async () => (await state(page)).orders.length).toBe(0);
  290 |   await make(page, 'juice');
  291 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  292 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  293 |   await table(page);
  294 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  295 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  296 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  297 |   await page.getByRole('button', { name: '摆到3号餐位', exact: true }).click();
  298 |   await page.getByRole('button', { name: '拿回苹果汁到桌边', exact: true }).click();
  299 |   const beforeBlocked = await state(page);
  300 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
```