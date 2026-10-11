# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: adventure.spec.ts >> low motion receipts retain actual foods and reachable controls across compact layouts
- Location: e2e/adventure.spec.ts:511:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false
```

# Page snapshot

```yaml
- main [ref=e3]:
  - img "英语餐车游戏画面" [ref=e4]
  - region "小院活动桌" [ref=e6]:
    - generic [ref=e7]:
      - generic [ref=e8]:
        - button "返回小院" [ref=e9] [cursor=pointer]: ← 小院
        - generic [ref=e10]:
          - heading "晨光开门" [level=2] [ref=e11]
          - paragraph [ref=e12]: 送早餐，找到花苗，一起种迎客花
        - group "活动客流" [ref=e13]:
          - button "一次接待一位" [pressed] [ref=e14] [cursor=pointer]: 👤
          - button "一起接待两位" [ref=e15] [cursor=pointer]: 👥
        - button "去厨房备餐" [ref=e16] [cursor=pointer]
      - region "英语交流" [ref=e21]:
        - generic [ref=e22]:
          - button "重听下一步行动" [ref=e23] [cursor=pointer]: ➜ ♫
          - generic [ref=e24]: 大咪
          - group [ref=e25]:
            - generic "回看最近交流" [ref=e26] [cursor=pointer]: ↶
        - generic [ref=e27]:
          - button "重听大咪：Please open the drawer." [ref=e28] [cursor=pointer]:
            - text: Please open the
            - strong [ref=e29]: drawer
            - text: .
          - button "播放整句：Please open the drawer." [ref=e30] [cursor=pointer]: ▶
          - generic [ref=e31]: 可播放整句
      - generic [ref=e32]:
        - generic [ref=e33]:
          - button "去小院游乐角" [ref=e34] [cursor=pointer]:
            - generic [ref=e36]: 去游乐角 · 随时回来
          - button "打开储物抽屉" [ref=e37] [cursor=pointer]:
            - generic [ref=e42]:
              - text: 打开储物抽屉
              - generic [ref=e43]: Drawer
          - button "翻开旧食谱" [ref=e44] [cursor=pointer]:
            - generic [ref=e50]:
              - text: 翻开旧食谱
              - generic [ref=e51]: Recipe book
        - region "图示下一步" [ref=e52]:
          - button "图示下一步：点一位朋友，自己决定先帮谁。" [ref=e53] [cursor=pointer]:
            - generic [aria-hidden] [ref=e60]: ➜
            - generic [aria-hidden] [ref=e65]: ●
          - generic [ref=e66]: 点一位朋友，自己决定先帮谁。
          - button "重听下一步" [ref=e68] [cursor=pointer]: ♫
          - button "看看怎么行动" [ref=e69] [cursor=pointer]: ▶
        - paragraph [ref=e70]: 送早餐，找到花苗，一起种迎客花
        - generic [ref=e71]:
          - img "小主厨大咪" [ref=e72]
          - generic [ref=e73]:
            - img "兔兔" [ref=e74]
            - generic [ref=e75]:
              - img "苹果"
          - generic [ref=e76]:
            - img "刺刺" [ref=e77]
            - button "先帮刺刺" [ref=e78] [cursor=pointer]: 👋
        - region "朋友实际使用食品" [ref=e79]:
          - img "兔兔携带真实食品" [ref=e80]:
            - img "兔兔" [ref=e81]
            - generic [ref=e83]:
              - img "苹果"
          - generic [ref=e89]:
            - button "重看朋友使用" [ref=e90] [cursor=pointer]: ↻ ♫
            - button "跳过朋友演出" [active] [ref=e91] [cursor=pointer]: ↗
            - button "低动态表现" [pressed] [ref=e92] [cursor=pointer]: ◒
        - generic [ref=e93]:
          - button "摆到1号餐位" [ref=e94] [cursor=pointer]
          - button "摆到2号餐位" [ref=e96] [cursor=pointer]
          - button "摆到3号餐位" [ref=e98] [cursor=pointer]
        - region "真实送到活动桌的食物" [ref=e100]:
          - button "选择苹果" [pressed] [ref=e102] [cursor=pointer]:
            - img "苹果"
            - generic [aria-hidden] [ref=e103]: ●
          - region "当前拿着苹果" [ref=e104]:
            - img "苹果"
            - generic [aria-hidden] [ref=e105]: ➜
            - button "品尝苹果" [ref=e111] [cursor=pointer]
      - generic [ref=e116]:
        - status [ref=e117]: 点一位朋友，自己决定先帮谁。
        - generic [ref=e118]:
          - button "一起开席" [disabled] [ref=e119]
          - button "收摊回小院" [ref=e124] [cursor=pointer]
      - generic [ref=e128]: 当前拿着苹果，可点一个餐位摆放。
