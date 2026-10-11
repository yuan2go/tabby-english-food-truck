# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> opening a new seat uses the new menu while an accepted guest keeps the old request
- Location: e2e/adventure.spec.ts:351:1

# Error details

```
Error: expect(received).toEqual(expected) // deep equality

- Expected  - 1
+ Received  + 1

@@ -1,7 +1,7 @@
  Object {
-   "heard": false,
+   "heard": true,
    "id": "guest-2",
    "remaining": 0,
    "request": "banana",
    "revisit": false,
    "seat": 0,
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
      - button "客人B·刺刺：拿盘交付，空手重听请求"
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
> 390 |   const pendingMenu = page.getByRole('dialog', { name: '今日新菜单', exact: true });
      |                          ^ Error: expect(received).toEqual(expected) // deep equality
  391 |   if (await pendingMenu.count())
  392 |     await pendingMenu.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  393 |   const old = (await state(page)).orders[0];
  394 |   expect(old?.request).toBe('banana');
  395 |   await table(page);
  396 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  397 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  398 |   await page.getByRole('checkbox', { name: /banana/i }).uncheck();
  399 |   await page.getByRole('checkbox', { name: /apple/i }).check();
  400 |   await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  401 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  402 |   const next = await state(page);
  403 |   expect(next.orders[0]).toEqual(old);
  404 |   expect(next.orders[1]?.request).toBe('apple');
  405 |   expect(next.session.menu).toEqual(['apple']);
  406 | });
  407 | 
```