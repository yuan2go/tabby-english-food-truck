# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> opening a new seat uses the new menu while an accepted guest keeps the old request
- Location: e2e/adventure.spec.ts:371:1

# Error details

```
TimeoutError: locator.click: Timeout 12000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '自由开店', exact: true })
    - locator resolved to <button type="button" aria-label="自由开店" class="entry-main">…</button>

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "餐车小院" [ref=e6]:
    - generic [ref=e7]:
      - text: DAMI'S LITTLE KITCHEN
      - heading "大咪的英语餐车" [level=1] [ref=e8]
      - paragraph [ref=e9]: 一辆小餐车，一院好朋友。
    - button "设置" [ref=e10] [cursor=pointer]: ⚙
    - img "小主厨大咪" [ref=e11]
    - generic [ref=e12]:
      - button "正在准备 · 晨光开门" [ref=e13] [cursor=pointer]:
        - generic [ref=e15]: 送早餐，找到花苗，一起种迎客花
      - button "听正在准备 · 晨光开门" [ref=e16] [cursor=pointer]: ♫
    - generic [ref=e17]:
      - button "自由开店" [ref=e18] [cursor=pointer]:
        - generic [ref=e20]: 今天也有新朋友
      - button "听自由开店" [ref=e21] [cursor=pointer]: ♫
    - button "旧食谱 · 回访活动与作品" [ref=e22] [cursor=pointer]
    - generic [ref=e27]:
      - button "教学练习" [ref=e28] [cursor=pointer]:
        - generic [ref=e30]: 看大咪做，再亲手试试
      - button "听教学练习" [ref=e31] [cursor=pointer]: ♫
    - generic [ref=e32]:
      - button "迷你游戏" [ref=e33] [cursor=pointer]:
        - generic [ref=e35]: 听一听 · 找一找 · 拼一拼
      - button "听迷你游戏" [ref=e36] [cursor=pointer]: ♫
    - generic: 开发素材与语音待审核
```

# Test source