```

# Test source

```ts
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
  492 |   await page.getByRole('button', { name: '重听客人A的请求', exact: true }).click();
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
  532 |     await expect(page.locator('canvas')).toHaveAttribute('data-world-width', String(size.width));
  533 |     await expect(page.locator('canvas')).toHaveAttribute('data-world-height', String(size.height));
  534 |     expect(
  535 |       await page.locator('.activity-world > .goal-guide').evaluate((guide) => {
  536 |         const pictures = guide.querySelector('.goal-pictures');
  537 |         if (!pictures) return false;
  538 |         const box = pictures.getBoundingClientRect();
  539 |         const containsPictures = [...pictures.children].every((child) => {
  540 |           if (getComputedStyle(child).display === 'none') return true;
  541 |           const b = child.getBoundingClientRect();
  542 |           return b.left >= box.left - 1 && b.right <= box.right + 1;
  543 |         });
  544 |         const children = [...guide.children].filter(
  545 |           (child) => getComputedStyle(child).display !== 'none',
  546 |         );
  547 |         const bounds = guide.getBoundingClientRect();
  548 |         return (
  549 |           containsPictures &&
  550 |           children.every((child, index) => {
  551 |             const b = child.getBoundingClientRect();
  552 |             const next = children[index + 1]?.getBoundingClientRect();
  553 |             return (
  554 |               b.left >= bounds.left - 1 &&
  555 |               b.right <= bounds.right + 1 &&
  556 |               (!next || b.right <= next.left + 1 || b.bottom <= next.top + 1)
  557 |             );
  558 |           })
  559 |         );
  560 |       }),
> 561 |     ).toBe(true);
      |       ^ Error: expect(received).toBe(expected) // Object.is equality
  562 |     for (const name of ['重看朋友使用', '跳过朋友演出', '低动态表现']) {
  563 |       const button = page.getByRole('button', { name, exact: true });
  564 |       await expect(button).toBeInViewport({ ratio: 1 });
  565 |       expect(
  566 |         await button.evaluate((el) => {
  567 |           const b = el.getBoundingClientRect();
  568 |           return (
  569 |             b.width >= 48 &&
  570 |             b.height >= 48 &&
  571 |             [
  572 |               [b.left + b.width * 0.25, b.top + b.height * 0.25],
  573 |               [b.left + b.width * 0.75, b.top + b.height * 0.75],
  574 |               [b.left + b.width / 2, b.top + b.height / 2],
  575 |             ].every(([x, y]) => {
  576 |               const hit = document.elementFromPoint(x ?? 0, y ?? 0);
  577 |               return hit === el || (hit !== null && el.contains(hit));
  578 |             })
  579 |           );
  580 |         }),
  581 |       ).toBe(true);
  582 |     }
  583 |     await page.screenshot({
  584 |       path: evidencePath(
  585 |         `docs/evidence/demo-repair-2026-10-12/receipt-${size.width}x${size.height}.png`,
  586 |       ),
  587 |     });
  588 |     await page.getByRole('button', { name: '重看朋友使用', exact: true }).click();
  589 |     await page.getByRole('button', { name: '跳过朋友演出', exact: true }).click();
  590 |     expect((await state(page)).adventure).toEqual(before);
  591 |   }
  592 | });
  593 | 
```