# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> opening a new seat uses the new menu while an accepted guest keeps the old request
- Location: e2e/adventure.spec.ts:376:1

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '点请求气泡重听', exact: true })
    - locator resolved to <button type="button" aria-label="点请求气泡重听" class="request-picture">…</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <path fill="#c88455" d="m41 23 9 3-4 13z"></path> from <section data-guide="free" aria-label="图示下一步" class="goal-guide compact-guide  ">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <path fill="#c88455" d="m41 23 9 3-4 13z"></path> from <section data-guide="free" aria-label="图示下一步" class="goal-guide compact-guide  ">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    53 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <path fill="#c88455" d="m41 23 9 3-4 13z"></path> from <section data-guide="free" aria-label="图示下一步" class="goal-guide compact-guide  ">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - generic:
    - generic:
      - button "暂停" [ref=e6] [cursor=pointer]: Ⅱ
      - generic: 无尽营业
      - button "到活动桌" [ref=e7] [cursor=pointer]
    - region "图示下一步":
      - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=e13] [cursor=pointer]:
        - generic [aria-hidden] [ref=e18]: ➜
      - button "重听下一步" [ref=e23] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e24] [cursor=pointer]
      - button "切换果汁机" [ref=e25] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "2号托盘：放入食品或选择整盘"
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
    - button "带作品到活动桌" [ref=e26] [cursor=pointer]
    - button "点请求气泡重听" [ref=e27] [cursor=pointer]:
      - img "香蕉"
      - generic [ref=e28]: ♫
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  308 |   const tasted = await state(page);
  309 |   await expect(page.locator('.theatre-sip, .friend-theatre.sip')).toBeVisible();
  310 |   await expect(page.locator('.friend-theatre')).toBeInViewport({ ratio: 1 });
  311 |   await expect(page.getByRole('button', { name: '重看朋友使用', exact: true })).toBeInViewport();
  312 |   await page.waitForTimeout(900);
  313 |   await page.screenshot({
  314 |     path: 'docs/evidence/adventure-experience-02/friend-drinking-phone.png',
  315 |   });
  316 |   await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  317 |   await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  318 |   await page.getByRole('button', { name: '低动态表现', exact: true }).click();
  319 |   await page.waitForTimeout(300);
  320 |   expect((await state(page)).adventure?.foods).toEqual(tasted.adventure?.foods);
  321 |   expect((await state(page)).adventure?.rewards).toEqual(tasted.adventure?.rewards);
  322 |   await page.getByRole('button', { name: '保存到食谱', exact: true }).click();
  323 |   await page.getByRole('button', { name: '翻开旧食谱', exact: true }).click();
  324 |   await expect(
  325 |     page.locator('.remembered-seat').nth(1).getByRole('img', { name: '苹果汁', exact: true }),
  326 |   ).toBeVisible();
  327 |   await page.getByRole('button', { name: '收起食谱', exact: true }).click();
  328 |   const before = await state(page);
  329 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  330 |   await page.reload();
  331 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  332 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  333 |   await table(page);
  334 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  335 |   await page.screenshot({ path: 'docs/evidence/adventure-experience-02/free-shop-phone.png' });
  336 |   await page.getByRole('button', { name: '收拾桌面', exact: true }).click();
  337 |   const dialog = page.getByRole('dialog', { name: '收拾活动桌', exact: true });
  338 |   await expect(dialog.getByRole('button', { name: '继续摆餐', exact: true })).toBeFocused();
  339 |   await dialog.getByRole('button', { name: '确认收拾', exact: true }).click();
  340 |   expect((await state(page)).adventure?.foods).toEqual([]);
  341 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  342 |   expect((await state(page)).items).toEqual([]);
  343 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  344 |   await expect(page.getByRole('heading', { name: '大咪的英语餐车', exact: true })).toBeVisible();
  345 | });
  346 | 
  347 | test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  348 |   browser,
  349 | }) => {
  350 |   const context = await browser.newContext({
  351 |     viewport: { width: 1280, height: 720 },
  352 |     hasTouch: false,
  353 |   });
  354 |   const page = await context.newPage();
  355 |   await page.goto('/');
  356 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  357 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  358 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  359 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  360 |   const tray = await hot(page, 'tray-0', 26);
  361 |   await page.mouse.click(tray.x, tray.y);
  362 |   const point = await hot(page, 'supply-banana');
  363 |   await page.mouse.click(point.x, point.y);
  364 |   const fruit = (await state(page)).items[0];
  365 |   await page.mouse.click(tray.x, tray.y);
  366 |   const guest = await hot(page, (await state(page)).orders[0]?.id ?? 'guest-0', 20);
  367 |   await page.mouse.click(guest.x, guest.y);
  368 |   expect((await state(page)).items[0]).toEqual(fruit);
  369 |   expect((await state(page)).adventure?.branch).toBeNull();
  370 |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  371 |   const supply = page.getByRole('button', { name: '拿苹果', exact: true });
  372 |   await supply.focus();
  373 |   await supply.press('Enter');
  374 |   expect((await state(page)).items.map((f) => f.product)).toEqual(['banana', 'apple']);
  375 |   const inlet = await hot(page, 'machine-apple');
  376 |   await page.mouse.click(inlet.x, inlet.y);
  377 |   await page.mouse.click(point.x, point.y);
  378 |   const start = await hot(page, 'start');
  379 |   await page.mouse.click(start.x, start.y);
  380 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  381 |   const saved = await state(page);
  382 |   expect(saved.machine.status).toBe('processing');
  383 |   await page.waitForTimeout(300);
  384 |   expect((await state(page)).gameTime).toBe(saved.gameTime);
  385 |   await page.reload();
  386 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  387 |   expect((await state(page)).runId).toBe(saved.runId);
  388 |   expect((await state(page)).items).toEqual(saved.items);
  389 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  390 |   await expect
  391 |     .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-juice'), {
  392 |       timeout: 15000,
  393 |     })
  394 |     .toBe(true);
  395 |   await page.screenshot({
  396 |     path: 'docs/evidence/adventure-experience-02/kitchen-desktop-mouse.png',
  397 |   });
  398 |   await context.close();
  399 | });
  400 | 
  401 | test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  402 |   page,
  403 | }) => {
  404 |   test.setTimeout(150000);
  405 |   page.setDefaultTimeout(30000);
  406 |   await page.goto('/');
  407 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
> 408 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
      |                                                                    ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  409 |   await lesson(page);
  410 |   await send(page, 0, 'apple');
  411 |   await page
  412 |     .getByRole('dialog', { name: '今日新菜单', exact: true })
  413 |     .getByRole('button', { name: '加入今日菜单', exact: true })
  414 |     .click();
  415 |   await table(page);
  416 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  417 |   await kitchen(page);
  418 |   const request = (await state(page)).orders[0]?.request;
  419 |   if (request !== 'apple' && request !== 'banana') throw Error('unexpected first revisit');
  420 |   await send(page, 0, request);
  421 |   await table(page);
  422 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  423 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  424 |   await page.getByRole('checkbox', { name: /apple/i }).uncheck();
  425 |   await page.getByRole('checkbox', { name: /banana/i }).check();
  426 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  427 |   await lesson(page);
  428 |   const pendingMenu = page.getByRole('dialog', { name: '今日新菜单', exact: true });
  429 |   if (await pendingMenu.count())
  430 |     await pendingMenu.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  431 |   // Finish the real replay before comparing the complete accepted-order snapshot.
  432 |   // Audio completion legitimately changes `heard`; menu/seat policy must change nothing else.
  433 |   await page.getByRole('button', { name: '点请求气泡重听', exact: true }).click();
  434 |   await expect
  435 |     .poll(async () => (await state(page)).orders[0]?.heard, { timeout: 15000 })
  436 |     .toBe(true);
  437 |   const old = (await state(page)).orders[0];
  438 |   expect(old?.request).toBe('banana');
  439 |   await table(page);
  440 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  441 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  442 |   await page.getByRole('checkbox', { name: /banana/i }).uncheck();
  443 |   await page.getByRole('checkbox', { name: /apple/i }).check();
  444 |   await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  445 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  446 |   const next = await state(page);
  447 |   expect(next.orders[0]).toEqual(old);
  448 |   expect(next.orders[1]?.request).toBe('apple');
  449 |   expect(next.session.menu).toEqual(['apple']);
  450 | });
  451 | 
```