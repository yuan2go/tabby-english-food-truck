# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> opening a new seat uses the new menu while an accepted guest keeps the old request
- Location: e2e/adventure.spec.ts:459:1

# Error details

```
TimeoutError: locator.click: Timeout 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: '点请求气泡重听', exact: true })

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
        - button "图示下一步：继续搭配、分享或修改，喜欢的作品留在食谱。" [ref=e13] [cursor=pointer]
        - button "重听下一步" [ref=e18] [cursor=pointer]: ♫
    - group "餐车操作":
      - button "客人A·兔兔：拿盘交付，空手重听请求"
      - button "果汁机苹果入口"
      - button "果汁机杯座"
      - button "▶ 榨成果汁" [ref=e19] [cursor=pointer]
      - button "切换果汁机" [ref=e20] [cursor=pointer]
      - button "请大咪帮忙"
      - button "1号托盘：放入食品或选择整盘"
      - button "拿起或放下1号整盘" [ref=e21] [cursor=pointer]
      - button "2号托盘：放入食品或选择整盘"
      - button "拿起或放下2号整盘" [ref=e22] [cursor=pointer]
      - button "拿苹果"
      - button "拿香蕉"
      - button "拿空杯"
    - button "带作品到活动桌" [ref=e23] [cursor=pointer]
    - region "英语交流":
      - generic:
        - button "重听客人A的请求" [pressed] [ref=e24] [cursor=pointer]: A ♫
        - button "重听开放请求" [ref=e25] [cursor=pointer]: ▧ ♫
        - generic: 朋友
        - button "图示帮助" [ref=e26] [cursor=pointer]: ▧
        - group:
          - generic "回看最近交流": ↶
      - generic:
        - button "重听朋友：Can I have a banana, please?" [ref=e27] [cursor=pointer]:
          - text: Can I have a
          - strong [ref=e28]: banana
          - text: ", please?"
        - button "播放整句：Can I have a banana, please?" [ref=e29] [cursor=pointer]: ▶
        - generic: 可播放整句
    - generic:
      - status: 点食材直接装盘；要制作时先点设备
```

# Test source

