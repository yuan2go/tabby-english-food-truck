# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> free shop stops accepting, saves actual food, restores and returns to a natural ending
- Location: e2e/adventure.spec.ts:221:1

# Error details

```
Test timeout of 90000ms exceeded.
```

```
Error: locator.click: Test timeout of 90000ms exceeded.
Call log:
  - waiting for getByRole('dialog', { name: '收拾活动桌', exact: true }).getByRole('button', { name: '确认收拾', exact: true })

```

# Page snapshot

```yaml
- main [ref=f1e3]:
  - img "英语餐车游戏画面" [ref=f1e4]
  - generic:
    - generic:
      - button "暂停" [ref=f1e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=f1e7] [cursor=pointer]
    - region "图示下一步":
      - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=f1e13] [cursor=pointer]:
        - generic [aria-hidden] [ref=f1e18]: ➜
      - button "重听下一步" [ref=f1e23] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求" [disabled]
      - button "果汁机苹果入口" [disabled]
      - button "果汁机杯座" [disabled]
      - button "▶ 榨成果汁" [disabled] [ref=f1e24]
      - button "切换果汁机" [disabled] [ref=f1e25]
      - button "请大咪帮忙" [disabled]
      - button "1号托盘：放入食品或选择整盘" [disabled]
      - button "2号托盘：放入食品或选择整盘" [disabled]
      - button "拿苹果" [disabled]
      - button "拿香蕉" [disabled]
      - button "拿空杯" [disabled]
    - dialog "今日新菜单" [ref=f1e26]:
      - generic [ref=f1e27]:
        - generic [ref=f1e28]: 大咪发现一个新味道
        - button "这次先不加 ↗" [active] [ref=f1e29] [cursor=pointer]
      - heading "认识后，再放上菜单" [level=2] [ref=f1e30]
      - button "听新菜单" [ref=f1e31] [cursor=pointer]:
        - generic [ref=f1e32]:
          - img "香蕉"
        - strong [ref=f1e33]: A banana, please.
        - generic [ref=f1e34]: ♫
      - paragraph [ref=f1e35]: 香蕉可以直接放到盘子里。
      - button "加入今日菜单" [ref=f1e36] [cursor=pointer]
      - generic [ref=f1e37]: 这是认识新菜单，不是考试。随时可请大咪帮忙。
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  189 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('cool')).toBe(true);
  190 |   await table(page);
  191 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  192 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  193 |   await page.getByRole('button', { name: '比较两种甜点', exact: true }).click();
  194 |   await page.getByRole('button', { name: '选择香草冰淇淋杯', exact: true }).click();
  195 |   await page.getByRole('button', { name: '品尝香草冰淇淋杯', exact: true }).click();
  196 |   await page.getByRole('button', { name: '挂上暖色彩旗', exact: true }).click();
  197 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  198 |   await page.getByRole('button', { name: '下一院活动', exact: true }).click();
  199 |   await kitchen(page);
  200 |   await send(page, 1, 'salad-sandwich');
  201 |   await table(page);
  202 |   await page.getByRole('button', { name: '打开储物抽屉', exact: true }).click();
  203 |   await page.getByRole('button', { name: '取出餐垫', exact: true }).click();
  204 |   await page.getByRole('button', { name: '选择蔬菜三明治', exact: true }).click();
  205 |   await page.getByRole('button', { name: '摆到1号餐位', exact: true }).click();
  206 |   await kitchen(page);
  207 |   await send(page, 0, 'sandwich');
  208 |   await table(page);
  209 |   await page.getByRole('button', { name: '选择芝士三明治', exact: true }).click();
  210 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  211 |   await page.getByRole('button', { name: '铺上阳光桌布', exact: true }).click();
  212 |   await page.getByRole('button', { name: '一起开席', exact: true }).click();
  213 |   expect((await state(page)).adventure?.branch).toBe('hedgehog');
  214 |   expect((await state(page)).adventure?.rewards).toEqual(['picnic-page']);
  215 |   await expect(page.getByRole('button', { name: '把篮子摆上桌', exact: true })).toHaveCount(0);
  216 |   await page.screenshot({
  217 |     path: 'docs/evidence/adventure-experience-02/picnic-hedgehog-phone.png',
  218 |   });
  219 | });
  220 | 
  221 | test('free shop stops accepting, saves actual food, restores and returns to a natural ending', async ({
  222 |   page,
  223 | }) => {
  224 |   test.setTimeout(90000);
  225 |   await page.setViewportSize({ width: 393, height: 665 });
  226 |   await page.goto('/');
  227 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  228 |   await page.getByRole('button', { name: '晨间水果', exact: true }).click();
  229 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  230 |   await lesson(page);
  231 |   await table(page);
  232 |   await page.getByRole('button', { name: '邀请兔兔', exact: true }).click();
  233 |   await expect(page.getByRole('region', { name: '朋友的回访分享需要', exact: true })).toBeVisible();
  234 |   await page.getByRole('button', { name: '邀请刺刺', exact: true }).click();
  235 |   await page.getByRole('button', { name: '邀请长辈', exact: true }).click();
  236 |   await page.getByRole('button', { name: '下一组分享朋友', exact: true }).click();
  237 |   await expect(page.getByRole('button', { name: '分享给长辈', exact: true })).toBeInViewport();
  238 |   await page.getByRole('button', { name: '上一组分享朋友', exact: true }).click();
  239 |   await expect(page.getByRole('button', { name: '取出小勺', exact: true })).toBeInViewport();
  240 |   await page.getByRole('button', { name: '取出小勺', exact: true }).click();
  241 |   const beforeRotation = await state(page);
  242 |   await page.setViewportSize({ width: 665, height: 393 });
  243 |   await expect(page.getByRole('button', { name: '分享给兔兔', exact: true })).toBeInViewport();
  244 |   await expect(page.getByRole('button', { name: '收摊回小院', exact: true })).toBeInViewport();
  245 |   await page.setViewportSize({ width: 393, height: 665 });
  246 |   expect((await state(page)).adventure).toEqual(beforeRotation.adventure);
  247 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  248 |   await kitchen(page);
  249 |   await send(page, 0, 'apple');
  250 |   await expect.poll(async () => (await state(page)).orders.length).toBe(0);
  251 |   await make(page, 'juice');
  252 |   await page.getByRole('button', { name: '带作品到活动桌', exact: true }).click();
  253 |   await expect.poll(async () => (await state(page)).adventure?.steps.includes('create')).toBe(true);
  254 |   await table(page);
  255 |   await page.getByRole('button', { name: '选择苹果', exact: true }).click();
  256 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  257 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  258 |   await page.getByRole('button', { name: '摆到3号餐位', exact: true }).click();
  259 |   await page.getByRole('button', { name: '拿回苹果汁到桌边', exact: true }).click();
  260 |   const beforeBlocked = await state(page);
  261 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  262 |   await expect(page.locator('.goal-guide')).toHaveAttribute('data-guide', 'occupied');
  263 |   expect((await state(page)).adventure?.foods).toEqual(beforeBlocked.adventure?.foods);
  264 |   await page.screenshot({
  265 |     path: 'docs/evidence/adventure-experience-02/occupied-recovery-phone.png',
  266 |   });
  267 |   await page.getByRole('button', { name: /图示下一步：餐位已经/ }).click();
  268 |   await expect(page.getByRole('button', { name: '拿回苹果到桌边', exact: true })).toBeFocused();
  269 |   await page.getByRole('button', { name: '拿回苹果到桌边', exact: true }).click();
  270 |   await page.getByRole('button', { name: '选择苹果汁', exact: true }).click();
  271 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  272 |   await page.getByRole('button', { name: '品尝苹果汁', exact: true }).click();
  273 |   const tasted = await state(page);
  274 |   await expect(page.locator('.theatre-sip, .friend-theatre.sip')).toBeVisible();
  275 |   await page.waitForTimeout(900);
  276 |   await page.screenshot({
  277 |     path: 'docs/evidence/adventure-experience-02/friend-drinking-phone.png',
  278 |   });
  279 |   await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  280 |   await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  281 |   await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  282 |   await page.waitForTimeout(300);
  283 |   expect((await state(page)).adventure?.foods).toEqual(tasted.adventure?.foods);
  284 |   expect((await state(page)).adventure?.rewards).toEqual(tasted.adventure?.rewards);
  285 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  286 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  287 |   await expect(
  288 |     page.locator('.remembered-seat').nth(1).getByRole('img', { name: '苹果汁', exact: true }),
> 289 |   ).toBeVisible();
      |                                                                   ^ Error: locator.click: Test timeout of 90000ms exceeded.
  290 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  291 |   const before = await state(page);
  292 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  293 |   await page.reload();
  294 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  295 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  296 |   await table(page);
  297 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  298 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/free-shop-phone.png' });
  299 |   await page.getByRole('button', { name: '收拾桌面', exact: true }).click();
  300 |   const dialog = page.getByRole('dialog', { name: '收拾活动桌', exact: true });
  301 |   await expect(dialog.getByRole('button', { name: '继续摆餐', exact: true })).toBeFocused();
  302 |   await dialog.getByRole('button', { name: '确认收拾', exact: true }).click();
  303 |   expect((await state(page)).adventure?.foods).toEqual([]);
  304 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  305 |   expect((await state(page)).items).toEqual([]);
  306 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  307 |   await expect(page.getByRole('heading', { name: '大咪的英语餐车', exact: true })).toBeVisible();
  308 | });
  309 | 
  310 | test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  311 |   browser,
  312 | }) => {
  313 |   const context = await browser.newContext({
  314 |     viewport: { width: 1280, height: 720 },
  315 |     hasTouch: false,
  316 |   });
  317 |   const page = await context.newPage();
  318 |   await page.goto('/');
  319 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  320 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  321 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  322 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  323 |   const tray = await hot(page, 'tray-0', 26);
  324 |   await page.mouse.click(tray.x, tray.y);
  325 |   const point = await hot(page, 'supply-banana');
  326 |   await page.mouse.click(point.x, point.y);
  327 |   const fruit = (await state(page)).items[0];
  328 |   await page.mouse.click(tray.x, tray.y);
  329 |   const guest = await hot(page, (await state(page)).orders[0]?.id ?? 'guest-0', 20);
  330 |   await page.mouse.click(guest.x, guest.y);
  331 |   expect((await state(page)).items[0]).toEqual(fruit);
  332 |   expect((await state(page)).adventure?.branch).toBeNull();
  333 |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  334 |   const supply = page.getByRole('button', { name: '拿苹果', exact: true });
  335 |   await supply.focus();
  336 |   await supply.press('Enter');
  337 |   expect((await state(page)).items.map((f) => f.product)).toEqual(['banana', 'apple']);
  338 |   const inlet = await hot(page, 'machine-apple');
  339 |   await page.mouse.click(inlet.x, inlet.y);
  340 |   await page.mouse.click(point.x, point.y);
  341 |   const start = await hot(page, 'start');
  342 |   await page.mouse.click(start.x, start.y);
  343 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  344 |   const saved = await state(page);
  345 |   expect(saved.machine.status).toBe('processing');
  346 |   await page.waitForTimeout(300);
  347 |   expect((await state(page)).gameTime).toBe(saved.gameTime);
  348 |   await page.reload();
  349 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  350 |   expect((await state(page)).runId).toBe(saved.runId);
  351 |   expect((await state(page)).items).toEqual(saved.items);
  352 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  353 |   await expect
  354 |     .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-juice'), {
  355 |       timeout: 15000,
  356 |     })
  357 |     .toBe(true);
  358 |   await page.screenshot({
  359 |     path: 'docs/evidence/adventure-experience-02/kitchen-desktop-mouse.png',
  360 |   });
  361 |   await context.close();
  362 | });
  363 | 
  364 | test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  365 |   page,
  366 | }) => {
  367 |   test.setTimeout(90000);
  368 |   await page.goto('/');
  369 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  370 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  371 |   await lesson(page);
  372 |   await send(page, 0, 'apple');
  373 |   await page
  374 |     .getByRole('dialog', { name: '今日新菜单', exact: true })
  375 |     .getByRole('button', { name: '加入今日菜单', exact: true })
  376 |     .click();
  377 |   await table(page);
  378 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  379 |   await kitchen(page);
  380 |   const request = (await state(page)).orders[0]?.request;
  381 |   if (request !== 'apple' && request !== 'banana') throw Error('unexpected first revisit');
  382 |   await send(page, 0, request);
  383 |   await table(page);
  384 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  385 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  386 |   await page.getByRole('checkbox', { name: /apple/i }).uncheck();
  387 |   await page.getByRole('checkbox', { name: /banana/i }).check();
  388 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  389 |   await lesson(page);
```