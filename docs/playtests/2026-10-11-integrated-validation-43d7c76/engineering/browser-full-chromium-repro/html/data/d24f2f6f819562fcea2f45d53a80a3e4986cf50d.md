# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> desktop feast exposes replay skip and low motion without repeating settlement
- Location: ../../../../../../../.codex/worktrees/integrated-validation-20261011/tabby-english-food-truck/e2e/adventure.spec.ts:180:1

# Error details

```
Error: expect(locator).toBeInViewport() failed

Locator:  getByRole('button', { name: '低动态表现', exact: true })
Expected: in viewport
Received: viewport ratio 0.2647058963775635
Timeout:  6000ms

Call log:
  - Expect "toBeInViewport" getByRole('button', { name: '低动态表现', exact: true }) with timeout 6000ms
  - waiting for getByRole('button', { name: '低动态表现', exact: true })
    15 × locator resolved to <button type="button" aria-label="低动态表现" aria-pressed="false">◒</button>
       - unexpected value "viewport ratio 0.2647058963775635"

```

```yaml
- button "低动态表现": ◒
```

# Test source

```ts
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
  185 |   const walkStarted = Date.now();
  186 |   await page.setViewportSize({ width: 1280, height: 720 });
  187 |   await begin(page);
  188 |   await kitchen(page);
  189 |   await send(page, 0, 'apple');
  190 |   await send(page, 1, 'banana');
  191 |   await table(page);
  192 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  193 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  194 |   await page.getByRole('button', { name: '把花种在中间', exact: true }).click();
  195 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  196 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  197 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  198 |   console.log('EVIDENCE_FEAST_START_SECONDS', (Date.now() - walkStarted) / 1000);
  199 |   const before = await state(page);
  200 |   const feast = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  201 |   for (let stage = 0; stage < 5; stage++)
  202 |     await expect(feast).toHaveClass(new RegExp(`stage-${stage}`), { timeout: 15000 });
  203 |   await expect(page.getByRole('img', { name: '第2份，共2份', exact: true })).toBeVisible({
  204 |     timeout: 15000,
  205 |   });
  206 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  207 |   await page.screenshot({
  208 |     path: 'docs/evidence/adventure-experience-02/breakfast-friends-desktop.png',
  209 |   });
  210 |   for (const name of ['重看朋友使用', '跳过朋友演出', '低动态表现']) {
  211 |     const button = page.getByRole('button', { name, exact: true });
> 212 |     await expect(button).toBeInViewport({ ratio: 1 });
      |                          ^ Error: expect(locator).toBeInViewport() failed
  213 |     await button.click();
  214 |   }
  215 |   expect((await state(page)).adventure).toEqual(before.adventure);
  216 |   await page.screenshot({
  217 |     path: 'docs/evidence/adventure-experience-02/desktop-friend-controls.png',
  218 |   });
  219 |   await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  220 |   await kitchen(page);
  221 |   await make(page, 'juice');
  222 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  223 |   await table(page);
  224 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  225 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  226 |   await page.getByRole('button', { name: '品尝苹果汁', exact: true }).click();
  227 |   console.log('EVIDENCE_DRINK_START_SECONDS', (Date.now() - walkStarted) / 1000);
  228 |   const tasted = await state(page);
  229 |   await expect(feast).toHaveClass(/sip.*stage-3|stage-3.*sip/, { timeout: 15000 });
  230 |   await expect(feast).toHaveClass(/stage-4/, { timeout: 15000 });
  231 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/drink-use-desktop.png' });
  232 |   await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  233 |   await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  234 |   expect((await state(page)).adventure).toEqual(tasted.adventure);
  235 | });
  236 | 
  237 | test('phone replay follows hedgehog path with real food and no packing task', async ({ page }) => {
  238 |   test.setTimeout(300000);
  239 |   await page.setViewportSize({ width: 393, height: 665 });
  240 |   await begin(page);
  241 |   await kitchen(page);
  242 |   await send(page, 0, 'apple');
  243 |   await send(page, 1, 'banana');
  244 |   await table(page);
  245 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  246 |   await page.getByRole('button', { name: '取出花苗', exact: true }).click();
  247 |   await page.getByRole('button', { name: '把花种在左边', exact: true }).click();
  248 |   await page.getByRole('button', { name: '取出浇水壶', exact: true }).click();
  249 |   await page.getByRole('button', { name: '给迎客花浇水', exact: true }).click();
  250 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  251 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  252 |   await kitchen(page);
  253 |   await send(page, 0, 'vanilla-cone');
  254 |   await make(page, 'vanilla-cup');
  255 |   await page.getByRole('button', { name: '送去树荫分享', exact: true }).click();
  256 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  257 |   await table(page);
  258 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  259 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  260 |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  261 |   await page.getByRole('button', { name: '选择香草冰淇淋杯', exact: true }).click();
  262 |   await page.getByRole('button', { name: '品尝香草冰淇淋杯', exact: true }).click();
  263 |   await page.getByRole('button', { name: '挂上暖色彩旗', exact: true }).click();
  264 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  265 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  266 |   await kitchen(page);
  267 |   await send(page, 1, 'salad-sandwich');
  268 |   await table(page);
  269 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  270 |   await page.getByRole('button', { name: '取出餐垫', exact: true }).click();
  271 |   await page.getByRole('button', { name: '选择蔬菜三明治', exact: true }).click();
  272 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  273 |   await kitchen(page);
  274 |   await send(page, 0, 'sandwich');
  275 |   await table(page);
  276 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  277 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  278 |   await page.getByRole('button', { name: '铺上阳光桌布', exact: true }).click();
  279 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  280 |   expect((await state(page)).adventure?.branch).toBe('hedgehog');
  281 |   expect((await state(page)).adventure?.rewards).toEqual(['picnic-page']);
  282 |   await expect(page.getByRole('button', { name: '把篮子摆上桌', exact: true })).toHaveCount(0);
  283 |   await page.screenshot({
  284 |     path: 'docs/evidence/adventure-experience-02/picnic-hedgehog-phone.png',
  285 |   });
  286 | });
  287 | 
  288 | test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  289 |   page,
  290 | }) => {
  291 |   test.setTimeout(150000);
  292 |   await page.setViewportSize({ width: 393, height: 665 });
  293 |   await page.goto('/');
  294 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  295 |   await page.getByRole('button', { name: '晨间水果', exact: true }).click();
  296 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  297 |   await lesson(page);
  298 |   await table(page);
  299 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  300 |   await expect(page.getByRole('region', { name: '朋友的回访分享需要', exact: true })).toBeVisible();
  301 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  302 |   await page.getByRole('button', { name: '邀请长辈', exact: true }).click();
  303 |   await page.getByRole('button', { name: '下一组分享朋友', exact: true }).click();
  304 |   await expect(page.getByRole('button', { name: '分享给长辈', exact: true })).toBeInViewport();
  305 |   await page.getByRole('button', { name: '上一组分享朋友', exact: true }).click();
  306 |   await expect(page.getByRole('button', { name: '取出小勺', exact: true })).toBeInViewport();
  307 |   await page.getByRole('button', { name: '取出小勺', exact: true }).click();
  308 |   const beforeRotation = await state(page);
  309 |   await page.setViewportSize({ width: 665, height: 393 });
  310 |   await expect(page.getByRole('button', { name: '分享给兔兔', exact: true })).toBeInViewport();
  311 |   await expect(page.getByRole('button', { name: '收摊回小院', exact: true })).toBeInViewport();
  312 |   await page.setViewportSize({ width: 393, height: 665 });
```