```ts
  392 |     path: evidencePath('docs/evidence/adventure-experience-02/free-shop-phone.png'),
  393 |   });
  394 |   await page.getByRole('button', { name: '收拾桌面', exact: true }).click();
  395 |   const dialog = page.getByRole('dialog', { name: '收拾活动桌', exact: true });
  396 |   await expect(dialog.getByRole('button', { name: '继续摆餐', exact: true })).toBeFocused();
  397 |   await dialog.getByRole('button', { name: '确认收拾', exact: true }).click();
  398 |   expect((await state(page)).adventure?.foods).toEqual([]);
  399 |   expect((await state(page)).adventure?.works).toEqual(before.adventure?.works);
  400 |   expect((await state(page)).items).toEqual([]);
  401 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  402 |   await expect(page.getByRole('heading', { name: '大咪的英语餐车', exact: true })).toBeVisible();
  403 | });
  404 | 
  405 | test('desktop mouse and keyboard preserve a wrong delivery and paused cooking on reload', async ({
  406 |   browser,
  407 | }) => {
  408 |   const context = await browser.newContext({
  409 |     viewport: { width: 1280, height: 720 },
  410 |     hasTouch: false,
  411 |   });
  412 |   const page = await context.newPage();
  413 |   await page.goto('/');
  414 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  415 |   await page.getByRole('button', { name: '先帮兔兔', exact: true }).click();
  416 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  417 |   await page.getByRole('button', { name: '我来试试', exact: true }).click();
  418 |   const tray = await hot(page, 'lift-tray-0');
  419 |   await page.mouse.click(tray.x, tray.y);
  420 |   const point = await hot(page, 'supply-banana');
  421 |   await page.mouse.click(point.x, point.y);
  422 |   const fruit = (await state(page)).items[0];
  423 |   await page.mouse.click(tray.x, tray.y);
  424 |   const guest = await hot(page, (await state(page)).orders[0]?.id ?? 'guest-0', 20);
  425 |   await page.mouse.click(guest.x, guest.y);
  426 |   expect((await state(page)).items[0]).toEqual(fruit);
  427 |   expect((await state(page)).adventure?.branch).toBeNull();
  428 |   expect((await state(page)).attempts.at(-1)?.result).toBe('request-mismatch');
  429 |   const supply = page.getByRole('button', { name: '拿苹果', exact: true });
  430 |   await supply.focus();
  431 |   await supply.press('Enter');
  432 |   expect((await state(page)).items.map((f) => f.product)).toEqual(['banana', 'apple']);
  433 |   const inlet = await hot(page, 'machine-apple');
  434 |   await page.mouse.click(inlet.x, inlet.y);
  435 |   await page.mouse.click(point.x, point.y);
  436 |   const start = await hot(page, 'start');
  437 |   await page.mouse.click(start.x, start.y);
  438 |   await page.getByRole('button', { name: '暂停', exact: true }).click();
  439 |   const saved = await state(page);
  440 |   expect(saved.machine.status).toBe('processing');
  441 |   await page.waitForTimeout(300);
  442 |   expect((await state(page)).gameTime).toBe(saved.gameTime);
  443 |   await page.reload();
  444 |   await page.getByRole('button', { name: '正在准备 · 晨光开门', exact: true }).click();
  445 |   expect((await state(page)).runId).toBe(saved.runId);
  446 |   expect((await state(page)).items).toEqual(saved.items);
  447 |   await page.getByRole('button', { name: '去厨房备餐', exact: true }).click();
  448 |   await expect
  449 |     .poll(async () => (await state(page)).items.some((i) => i.product === 'banana-juice'), {
  450 |       timeout: 15000,
  451 |     })
  452 |     .toBe(true);
  453 |   await page.screenshot({
  454 |     path: evidencePath('docs/evidence/adventure-experience-02/kitchen-desktop-mouse.png'),
  455 |   });
  456 |   await context.close();
  457 | });
  458 | 
  459 | test('opening a new seat uses the new menu while an accepted guest keeps the old request', async ({
  460 |   page,
  461 | }) => {
  462 |   test.setTimeout(150000);
  463 |   page.setDefaultTimeout(30000);
  464 |   await page.setViewportSize({ width: 393, height: 665 });
  465 |   await page.goto('/');
  466 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  467 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  468 |   await lesson(page);
  469 |   await send(page, 0, 'apple');
  470 |   await page
  471 |     .getByRole('dialog', { name: '今日新菜单', exact: true })
  472 |     .getByRole('button', { name: '加入今日菜单', exact: true })
  473 |     .click();
  474 |   await table(page);
  475 |   await page.getByRole('button', { name: '停止接客，做作品', exact: true }).click();
  476 |   await kitchen(page);
  477 |   const request = (await state(page)).orders[0]?.request;
  478 |   if (request !== 'apple' && request !== 'banana') throw Error('unexpected first revisit');
  479 |   await send(page, 0, request);
  480 |   await table(page);
  481 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  482 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  483 |   await page.getByRole('checkbox', { name: /apple/i }).uncheck();
  484 |   await page.getByRole('checkbox', { name: /banana/i }).check();
  485 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  486 |   await lesson(page);
  487 |   const pendingMenu = page.getByRole('dialog', { name: '今日新菜单', exact: true });
  488 |   if (await pendingMenu.count())
  489 |     await pendingMenu.getByRole('button', { name: '这次先不加 ↗', exact: true }).click();
  490 |   // Finish the real replay before comparing the complete accepted-order snapshot.
  491 |   // Audio completion legitimately changes `heard`; menu/seat policy must change nothing else.
> 492 |   await page.getByRole('button', { name: '点请求气泡重听', exact: true }).click();
      |                                                                    ^ TimeoutError: locator.click: Timeout 30000ms exceeded.
  493 |   await expect
  494 |     .poll(async () => (await state(page)).orders[0]?.heard, { timeout: 15000 })
  495 |     .toBe(true);
  496 |   const old = (await state(page)).orders[0];
  497 |   expect(old?.request).toBe('banana');
  498 |   await table(page);
  499 |   await page.getByRole('button', { name: '收摊回小院', exact: true }).click();
  500 |   await page.getByRole('button', { name: '自由开店', exact: true }).click();
  501 |   await page.getByRole('checkbox', { name: /banana/i }).uncheck();
  502 |   await page.getByRole('checkbox', { name: /apple/i }).check();
  503 |   await page.getByRole('button', { name: '两位一起招呼', exact: true }).click();
  504 |   await page.getByRole('button', { name: '开门 / 继续营业', exact: true }).click();
  505 |   const next = await state(page);
  506 |   expect(next.orders[0]).toEqual(old);
  507 |   expect(next.orders[1]?.request).toBe('apple');
  508 |   expect(next.session.menu).toEqual(['apple']);
  509 | });
  510 | 
  511 | test('low motion receipts retain actual foods and reachable controls across compact layouts', async ({
  512 |   page,
  513 | }) => {
  514 |   test.setTimeout(180000);
  515 |   await page.addInitScript(() => localStorage.setItem('tabby.foodtruck.lowGraphics', 'true'));
  516 |   await begin(page);
  517 |   await kitchen(page);
  518 |   await send(page, 0, 'apple');
  519 |   await table(page);
  520 |   const theatre = page.getByRole('region', { name: '朋友实际使用食品', exact: true });
  521 |   await expect(theatre).toHaveClass(/low-motion/);
  522 |   await expect(theatre).toHaveClass(/stage-2/);
  523 |   const before = (await state(page)).adventure;
  524 |   expect(before?.foods.map((food) => food.product)).toEqual(['apple']);
  525 |   for (const size of [
  526 |     { width: 1280, height: 720 },
  527 |     { width: 393, height: 665 },
  528 |     { width: 852, height: 300 },
  529 |     { width: 768, height: 1024 },
  530 |   ]) {
  531 |     await page.setViewportSize(size);
  532 |     for (const name of ['重看朋友使用', '跳过朋友演出', '低动态表现']) {
  533 |       const button = page.getByRole('button', { name, exact: true });
  534 |       await expect(button).toBeInViewport({ ratio: 1 });
  535 |       expect(
  536 |         await button.evaluate((el) => {
  537 |           const b = el.getBoundingClientRect();
  538 |           return (
  539 |             b.width >= 48 &&
  540 |             b.height >= 48 &&
  541 |             [
  542 |               [b.left + b.width * 0.25, b.top + b.height * 0.25],
  543 |               [b.left + b.width * 0.75, b.top + b.height * 0.75],
  544 |               [b.left + b.width / 2, b.top + b.height / 2],
  545 |             ].every(([x, y]) => {
  546 |               const hit = document.elementFromPoint(x ?? 0, y ?? 0);
  547 |               return hit === el || (hit !== null && el.contains(hit));
  548 |             })
  549 |           );
  550 |         }),
  551 |       ).toBe(true);
  552 |     }
  553 |     await page.screenshot({
  554 |       path: evidencePath(
  555 |         `docs/evidence/demo-repair-2026-10-12/receipt-${size.width}x${size.height}.png`,
  556 |       ),
  557 |     });
  558 |     await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  559 |     await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  560 |     expect((await state(page)).adventure).toEqual(before);
  561 |   }
  562 | });
  563 | 
```