```ts
  276 |   await page.getByRole('button', { name: '摆到2号餐位', exact: true }).click();
  277 |   await page.getByRole('button', { name: '品尝苹果汁', exact: true }).click();
  278 |   const tasted = await state(page);
  279 |   await expect(page.locator('.theatre-sip, .friend-theatre.sip')).toBeVisible();
  280 |   await expect(page.locator('.friend-theatre')).toBeInViewport({ ratio: 1 });
  281 |   await expect(page.getByRole('button', { name: '重看朋友使用', exact: true })).toBeInViewport();
  282 |   await page.waitForTimeout(900);
  283 |   await page.screenshot({
  284 |     path: 'docs/evidence/adventure-experience-02/friend-drinking-phone.png',
  285 |   });
  286 |   await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  287 |   await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  288 |   await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  289 |   await page.waitForTimeout(300);
  290 |   expect((await state(page)).adventure?.foods).toEqual(tasted.adventure?.foods);
  291 |   expect((await state(page)).adventure?.rewards).toEqual(tasted.adventure?.rewards);
  292 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  293 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  294 |   await expect(
  295 |     page.locator('.remembered-seat').nth(1).getByRole('img', { name: '苹果汁', exact: true }),
  296 |   ).toBeVisible();
  297 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  298 |   const before = await state(page);
  299 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  300 |   await page.reload();
  301 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  302 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  303 |   await table(page);
  304 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  305 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/free-shop-phone.png' });
  306 |   await page.getByRole('button', { name: '收拾桌面', exact: true }).click();
  307 |   const dialog = page.getByRole('dialog', { name: '收拾活动桌', exact: true });
  308 |   await expect(dialog.getByRole('button', { name: '继续摆餐', exact: true })).toBeFocused();
  309 |   await dialog.getByRole('button', { name: '确认收拾', exact: true }).click();
  310 |   expect((await state(page)).adventure?.foods).toEqual([]);
  311 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  312 |   expect((await state(page)).items).toEqual([]);
  313 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  314 |   await expect(page.getByRole('heading', { name: '大咪的英语餐车', exact: true })).toBeVisible();
  315 | });
  316 | 
  317 | test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  318 |   browser,
  319 | }) => {
  320 |   const context = await browser.newContext({
  321 |     viewport: { width: 1280, height: 720 },
  322 |     hasTouch: false,
  323 |   });
  324 |   const page = await context.newPage();
  325 |   await page.goto('/');
  326 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  327 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  328 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  329 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  330 |   const tray = await hot(page, 'tray-0', 26);
  331 |   await page.mouse.click(tray.x, tray.y);
  332 |   const point = await hot(page, 'supply-banana');
  333 |   await page.mouse.click(point.x, point.y);
  334 |   const fruit = (await state(page)).items[0];
  335 |   await page.mouse.click(tray.x, tray.y);
  336 |   const guest = await hot(page, (await state(page)).orders[0]?.id ?? 'guest-0', 20);
  337 |   await page.mouse.click(guest.x, guest.y);
  338 |   expect((await state(page)).items[0]).toEqual(fruit);
  339 |   expect((await state(page)).adventure?.branch).toBeNull();
  340 |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  341 |   const supply = page.getByRole('button', { name: '拿苹果', exact: true });
  342 |   await supply.focus();
  343 |   await supply.press('Enter');
  344 |   expect((await state(page)).items.map((f) => f.product)).toEqual(['banana', 'apple']);
  345 |   const inlet = await hot(page, 'machine-apple');
  346 |   await page.mouse.click(inlet.x, inlet.y);
  347 |   await page.mouse.click(point.x, point.y);
  348 |   const start = await hot(page, 'start');
  349 |   await page.mouse.click(start.x, start.y);
  350 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  351 |   const saved = await state(page);
  352 |   expect(saved.machine.status).toBe('processing');
  353 |   await page.waitForTimeout(300);
  354 |   expect((await state(page)).gameTime).toBe(saved.gameTime);
  355 |   await page.reload();
  356 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  357 |   expect((await state(page)).runId).toBe(saved.runId);
  358 |   expect((await state(page)).items).toEqual(saved.items);
  359 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  360 |   await expect
  361 |     .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-juice'), {
  362 |       timeout: 15000,
  363 |     })
  364 |     .toBe(true);
  365 |   await page.screenshot({
  366 |     path: 'docs/evidence/adventure-experience-02/kitchen-desktop-mouse.png',
  367 |   });
  368 |   await context.close();
  369 | });
  370 | 
  371 | test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  372 |   page,
  373 | }) => {
  374 |   test.setTimeout(150000);
  375 |   await page.goto('/');
> 376 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
      |                                                                 ^ TimeoutError: locator.click: Timeout 12000ms exceeded.
  377 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  378 |   await lesson(page);
  379 |   await send(page, 0, 'apple');
  380 |   await page
  381 |     .getByRole('dialog', { name: '今日新菜单', exact: true })
  382 |     .getByRole('button', { name: '加入今日菜单', exact: true })
  383 |     .click();
  384 |   await table(page);
  385 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  386 |   await kitchen(page);
  387 |   const request = (await state(page)).orders[0]?.request;
  388 |   if (request !== 'apple' && request !== 'banana') throw Error('unexpected first revisit');
  389 |   await send(page, 0, request);
  390 |   await table(page);
  391 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  392 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  393 |   await page.getByRole('checkbox', { name: /apple/i }).uncheck();
  394 |   await page.getByRole('checkbox', { name: /banana/i }).check();
  395 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  396 |   await lesson(page);
  397 |   const pendingMenu = page.getByRole('dialog', { name: '今日新菜单', exact: true });
  398 |   if (await pendingMenu.count())
  399 |     await pendingMenu.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  400 |   // Finish the real replay before comparing the complete accepted-order snapshot.
  401 |   // Audio completion legitimately changes `heard`; menu/seat policy must change nothing else.
  402 |   await page.getByRole('button', { name: '点请求气泡重听', exact: true }).click();
  403 |   await expect
  404 |     .poll(async () => (await state(page)).orders[0]?.heard, { timeout: 15000 })
  405 |     .toBe(true);
  406 |   const old = (await state(page)).orders[0];
  407 |   expect(old?.request).toBe('banana');
  408 |   await table(page);
  409 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  410 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  411 |   await page.getByRole('checkbox', { name: /banana/i }).uncheck();
  412 |   await page.getByRole('checkbox', { name: /apple/i }).check();
  413 |   await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  414 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  415 |   const next = await state(page);
  416 |   expect(next.orders[0]).toEqual(old);
  417 |   expect(next.orders[1]?.request).toBe('apple');
  418 |   expect(next.session.menu).toEqual(['apple']);
  419 | });
  420 | 
```